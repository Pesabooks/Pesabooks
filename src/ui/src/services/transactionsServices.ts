import { JsonRpcSigner } from '@ethersproject/providers';
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types';
import { ERC20__factory } from '@pesabooks/contracts/typechain';
import { BigNumber, ContractReceipt, ContractTransaction, ethers, Signer } from 'ethers';
import { Token as ParaswapToken, Transaction as ParaswapTransaction } from 'paraswap';
import { OptimalRate } from 'paraswap-core';
import { Filter } from 'react-supabase';
import { networks } from '../data/networks';
import { handleSupabaseError, transationsQueueTable, transationsTable } from '../supabase';
import { AddressLookup, Pool } from '../types';
import { SwapData, Transaction } from '../types/transaction';
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
  getRemoveOwnerTx,
  getSafeTransaction,
  getSafeTransactionHash,
  getSafeTreshold,
  proposeSafeTransaction,
} from './gnosisServices';

export const deposit = async (
  signer: JsonRpcSigner,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | undefined,
) => {
  const { token } = pool;
  if (token == null) throw new Error();

  const from = checksummed(await signer.getAddress());
  const to = checksummed(pool.gnosis_safe_address);
  const tokenAddress = checksummed(token?.address);

  const tokenContract = ERC20__factory.connect(token.address, signer);
  const decimals = await tokenContract.decimals();

  const transaction: Partial<Transaction> = {
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
        image: `${process.env.PUBLIC_URL}/${token.image}`,
      },
      amount: amount,
    },
  };

  const { data: queuedTransactions, error: queuingEror } = await transationsQueueTable().insert({
    pool_id: pool.id,
    transaction: transaction,
  });
  handleSupabaseError(queuingEror);
  const queuedTransactionId = queuedTransactions?.[0].id ?? 0;

  const tx = await tokenContract.transfer(to, ethers.utils.parseUnits(amount.toString(), decimals));

  //notifyTransaction(tx, `Deposit of ${amount} ${token.symbol}`);
  notifyTransaction(pool.chain_id, tx.hash);

  transaction.hash = tx.hash;

  const { data, error } = await transationsTable().insert({ ...transaction, hash: tx.hash });
  handleSupabaseError(error);
  await deleteQueuedTransaction(queuedTransactionId);

  tx.wait().then(
    (receipt) => {
      onTransactionComplete(receipt, pool.chain_id);
    },
    () => onTransactionFailed(tx.hash),
  );

  return data?.[0];
};

export const depositWithCard = async (
  pool: Pool,
  rampId: string,
  rampPurchaseViewToken: string | undefined,
  category_id: number | undefined,
  memo: string | undefined,
  amount: number,
  finalTxHash: string | undefined,
) => {
  const { token } = pool;
  if (token == null) throw new Error();

  const transaction: Partial<Transaction> = {
    memo: memo,
    type: 'deposit',
    category_id: category_id,
    status: 'pending',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      ramp_id: rampId,
      ramp_purchase_view_token: rampPurchaseViewToken,
      transfer_to: checksummed(pool.gnosis_safe_address),
      token: {
        address: checksummed(token.address),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: `${process.env.PUBLIC_URL}/${token.image}`,
      },
      amount: amount,
    },
    hash: finalTxHash,
  };

  const { data, error } = await transationsTable().insert(transaction);
  handleSupabaseError(error);

  if (finalTxHash) {
    notifyTransaction(pool.chain_id, finalTxHash);
  }

  return data?.[0];
};

export const withdraw = async (
  signer: JsonRpcSigner,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | undefined,
  user: AddressLookup,
): Promise<Transaction | undefined> => {
  const { token } = pool;
  if (token == null) throw new Error();

  const tokenAddress = checksummed(token?.address);
  const from = checksummed(pool.gnosis_safe_address);
  const to = checksummed(user.address);

  const tokenContract = getTokenContract(pool.chain_id, tokenAddress);
  const decimals = await tokenContract.decimals();

  const transaction: Partial<Transaction> = {
    memo: memo,
    type: 'withdrawal',
    category_id: category_id,
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
        image: `${process.env.PUBLIC_URL}/${token.image}`,
      },
      amount: amount,
    },
  };

  const safeTransaction = await createSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
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
  user: AddressLookup,
  treshold: number,
): Promise<Transaction | undefined> => {
  const transaction: Partial<Transaction> = {
    type: 'addOwner',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      address: user.address,
      user_id: user.id,
      treshold: treshold,
    },
  };

  const safeTransaction = await getAddOwnerTx(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
    checksummed(user.address),
    treshold,
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

export const removeAdmin = async (
  signer: JsonRpcSigner,
  pool: Pool,
  user: AddressLookup,
  treshold: number,
): Promise<Transaction | undefined> => {
  const transaction: Partial<Transaction> = {
    type: 'removeOwner',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      address: user.address,
      user_id: user.id,
      treshold: treshold,
    },
  };

  const safeTransaction = await getRemoveOwnerTx(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
    checksummed(user.address),
    treshold,
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

  const transaction: Partial<Transaction> = {
    type: 'unlockToken',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      token: token,
      amount,
    } as any,
  };

  const safeTransaction = await createSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
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
  const transaction: Partial<Transaction> = {
    type: 'swap',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
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
    pool.gnosis_safe_address,
    {
      to: checksummed(paraswapTx.to),
      value: paraswapTx.value,
      data: paraswapTx.data,
    },
  );

  return submitTransaction(signer, pool, transaction, safeTransaction);
};

