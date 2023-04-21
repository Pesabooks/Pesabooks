export interface Network {
  chainId: string;
  rpcUrl: string;
  websocketUrl?: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl: string;
  isTest: boolean;
  active: boolean;
  logoUrl: string;
  type: Type;
  gnosisServiceUrl: string;
}

enum Type {
  'L1' = 1,
  'L2' = 2,
  'Sidechain' = 3,
  'AltChain' = 4,
}

export const networks: { [chainId: number]: Network } = {
  1: {
    chainId: '0x1',
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://etherscan.io/',
    isTest: false,
    active: true,
    logoUrl: 'images/chains/ethereum.svg',
    type: Type.L1,
    gnosisServiceUrl: 'https://safe-transaction-mainnet.safe.global/',
  },
  5: {
    chainId: '0x5',
    rpcUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    websocketUrl: 'wss://eth-goerli.g.alchemy.com/v2/T_i4f_7MvSeXU557WFcYFFE-fvzz-mB3',
    chainName: 'Goerli Test Network',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://goerli.etherscan.io/',
    isTest: true,
    active: true,
    logoUrl: 'images/chains/ethereum.svg',
    type: Type.L1,
    gnosisServiceUrl: 'https://safe-transaction-base-testnet.safe.global/',
  },
  137: {
    chainId: '0x89',
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    websocketUrl: `wss://polygon-mainnet.g.alchemy.com/v2/T_i4f_7MvSeXU557WFcYFFE-fvzz-mB3`,
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrl: 'https://polygonscan.com/',
    isTest: false,
    active: true,
    logoUrl: 'images/chains/polygon-matic-logo.svg',
    type: Type.Sidechain,
    gnosisServiceUrl: 'https://safe-transaction-polygon.safe.global/',
  },
  56: {
    chainId: '0x38',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockExplorerUrl: 'https://bscscan.com/',
    isTest: false,
    active: true,
    logoUrl: 'images/chains/bsc.svg',
    type: Type.AltChain,
    gnosisServiceUrl: 'https://safe-transaction-bsc.safe.global/',
  },
  42161: {
    chainId: '0xA4B1',
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    chainName: 'Arbitrum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://arbiscan.io/',
    isTest: false,
    active: true,
    logoUrl: 'images/chains/arbitrum.svg',
    type: Type.L2,
    gnosisServiceUrl: 'https://safe-transaction-arbitrum.safe.global/',
  },
  10: {
    chainId: '0xa',
    rpcUrl: `https://optimism-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
    chainName: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://optimistic.etherscan.io/',
    isTest: false,
    active: true,
    logoUrl: 'images/chains/optimism.svg',
    type: Type.L2,
    gnosisServiceUrl: 'https://safe-transaction-optimism.safe.global/',
  },
};
