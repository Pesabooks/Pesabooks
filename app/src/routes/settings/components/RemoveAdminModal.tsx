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
import { UserWalletCard } from '@pesabooks/components/UserWalletCard';
import { usePool, useSafeAdmins } from '@pesabooks/hooks';
import { Ref, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { User } from '../../../types';

type callbackfn = (data: RemoveAdminFormValue) => void | Promise<void>;

export interface RemoveAdminModalRef {
  open: (user: User, onConfirm: callbackfn) => void;
}

export interface RemoveAdminModalProps {
  currentThreshold: number;
  adminsCount: number;
  ref: Ref<RemoveAdminModalRef>;
}

export interface RemoveAdminFormValue {
  user: User;
  threshold: number;
}

export const RemoveAdminModal = forwardRef((_, ref: Ref<RemoveAdminModalRef>) => {
  const { isDeployed } = usePool();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [user, setUser] = useState<User>();
  const { threshold: currentThreshold, safeAdmins } = useSafeAdmins();
  const [threshold, setThreshold] = useState(Math.max(1, currentThreshold - 1));

  const onConfirmRef = useRef<callbackfn>();

  const adminsCount = Math.max(1, safeAdmins.length - 1);

  useImperativeHandle(ref, () => ({
    open: (user: User, onConfirm) => {
      setUser(user);
      onOpen();

      onConfirmRef.current = (data: RemoveAdminFormValue) => onConfirm(data);
    },
  }));

  const submit = () => {
    if (!user) throw new Error('User is not defined');
    onClose();
    onConfirmRef.current?.({ user: user, threshold });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Remove member</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={10}>
            <UserWalletCard user={user}></UserWalletCard>
          </Box>
          {isDeployed && (
            <FormControl isRequired>
              <FormLabel htmlFor="category">New Threshold</FormLabel>
              <FormHelperText mb={4}>
                Any transaction will requires the confirmation of:
              </FormHelperText>
              <HStack gap={4}>
                <Select w={70} onChange={(e) => setThreshold(+e.target.value)}>
                  {[...Array(adminsCount).keys()]
                    .map((el) => el + 1)
                    .map((t) => (
                      <option value={t} key={t}>
                        {t}
                      </option>
                    ))}
                </Select>
                <Text>out of {adminsCount} members</Text>
              </HStack>
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={submit}>Remove</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