const submitTransaction = async (
  signer: Signer,
  pool: Pool,
  transaction: Partial<Transaction>,
  safeTransaction: SafeTransaction,
) => {
  const treshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address);

  if (treshold > 1) {
    const safeTxHash = await proposeSafeTransaction(
      signer,
      pool.chain_id,
      pool.gnosis_safe_address,
      safeTransaction,
    );
    const { data } = await transationsTable().insert({
      ...transaction,
      safe_tx_hash: safeTxHash,
      safe_nonce: safeTransaction.data.nonce,
      status: 'awaitingConfirmations',
    });

    return data?.[0];
  } else if (treshold === 1) {
    const safeTxHash = await getSafeTransactionHash(
      signer,
      pool.gnosis_safe_address,
      safeTransaction,
    );
    const tx = await executeSafeTransaction(signer, pool.gnosis_safe_address, safeTransaction);

    const { data } = await transationsTable().insert({
      ...transaction,
      safe_tx_hash: safeTxHash,
      safe_nonce: safeTransaction.data.nonce,
      hash: tx?.hash,
      status: 'pending',
    });
    onTransactionExecuted(tx, pool.chain_id, false);
    return data?.[0];
  }
};

export const confirmTransaction = async (
  signer: Signer,
  pool: Pool,
  transactionId: number,
  safeTxHash: string,
) => {
  const treshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address);
  await confirmSafeTransaction(signer, pool.chain_id, pool.gnosis_safe_address, safeTxHash);

  const safeTransaction = await getSafeTransaction(pool.chain_id, safeTxHash);
  if (safeTransaction.confirmations?.length === treshold) {
    await transationsTable().update({ status: 'awaitingExecution' }).eq('id', transactionId);
  }
};

export const executeTransaction = async (
  signer: Signer,
  pool: Pool,
  transactionId: number,
  safeTxHash: string,
  isRejection: boolean,
) => {
  const tx = await executeSafeTransactionByHash(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
    safeTxHash,
  );

  onTransactionExecuted(tx, pool.chain_id, isRejection);

  await transationsTable().update({ hash: tx?.hash, status: 'pending' }).eq('id', transactionId);

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
    pool.gnosis_safe_address,
    nonce,
  );

  const safeTxHash = await proposeSafeTransaction(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address,
    safeTransaction,
  );

  await transationsTable().update({ reject_safe_tx_hash: safeTxHash }).eq('id', transactionId);
};

const onTransactionExecuted = async (
  tx: ContractTransaction | undefined,
  chainId: number,
  isRejection: boolean,
) => {
  if (tx) notifyTransaction(chainId, tx.hash);

  tx?.wait().then(
    (receipt) => {
      onTransactionComplete(receipt, chainId, isRejection);
    },
    () => onTransactionFailed(tx.hash),
  );
};

const onTransactionComplete = async (
  receipt: ContractReceipt,
  chainId: number,
  isRejection: boolean = false,
) => {
  if (receipt.blockNumber) {
    const timestamp = (await defaultProvider(chainId).getBlock(receipt.blockNumber)).timestamp;
    const { error } = await transationsTable()
      .update({ status: isRejection ? 'rejected' : 'completed', timestamp })
      .eq('hash', receipt.transactionHash);
    if (error) console.error(error);
  }
};

const onTransactionFailed = async (txHash: string) => {
  await transationsTable().update({ status: 'failed' }).eq('hash', txHash);
};

const deleteQueuedTransaction = (id: number) => {
  return transationsQueueTable().delete().eq('id', id);
};

export const getAllTransactions = async (pool_id: number, filter?: Filter<Transaction>) => {
  let query = transationsTable().select(
    `
    *,
    category:category_id(id, name),
    created_by:profiles(id,name,email)
  `,
  );

  query = (filter ? filter(query) : query)
    .filter('pool_id', 'eq', pool_id)
    .filter('status', 'neq', 'failed');
  const { data, error } = await query;

  handleSupabaseError(error);
  return data;
};

export const getTransactionById = async (txId: number) => {
  const { data, error } = await transationsTable()
    .select(
      `
      *,
      category:category_id(id, name),
      created_by:profiles(id,name,email)
    `,
    )
    .eq('id', txId);
  handleSupabaseError(error);

  return data?.[0];
};

export const refreshTransaction = async (chain_id: number, t: Transaction) => {
  const provider = defaultProvider(chain_id);
  var tx = await provider.getTransaction(t.hash);
  await tx.wait().then(
    async (receipt) => await onTransactionComplete(receipt, chain_id),
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

export const getPendingTokenUnlockingTxCount = async (pool: Pool, symbol: string) => {
  const { data } = await transationsTable()
    .select()
    .eq('pool_id', pool.id)
    .eq('type', 'unlockToken')
    .in('status', ['awaitingConfirmations', 'awaitingExecution'])
    //@ts-ignore
    .eq('metadata->token->>symbol', symbol);
  return data?.length || 0;
};
