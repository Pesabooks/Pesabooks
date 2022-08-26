import { Web3Provider } from '@ethersproject/providers';
import { ERC20__factory } from '@pesabooks/contracts/typechain';
import { BigNumber, ethers } from 'ethers';
import { Transaction as ParaswapTx } from 'paraswap';
import {
  estimateSafeTransaction,
  estimateSafeTransactionByHash,
  getAddOwnerTx,
  getRemoveOwnerTx,
} from './gnosisServices';

const INITIAL_SAFE_CREATION_TX_GAS_COST = 282912;

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
) => {
  const maxAllowance = BigNumber.from('2').pow(BigNumber.from('256').sub(BigNumber.from('1')));
  const data = ERC20__factory.createInterface().encodeFunctionData('approve', [
    spender,
    maxAllowance,
  ]);

  const gasLimit = await estimateSafeTransaction(chain_id, safeAddress, {
    value: '0',
    to: safeAddress,
    data: data,
  });

  return fee(provider, BigNumber.from(gasLimit));
};

export const estimateSwap = async (provider: Web3Provider, txParams: ParaswapTx) => {
  const gasLimit = await estimateSafeTransaction(txParams.chainId, txParams.from, {
    value: '0',
    to: txParams.to,
    data: txParams.data,
  });

  return fee(provider, BigNumber.from(gasLimit));
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

  const gasLimit = await estimateSafeTransaction(chain_id, safe_address, {
    value: '0',
    to: safeTransaction.data.to,
    data: safeTransaction.data.data,
  });

  return fee(provider, BigNumber.from(gasLimit));
};

export const estimateRemoveOwner = async (
  provider: Web3Provider,
  chain_id: number,
  safe_address: string,
  address: string,
  treshold: number,
) => {
  const signer = provider.getSigner();

  const safeTransaction = await getRemoveOwnerTx(signer, chain_id, safe_address, address, treshold);

  const gasLimit = await estimateSafeTransaction(chain_id, safe_address, {
    value: '0',
    to: safeTransaction.data.to,
    data: safeTransaction.data.data,
  });

  return fee(provider, BigNumber.from(gasLimit));
};

export const estimateTransaction = async (
  provider: Web3Provider,
  chain_id: number,
  safe_address: string,
  safeTxHash: string,
) => {
  const gasLimit = await estimateSafeTransactionByHash(chain_id, safe_address, safeTxHash);

  return fee(provider, BigNumber.from(gasLimit));
};

export const estimateWithdraw = async (
  provider: Web3Provider,
  chain_id: number,
  safeAddress: string,
  to: string,
  amount: BigNumber,
) => {
  const data = ERC20__factory.createInterface().encodeFunctionData('transfer', [to, amount]);

  const gasLimit = await estimateSafeTransaction(chain_id, safeAddress, {
    value: '0',
    to: to,
    data: data,
  });

  return fee(provider, BigNumber.from(gasLimit));
};

const fee = async (provider: Web3Provider, gasLimit: BigNumber) => {
  const feeData = await provider.getFeeData();

  if (feeData.maxPriorityFeePerGas) {
    return feeData.maxPriorityFeePerGas.mul(gasLimit);
  } else if (feeData.gasPrice) return feeData.gasPrice.mul(gasLimit);
};
