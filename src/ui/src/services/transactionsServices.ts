import { Web3Provider } from '@ethersproject/providers';
import { Account__factory } from '@pesabooks/contracts/typechain';
import { ContractTransaction, ethers } from 'ethers';
import { Filter } from 'react-supabase';
import { handleSupabaseError, transationsTable } from '../supabase';
import { Pool } from '../types';
import { Account } from '../types/account';
import { Transaction } from '../types/transaction';
import { defaultProvider, getTokenContract } from './blockchainServices';

export const deposit = async (
  user_id: string,
  provider: Web3Provider,
  pool: Pool,
  account: Account,
  category_id: number,
  amount: number,
  memo: string | undefined,
  onConfirmation: () => void,
): Promise<Transaction | undefined> => {
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();
  const accountContract = Account__factory.connect(account.contract_address, signer);

  const tokenAddress = await accountContract.token();
  const tokenContract = getTokenContract(defaultProvider(pool.chain_id), tokenAddress);
  const decimals = await tokenContract.decimals();

  const tx = await accountContract.deposit(ethers.utils.parseUnits(amount.toString(), decimals));

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
    transfer_to: account.contract_address,
    status: 0,
    pool_id: pool.id,
  };

  const newTx = await SaveTransactionAndWaitToComplete(
    pool.chain_id,
    tx,
    transaction,
    onConfirmation,
  );
  return newTx;
};

export const withdraw = async (
  user_id: string,
  provider: Web3Provider,
  pool: Pool,
  account: Account,
  category_id: number,
  amount: number,
  memo: string | undefined,
  recipient: string,
  onConfirmation: () => void,
): Promise<Transaction | undefined> => {
  const signer = provider.getSigner();
  const accountContract = Account__factory.connect(account.contract_address, signer);

  const tokenAddress = await accountContract.token();
  const tokenContract = getTokenContract(defaultProvider(pool.chain_id), tokenAddress);
  const decimals = await tokenContract.decimals();

  const tx = await accountContract.withdraw(
    recipient,
    ethers.utils.parseUnits(amount.toString(), decimals),
  );

  const transaction: Partial<Transaction> = {
    amount: amount,
    memo: memo,
    user_id: user_id,
    type: 'withdrawal',
    category_id: category_id,
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    transfer_from: account.contract_address,
    transfer_to: recipient,
    status: 0,
    pool_id: pool.id,
  };

  const newTx = await SaveTransactionAndWaitToComplete(
    pool.chain_id,
    tx,
    transaction,
    onConfirmation,
  );

  return newTx;
};

const SaveTransactionAndWaitToComplete = async (
  chain_id: number,
  tx: ContractTransaction,
  transaction: Partial<Transaction>,
  onConfirmation?: () => void,
) => {
  //Save pending transaction
  const { data, error } = await transationsTable().insert(transaction);
  handleSupabaseError(error);

  tx.wait().then(async (receipt) => {
    if (receipt.blockNumber) {
      onConfirmation?.();
      const timestamp = (await defaultProvider(chain_id).getBlock(receipt.blockNumber)).timestamp;
      const { error } = await transationsTable()
        .update({ status: 1, timestamp })
        .eq('hash', receipt.transactionHash);
      if (error) console.error(error);
    }
  });

  return data?.[0];
};

export const getAllTransactions = async (pool_id: number, filter?: Filter<Transaction>) => {
  let query = transationsTable().select(
    `
    *,
    category:category_id(id, name)
  `,
  );

  query = (filter ? filter(query) : query).filter('pool_id', 'eq', pool_id);
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
  let timestamp;
  if (tx?.blockNumber) timestamp = (await provider.getBlock(tx.blockNumber)).timestamp;
  await transationsTable()
    .update({ status: tx.blockNumber ? 1 : 0, timestamp })
    .eq('hash', txHash);
};

export const updateTransactionCategory = async (id: number, category_id: number) => {
  await transationsTable().update({ category_id }).match({ id: id });
};
