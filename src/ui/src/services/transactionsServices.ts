import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ERC20__factory } from '@pesabooks/contracts/typechain';
import { ContractTransaction, ethers, Signer } from 'ethers';
import { networks } from '../data/networks';
import { Filter, handleSupabaseError, transationsTable } from '../supabase';
import { Pool, User } from '../types';
import { NewTransaction, Transaction, TransferData } from '../types/transaction';
import { defaultProvider } from './blockchainServices';
import {
  ConfirmTransactionPayload,
  eventBus,
  TransactionMessage,
  TransactionPayload,
} from './eventBus';
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
  user: User,
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

  onTransactionSubmitted(data as Transaction, tx, pool.chain_id, false, user);

  return data as Transaction;
};

export const submitTransaction = async (
  user: User,
  signer: Signer,
  pool: Pool,
  transaction: NewTransaction,
) => {
  const safeTransaction = await createSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    transaction.transaction_data,
  );

  const threshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address!);

  if (threshold > 1) {
    const safeTxHash = await proposeSafeTransaction(
      signer,
      pool.chain_id,
      pool.gnosis_safe_address!,
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
      pool.gnosis_safe_address!,
      safeTransaction,
    );
    const tx = await executeSafeTransaction(signer, pool.gnosis_safe_address!, safeTransaction);

    const { data } = await transationsTable()
      .insert({
        ...transaction,
        safe_tx_hash: safeTxHash,
        safe_nonce: safeTransaction.data.nonce,
        hash: tx?.hash,
        status: 'pending',
      })
      .select()
      .single();

    onTransactionSubmitted(data as Transaction, tx!, pool.chain_id, false, user);

    return data as Transaction;
  }
};

export const confirmTransaction = async (
  user: User,
  signer: Signer,
  pool: Pool,
  transaction: Transaction,
  safeTxHash: string,
  isRejection: boolean,
) => {
  const treshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address!);
  await confirmSafeTransaction(signer, pool.chain_id, pool.gnosis_safe_address!, safeTxHash);

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
    userId: user.id,
    transaction,
    safeTxHash,
  });
};

export const executeTransaction = async (
  user: User,
  signer: Signer,
  pool: Pool,
  transaction: Transaction,
  safeTxHash: string,
  isRejection: boolean,
) => {
  const tx = await executeSafeTransactionByHash(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    safeTxHash,
  );

  onTransactionSubmitted(transaction, tx!, pool.chain_id, isRejection, user);

  await transationsTable()
    .update({ hash: tx?.hash, status: isRejection ? 'pending_rejection' : 'pending' })
    .eq('id', transaction.id);

  return tx;
};

export const createRejectTransaction = async (
  user: User,
  signer: JsonRpcSigner,
  pool: Pool,
  transactionId: number,
  nonce: number,
) => {
  const safeTransaction = await createSafeRejectionTransaction(
    signer,
    pool.gnosis_safe_address!,
    nonce,
  );

  const safeTxHash = await proposeSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    safeTransaction,
  );

  const { data } = await transationsTable()
    .update({ reject_safe_tx_hash: safeTxHash, rejections: 1 })
    .eq('id', transactionId)
    .select()
    .single();

  eventBus.channel('transaction').emit<ConfirmTransactionPayload>('rejected', {
    chainId: pool.chain_id,
    userId: user.id,
    transaction: data as Transaction,
    safeTxHash,
  });
};

export const onTransactionSubmitted = async (
  transaction: Transaction,
  tx: ContractTransaction,
  chainId: number,
  isRejection: boolean = false,
  user?: User,
) => {
  const payload = { transaction, blockchainTransaction: tx, chainId, isRejection, user };
  eventBus.channel('transaction').emit<TransactionMessage>('execution_sent', payload);

  tx?.wait().then(
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
  chainId: number,
  safeAddress: string,
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
  const filter: Filter<'transactions'> = (query) =>
    query.in('status', ['awaitingConfirmations', 'awaitingExecution']);
  return getAllTransactions(pool.id, pool.chain_id, pool.gnosis_safe_address!, filter);
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
  const provider = defaultProvider(chain_id);
  var tx = await provider.getTransaction(t.hash!);
  onTransactionSubmitted(t, tx, chain_id);
};

export const updateTransactionCategory = async (id: number, category_id: number) => {
  await transationsTable().update({ category_id }).match({ id: id });
};

export const updateTransactionMemo = async (id: number, memo: string) => {
  await transationsTable().update({ memo }).match({ id: id });
};

export const getTxScanLink = (hash: string, chainId: number) => {
  return `${networks[chainId].blockExplorerUrls[0]}tx/${hash}`;
};

export const getPendingTokenUnlockingTxCount = async (pool_id: string, symbol: string) => {
  const { data } = await transationsTable()
    .select()
    .eq('pool_id', pool_id)
    .eq('type', 'unlockToken')
    .in('status', ['awaitingConfirmations', 'awaitingExecution'])
    //@ts-ignore
    .eq('metadata->token->>symbol', symbol);
  return data?.length || 0;
};
