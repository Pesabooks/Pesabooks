import { CheckIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { useWeb3Auth } from '@pesabooks/hooks';
import { checkifUsernameExists, updateUsername } from '@pesabooks/services/profilesService';
import { getErrorMessage } from '@pesabooks/utils/error-utils';
import { debounce } from 'lodash';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SetUsernamePage = () => {
  const { user, updateProfile } = useWeb3Auth();
  const [username, setUsername] = useState<string>();
  const [errors, setErrors] = useState<string | null>();
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const returnUrl = searchParams.get('returnUrl') ?? '/';

  const onSubmit = async () => {
    if (!user?.id) throw new Error('User is not set');

    if (username) {
      try {
        setIsSubmitting(true);
        await updateUsername(user.id, username);
        updateProfile(username);
        navigate(returnUrl ?? '/');
      } catch (error: unknown) {
        setErrors(getErrorMessage(error));
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
      } else if (!/^[\w-]{3,20}$/.test(value)) {
        setErrors(
          'Letters, numbers, dashes, and underscores only. Please try again without symbols',
        );
      } else {
        const usernameExists = await checkifUsernameExists(value);
        if (usernameExists) setErrors('That username is already taken');
      }
    } finally {
      setIsValidating(false);
    }
  }, 1000);

  const onUsernameChange = (e: string) => {
    setIsValidating(true);
    setUsername(e);
    checkAvailability(e);
  };

  return (
    <>
      <Helmet>
        <title>Set username</title>
      </Helmet>
      <VStack p={20} align="start" gap={5}>
        <Heading as="h2" mb={4} size="md">
          One last step and you're all set
        </Heading>

        <FormControl isInvalid={!!errors}>
          <FormLabel>Choose a username</FormLabel>
          <FormHelperText>Your username is how other group members will see you.</FormHelperText>
          <InputGroup mt={3} maxWidth={500}>
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
          isDisabled={isValidating || !!errors}
          type="submit"
        >
          Submit
        </Button>
      </VStack>
    </>
  );
};
