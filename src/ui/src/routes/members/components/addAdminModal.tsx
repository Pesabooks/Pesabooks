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
  Text
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectUserField } from '../../../components/Input/SelectUserField';
import { User } from '../../../types';
import { compareAddress } from '../../../utils';

export interface AddAdminModalProps {
  isOpen: boolean;
  onClose: (hash?: string) => void;
  users: User[];
  adminAddressess: string[];
  addAdmin: (admin: AddAdminFormValue) => Promise<void>;
  currenTreshold: number;
}

export interface AddAdminFormValue {
  user: User;
  treshold: number;
}

export const AddAdminModal = ({
  isOpen,
  onClose,
  users,
  adminAddressess,
  addAdmin,
  currenTreshold,
}: AddAdminModalProps) => {
  const methods = useForm<AddAdminFormValue>({
    defaultValues: { treshold: currenTreshold },
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

            <FormControl isInvalid={!!methods.formState.errors.treshold} isRequired>
              <FormLabel htmlFor="category">New Threshold</FormLabel>
              <FormHelperText mb={4}>Any transaction requires the confirmation of:</FormHelperText>
              <HStack gap={4}>
                <Select w={70} {...methods.register('treshold', { required: true })}>
                  {[...Array(currenTreshold + 1).keys()]
                    .map((el) => el + 1)
                    .map((t) => (
                      <option value={t} key={t}>
                        {t}
                      </option>
                    ))}
                </Select>
                <Text>out of {currenTreshold + 1} admins</Text>
              </HStack>
              <FormErrorMessage>
                {methods.formState.errors.treshold && methods.formState.errors.treshold.message}
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
