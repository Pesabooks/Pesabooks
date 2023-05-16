import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from '@chakra-ui/react';
import { SelectUserField } from '@pesabooks/components/Input/SelectUserField';
import { compareAddress } from '@pesabooks/utils/addresses-utils';
import { FormProvider, useForm } from 'react-hook-form';
import { User } from '../../../types';

export interface AddAdminModalProps {
  isOpen: boolean;
  onClose: (hash?: string) => void;
  users: User[];
  adminAddressess: string[];
  addAdmin: (admin: AddAdminFormValue) => void;
  currenThreshold: number;
}

export interface AddAdminFormValue {
  user: User;
  threshold: number;
}

export const AddAdminModal = ({
  isOpen,
  onClose,
  users,
  adminAddressess,
  addAdmin,
  currenThreshold,
}: AddAdminModalProps) => {
  const methods = useForm<AddAdminFormValue>({
    defaultValues: { threshold: currenThreshold },
  });

  const filteredUsers = users?.filter(
    (l) => !adminAddressess.find((a) => compareAddress(a, l.wallet)),
  );
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add user as admin</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormProvider {...methods}>
            <SelectUserField label="Select a member" mb="8" users={filteredUsers} />

            <FormControl isInvalid={!!methods.formState.errors.threshold} isRequired>
              <FormLabel htmlFor="category">New Threshold</FormLabel>
              <FormHelperText mb={4}>Any transaction requires the confirmation of:</FormHelperText>
              <HStack gap={4}>
                <Select w={70} {...methods.register('threshold', { required: true })}>
                  {[...Array(currenThreshold + 1).keys()]
                    .map((el) => el + 1)
                    .map((t) => (
                      <option value={t} key={t}>
                        {t}
                      </option>
                    ))}
                </Select>
                <Text>out of {currenThreshold + 1} admins</Text>
              </HStack>
              <FormErrorMessage>
                {methods.formState.errors.threshold && methods.formState.errors.threshold.message}
              </FormErrorMessage>
            </FormControl>
          </FormProvider>
        </ModalBody>

        <ModalFooter>
          <Button
            isLoading={methods.formState.isSubmitting}
            onClick={methods.handleSubmit((val) => addAdmin(val))}
          >
            Add as Admin
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
