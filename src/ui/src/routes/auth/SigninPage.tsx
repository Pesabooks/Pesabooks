import { CheckCircleIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { isSignInWithEmailLink, sendSignInLinkToEmail } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import { firebaseAuth } from '../../firebase';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import {
  clearTypedStorageItem,
  getTypedStorageItem,
  setTypedStorageItem
} from '../../utils/storage-utils';

interface SigninFormValue {
  email: string;
}

export const SignInPage = () => {
  const titleColor = useColorModeValue('teal.300', 'teal.200');
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.700');
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';
  const toast = useToast();
  const { signIn, isInitialised } = useWeb3Auth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shouldConfirmEmail, setShouldConfirmEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const emailParam = searchParams.get('email') ?? '';

  setTypedStorageItem('redirect_url', returnUrl);

  const sendEmailLink = async ({ email }: SigninFormValue) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/signin?returnUrl=${returnUrl}`,
      // This must be true.
      handleCodeInApp: true,
    };
    setTypedStorageItem('emailForSignIn', email);
    await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
    setIsSubmitted(true);
  };

  const confirmEmail = async ({ email }: SigninFormValue) => {
    try {
      await signIn(email, window.location.href);
    } catch (e: any) {
      toast({
        title: 'The email provided does not match the current sign-in session.',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const cancel = () => {
    setShouldConfirmEmail(false);
    navigate(`/auth/signin?returnUrl=${returnUrl}`);
  };

  useEffect(() => {
    const finish = async () => {
      const isEmailSignin = isSignInWithEmailLink(firebaseAuth, window.location.href);
      if (!isEmailSignin) {
        setIsLoading(false);
      }

      if (isInitialised && isEmailSignin) {
        let email = getTypedStorageItem('emailForSignIn');
        if (!email) {
          setShouldConfirmEmail(true);
          setIsLoading(false);
        } else {
          await signIn(email!, window.location.href);
          clearTypedStorageItem('emailForSignIn');
        }
      }
    };

    finish();
  }, [isInitialised, signIn]);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValue>({ defaultValues: { email: emailParam } });

  const SigninFormCard = () => (
    <Flex
      direction="column"
      w="445px"
      background="transparent"
      p="48px"
      mt={{ md: '150px', lg: '80px' }}
      bg={bgColor}
    >
      <Heading color={titleColor} fontSize="32px" mb="10px">
        Let's get started
      </Heading>
      <Text mb="36px" ms="4px" color={textColor} fontWeight="bold" fontSize="14px">
        Enter your email to sign in or create an account
      </Text>

      <form onSubmit={handleSubmit(sendEmailLink)}>
        <FormControl isInvalid={!!errors.email}>
          <Input
            fontSize="sm"
            ms="4px"
            mb="24px"
            size="lg"
            borderRadius="15px"
            id="email"
            type="email"
            placeholder="Your email"
            {...register('email', { required: true })}
          />
          <FormErrorMessage>
            {errors.email?.type === 'required' && 'Email is required'}
          </FormErrorMessage>
        </FormControl>

        <Button
          isLoading={isSubmitting}
          type="submit"
          bg="teal.300"
          fontSize="sm"
          color="white"
          fontWeight="bold"
          w="100%"
          h="45"
          mb="24px"
          _hover={{
            bg: 'teal.200',
          }}
          _active={{
            bg: 'teal.400',
          }}
        >
          SUBMIT
        </Button>
      </form>
    </Flex>
  );

  const ConfirmEmailCard = () => (
    <Flex
      direction="column"
      w="445px"
      background="transparent"
      p="48px"
      mt={{ md: '150px', lg: '80px' }}
      bg={bgColor}
    >
      <Heading color={titleColor} fontSize="32px" mb="10px">
        Confirm email
      </Heading>
      <Text mb="36px" ms="4px" color={textColor} fontWeight="bold" fontSize="14px">
        Confirm your email to complete sign in
      </Text>

      <form onSubmit={handleSubmit(confirmEmail)}>
        <FormControl isInvalid={!!errors.email}>
          <Input
            fontSize="sm"
            ms="4px"
            mb="24px"
            size="lg"
            borderRadius="15px"
            id="email"
            type="email"
            placeholder="Your email"
            {...register('email', { required: true })}
          />
          <FormErrorMessage>
            {errors.email?.type === 'required' && 'Email is required'}
          </FormErrorMessage>
        </FormControl>

        <Flex mb="24px" gap={5}>
          <Button variant="ghost" fontSize="sm" fontWeight="bold" w="100%" h="45" onClick={cancel}>
            Cancel
          </Button>
          <Button
            isLoading={isSubmitting}
            type="submit"
            bg="teal.300"
            fontSize="sm"
            color="white"
            fontWeight="bold"
            w="100%"
            h="45"
            _hover={{
              bg: 'teal.200',
            }}
            _active={{
              bg: 'teal.400',
            }}
          >
            SUBMIT
          </Button>
        </Flex>
      </form>
    </Flex>
  );

  const ConfirmSubmissionCard = () => (
    <Flex
      direction="column"
      w="445px"
      background="transparent"
      p="48px"
      mt={{ md: '150px', lg: '80px' }}
      bg={bgColor}
    >
      <Heading mb="20px">Sign-in email sent</Heading>

      <Box textAlign="center">
        <CheckCircleIcon mb="20px" boxSize={'50px'} color={'green.500'} />
      </Box>
      <Text>
        A sign-in email with additional instructions was sent to{' '}
        <b>{getTypedStorageItem('emailForSignIn')}</b>. Check your email to complete sign-in.
      </Text>
    </Flex>
  );

  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>

      {isLoading && (
        <Flex w="100%" direction="column" textAlign="center" gap={10}>
          <Loading />
        </Flex>
      )}
      {isSubmitted && <ConfirmSubmissionCard />}
      {shouldConfirmEmail && <ConfirmEmailCard />}
      {!isSubmitted && !shouldConfirmEmail && !isLoading && <SigninFormCard />}
    </>
  );
};
