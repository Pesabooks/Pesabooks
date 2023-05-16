import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { NewTransaction, Pool, Transaction, TransferData } from '@pesabooks/types';
import { ERC20__factory } from '@pesabooks/utils/erc20';
import { getTypedStorageItem } from '@pesabooks/utils/storage-utils';
import { notEqual } from 'assert';
import { ContractTransaction, Signer, ethers } from 'ethers';
import { networks } from '../data/networks';
import { Filter, handleSupabaseError, transationsTable } from '../supabase';
import { defaultProvider } from './blockchainServices';
import {
  ConfirmTransactionPayload,
  TransactionMessage,
  TransactionPayload,
  eventBus,
} from './events/eventBus';
import {
  confirmSafeTransaction,
  createSafeRejectionTransaction,
  createSafeTransaction,
  executeSafeTransaction,
  executeSafeTransactionByHash,
  getSafeTransaction,
  getSafeTransactionHash,
  getSafeTreshold,
  proposeSafeTransaction,
} from './gnosisServices';

export const submitDepositTx = async (
  provider: Web3Provider,
  pool: Pool,
  transaction: NewTransaction,
) => {
  const { metadata, transaction_data } = transaction;

  const { token, amount, transfer_to } = metadata as TransferData;

  const signer = provider.getSigner();

  const tokenContract = ERC20__factory.connect(token.address, signer);
  const decimals = await tokenContract.decimals();
  const _amount = ethers.utils.parseUnits(amount.toString(), decimals);

  const gasLimit = await provider.estimateGas(transaction_data);
  const gasPrice = await provider.getGasPrice();

  const tx = await tokenContract.transfer(transfer_to, _amount, {
    gasLimit: gasLimit,
    gasPrice: gasPrice,
  });

  const { data, error } = await transationsTable()
    .insert({ ...transaction, status: 'pending', hash: tx.hash })
    .select()
    .single();
  handleSupabaseError(error);

  onTransactionSentToNetwork(data as Transaction, tx, pool.chain_id, false);

  return data as Transaction;
};

export const submitTransaction = async (
  signer: Signer,
  pool: Pool,
  transaction: NewTransaction,
) => {
  if (!pool.gnosis_safe_address) throw new Error('Pool has no gnosis safe address');

  const safeTransaction = await createSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
    transaction.transaction_data,
  );

  const threshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address);

  if (threshold > 1) {
    const safeTxHash = await proposeSafeTransaction(
      signer,
      pool.chain_id,
      pool.gnosis_safe_address,
      safeTransaction,
    );
    const { data } = await transationsTable()
      .insert({
        ...transaction,
        safe_tx_hash: safeTxHash,
        safe_nonce: safeTransaction.data.nonce,
        status: 'awaitingConfirmations',
        threshold,
      })
      .select()
      .single();

    eventBus.channel('transaction').emit<TransactionPayload>('proposed', {
      transaction: data as Transaction,
    });

    return data as Transaction;
  } else if (threshold === 1) {
    const safeTxHash = await getSafeTransactionHash(
      signer,
      pool.gnosis_safe_address,
      safeTransaction,
    );
    const tx = await executeSafeTransaction(signer, pool.gnosis_safe_address, safeTransaction);

    if (!tx) throw new Error('Transaction is null. Something went wrong');

    const { data } = await transationsTable()
      .insert({
        ...transaction,
        safe_tx_hash: safeTxHash,
        safe_nonce: safeTransaction.data.nonce,
        hash: tx.hash,
        status: 'pending',
      })
      .select()
      .single();

    onTransactionSentToNetwork(data as Transaction, tx, pool.chain_id, false);

    return data as Transaction;
  }
};

export const confirmTransaction = async (
  signer: Signer,
  pool: Pool,
  transaction: Transaction,
  safeTxHash: string,
  isRejection: boolean,
) => {
  if (!pool.gnosis_safe_address) throw new Error('Pool has no gnosis safe address');

  const treshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address);
  await confirmSafeTransaction(signer, pool.chain_id, pool.gnosis_safe_address, safeTxHash);

  const safeTransaction = await getSafeTransaction(pool.chain_id, safeTxHash);

  let update: Partial<Transaction> = {};
  if (isRejection) {
    update = { ...update, rejections: safeTransaction.confirmations?.length ?? 1 };
  } else {
    update = { ...update, confirmations: safeTransaction.confirmations?.length };
  }

  if (safeTransaction.confirmations?.length === treshold) {
    update = { ...update, status: 'awaitingExecution' };
  }
  await transationsTable().update(update).eq('id', transaction.id);

  const eventname = isRejection ? 'rejected' : 'confirmed';

  eventBus.channel('transaction').emit<ConfirmTransactionPayload>(eventname, {
    chainId: pool.chain_id,
    userId: getTypedStorageItem('user_id')!,
    transaction,
    safeTxHash,
  });
};

