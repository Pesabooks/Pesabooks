import { Web3Provider } from '@ethersproject/providers';
import { PoolSafe__factory } from '@pesabooks/contracts/typechain';
import { ContractReceipt, ethers } from 'ethers';
import { Filter } from 'react-supabase';
import { networks } from '../data/networks';
import { handleSupabaseError, transationsTable } from '../supabase';
import { AddressLookup, Pool } from '../types';
import { Transaction } from '../types/transaction';
import { defaultProvider, getControllerContract, getTokenContract } from './blockchainServices';

export const deposit = async (
  user_id: string,
  provider: Web3Provider,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | undefined,
) => {
  const { token } = pool;
  if (token == null) throw new Error();

  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();
  const safe = PoolSafe__factory.connect(pool.contract_address, signer);
  const controller = await getControllerContract(pool.chain_id, signer);

  const tokenAddress = await safe.token();
  const tokenContract = getTokenContract(defaultProvider(pool.chain_id), tokenAddress);
  const decimals = await tokenContract.decimals();

  const tx = await controller.deposit(
    safe.address,
    tokenAddress,
    ethers.utils.parseUnits(amount.toString(), decimals),
  );

  const transaction: Partial<Transaction> = {
    amount: amount,
    memo: memo,
    user_id: user_id,
    type: 'deposit',
    category_id: category_id,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    transfer_from: signerAddress,
    transfer_to: pool.contract_address,
    status: 0,
    pool_id: pool.id,
    metadata: {
      transfer_from: signerAddress,
      transfer_to: pool.contract_address,
      token: {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
      },
      amount: amount,
    },
  };

  const { error } = await transationsTable().insert(transaction);
  handleSupabaseError(error);

  tx.wait().then((receipt) => {
    onTransactionComplete(receipt, pool.chain_id);
  });

  return tx;
};

export const withdraw = async (
  user: AddressLookup,
  provider: Web3Provider,
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | undefined,
  recipient: string,
) => {
  const { token } = pool;
  if (token == null) throw new Error();

  const signer = provider.getSigner();
  const safe = PoolSafe__factory.connect(pool.contract_address, signer);
  const controlller = await getControllerContract(pool.chain_id, signer);

  const tokenAddress = pool.token?.address ?? '';

  const tokenContract = getTokenContract(defaultProvider(pool.chain_id), tokenAddress);
  const decimals = await tokenContract.decimals();

  const tx = await controlller.withdraw(
    safe.address,
    tokenAddress,
    recipient,
    ethers.utils.parseUnits(amount.toString(), decimals),
  );

  const transaction: Partial<Transaction> = {
    amount: amount,
    memo: memo,
    user_id: user.id,
    type: 'withdrawal',
    category_id: category_id,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    transfer_from: pool.contract_address,
    transfer_to: recipient,
    status: 0,
    pool_id: pool.id,
    metadata: {
      transfer_from: pool.contract_address,
      transfer_to: recipient,
      token: {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
      },
      amount: amount,
    },
  };

  const { error } = await transationsTable().insert(transaction);
  handleSupabaseError(error);

  tx.wait().then((receipt) => {
    onTransactionComplete(receipt, pool.chain_id);
  });

  return tx;
};

const onTransactionComplete = async (receipt: ContractReceipt, chainId: number) => {
  if (receipt.blockNumber) {
    const timestamp = (await defaultProvider(chainId).getBlock(receipt.blockNumber)).timestamp;
    const { error } = await transationsTable()
      .update({ status: 1, timestamp })
      .eq('hash', receipt.transactionHash);
    if (error) console.error(error);
  }
};

export const getAllTransactions = async (pool_id: number, filter?: Filter<Transaction>) => {
  let query = transationsTable().select(
    `
    *,
    category:category_id(id, name)
  `,
  );

  query = (filter ? filter(query) : query).filter('pool_id', 'eq', pool_id);
  query = query.filter('status', 'neq', -1);
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
    async (receipt) => {
      let timestamp = (await provider.getBlock(receipt.blockNumber)).timestamp;
      await transationsTable().update({ status: 1, timestamp }).eq('hash', txHash);
    },
    async () => {
      await transationsTable().update({ status: -1 }).eq('hash', txHash);
    },
  );
};

export const updateTransactionCategory = async (id: number, category_id: number) => {
  await transationsTable().update({ category_id }).match({ id: id });
};

export const getTxScanLink = (hash: string, chainId: number) => {
  return `${networks[chainId].blockExplorerUrls[0]}tx/${hash}`;
};
