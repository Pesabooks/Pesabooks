import { Web3Provider } from '@ethersproject/providers';
import { TransactionData } from '@pesabooks/types';
import { BigNumber } from 'ethers';
import { getSafeTransaction } from './gnosisServices';

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

export const estimateSafeTransaction = async (
  provider: Web3Provider,
  gnosis_safe_address: string,
  chain_id: number,
  SafeTxHash: string,
) => {
  const { to, data, value } = await getSafeTransaction(chain_id, SafeTxHash);
  return estimateTransaction(provider, {
    from: gnosis_safe_address,
    to: to,
    data: data ?? '',
    value: value,
  });
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
