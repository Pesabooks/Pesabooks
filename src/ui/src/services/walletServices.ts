import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ERC20__factory } from '@pesabooks/contracts/typechain';
import { BigNumber, ethers } from 'ethers';
import { Token as ParaswapToken, Transaction as ParaswapTransaction } from 'paraswap';
import { OptimalRate } from 'paraswap-core';
import { networks } from '../data/networks';
import { activitiesTable, supabase } from '../supabase';
import { Activity, TokenBase } from '../types';
import { SwapData } from '../types/transaction';
import { checksummed, notifyTransaction } from '../utils';

const getTimestamp = () => Math.floor(new Date().valueOf() / 1000);

export const approveToken = async (
  signer: JsonRpcSigner,
  chainId: number,
  amount: number,
  proxyContract: string,
  token: ParaswapToken,
) => {
  const tokenContract = ERC20__factory.connect(token.address, signer);
  const decimals = await tokenContract.decimals();
  const timestamp = getTimestamp();

  const tx = await tokenContract.approve(
    checksummed(proxyContract),
    ethers.utils.parseUnits(amount.toString(), decimals),
  );

  notifyTransaction(chainId, tx.hash);

  await activitiesTable().insert({
    hash: tx.hash,
    status: 'completed',
    type: 'unlockToken',
    chain_id: chainId,
    timestamp,
    metadata: {
      token: token,
      amount,
    } as any,
  });

  return tx;
};

export const sendToken = async (
  signer: JsonRpcSigner,
  chainId: number,
  amount: number,
  address: string,
  token: TokenBase,
) => {
  const tokenContract = ERC20__factory.connect(token.address, signer);
  const decimals = await tokenContract.decimals();
  const from = await signer.getAddress();

  const tx = await tokenContract.transfer(
    checksummed(address),
    ethers.utils.parseUnits(amount.toString(), decimals),
  );

  notifyTransaction(chainId, tx.hash);

  await activitiesTable().insert({
    hash: tx.hash,
    status: 'completed',
    type: 'transfer_out',
    chain_id: chainId,
    metadata: {
      transfer_from: from,
      transfer_to: address,
      token: {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: token.image,
      },
      amount: amount,
    },
  });

  return tx;
};

export const sendNativeToken = async (
  signer: JsonRpcSigner,
  chainId: number,
  amount: number,
  address: string,
) => {
  const network = networks[chainId];
  const from = await signer.getAddress();

  const tx = await signer.sendTransaction({
    to: checksummed(address),
    value: ethers.utils.parseUnits(amount.toString(), network.nativeCurrency.decimals),
  });

  notifyTransaction(chainId, tx.hash);

  await activitiesTable().insert({
    hash: tx.hash,
    status: 'completed',
    type: 'transfer_out',
    chain_id: chainId,
    metadata: {
      transfer_from: from,
      transfer_to: address,
      token: {
        address: '',
        symbol: network.nativeCurrency.symbol,
        name: network.nativeCurrency.name,
        decimals: network.nativeCurrency.decimals,
        image: '',
        is_native: true,
      },
      amount: amount,
    },
  });

  return tx;
};

export const swapTokens = async (
  signer: JsonRpcSigner,
  paraswapTx: ParaswapTransaction,
  tokenFrom: ParaswapToken,
  tokenTo: ParaswapToken,
  priceRoute: OptimalRate,
) => {
  const { to, value, data, chainId, from } = paraswapTx;

  const tx = await signer.sendTransaction({
    from,
    to,
    value: BigNumber.from(value),
    data,
  });

  notifyTransaction(chainId, tx.hash);

  await activitiesTable().insert({
    hash: tx.hash,
    status: 'completed',
    type: 'swap',
    chain_id: chainId,
    metadata: {
      src_token: tokenFrom,
      src_usd: priceRoute.srcUSD,
      src_amount: priceRoute.srcAmount,
      dest_token: tokenTo,
      dest_amount: priceRoute.destAmount,
      dest_usd: priceRoute.destUSD,
      gas_cost: priceRoute.gasCost,
      gas_cost_usd: priceRoute.gasCostUSD,
    } as SwapData,
  });

  return tx;
};

export const estimateApprove = async (
  provider: Web3Provider,
  proxyContract: string,
  token: ParaswapToken,
  amount: number,
) => {
  const signer = provider.getSigner();
  const tokenContract = ERC20__factory.connect(token.address, signer);
  const decimals = await tokenContract.decimals();
  const _amount = ethers.utils.parseUnits(amount.toString(), decimals);

  const gasLimit = await tokenContract.estimateGas.approve(checksummed(proxyContract), _amount);

  return fee(provider, gasLimit);
};

export const estimateTokenTransfer = async (
  provider: Web3Provider,
  address: string,
  contract: string,
  amount: number,
) => {
  const signer = provider.getSigner();
  const tokenContract = ERC20__factory.connect(contract, signer);
  const decimals = await tokenContract.decimals();
  const _amount = ethers.utils.parseUnits(amount.toString(), decimals);

  const gasLimit = await tokenContract.estimateGas.transfer(checksummed(address), _amount);

  return fee(provider, gasLimit);
};

export const purchaseToken = async (
  chainId: number,
  rampId: string,
  rampPurchaseViewToken: string | undefined,
  address: string,
  amount: string,
  finalTxHash: string | undefined,
  token: TokenBase,
) => {
  const activity: Partial<Activity> = {
    type: 'purchase',
    status: 'pending',
    timestamp: Math.floor(new Date().valueOf() / 1000),
    chain_id: chainId,
    metadata: {
      ramp_id: rampId,
      ramp_purchase_view_token: rampPurchaseViewToken,
      transfer_to: address,
      token: {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        image: `${process.env.PUBLIC_URL}/${token.image}`,
      },
      amount,
    },
    hash: finalTxHash,
  };

  await activitiesTable().insert(activity);
};

export const getAllActivities = async (chainId: number, pageSize: number, pageIndex: number) => {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase()
    .rpc<Activity>(
      'get_user_activities',
      {
        chain_id: chainId,
      },
      {
        count: 'exact',
      },
    )
    .range(from, to);

  return { data: data ?? [], total: count ?? 0 };
};

const fee = async (provider: Web3Provider, gasLimit: BigNumber) => {
  const feeData = await provider.getFeeData();

  if (feeData.maxPriorityFeePerGas) {
    return feeData.maxPriorityFeePerGas.mul(gasLimit);
  } else if (feeData.gasPrice) return feeData.gasPrice.mul(gasLimit);
};
