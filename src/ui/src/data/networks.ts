export interface Network {
  chainId: string;
  rpcUrls: string[];
  websockets?: string[];
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
    websockets: ['wss://eth-goerli.g.alchemy.com/v2/T_i4f_7MvSeXU557WFcYFFE-fvzz-mB3'],
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
    websockets: [`wss://polygon-mainnet.g.alchemy.com/v2/T_i4f_7MvSeXU557WFcYFFE-fvzz-mB3`],
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
