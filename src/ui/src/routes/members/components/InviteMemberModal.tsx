import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react';
import React from 'react';
import { useForm } from 'react-hook-form';

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (form: InviteMemberFormValue) => void;
}

export interface InviteMemberFormValue {
  email: string;
  name: string;
}

export const InviteMemberModal = ({ isOpen, onClose, onInvite }: InviteMemberModalProps) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberFormValue>();

  const onSubmit = async (form: InviteMemberFormValue) => {
    await onInvite(form);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add group member</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input id="name" {...register('name', { required: true })} />
                <FormErrorMessage>{errors.name && 'Name is required'}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel htmlFor="email">Email address</FormLabel>
                <Input id="email" type="email" {...register('email', { required: true })} />
                <FormErrorMessage>
                  {errors.email?.type === 'required' && 'Email is required'}
                </FormErrorMessage>
              </FormControl>
              <Button mt={4} isLoading={isSubmitting} type="submit">
                Invite
              </Button>
            </Stack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
