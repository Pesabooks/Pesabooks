import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast
} from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { ContractTransaction } from 'ethers';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectUserField } from '../../../components/Input/SelectUserField';
import { useNotifyTransaction } from '../../../hooks/useNotifyTransaction';
import { usePool } from '../../../hooks/usePool';
import { addAdmin, removeAdmin } from '../../../services/poolsService';
import { AddressLookup } from '../../../types';

export interface SetAdminModalProps {
  isOpen: boolean;
  onClose: (hash?: string) => void;
  lookups: AddressLookup[];
  adminAddressess: string[];
  onTxSuccess?: () => void;
  onTxFailed?: () => void;
  operation: 'add' | 'remove';
}

export const SetAdminModal = ({
  isOpen,
  onClose,
  lookups,
  adminAddressess,
  onTxSuccess,
  onTxFailed,
  operation,
}: SetAdminModalProps) => {
  const methods = useForm<{ user: AddressLookup }>();
  const { pool } = usePool();
  const { provider } = useWeb3React();
  const toast = useToast();
  const { notify } = useNotifyTransaction();

  const filteredLookups =
    operation === 'add'
      ? lookups?.filter((l) => !adminAddressess.find((a) => a === l.address))
      : lookups?.filter((l) => adminAddressess.find((a) => a === l.address));

  const onAdddAdmin = async ({ user }: { user: AddressLookup }) => {
    if (pool) {
      try {
        let tx: false | ContractTransaction;
        if (operation === 'add') tx = await addAdmin(pool, user, provider as Web3Provider);
        else tx = await removeAdmin(pool, user, provider as Web3Provider);
        if (tx) {
          notify(tx, 'add' ? `Add ${user.name} as an admin` : `Remove ${user.name} as an admin `);

          tx.wait().then(
            (r) => {
              onTxSuccess?.();
            },
            () => {
              onTxFailed?.();
            },
          );
          onClose(tx.hash);
        }
        methods.reset();
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add user as admin</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormProvider {...methods}>
            <SelectUserField
              label={operation === 'add' ? 'Select a member' : 'Select an admin'}
              mb="4"
              users={filteredLookups}
            />
          </FormProvider>
          <Text>
            Setting an admin is an on-chain operation and require a transaction to be send on the
            blockchain.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            isLoading={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(onAdddAdmin)}
          >
            {operation === 'add' ? 'Add as Admin' : 'Remove as admin'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
