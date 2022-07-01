import { JsonRpcProvider } from '@ethersproject/providers';
import {
  Controller__factory,
  ERC20,
  ERC20__factory,
  PoolSafe__factory,
  Registry__factory,
} from '@pesabooks/contracts/typechain';
import { ethers, Signer } from 'ethers';
import { networks } from '../data/networks';

export const getNetwork = (chain_id: number) => networks[chain_id];

export const defaultProvider = (chain_id: number) => {
  return new ethers.providers.InfuraProvider(chain_id, process.env.REACT_APP_INFURA_KEY);
};

export const getTokenContract = (chainId: number, address: string): ERC20 => {
  return ERC20__factory.connect(address, defaultProvider(chainId));
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
  const tokenContract = getTokenContract(chain_id, tokenAddress);
  const balance = await tokenContract.balanceOf(accountAddress);
  const decimals = await tokenContract.decimals();

  const formattedBalance = ethers.utils.formatUnits(balance, decimals);
  return Number.parseFloat(formattedBalance);
};

export const onTransactionComplete = async (
  chain_id: number,
  hash: string,
  onComplete: Function,
  onFailed?: Function,
) => {
  const provider = defaultProvider(chain_id);
  var tx = await provider.getTransaction(hash);
  await tx.wait().then(
    () => onComplete(),
    () => onFailed?.(),
  );
};
