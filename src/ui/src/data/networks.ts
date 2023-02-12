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
  active: boolean;
  logoUrl: string;
}

export const networks: { [chainId: number]: Network } = {
  1: {
    chainId: '0x1',
    rpcUrls: [`https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`],
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://etherscan.io/'],
    isTest: false,
    active: false,
    logoUrl: 'images/chains/ethereum.svg',
  },
  80001: {
    chainId: '0x13881',
    rpcUrls: [`https://polygon-mumbai.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`],
    chainName: 'Polygon Testnet Mumbai',
    nativeCurrency: {
      name: 'tMATIC',
      symbol: 'tMATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    isTest: true,
    active: false,
    logoUrl: 'images/chains/polygon-matic-logo.svg',
  },
  4: {
    chainId: '0x4',
    rpcUrls: [`https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`],
    chainName: 'Rinkeby Testnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
    isTest: true,
    active: false,
    logoUrl: 'images/chains/ethereum.svg',
  },
  5: {
    chainId: '0x5',
    rpcUrls: [`https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`],
    chainName: 'Goerli Test Network',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    isTest: true,
    active: true,
    logoUrl: 'images/chains/ethereum.svg',
  },
  137: {
    chainId: '0x89',
    rpcUrls: [`https://polygon-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`],
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://polygonscan.com/'],
    isTest: false,
    active: true,
    logoUrl: 'images/chains/polygon-matic-logo.svg',
  },
  56: {
    chainId: '0x38',
    rpcUrls: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
    ],
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://bscscan.com/'],
    isTest: false,
    active: true,
    logoUrl: 'images/chains/BNB.png',
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
