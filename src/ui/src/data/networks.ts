import { AddEthereumChainParameter } from '@web3-react/types';

export interface Network {
  chainId: string;
  rpcUrls: string[];
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
  isTest: boolean;
  registryAddress: string;
}

export const networks: { [chainId: number]: Network } = {
  80001: {
    chainId: '0x13881',
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
    chainName: 'Polygon Testnet Mumbai',
    nativeCurrency: {
      name: 'tMATIC',
      symbol: 'tMATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    isTest: true,
    registryAddress: '0x2549a1d70165d71B86D71537ccF7506181FB37c1',
  },
  137: {
    chainId: '0x89',
    rpcUrls: ['https://polygon-rpc.com'],
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://polygonscan.com/'],
    isTest: false,
    registryAddress: '0x8d618a58967ebBb421D848640A1D2886336484d3',
  },
};

export const getAddChainParameters = (chainId: number): AddEthereumChainParameter => {
  const chainInformation = networks[chainId];
  return {
    chainId,
    chainName: chainInformation.chainName,
    nativeCurrency: { ...chainInformation.nativeCurrency, decimals: 18 },
    rpcUrls: chainInformation.rpcUrls,
    blockExplorerUrls: chainInformation.blockExplorerUrls,
  };
};

export const RPCURLS: { [chainId: number]: string[] } = Object.keys(networks).reduce<{
  [chainId: number]: string[];
}>((accumulator, chainId) => {
  const validURLs: string[] = networks[Number(chainId)].rpcUrls;

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs;
  }

  return accumulator;
}, {});
