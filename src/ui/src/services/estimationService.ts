import { Web3Provider } from '@ethersproject/providers';
import { ERC20__factory } from '@pesabooks/contracts/typechain';
import { BigNumber, ethers } from 'ethers';
import { Transaction as ParaswapTx } from 'paraswap';
import { TransactionData } from '../types';
import { getAddOwnerTx, getRemoveOwnerTx, getSafeTransaction } from './gnosisServices';

const INITIAL_SAFE_CREATION_TX_GAS_COST = 282912;

export const estimateTransaction = async (
  provider: Web3Provider,
  transactionData: TransactionData,
) => {
  const { from, to, data, value } = transactionData;
  const tx = {
    from,
    to: to,
    data: data,
    value: value,
  };
  const gasLimit = await provider.estimateGas(tx);
  return fee(provider, gasLimit);
};

export const estimateTransfer = async (
  provider: Web3Provider,
  tokenAddress: string,
  amount: number,
  recipient: string,
) => {
  const signer = provider.getSigner();
  const tokenContract = ERC20__factory.connect(tokenAddress, signer);
  const decimals = await tokenContract.decimals();

  const _amount = ethers.utils.parseUnits(amount.toString(), decimals);

  const gasLimit = await tokenContract.estimateGas.transfer(recipient, _amount);

  return fee(provider, gasLimit);
};

export const estimateSafeCreation = async (provider: Web3Provider) => {
  return fee(provider, BigNumber.from(INITIAL_SAFE_CREATION_TX_GAS_COST));
};

export const estimateApprove = async (
  provider: Web3Provider,
  chain_id: number,
  safeAddress: string,
  spender: string,
  tokenAddress: string,
) => {
  const maxAllowance = BigNumber.from('2').pow(BigNumber.from('256').sub(BigNumber.from('1')));
  const data = ERC20__factory.createInterface().encodeFunctionData('approve', [
    spender,
    maxAllowance,
  ]);

  return estimateTransaction(provider, {
    from: safeAddress,
    to: tokenAddress,
    data,
    value: '0',
  });
};

export const estimateSwap = async (provider: Web3Provider, txParams: ParaswapTx) => {
  return estimateTransaction(provider, {
    from: txParams.from,
    to: txParams.to,
    data: txParams.data,
    value: '0',
  });
};

export const estimateAddOwner = async (
  provider: Web3Provider,
  chain_id: number,
  safe_address: string,
  address: string,
  treshold: number,
) => {
  const signer = provider.getSigner();

  const safeTransaction = await getAddOwnerTx(signer, chain_id, safe_address, address, treshold);

  return estimateTransaction(provider, {
    from: safe_address,
    to: safeTransaction.to,
    data: safeTransaction.data,
    value: '0',
  });
};

export const estimateRemoveOwner = async (
  provider: Web3Provider,
  chain_id: number,
  safe_address: string,
  address: string,
  treshold: number,
) => {
  const signer = provider.getSigner();

  const safeTransaction = await getRemoveOwnerTx(signer, safe_address, address, treshold);

  return estimateTransaction(provider, {
    from: safe_address,
    to: safeTransaction.to,
    data: safeTransaction.data,
    value: '0',
  });
};

export const estimateSafeTransaction = async (
  provider: Web3Provider,
  chain_id: number,
  safe_address: string,
  safeTxHash: string,
) => {
  const safeTransaction = await getSafeTransaction(chain_id, safeTxHash);
  const { to, data, value } = safeTransaction;
  const tx = {
    from: safe_address,
    to: to,
    data: data,
    value: value,
  };
  const gasLimit = await provider.estimateGas(tx);
  return fee(provider, gasLimit);
};

export const estimateWithdraw = async (
  provider: Web3Provider,
  safeAddress: string,
  to: string,
  amount: BigNumber,
) => {
  const data = ERC20__factory.createInterface().encodeFunctionData('transfer', [to, amount]);

  return estimateTransaction(provider, {
    from: safeAddress,
    to: to,
    data: data,
    value: '0',
  });
};

export const fee = async (provider: Web3Provider, gasLimit: BigNumber) => {
  const feeData = await provider.getFeeData();

  if (feeData.maxPriorityFeePerGas) {
    return feeData.maxPriorityFeePerGas.mul(gasLimit);
  } else if (feeData.gasPrice) return feeData.gasPrice.mul(gasLimit);
};
