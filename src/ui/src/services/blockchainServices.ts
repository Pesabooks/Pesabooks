import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import {
  Controller__factory,
  ERC20,
  ERC20__factory,
  PoolSafe__factory,
  Registry__factory,
} from '@pesabooks/contracts/typechain';
import { BigNumber, ethers, Signer } from 'ethers';
import { networks } from '../data/networks';

export const getNetwork = (chain_id: number) => networks[chain_id];

export const defaultProvider = (chain_id: number) => {
  let url = networks[chain_id].rpcUrls[0];
  return new ethers.providers.JsonRpcProvider(url);
};

export const getTokenContract = (provider: JsonRpcProvider, address: string): ERC20 => {
  return ERC20__factory.connect(address, provider);
};

export const getControllerContract = async (
  chainId: number,
  signerOrPovider: JsonRpcProvider | Signer,
) => {
  const registryAddress = networks[chainId].registryAddress;

  const registry = await Registry__factory.connect(registryAddress, signerOrPovider);
  const controllerAddress = await registry.getAddress('ControllerAddress');
  return Controller__factory.connect(controllerAddress, signerOrPovider);
};

export const getPoolContract = (
  contract_address: string,
  signerOrPovider: JsonRpcProvider | Signer,
) => {
  return PoolSafe__factory.connect(contract_address, signerOrPovider);
};

export const getAddressBalance = async (
  chain_id: number,
  tokenAddress: string,
  accountAddress: string,
): Promise<number> => {
  const tokenContract = getTokenContract(defaultProvider(chain_id), tokenAddress);
  const balance = await tokenContract.balanceOf(accountAddress);
  const decimals = await tokenContract.decimals();

  const formattedBalance = ethers.utils.formatUnits(balance, decimals);
  return Number.parseFloat(formattedBalance);
};

export const isTokenApproved = async (
  provider: Web3Provider,
  tokenAddress: string,
  poolAddress: string,
  amount: number,
) => {
  const tokenContract = getTokenContract(provider, tokenAddress);
  const signer = provider.getSigner();
  const allowance = await tokenContract.allowance(await signer.getAddress(), poolAddress);
  const approved = allowance.gte(BigNumber.from(amount));
  return approved;
};

export async function approveToken(
  provider: Web3Provider,
  tokenAddress: string,
  poolAddress: string,
) {
  const signer = provider.getSigner();
  const tokenContract = getTokenContract(provider, tokenAddress);
  const totalSupply = await tokenContract.totalSupply();
  await (await tokenContract.connect(signer).approve(poolAddress, totalSupply)).wait();
}
