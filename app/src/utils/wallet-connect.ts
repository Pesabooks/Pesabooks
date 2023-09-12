import { Core } from '@walletconnect/core';
import { ICore } from '@walletconnect/types';
import { IWeb3Wallet, Web3Wallet } from '@walletconnect/web3wallet';
import { utils } from 'ethers';

export let web3wallet: IWeb3Wallet;
export let core: ICore;

export const EIP155_SIGNING_METHODS = {
  PERSONAL_SIGN: 'personal_sign',
  ETH_SIGN: 'eth_sign',
  ETH_SIGN_TRANSACTION: 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  ETH_SEND_RAW_TRANSACTION: 'eth_sendRawTransaction',
  ETH_SEND_TRANSACTION: 'eth_sendTransaction',
};

/**
 * Converts hex to utf8 string if it is valid bytes
 */
export function convertHexToUtf8(value: string) {
  if (utils.isHexString(value)) {
    return utils.toUtf8String(value);
  }

  return value;
}

export async function createWeb3Wallet() {
  core = new Core({
    projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
  });

  web3wallet = await Web3Wallet.init({
    core,
    metadata: {
      name: 'Pesabooks',
      description: 'Save and invest with friends and family',
      url: 'https://pesabooks.com',
      icons: ['https://pesabooks.com/assets/img/icon.png'],
    },
  });
}

export async function pair(params: { uri: string }) {
  const topic = params.uri.split('@')[0].split(':')[1];
  //get existing pairing
  const pairings = await core.pairing.getPairings();

  const existingPairing = pairings.find((pairing) => pairing.topic === topic);

  if (existingPairing) {
    await core.pairing.disconnect({ topic: existingPairing.topic });
  }
  return await core.pairing.pair({ uri: params.uri });
}
