import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Category } from '../../../types';

interface CategoryModalProps {
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: Category) => void;
  isSaving: boolean;
}

export const CategoryModal = ({ isOpen, onClose, onSave, isSaving }: CategoryModalProps) => {
  const submit = (values: Category) => {
    onSave(values);
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Category>();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(submit)}>
          <ModalHeader>Edit category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" w="100%">
              <Stack spacing={4}>
                <FormControl isRequired isInvalid={!!errors.name}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    id="name"
                    placeholder="name"
                    {...register('name', { required: 'Name is required' })}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Textarea
                    id="description"
                    placeholder="description"
                    {...register('description')}
                  />
                </FormControl>
              </Stack>
            </Flex>
          </ModalBody>

          <ModalFooter mt={4}>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Spacer />
            <Button isLoading={isSaving} type="submit">
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
