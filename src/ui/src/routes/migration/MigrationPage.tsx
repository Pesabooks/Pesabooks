import { Button, Heading, VStack } from '@chakra-ui/react';
import type { Web3Provider } from '@ethersproject/providers';
import { SafeAccountConfig, SafeFactory } from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import { PoolSafe__factory } from '@pesabooks/contracts/typechain';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePool } from '../../hooks/usePool';
import { getControllerContract, getTokenContract } from '../../services/blockchainServices';
import { poolsTable } from '../../supabase';

export const MigrationPage = () => {
  const { pool } = usePool();
  const { provider } = useWeb3React();
  const [gnosisSafeAddress, setGnosisSafeAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const createSafe = async () => {
    setIsCreating(true);
    try {
      if (provider && pool) {
        const signer = (provider as Web3Provider).getSigner();
        const oldSafe = PoolSafe__factory.connect(pool.contract_address, signer);
        const admins = await oldSafe.getAdmins();

        const ethAdapter = new EthersAdapter({
          ethers,
          signer,
        });

        const safeFactory = await SafeFactory.create({ ethAdapter });

        if (!safeFactory) return;

        const safeAccountConfig: SafeAccountConfig = {
          owners: admins,
          threshold: 1,
        };
        const safe = await safeFactory.deploySafe({ safeAccountConfig });

        const gnosis_address = ethers.utils.getAddress(safe.getAddress());

        if (gnosis_address) {
          await poolsTable().update({ gnosis_safe_address: gnosis_address }).eq('id', pool.id);
          setGnosisSafeAddress(gnosis_address);
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const withdraw = async () => {
    setIsMigrating(true);

    try {
      const signer = (provider as Web3Provider).getSigner();

      if (signer && pool) {
        const { token } = pool;

        const safe = PoolSafe__factory.connect(pool.contract_address, signer);
        const controlller = await getControllerContract(pool.chain_id, signer);

        const tokenAddress = token?.address?.toLowerCase() ?? '';

        const tokenContract = getTokenContract(pool.chain_id, tokenAddress);
        const amount = await tokenContract.balanceOf(pool.contract_address);

        const tx = await controlller.withdraw(
          safe.address,
          tokenAddress,
          pool.gnosis_safe_address ?? gnosisSafeAddress,
          amount,
        );

        await tx.wait();
      }
    } finally {
      setIsMigrating(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>Migration</title>
      </Helmet>
      <Heading as="h2" size="lg">
        Migration
      </Heading>
      <VStack mt={30} gap={5}>
        <Button
          disabled={!!pool?.gnosis_safe_address || !!gnosisSafeAddress}
          onClick={createSafe}
          isLoading={isCreating}
        >
          Create Gnosis Safe
        </Button>
        <Button
          disabled={!pool?.gnosis_safe_address && !gnosisSafeAddress}
          onClick={withdraw}
          isLoading={isMigrating}
        >
          Migrate funds
        </Button>
      </VStack>
    </>
  );
};
