import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ERC20__factory } from '@pesabooks/contracts/typechain';
import { SafeMultisigTransactionResponse, SafeTransaction } from '@safe-global/safe-core-sdk-types';
import { BigNumber, ethers, Signer } from 'ethers';
import { Token as ParaswapToken, Transaction as ParaswapTransaction } from 'paraswap';
import { OptimalRate } from 'paraswap-core';
import { networks } from '../data/networks';
import { Filter, handleSupabaseError, transationsTable } from '../supabase';
import { Pool, User } from '../types';
import { AddOrRemoveOwnerData, NewTransaction, SwapData, Transaction } from '../types/transaction';
import { checksummed } from '../utils';
import { notifyTransaction } from '../utils/notification';
import { defaultProvider, getTokenContract } from './blockchainServices';
import {
  confirmSafeTransaction,
  createSafeRejectionTransaction,
  createSafeTransaction,
  executeSafeTransaction,
  executeSafeTransactionByHash,
  getAddOwnerTx,
  getChangeThresholdTx,
  getRemoveOwnerTx,
  getSafePendingTransactions,
  getSafeTransaction,
  getSafeTransactionHash,
  getSafeTreshold,
  proposeSafeTransaction,
} from './gnosisServices';
import {
  onTransactionComplete,
  onTransactionFailed,
  onTransactionSubmitted,
} from './transaction-events';

export const deposit = async (
  provider: Web3Provider,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | null,
) => {
  const { token } = pool;
  if (token == null) throw new Error();
  const signer = provider.getSigner();

  const from = checksummed(await signer.getAddress());
  const to = checksummed(pool.gnosis_safe_address!);
  const tokenAddress = checksummed(token?.address);

  const tokenContract = ERC20__factory.connect(token.address, signer);
  const decimals = await tokenContract.decimals();

  const transaction: NewTransaction = {
    memo: memo,
    type: 'deposit',
    category_id: category_id,
    status: 'pending',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      transfer_from: from,
      transfer_to: to,
      token: {
        address: tokenAddress,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: `/${token.image}`,
      },
      amount: amount,
    },
  };

  const _amount = ethers.utils.parseUnits(amount.toString(), decimals);

  const gasLimit = await tokenContract.estimateGas.transfer(to, _amount);
  const gasPrice = await provider.getGasPrice();

  const tx = await tokenContract.transfer(to, _amount, { gasLimit: gasLimit, gasPrice: gasPrice });

  notifyTransaction(pool.chain_id, tx.hash);

  const { data, error } = await transationsTable()
    .insert({ ...transaction, hash: tx.hash })
    .select()
    .single();
  handleSupabaseError(error);

  tx.wait().then(
    (receipt) => {
      onTransactionComplete(transaction, receipt, pool.chain_id);
    },
    () => onTransactionFailed(tx.hash),
  );

  return data as Transaction;
};

