import Notify from 'bnc-notify';
import { getTxScanLink } from '../services/transactionsServices';

export const notifyTransaction = (chainId: number, hash: string) => {
  try {
    var notify = Notify({
      dappId: process.env.REACT_APP_BLOCKNATIVE_KEY,
      networkId: chainId,
      darkMode: true,
    });

    const { emitter } = notify.hash(hash);
    emitter.on('all', (t) => ({ link: getTxScanLink(hash, chainId) }));
  } catch (e) {
    console.error(e);
  }
};
