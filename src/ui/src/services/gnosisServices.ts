import { default as Safe, SafeAccountConfig, SafeFactory } from '@safe-global/safe-core-sdk';
import { SafeTransaction, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient from '@safe-global/safe-service-client';
import { ethers, Signer } from 'ethers';
import { defaultProvider } from './blockchainServices';
import { TokenBalance } from './covalentServices';

const getEthersAdapter = (signer: Signer) => {
  return new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });
};

const getDefaultEthersAdapter = (chainId: number) => {
  return new EthersAdapter({
    ethers,
    signerOrProvider: defaultProvider(chainId),
  });
};

const getSafeSDK = async (ethAdapter: EthersAdapter, safeAddress: string): Promise<Safe> => {
  return await Safe.create({
    ethAdapter,
    safeAddress,
  });
};

const getServiceClient = (ethAdapter: EthersAdapter, chainId: number) => {
  let txServiceUrl;

  switch (chainId) {
    case 1:
      txServiceUrl = 'https://safe-transaction.gnosis.io';
      break;
    case 4:
      txServiceUrl = 'https://safe-transaction.rinkeby.gnosis.io/';
      break;
    case 5:
      txServiceUrl = 'https://safe-transaction.goerli.gnosis.io/';
      break;
    case 137:
      txServiceUrl = 'https://safe-transaction.polygon.gnosis.io/';
      break;
    case 56:
      txServiceUrl = 'https://safe-transaction.bsc.gnosis.io/';
      break;
    default:
      throw new Error();
  }

  return new SafeServiceClient({ txServiceUrl, ethAdapter });
};

const calculateThreshold = (membersCount: number) => {
  if (membersCount === 1) return 1;
  if (membersCount === 2) return 2;

  const isEven = membersCount % 2 === 0;
  if (isEven) return membersCount / 2 + 1;
  else return Math.ceil(membersCount / 2);
};

export const deploySafe = async (signer: Signer, owners: string[]) => {
  const ethAdapter = getEthersAdapter(signer);

  const safeFactory = await SafeFactory.create({ ethAdapter });

  if (!safeFactory) return;

  const safeAccountConfig: SafeAccountConfig = {
    owners,
    threshold: calculateThreshold(owners.length),
  };
  const safe = await safeFactory.deploySafe({ safeAccountConfig });

  return ethers.utils.getAddress(safe.getAddress());
};

export const createSafeTransaction = async (
  signer: Signer,
  chainId: number,
  safeAddress: string,
  transaction: SafeTransactionDataPartial,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  const nonce = await getNextTxNonce(chainId, safeAddress);

  return await safeSdk.createTransaction({ safeTransactionData: transaction, options: { nonce } });
};

export const proposeSafeTransaction = async (
  signer: Signer,
  chainId: number,
  safeAddress: string,
  safeTransaction: SafeTransaction,
) => {
  const signerAddress = await signer.getAddress();
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  const safeService = getServiceClient(ethAdapter, chainId);

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);

  const signature = await safeSdk.signTransactionHash(safeTxHash);

  await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: signerAddress,
    senderSignature: signature.data,
    origin: 'pesabooks',
  });

  return safeTxHash;
};

export const confirmSafeTransaction = async (
  signer: Signer,
  chainId: number,
  safeAddress: string,
  safeTxHash: string,
) => {
  const ethAdapter = getEthersAdapter(signer);

  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  const safeService = getServiceClient(ethAdapter, chainId);

  if (!safeSdk || !safeService) return;

  let signature;
  try {
    signature = await safeSdk.signTransactionHash(safeTxHash);
  } catch (error) {
    console.error(error);
    return;
  }
  await safeService.confirmTransaction(safeTxHash, signature.data);
};

export const executeSafeTransaction = async (
  signer: Signer,
  safeAddress: string,
  safeTransaction: SafeTransaction,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);

  if (!safeSdk) return;

  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);

  return executeTxResponse.transactionResponse;
};

export const executeSafeTransactionByHash = async (
  signer: Signer,
  chainId: number,
  safeAddress: string,
  safeTxHash: string,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  const safeService = getServiceClient(ethAdapter, chainId);

  const transaction = await safeService.getTransaction(safeTxHash);

  const executeTxResponse = await safeSdk.executeTransaction(transaction);

  return executeTxResponse.transactionResponse;
};

