import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { TransactionData } from '../types';

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

export const estimateSafeCreation = async (provider: Web3Provider) => {
  return fee(provider, BigNumber.from(INITIAL_SAFE_CREATION_TX_GAS_COST));
};

export const fee = async (provider: Web3Provider, gasLimit: BigNumber) => {
  const feeData = await provider.getFeeData();
  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = feeData;

  let baseFee: BigNumber = BigNumber.from(0);

  if (maxFeePerGas) {
    const priority = maxPriorityFeePerGas;
    const base = priority ? maxFeePerGas.sub(priority) : maxFeePerGas;
    baseFee = base.mul(gasLimit);
  } else if (gasPrice) baseFee = gasPrice.mul(gasLimit);

  return baseFee;
};
