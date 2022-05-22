import { JsonRpcSigner } from '@ethersproject/providers';
import { ERC20__factory, PoolSafe__factory } from '@pesabooks/contracts/typechain';
import { ContractReceipt, ethers } from 'ethers';
import { Filter } from 'react-supabase';
import { networks } from '../data/networks';
import { handleSupabaseError, transationsQueueTable, transationsTable } from '../supabase';
import { Pool } from '../types';
import { Transaction } from '../types/transaction';
import { defaultProvider, getControllerContract, getTokenContract } from './blockchainServices';

export const deposit = async (
  signer: JsonRpcSigner,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | undefined,
) => {
  const { token } = pool;
  if (token == null) throw new Error();

  const from = (await signer.getAddress()).toLowerCase();
  const to = pool.contract_address.toLowerCase();
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
        address: token.address.toLowerCase(),
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
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

  const tx = await tokenContract.transfer(
    pool.contract_address,
    ethers.utils.parseUnits(amount.toString(), decimals),
  );

  transaction.hash = tx.hash;

  const { error } = await transationsTable().insert(transaction);
  handleSupabaseError(error);
  await deleteQueuedTransaction(queuedTransactionId);

  tx.wait().then(
    (receipt) => {
      onTransactionComplete(receipt, pool.chain_id);
    },
    () => onTransactionFailed(tx.hash),
  );

  return tx;
};

export const withdraw = async (
  signer: JsonRpcSigner,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | undefined,
  recipient: string,
) => {
  const { token } = pool;
  if (token == null) throw new Error();

  const safe = PoolSafe__factory.connect(pool.contract_address, signer);
  const controlller = await getControllerContract(pool.chain_id, signer);

  const tokenAddress = token?.address?.toLowerCase() ?? '';
  const from = pool.contract_address?.toLowerCase();
  const to = recipient.toLowerCase();

  const tokenContract = getTokenContract(pool.chain_id, tokenAddress);
  const decimals = await tokenContract.decimals();

  const transaction: Partial<Transaction> = {
    memo: memo,
    type: 'withdrawal',
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

  const tx = await controlller.withdraw(
    safe.address,
    tokenAddress,
    recipient,
    ethers.utils.parseUnits(amount.toString(), decimals),
  );

  transaction.hash = tx.hash;

  const { error } = await transationsTable().insert(transaction);
  handleSupabaseError(error);
  await deleteQueuedTransaction(queuedTransactionId);

  tx.wait().then(
    (receipt) => {
      onTransactionComplete(receipt, pool.chain_id);
    },
    () => onTransactionFailed(tx.hash),
  );

  return tx;
};

const onTransactionComplete = async (receipt: ContractReceipt, chainId: number) => {
  if (receipt.blockNumber) {
    const timestamp = (await defaultProvider(chainId).getBlock(receipt.blockNumber)).timestamp;
    const { error } = await transationsTable()
      .update({ status: 'completed', timestamp })
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
    category:category_id(id, name)
  `,
  );

  query = (filter ? filter(query) : query)
    .filter('pool_id', 'eq', pool_id)
    .filter('status', 'neq', 'failed');
  const { data, error } = await query;

  handleSupabaseError(error);
  return data;
};

export const geTransactionById = async (txId: number) => {
  const { data, error } = await transationsTable()
    .select(
      `
      *,
      category:category_id(id, name)
    `,
    )
    .eq('id', txId);
  handleSupabaseError(error);
  return data?.[0];
};

export const refreshTransaction = async (chain_id: number, txHash: string) => {
  const provider = defaultProvider(chain_id);
  var tx = await provider.getTransaction(txHash);
  await tx.wait().then(
    async (receipt) => await onTransactionComplete(receipt, chain_id),
    async () => await onTransactionFailed,
  );
};

export const updateTransactionCategory = async (id: number, category_id: number) => {
  await transationsTable().update({ category_id }).match({ id: id });
};

export const getTxScanLink = (hash: string, chainId: number) => {
  return `${networks[chainId].blockExplorerUrls[0]}tx/${hash}`;
};