export const withdraw = async (
  signer: JsonRpcSigner,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | null,
  user: User,
): Promise<Transaction | undefined> => {
  const { token } = pool;
  if (token == null) throw new Error();

  const tokenAddress = checksummed(token?.address);
  const from = checksummed(pool.gnosis_safe_address!);
  const to = checksummed(user.wallet);

  const tokenContract = getTokenContract(pool.chain_id, tokenAddress);
  const decimals = await tokenContract.decimals();

  const transaction: NewTransaction = {
    memo: memo,
    type: 'withdrawal',
    category_id: category_id,
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    status: 'pending',
    metadata: {
      transfer_from: from,
      transfer_to: to,
      token: {
        address: tokenAddress,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: `/${token.image}`,
      },
      amount: amount,
    },
  };

  const safeTransaction = await createSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    {
      to: checksummed(tokenAddress),
      value: '0',
      data: ERC20__factory.createInterface().encodeFunctionData('transfer', [
        to,
        ethers.utils.parseUnits(amount.toString(), decimals),
      ]),
    },
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

export const addAdmin = async (
  signer: JsonRpcSigner,
  pool: Pool,
  user: User,
  currentTreshold: number,
  threshold: number,
): Promise<Transaction | undefined> => {
  const transaction: NewTransaction = {
    type: 'addOwner',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
    status: 'pending',
    metadata: {
      address: user.wallet,
      user_id: user.id,
      username: user.username!,
      threshold: threshold,
      current_threshold: currentTreshold,
    },
  };

  const safeTransaction = await getAddOwnerTx(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    checksummed(user.wallet),
    threshold,
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

export const removeAdmin = async (
  signer: JsonRpcSigner,
  pool: Pool,
  user: User,
  currentTreshold: number,
  threshold: number,
): Promise<Transaction | undefined> => {
  const transaction: NewTransaction = {
    type: 'removeOwner',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
    status: 'pending',
    metadata: {
      address: user.wallet,
      user_id: user.id,
      username: user.username,
      current_threshold: currentTreshold,
      threshold: threshold,
    } as AddOrRemoveOwnerData,
  };

  const safeTransaction = await getRemoveOwnerTx(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    checksummed(user.wallet),
    threshold,
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

export const changeThreshold = async (
  signer: JsonRpcSigner,
  pool: Pool,
  threshold: number,
  currentThresold: number,
): Promise<Transaction | undefined> => {
  const transaction: NewTransaction = {
    type: 'changeThreshold',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
    status: 'pending',
    metadata: {
      threshold,
      current_threshold: currentThresold,
    },
  };

  const safeTransaction = await getChangeThresholdTx(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    threshold,
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

export const approveToken = async (
  signer: JsonRpcSigner,
  pool: Pool,
  amount: number | undefined,
  proxyContract: string,
  token: ParaswapToken,
): Promise<Transaction | undefined> => {
  const tokenContract = getTokenContract(pool.chain_id, token.address);
  const decimals = await tokenContract.decimals();
  const maxAllowance = BigNumber.from('2').pow(BigNumber.from('256').sub(BigNumber.from('1')));

  const transaction: NewTransaction = {
    type: 'unlockToken',
    pool_id: pool.id,
    category_id: null,
    memo: null,
    status: 'pending',
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      token: token,
      amount,
    } as any,
  };

  const safeTransaction = await createSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    {
      to: checksummed(token.address),
      value: '0',
      data: ERC20__factory.createInterface().encodeFunctionData('approve', [
        checksummed(proxyContract),
        amount ? ethers.utils.parseUnits(amount.toString(), decimals) : maxAllowance,
      ]),
    },
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

export const swapTokens = async (
  signer: JsonRpcSigner,
  pool: Pool,
  paraswapTx: ParaswapTransaction,
  tokenFrom: ParaswapToken,
  tokenTo: ParaswapToken,
  slippage: number,
  priceRoute: OptimalRate,
): Promise<Transaction | undefined> => {
  const transaction: NewTransaction = {
    type: 'swap',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
    status: 'pending',
    metadata: {
      src_token: tokenFrom,
      src_usd: priceRoute.srcUSD,
      src_amount: priceRoute.srcAmount,
      dest_token: tokenTo,
      dest_amount: priceRoute.destAmount,
      dest_usd: priceRoute.destUSD,
      slippage,
      gas_cost: priceRoute.gasCost,
      gas_cost_usd: priceRoute.gasCostUSD,
    } as SwapData,
  };

  const safeTransaction = await createSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    {
      to: checksummed(paraswapTx.to),
      value: paraswapTx.value,
      data: paraswapTx.data,
    },
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

export const submitTransaction = async (
  signer: Signer,
  pool: Pool,
  transaction: NewTransaction,
  safeTransaction: SafeTransaction,
) => {
  const treshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address!);

  if (treshold > 1) {
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
      })
      .select()
      .single();

    return data as Transaction;
  } else if (treshold === 1) {
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

    onTransactionSubmitted(transaction, tx, pool.chain_id, false);
    return data as Transaction;
  }
};

export const confirmTransaction = async (
  signer: Signer,
  pool: Pool,
  transactionId: number,
  safeTxHash: string,
) => {
  const treshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address!);
  await confirmSafeTransaction(signer, pool.chain_id, pool.gnosis_safe_address!, safeTxHash);

  const safeTransaction = await getSafeTransaction(pool.chain_id, safeTxHash);
  if (safeTransaction.confirmations?.length === treshold) {
    await transationsTable().update({ status: 'awaitingExecution' }).eq('id', transactionId);
  }
};

export const executeTransaction = async (
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

  onTransactionSubmitted(transaction, tx, pool.chain_id, isRejection, safeTxHash);

  await transationsTable().update({ hash: tx?.hash, status: 'pending' }).eq('id', transaction.id);

  return tx;
};

export const rejectTransaction = async (
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

  await transationsTable().update({ reject_safe_tx_hash: safeTxHash }).eq('id', transactionId);
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

  // If there are any pending transactions, we need to fetch the safe transactions
  if (
    transactions?.find(
      (t) => t.status === 'awaitingConfirmations' || t.status === 'awaitingExecution',
    )
  ) {
    const safeTransactions: Record<string, SafeMultisigTransactionResponse> = (
      await getSafePendingTransactions(chainId, safeAddress)
    ).reduce((acc, safeTx) => ({ ...acc, [safeTx.safeTxHash]: safeTx }), {});

    return (
      transactions?.map((d) => ({
        ...d,
        safeTx: safeTransactions[d.safe_tx_hash!],
        rejectSafeTx: safeTransactions[d.reject_safe_tx_hash!],
      })) ?? []
    );
  }

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
  await tx.wait().then(
    async (receipt) => await onTransactionComplete(t, receipt, chain_id),
    async () => await onTransactionFailed,
  );
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
