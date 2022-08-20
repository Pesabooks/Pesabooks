import { JsonRpcSigner } from '@ethersproject/providers';
import Safe, { EthSignSignature, SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk';
import { SafeTransaction, SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { ethers, Signer, VoidSigner } from 'ethers';
import { defaultProvider } from './blockchainServices';

const getEthersAdapter = (signer: Signer) => {
  return new EthersAdapter({
    ethers,
    signer,
  });
};

const getDefaultEthersAdapter = (chainId: number) => {
  return new EthersAdapter({
    ethers,
    signer: new VoidSigner('', defaultProvider(chainId)),
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

export const deploySafe = async (signer: JsonRpcSigner) => {
  const signerAddress = await signer.getAddress();

  const ethAdapter = getEthersAdapter(signer);

  const safeFactory = await SafeFactory.create({ ethAdapter });

  if (!safeFactory) return;

  const safeAccountConfig: SafeAccountConfig = {
    owners: [signerAddress],
    threshold: 1,
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

  const adjustedTransaction: SafeTransactionDataPartial = {
    ...transaction,
    nonce,
  };
  return await safeSdk.createTransaction(adjustedTransaction);
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
  safeTransaction.addSignature(signature);

  await safeService.proposeTransaction({
    safeAddress,
    safeTransaction,
    safeTxHash,
    senderAddress: signerAddress,
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

  if (!safeSdk) return;
  const safeTransactionData = {
    to: transaction.to,
    value: transaction.value,
    data: transaction.data || '0x',
    operation: transaction.operation,
    safeTxGas: transaction.safeTxGas,
    baseGas: transaction.baseGas,
    gasPrice: Number(transaction.gasPrice),
    gasToken: transaction.gasToken,
    refundReceiver: transaction.refundReceiver,
    nonce: transaction.nonce,
  };
  const safeTransaction = await safeSdk.createTransaction(safeTransactionData);
  transaction.confirmations?.forEach((confirmation) => {
    const signature = new EthSignSignature(confirmation.owner, confirmation.signature);
    safeTransaction.addSignature(signature);
  });

  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);

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

  return safeSdk.getAddOwnerTx({ ownerAddress: address, threshold: treshold }, { nonce });
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

  return safeSdk.getRemoveOwnerTx({ ownerAddress: address, threshold: treshold }, { nonce });
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

export const getSafeBalance = async (chainId: number, safeAddress: string) => {
  const ethAdapter = getDefaultEthersAdapter(chainId);

  const safeService = getServiceClient(ethAdapter, chainId);

  const balances = await safeService.getUsdBalances(safeAddress, { excludeSpamTokens: true });

  return balances.reduce((balance, resp) => balance + Number.parseFloat(resp.fiatBalance), 0);
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
  return (await safeService.getUsdBalances(safeAddress, { excludeSpamTokens: true })).filter(
    (b) => b.balance !== '0',
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
