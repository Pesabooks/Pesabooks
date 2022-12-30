import {
  Box,
  Button,
  FormControl,
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
  useDisclosure,
} from '@chakra-ui/react';
import { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import { UserWalletCard } from '../../../components/UserWalletCard';
import { User } from '../../../types';

type callbackfn = (data: RemoveAdminFormValue) => void | Promise<void>;

export interface RemoveAdminModalRef {
  open: (user: User, onConfirm: callbackfn) => void;
}

export interface AddAdminModalProps {
  currentThreshold: number;
  ref: Ref<RemoveAdminModalRef>;
}

export interface RemoveAdminFormValue {
  user: User;
  threshold: number;
}

export const RemoveAdminModal = forwardRef(
  ({ currentThreshold }: AddAdminModalProps, ref: Ref<RemoveAdminModalRef>) => {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [user, setUser] = useState<User>();
    const [threshold, setThreshold] = useState(currentThreshold - 1);

    const onConfirmRef = useRef<any>();

    useImperativeHandle(ref, () => ({
      open: (user: User, onConfirm) => {
        setUser(user);
        onOpen();

        onConfirmRef.current = (data: RemoveAdminFormValue) => onConfirm(data);
      },
    }));

    const submit = () => {
      onClose();
      onConfirmRef.current?.({ user, treshold: threshold });
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remove admin</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb={10}>
              <UserWalletCard user={user}></UserWalletCard>
            </Box>
            <FormControl isRequired>
              <FormLabel htmlFor="category">New Threshold</FormLabel>
              <FormHelperText mb={4}>Any transaction requires the confirmation of:</FormHelperText>
              <HStack gap={4}>
                <Select w={70} onChange={(e) => setThreshold(+e.target.value)}>
                  {[...Array(currentThreshold - 1).keys()]
                    .map((el) => el + 1)
                    .map((t) => (
                      <option value={t} key={t}>
                        {t}
                      </option>
                    ))}
                </Select>
                <Text>out of {currentThreshold - 1} admins</Text>
              </HStack>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={submit}>Remove as Admin</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
);
