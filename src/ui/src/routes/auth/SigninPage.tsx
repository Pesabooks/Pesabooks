import {
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
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { setTypedStorageItem } from '../../utils/storage-utils';

interface SigninFormValue {
  email: string;
}

export const SignInPage = () => {
  const titleColor = useColorModeValue('teal.300', 'teal.200');
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.700');
  let [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';
  const toast = useToast();
  const { signIn, isInitialised, isAuthenticated } = useWeb3Auth();
  const navigate = useNavigate();

  const emailParam = searchParams.get('email') ?? '';

  setTypedStorageItem('redirect_url', returnUrl);

  useEffect(() => {
    if (isInitialised && isAuthenticated) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, isInitialised, navigate, returnUrl]);

  const submit = async ({ email }: SigninFormValue) => {
    try {
      await signIn(email);
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Sign in failed',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValue>({ defaultValues: { email: emailParam } });

  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>

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

        {isInitialised ? (
          <form onSubmit={handleSubmit(submit)}>
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
        ) : (
          <Loading />
        )}
      </Flex>
    </>
  );
};
