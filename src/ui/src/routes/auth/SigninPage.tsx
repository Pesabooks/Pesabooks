import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { logInAndReturnUser, migrateUSer } from '../../services/auth-migration-service';
import { setTypedStorageItem } from '../../utils/storage-utils';

interface SigninFormValue {
  email: string;
  password: string;
}

export const SignInPage = () => {
  const titleColor = useColorModeValue('teal.300', 'teal.200');
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.700');
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';
  const toast = useToast();
  const { signIn, signUp } = useWeb3Auth();

  const email = searchParams.get('email') ?? '';

  let submit = async (values: SigninFormValue) => {
    const { email, password } = values;
    try {
      setTypedStorageItem('redirect_url', returnUrl);
      await signIn(email, password);
    } catch (e: any) {
      if (process.env.REACT_APP_ENV === 'prod' && e.code === 'auth/user-not-found') {
        //migrate user if exis in old Database
        const user = await logInAndReturnUser(email, password);
        if (user) {
          await signUp(user.name, email, password).then(() => migrateUSer(user.id));
        }
      }

      toast({
        title: 'Your login is invalid. Please try again.',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValue>({ defaultValues: { email } });

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
          Log in to continue
        </Text>

        <form onSubmit={handleSubmit(submit)}>
          <FormControl isInvalid={!!errors.email}>
            <FormLabel ms="4px" fontSize="sm" fontWeight="normal" htmlFor="email">
              Email address
            </FormLabel>
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

          <FormControl isInvalid={!!errors.password}>
            <FormLabel htmlFor="password" ms="4px" fontSize="sm" fontWeight="normal">
              Password
            </FormLabel>
            <Input
              id="password"
              fontSize="sm"
              ms="4px"
              borderRadius="15px"
              type="password"
              placeholder="Your password"
              mb="24px"
              size="lg"
              {...register('password', { required: true })}
            />
            <FormErrorMessage>{errors.password && 'Password is required'}</FormErrorMessage>
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
            SIGN IN
          </Button>

          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            maxW="100%"
            mt="0px"
          >
            <Text color={textColor} fontWeight="medium">
              Don’t have an account?
              <Link
                onClick={() => navigate(`/auth/signup?returnUrl=${returnUrl}`)}
                color={titleColor}
                as="span"
                ms="5px"
                href="#"
                fontWeight="bold"
              >
                Sign Up
              </Link>
            </Text>
          </Flex>
        </form>
      </Flex>
    </>
  );
};
