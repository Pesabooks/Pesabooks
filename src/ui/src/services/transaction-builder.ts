import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ERC20__factory } from '@pesabooks/contracts/typechain';
import { SafeTransaction } from '@safe-global/safe-core-sdk-types';
import { Transaction } from '@sentry/tracing';
import { BigNumber, ethers } from 'ethers';
import { Token as ParaswapToken, Transaction as ParaswapTransaction } from 'paraswap';
import { OptimalRate } from 'paraswap-core';
import { Pool, User } from '../types';
import { AddOrRemoveOwnerData, NewTransaction, SwapData } from '../types/transaction';
import { checksummed } from '../utils';
import { getTokenContract } from './blockchainServices';
import { getAddOwnerTx, getChangeThresholdTx, getRemoveOwnerTx } from './gnosisServices';

export interface transactionParam {
  transaction: Transaction;
  safeTransaction: SafeTransaction;
}

export const buildDepositTx = async (
  provider: Web3Provider,
  pool: Pool,
  user: User,
  category_id: number,
  amount: number,
  memo: string | null,
) => {
  const { token } = pool;
  if (token == null) throw new Error();
  const signer = provider.getSigner();

  const from = checksummed(await signer.getAddress());
  const to = checksummed(pool.gnosis_safe_address!);
  const tokenAddress = checksummed(token.address);

  const tokenContract = ERC20__factory.connect(tokenAddress, signer);
  const decimals = await tokenContract.decimals();

  const _amount = ethers.utils.parseUnits(amount.toString(), decimals);

  const transaction: NewTransaction = {
    memo: memo,
    type: 'deposit',
    category_id: category_id,
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      transfer_from_name: user.username!,
      transfer_from: from,
      transfer_to: to,
      transfer_to_name: pool.name,
      token: {
        address: tokenAddress,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: `${process.env.PUBLIC_URL}/${token.image}`,
      },
      amount: amount,
    },
    transaction_data: {
      from,
      to: checksummed(tokenAddress),
      value: '0',
      data: ERC20__factory.createInterface().encodeFunctionData('transfer', [to, _amount]),
    },
  };

  return transaction;
};

export const buildWithdrawTx = async (
  pool: Pool,
  category_id: number,
  amount: number,
  memo: string | null,
  user: User,
): Promise<NewTransaction> => {
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
    metadata: {
      transfer_from_name: pool.name,
      transfer_from: from,
      transfer_to: to,
      transfer_to_name: user.username!,
      token: {
        address: tokenAddress,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: `${process.env.PUBLIC_URL}/${token.image}`,
      },
      amount: amount,
    },
    transaction_data: {
      from,
      to: checksummed(tokenAddress),
      value: '0',
      data: ERC20__factory.createInterface().encodeFunctionData('transfer', [
        to,
        ethers.utils.parseUnits(amount.toString(), decimals),
      ]),
    },
  };

  return transaction;
};

export const buildAddAdminTx = async (
  signer: JsonRpcSigner,
  pool: Pool,
  user: User,
  currentTreshold: number,
  threshold: number,
) => {
  const txData = await getAddOwnerTx(
    signer,
    pool.chain_id,
    pool.gnosis_safe_address!,
    checksummed(user.wallet),
    threshold,
  );
  const transaction: NewTransaction = {
    type: 'addOwner',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
    metadata: {
      address: user.wallet,
      user_id: user.id,
      username: user.username!,
      threshold: threshold,
      current_threshold: currentTreshold,
    },
    transaction_data: { from: pool.gnosis_safe_address!, ...txData },
  };

  return transaction;
};

export const BuildRemoveAdminTx = async (
  signer: JsonRpcSigner,
  pool: Pool,
  user: User,
  currentTreshold: number,
  threshold: number,
) => {
  const safeTransaction = await getRemoveOwnerTx(
    signer,
    pool.gnosis_safe_address!,
    checksummed(user.wallet),
    threshold,
  );

  const transaction: NewTransaction = {
    type: 'removeOwner',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
    metadata: {
      address: user.wallet,
      user_id: user.id,
      username: user.username,
      current_threshold: currentTreshold,
      threshold: threshold,
    } as AddOrRemoveOwnerData,
    transaction_data: { from: pool.gnosis_safe_address!, ...safeTransaction },
  };

  return transaction;
};

export const buildChangeThresholdTx = async (
  signer: JsonRpcSigner,
  pool: Pool,
  threshold: number,
  currentThresold: number,
) => {
  const safeTransaction = await getChangeThresholdTx(signer, pool.gnosis_safe_address!, threshold);

  const transaction: NewTransaction = {
    type: 'changeThreshold',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
    metadata: {
      threshold,
      current_threshold: currentThresold,
    },
    transaction_data: { from: pool.gnosis_safe_address!, ...safeTransaction },
  };

  return transaction;
};

export const buildApproveTokenTx = async (
  pool: Pool,
  amount: number | undefined,
  proxyContract: string,
  token: ParaswapToken,
) => {
  const tokenContract = getTokenContract(pool.chain_id, token.address);
  const decimals = await tokenContract.decimals();
  const maxAllowance = BigNumber.from('2').pow(BigNumber.from('256').sub(BigNumber.from('1')));

  const txData = {
    to: checksummed(token.address),
    value: '0',
    data: ERC20__factory.createInterface().encodeFunctionData('approve', [
      checksummed(proxyContract),
      amount ? ethers.utils.parseUnits(amount.toString(), decimals) : maxAllowance,
    ]),
  };

  const transaction: NewTransaction = {
    type: 'unlockToken',
    pool_id: pool.id,
    category_id: null,
    memo: null,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    metadata: {
      token: token,
      amount,
    } as any,
    transaction_data: { from: pool.gnosis_safe_address!, ...txData },
  };

  return transaction;
};

export const buildSwapTokensTx = async (
  pool: Pool,
  paraswapTx: ParaswapTransaction,
  tokenFrom: ParaswapToken,
  tokenTo: ParaswapToken,
  slippage: number,
  priceRoute: OptimalRate,
) => {
  const txData = {
    from: pool.gnosis_safe_address!,
    to: checksummed(paraswapTx.to),
    value: paraswapTx.value,
    data: paraswapTx.data,
  };

  const transaction: NewTransaction = {
    type: 'swap',
    pool_id: pool.id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    category_id: null,
    memo: null,
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
    transaction_data: txData,
  };

  return transaction;
};
