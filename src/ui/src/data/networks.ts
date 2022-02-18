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
}

export const networks: { [chainId: number]: Network } = {
  80001: {
    chainId: '0x13881',
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    chainName: 'Polygon Testnet Mumbai',
    nativeCurrency: {
      name: 'tMATIC',
      symbol: 'tMATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  137: {
    chainId: '0x89',
    rpcUrls: ['https://polygon-rpc.com/'],
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
};
