import { Flex, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import Loading from '../../../components/Loading';
import { ButtonWithAdmingRights } from '../../../components/withConnectedWallet';
import { usePool } from '../../../hooks/usePool';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { getSafeAdmins, getSafeTreshold } from '../../../services/gnosisServices';
import { getMembers } from '../../../services/membersService';
import { addAdmin, removeAdmin } from '../../../services/transactionsServices';
import { User } from '../../../types';
import { compareAddress } from '../../../utils';
import {
  ReviewTransactionModal,
  ReviewTransactionModalRef,
} from '../../transactions/components/ReviewTransactionModal';
import {
  SubmittingTransactionModal,
  SubmittingTxModalRef,
} from '../../transactions/components/SubmittingTransactionModal';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef,
} from '../../transactions/components/TransactionSubmittedModal';
import { AddAdminFormValue, AddAdminModal } from '../components/addAdminModal';
import { AdminsList } from '../components/AdminsList';
import {
  RemoveAdminFormValue,
  RemoveAdminModal,
  RemoveAdminModalRef,
} from '../components/RemoveAdminModal';

export const AdminsPage = () => {
  const [adminAddressess, setAdminAddressess] = useState<string[]>([]);
  const [currentThreshold, setcurrentTreshold] = useState(1);
  const [users, setLookups] = useState<User[]>([]);
  const { pool } = usePool();
  const { provider } = useWeb3Auth();
  const {
    isOpen: isOpenSetAdminModal,
    onClose: onCloseSetAdminModal,
    onOpen: onOpenSetAdminModal,
  } = useDisclosure();
  const toast = useToast();
  const reviewTxRef = useRef<ReviewTransactionModalRef>(null);
  const txSubmittedRef = useRef<TransactionSubmittedModalRef>(null);
  const removeAdminModaldRef = useRef<RemoveAdminModalRef>(null);
  const submittingRef = useRef<SubmittingTxModalRef>(null);
  const signer = (provider as Web3Provider)?.getSigner();
  const [loading, setLoading] = useState(true);

  const adminsAddressLookup = useMemo(
    () => users.filter((l) => !!adminAddressess.find((a) => compareAddress(a, l.wallet))),
    [users, adminAddressess],
  );

  const loadAdminAddresses = useCallback(async () => {
    if (pool?.chain_id && pool.gnosis_safe_address) {
      const addresses = await getSafeAdmins(pool.chain_id, pool.gnosis_safe_address);
      setAdminAddressess(addresses);
      setLoading(false);
    }
  }, [pool?.chain_id, pool?.gnosis_safe_address]);

  useEffect(() => {
    if (pool?.gnosis_safe_address) {
      loadAdminAddresses();
      getMembers(pool.id).then((members) => setLookups(members?.map((m) => m.user!)));
      getSafeTreshold(pool.chain_id, pool.gnosis_safe_address).then(setcurrentTreshold);
    }
  }, [loadAdminAddresses, pool]);

  const onAdminAdded = async (hash?: string) => {
    onCloseSetAdminModal();
  };

  const reviewAddAdminTx = (formValue: AddAdminFormValue) => {
    const { user } = formValue;
    reviewTxRef.current?.open(`Add ${user.name} as an Admin`, 'addOwner', formValue, onAddmin);
  };

  const onAddmin = async (confirmed: boolean, { user, threshold: treshold }: AddAdminFormValue) => {
    if (confirmed && pool) {
      try {
        submittingRef.current?.open('addOwner');

        let tx = await addAdmin(signer, pool, user, treshold);

        if (tx) txSubmittedRef.current?.open(tx.type, tx.hash, tx.id);

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
      } finally {
        submittingRef.current?.close();
      }
    }
  };

  const onpenRemoveAdmin = (user: User) => {
    removeAdminModaldRef.current?.open(user, reviewRemoveAdminTx);
  };

  const reviewRemoveAdminTx = (formValue: RemoveAdminFormValue) => {
    const { user } = formValue;
    reviewTxRef.current?.open(
      `Remove ${user.name} as an Admin`,
      'removeOwner',
      formValue,
      onRemoveAdmin,
    );
  };

  const onRemoveAdmin = async (
    confirmed: boolean,
    { user, threshold: treshold }: RemoveAdminFormValue,
  ) => {
    if (confirmed && pool) {
      try {
        submittingRef.current?.open('removeOwner');

        let tx = await removeAdmin(signer, pool, user, treshold);
        if (tx) txSubmittedRef.current?.open(tx.type, tx.hash, tx.id);
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
      } finally {
        submittingRef.current?.close();
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
                  {currentThreshold} out of {adminAddressess.length}
                </b>{' '}
                admins
              </Text>
            </Flex>
            <ButtonWithAdmingRights size="sm" onClick={onOpenSetAdminModal}>
              Add Admin
            </ButtonWithAdmingRights>
          </Flex>
        </CardHeader>
        <CardBody>
          {!loading && pool && (
            <AdminsList
              chainId={pool.chain_id}
              admins={adminsAddressLookup}
              remove={onpenRemoveAdmin}
            />
          )}
          {loading && <Loading />}
        </CardBody>
      </Card>

      {isOpenSetAdminModal && (
        <AddAdminModal
          isOpen={isOpenSetAdminModal}
          onClose={onAdminAdded}
          users={users}
          adminAddressess={adminAddressess}
          addAdmin={reviewAddAdminTx}
          currenThreshold={currentThreshold}
        />
      )}
      <ReviewTransactionModal ref={reviewTxRef} />
      <RemoveAdminModal ref={removeAdminModaldRef} currentThreshold={currentThreshold} />
      <TransactionSubmittedModal ref={txSubmittedRef} chainId={pool?.chain_id} />
      <SubmittingTransactionModal ref={submittingRef} />
    </>
  );
};