export const getAddOwnerTx = async (
  signer: Signer,
  chainId: number,
  safeAddress: string,
  address: string,
  treshold: number,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  const nonce = await getNextTxNonce(chainId, safeAddress);

  return safeSdk.createAddOwnerTx({ ownerAddress: address, threshold: treshold }, { nonce });
};

export const getRemoveOwnerTx = async (
  signer: Signer,
  chainId: number,
  safeAddress: string,
  address: string,
  treshold: number,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  const nonce = await getNextTxNonce(chainId, safeAddress);

  return safeSdk.createRemoveOwnerTx({ ownerAddress: address, threshold: treshold }, { nonce });
};

export const getChangeThresholdTx = async (
  signer: Signer,
  chainId: number,
  safeAddress: string,
  threshold: number,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  const nonce = await getNextTxNonce(chainId, safeAddress);

  return safeSdk.createChangeThresholdTx(threshold, { nonce });
};

export const createSafeRejectionTransaction = async (
  signer: Signer,
  safeAddress: string,
  nonce: number,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);

  const safeTransaction = await safeSdk.createRejectionTransaction(nonce);
  return safeTransaction;
};

export const getSafeTransaction = async (chainId: number, safeTxHash: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeService = getServiceClient(ethAdapter, chainId);

  return await safeService.getTransaction(safeTxHash);
};

export const getSafePendingTransactions = async (chainId: number, safeTxHash: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeService = getServiceClient(ethAdapter, chainId);

  const response = await safeService.getPendingTransactions(safeTxHash);
  return response.results;
};

export const getSafeAdmins = async (chainId: number, safeAddress: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);

  const toto = await safeSdk.getOwners();
  return toto;
};

export const getSafeTreshold = async (chainId: number, safeAddress: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);

  return safeSdk.getThreshold();
};

export const getSafeTransactionHash = async (
  signer: Signer,
  safeAddress: string,
  safeTransaction: SafeTransaction,
) => {
  const ethAdapter = getEthersAdapter(signer);
  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);

  return await safeSdk.getTransactionHash(safeTransaction);
};

export const getNextTxNonce = async (chainId: number, safeAddress: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeService = getServiceClient(ethAdapter, chainId);

  return safeService.getNextNonce(safeAddress);
};

export const getSafeNonce = async (chainId: number, safeAddress: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeSdk = await getSafeSDK(ethAdapter, safeAddress);
  return safeSdk.getNonce();
};

export const getSafeBalances = async (chainId: number, safeAddress: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeService = getServiceClient(ethAdapter, chainId);
  return (await safeService.getUsdBalances(safeAddress, { excludeSpamTokens: true }))
    .filter((b) => b.balance !== '0')
    .map(
      (b) =>
        ({
          balance: b.balance,
          quote: Number.parseFloat(b.fiatBalance),
          token: {
            address: b.tokenAddress,
            symbol: b.token.symbol,
            decimals: b.token.decimals,
            name: b.token.name,
            image: b.token.logoUri,
            is_native: false,
          },
        } as TokenBalance),
    );
};

export const estimateSafeTransactionByHash = async (
  chainId: number,
  safeAddress: string,
  safeTxHash: string,
) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeService = getServiceClient(ethAdapter, chainId);

  const transaction = await safeService.getTransaction(safeTxHash);

  const reponse = await safeService.estimateSafeTransaction(safeAddress, {
    operation: transaction.operation,
    value: transaction.value,
    to: transaction.to,
    data: transaction.data,
  });

  return reponse.safeTxGas;
};

export const estimateSafeTransaction = async (
  chainId: number,
  safeAddress: string,
  txParam: { operation?: number; value: string; to: string; data?: string },
) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);
  const safeService = getServiceClient(ethAdapter, chainId);
  const reponse = await safeService.estimateSafeTransaction(safeAddress, {
    operation: txParam.operation ?? 0,
    value: txParam.value,
    to: txParam.to,
    data: txParam.data,
  });

  return reponse.safeTxGas;
};
