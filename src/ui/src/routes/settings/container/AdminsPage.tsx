import { Flex, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import Loading from '../../../components/Loading';
import { ConfirmationModal, ConfirmationRef } from '../../../components/Modals/ConfirmationModal';
import { ButtonWithConnectedWallet } from '../../../components/withConnectedWallet';
import { usePool } from '../../../hooks/usePool';
import { getSafeAdmins, getSafeTreshold } from '../../../services/gnosisServices';
import { getAddressLookUp } from '../../../services/poolsService';
import { addAdmin, removeAdmin } from '../../../services/transactionsServices';
import { AddressLookup } from '../../../types';
import { compareAddress } from '../../../utils';
import { AddAdminFormValue, AddAdminModal } from '../../members/components/addAdminModal';
import { AdminsList } from '../components/AdminsList';

export const AdminsPage = () => {
  const [adminAddressess, setAdminAddressess] = useState<string[]>([]);
  const [currentTreshold, setcurrentTreshold] = useState(0);
  const [lookups, setLookups] = useState<AddressLookup[]>([]);
  const { pool } = usePool();
  const { provider } = useWeb3React();
  const {
    isOpen: isOpenSetAdminModal,
    onClose: onCloseSetAdminModal,
    onOpen: onOpenSetAdminModal,
  } = useDisclosure();
  const toast = useToast();
  const confirmationRef = useRef<ConfirmationRef>(null);
  const signer = (provider as Web3Provider)?.getSigner();
  const [loading, setLoading] = useState(true);

  const adminsAddressLookup = useMemo(
    () => lookups.filter((l) => !!adminAddressess.find((a) => compareAddress(a, l.address))),
    [lookups, adminAddressess],
  );

  const loadAdminAddresses = useCallback(async () => {
    if (pool?.chain_id && pool.gnosis_safe_address) {
      const addresses = await getSafeAdmins(pool.chain_id, pool.gnosis_safe_address);
      setAdminAddressess(addresses);
      setLoading(false);
    }
  }, [pool?.chain_id, pool?.gnosis_safe_address]);

  useEffect(() => {
    if (pool) {
      loadAdminAddresses();
      getAddressLookUp(pool.id, 'user').then(setLookups);
      getSafeTreshold(pool.chain_id, pool.gnosis_safe_address).then(setcurrentTreshold);
    }
  }, [loadAdminAddresses, pool]);

  const onAdminAdded = async (hash?: string) => {
    onCloseSetAdminModal();
  };

  const onAddmin = async ({ user, treshold }: AddAdminFormValue) => {
    if (pool) {
      try {
        let tx = await addAdmin(signer, pool, user, treshold);
        if (tx?.hash) {
          (await (provider as Web3Provider)?.getTransaction(tx.hash)).wait().then(() => {
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
    confirmationRef.current?.open(
      `Are you sure you want to remove ${user.name} as an admin?`,
      user,
    );
  }, []);

  const onRemoveAdmin = async (confirmed: boolean, { user, treshold }: AddAdminFormValue) => {
    if (confirmed && pool) {
      try {
        let tx = await removeAdmin(signer, pool, user, treshold);
        if (tx?.hash) {
          (await (provider as Web3Provider)?.getTransaction(tx.hash)).wait().then(() => {
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

  return (
    <>
      <Card>
        <CardHeader mb="40px">
          <Flex justify="space-between" align="center" w="100%">
            <Flex direction="column">
              <Text fontSize="lg" fontWeight="bold" mb="6px">
                Manage administrators
              </Text>
              <Text color="gray.400" fontSize="sm" fontWeight="normal">
                Add, remove, replace or rename admin
              </Text>
              <Text color="gray.400" fontSize="sm" fontWeight="normal">
                Every transaction requires the confirmation of{' '}
                <b>
                  {currentTreshold} out of {adminAddressess.length}
                </b>{' '}
                admins
              </Text>
            </Flex>
            <ButtonWithConnectedWallet onlyAdmin={true} size="sm" onClick={onOpenSetAdminModal}>
              Add Admin
            </ButtonWithConnectedWallet>
          </Flex>
        </CardHeader>
        <CardBody>
          {!loading && pool && (
            <AdminsList
              chainId={pool.chain_id}
              admins={adminsAddressLookup}
              remove={confirmDeactivation}
            />
          )}
          {loading && <Loading />}
        </CardBody>
      </Card>

      {isOpenSetAdminModal && (
        <AddAdminModal
          isOpen={isOpenSetAdminModal}
          onClose={onAdminAdded}
          lookups={lookups}
          adminAddressess={adminAddressess}
          addAdmin={onAddmin}
          currenTreshold={currentTreshold}
        />
      )}
      <ConfirmationModal ref={confirmationRef} afterClosed={onRemoveAdmin} />
    </>
  );
};
