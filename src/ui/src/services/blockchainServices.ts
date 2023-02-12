import { JsonRpcProvider } from '@ethersproject/providers';
import { ERC20, ERC20__factory, PoolSafe__factory } from '@pesabooks/contracts/typechain';
import { ethers, Signer } from 'ethers';
import { networks } from '../data/networks';

export const getNetwork = (chain_id: number) => networks[chain_id];

export const defaultProvider = (chain_id: number) => {
  // return new ethers.providers.InfuraProvider(chain_id, import.meta.env.VITE_INFURA_KEY);
  let url = networks[chain_id].rpcUrls[0];
  return new ethers.providers.JsonRpcProvider(url);
};

export const getTokenContract = (chainId: number, address: string): ERC20 => {
  return ERC20__factory.connect(address, defaultProvider(chainId));
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

  return +ethers.utils.formatUnits(balance, decimals);
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

export const getTokenAllowance = async (
  chainId: number,
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
) => {
  const tokenContract = getTokenContract(chainId, tokenAddress);
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);

  return allowance;
};
