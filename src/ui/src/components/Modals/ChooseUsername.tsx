import { CheckIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure
} from '@chakra-ui/react';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { checkifUsernameExists, updateUsername } from '../../services/profilesService';

export const ChooseUsernameModal = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { user, updateProfile } = useWeb3Auth();
  const [username, setUsername] = useState<string>();
  const [errors, setErrors] = useState<string | null>();
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !user.username) onOpen();
  }, [onOpen, user]);

  const onSubmit = async () => {
    if (username) {
      try {
        setIsSubmitting(true);
        await updateUsername(user?.id!, username);
        updateProfile(username);
        onClose();
      } catch (error) {
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const checkAvailability = debounce(async (value: string) => {
    setErrors(null);
    try {
      if (!value || value.length < 3 || value.length > 20) {
        setErrors('Username must be between 3 and 20 characters');
      }
      else if (!/^[\w-]{3,20}$/.test(value)){
        setErrors('Letters, numbers, dashes, and underscores only. Please try again without symbols')
      } else {
        const usernameExists = await checkifUsernameExists(value);
        if (usernameExists) setErrors('That username is already taken');
      }
    } finally {
      setIsValidating(false);
    }
  }, 1000);

  const onUsernameChange = (e: any) => {
    setIsValidating(true);
    setUsername(e);
    checkAvailability(e);
  };

  return (
    <Modal
      size="full"
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>One last step and you're all set</ModalHeader>
        <ModalBody mt={8}>
          <FormControl isInvalid={!!errors}>
            <FormLabel>Choose a username</FormLabel>
            <FormHelperText>Your username is how other group members will see you.</FormHelperText>
            <InputGroup mt={3}>
              <Input onChange={(e) => onUsernameChange(e.target.value)} />
              {!isValidating && !errors && (
                <InputRightElement children={<CheckIcon color="green.500" />} />
              )}
              {!isValidating && !!errors && (
                <InputRightElement children={<InfoOutlineIcon color="red.500" />} />
              )}
              {isValidating && <InputRightElement children={<Spinner />} />}
            </InputGroup>
            <FormErrorMessage>{errors}</FormErrorMessage>
          </FormControl>

          <Button
            mt={4}
            onClick={onSubmit}
            colorScheme="teal"
            isLoading={isSubmitting}
            disabled={isValidating || !!errors}
            type="submit"
          >
            Submit
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
