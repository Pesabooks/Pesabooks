import { Button, Flex, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { ConfirmationModal, ConfirmationRef } from '../../../components/Modals/ConfirmationModal';
import { withConnectedWallet } from '../../../components/withConnectedWallet';
import { useNotifyTransaction } from '../../../hooks/useNotifyTransaction';
import { usePool } from '../../../hooks/usePool';
import {
  addAdmin,
  getAddressLookUp,
  getAdminAddresses,
  removeAdmin,
} from '../../../services/poolsService';
import { AddressLookup } from '../../../types';
import { AddAdminModal } from '../../members/components/addAdminModal';
import { AdminsList } from '../components/AdminsList';

export const AdminsPage = () => {
  const [adminAddressess, setAdminAddressess] = useState<string[]>([]);
  const [lookups, setLookups] = useState<AddressLookup[]>([]);
  const { pool } = usePool();
  const { provider } = useWeb3React();
  const {
    isOpen: isOpenSetAdminModal,
    onClose: onCloseSetAdminModal,
    onOpen: onOpenSetAdminModal,
  } = useDisclosure();
  const { notify } = useNotifyTransaction();
  const toast = useToast();
  const confirmationRef = useRef<ConfirmationRef>(null);

  const adminsAddressLookup = useMemo(
    () =>
      lookups.filter(
        (l) => !!adminAddressess.find((a) => a.toLowerCase() === l.address.toLocaleLowerCase()),
      ),
    [lookups, adminAddressess],
  );

  const loadAdminAddresses = useCallback(() => {
    if (pool) getAdminAddresses(pool).then((addresses) => setAdminAddressess(addresses));
  }, [pool]);

  useEffect(() => {
    if (pool) {
      loadAdminAddresses();
      getAddressLookUp(pool.id, 'user').then(setLookups);
    }
  }, [loadAdminAddresses, pool]);

  const onAdminAdded = async (hash?: string) => {
    onCloseSetAdminModal();
  };

  const onAddmin = async (user: AddressLookup) => {
    if (pool) {
      try {
        let tx = await addAdmin(pool, user, provider as Web3Provider);
        if (tx) {
          notify(tx, `Add ${user.name} as an admin`);

          tx.wait().then((r) => {
            loadAdminAddresses();
          });

          onCloseSetAdminModal();
        }
      } catch (e: any) {
        toast({
          title: e?.data?.message ?? e.message,
          status: 'error',
          isClosable: true,
        });
      }
    }
  };

  const confirmDeactivation = useCallback((user: AddressLookup) => {
    confirmationRef.current?.open(`Are you sure you want to remove ${user.name} as an admin?`, user);
  }, []);

  const onRemoveAdmin = async (confirmed: boolean, user: AddressLookup) => {
    if (confirmed && pool) {
      try {
        let tx = await removeAdmin(pool, user, provider as Web3Provider);
        if (tx) {
          notify(tx, `Remove ${user.name} as an admin `);

          tx.wait().then((r) => {
            loadAdminAddresses();
          });
        }
      } catch (e: any) {
        toast({
          title: e?.data?.message ?? e.message,
          status: 'error',
          isClosable: true,
        });
      }
    }
  };

  const ButtonwithConnectedWallet = withConnectedWallet(Button, true);

  return (
    <>
      <Card>
        <CardHeader mb="40px">
          <Flex justify="space-between" align="center" w="100%">
            <Text fontSize="lg" fontWeight="bold">
              Manage Administrators
            </Text>
            <ButtonwithConnectedWallet size="sm" onClick={onOpenSetAdminModal}>
              Add Admin
            </ButtonwithConnectedWallet>
          </Flex>
        </CardHeader>
        <CardBody>
          <AdminsList admins={adminsAddressLookup} remove={confirmDeactivation} />
        </CardBody>
      </Card>

      {isOpenSetAdminModal && (
        <AddAdminModal
          isOpen={isOpenSetAdminModal}
          onClose={onAdminAdded}
          lookups={lookups}
          adminAddressess={adminAddressess}
          addAdmin={onAddmin}
        />
      )}
      <ConfirmationModal ref={confirmationRef} afterClosed={onRemoveAdmin} />
    </>
  );
};
