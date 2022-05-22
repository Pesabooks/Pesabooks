import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectUserField } from '../../../components/Input/SelectUserField';
import { AddressLookup } from '../../../types';

export interface AddAdminModalProps {
  isOpen: boolean;
  onClose: (hash?: string) => void;
  lookups: AddressLookup[];
  adminAddressess: string[];
  addAdmin: (address: AddressLookup) => Promise<void>;
}

export const AddAdminModal = ({
  isOpen,
  onClose,
  lookups,
  adminAddressess,
  addAdmin,
}: AddAdminModalProps) => {
  const methods = useForm<{ user: AddressLookup }>();


  const filteredLookups = lookups?.filter(
    (l) => !adminAddressess.find((a) => a.toLowerCase() === l.address.toLowerCase()),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add user as admin</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormProvider {...methods}>
            <SelectUserField label="Select a member" mb="4" users={filteredLookups} />
          </FormProvider>
          <Text>
            Setting an admin is an on-chain operation and require a transaction to be send on the
            blockchain.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button
            isLoading={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(({ user }) => addAdmin(user))}
          >
            Add as Admin
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