export const executeTransaction = async (
  signer: Signer,
  pool: Pool,
  transaction: Transaction,
  safeTxHash: string,
  isRejection: boolean,
) => {
  if (!pool.gnosis_safe_address) throw new Error('Pool has no gnosis safe address');

  const tx = await executeSafeTransactionByHash(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
    safeTxHash,
  );

  if (!tx) throw new Error('Transaction is null. Something went wrong');

  onTransactionSentToNetwork(transaction, tx, pool.chain_id, isRejection);

  await transationsTable()
    .update({ hash: tx?.hash, status: isRejection ? 'pending_rejection' : 'pending' })
    .eq('id', transaction.id);

  return tx;
};

export const createRejectTransaction = async (
  signer: JsonRpcSigner,
  pool: Pool,
  transactionId: number,
  nonce: number,
) => {
  if (!pool.gnosis_safe_address) throw new Error('Pool has no gnosis safe address');

  const safeTransaction = await createSafeRejectionTransaction(
    signer,
    pool.gnosis_safe_address,
    nonce,
  );

  const safeTxHash = await proposeSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
    safeTransaction,
  );

  const { data } = await transationsTable()
    .update({ reject_safe_tx_hash: safeTxHash, rejections: 1 })
    .eq('id', transactionId)
    .select()
    .single();

  eventBus.channel('transaction').emit<ConfirmTransactionPayload>('rejected', {
    chainId: pool.chain_id,
    userId: getTypedStorageItem('user_id')!,
    transaction: data as Transaction,
    safeTxHash,
  });
};

const onTransactionSentToNetwork = async (
  transaction: Transaction,
  tx: ContractTransaction,
  chainId: number,
  isRejection = false,
) => {
  const userId = getTypedStorageItem('user_id');
  const payload = {
    transaction,
    blockchainTransaction: tx,
    chainId,
    isRejection,
    userId: userId ?? null,
  };
  eventBus.channel('transaction').emit<TransactionMessage>('execution_sent', payload);

  tx.wait().then(
    (receipt) => {
      eventBus.channel('transaction').emit<TransactionMessage>('execution_completed', {
        ...payload,
        blockchainReceipt: receipt,
      });
    },
    () => {
      eventBus.channel('transaction').emit<TransactionMessage>('execution_failed', payload);
    },
  );
};

export const getAllTransactions = async (
  poolId: string,
  filter?: Filter<'transactions'>,
): Promise<Transaction[]> => {
  let query = transationsTable().select(
    `
      *,
      category:category_id(id, name),
      user:users(id,name,email)
    `,
  );

  query = (filter ? filter(query) : query).filter('pool_id', 'eq', poolId);
  //.filter('status', 'neq', 'failed');
  const { data, error } = await query;

  handleSupabaseError(error);

  const transactions = data as Transaction[] | null;

  return transactions ?? [];
};

export const getAllProposals = async (pool: Pool) => {
  notEqual;
  const filter: Filter<'transactions'> = (query) =>
    query.in('status', ['awaitingConfirmations', 'awaitingExecution']);
  return getAllTransactions(pool.id, filter);
};

export const getTransactionById = async (txId: number) => {
  const { data, error } = await transationsTable()
    .select(
      `
      *,
      category:category_id(id, name),
      user:users(id,name,email)
    `,
    )
    .eq('id', txId)
    .single();
  handleSupabaseError(error);

  return data as Transaction | null;
};

export const refreshTransaction = async (chain_id: number, t: Transaction) => {
  if (!t.hash) return;

  const provider = defaultProvider(chain_id);
  const tx = await provider.getTransaction(t.hash);
  onTransactionSentToNetwork(t, tx, chain_id);
};

export const updateTransactionCategory = async (id: number, category_id: number) => {
  await transationsTable().update({ category_id }).match({ id: id });
};

export const updateTransactionMemo = async (id: number, memo: string) => {
  await transationsTable().update({ memo }).match({ id: id });
};

export const getTxScanLink = (hash: string, chainId: number) => {
  return `${networks[chainId].blockExplorerUrl}tx/${hash}`;
};

export const getPendingTokenUnlockingTxCount = async (pool_id: string, symbol: string) => {
  const { data } = await transationsTable()
    .select()
    .eq('pool_id', pool_id)
    .eq('type', 'unlockToken')
    .in('status', ['awaitingConfirmations', 'awaitingExecution'])
    .eq('metadata->token->>symbol', symbol);
  return data?.length || 0;
};
