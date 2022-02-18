import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SigninFormValue {
  email: string;
  password: string;
}

export const SigninPage = () => {
  let navigate = useNavigate();
  const toast = useToast();

  let auth = useAuth();
  let [searchParams] = useSearchParams();

  let signIn = async (values: SigninFormValue) => {
    try {
      const { email, password } = values;
      await auth.signIn?.({ email, password });
      navigate(searchParams.get('returnUrl') ?? '/');
    } catch (error) {
      const message = error instanceof Error ? error.message : null;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValue>();
  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        backgroundImage="url('/images/bg.jpg')"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
      >
        <Stack
          spacing={8}
          mx={'auto'}
          maxW={'lg'}
          py={12}
          px={6}
          bg={useColorModeValue('white', 'gray.700')}
        >
          <Stack align={'center'}>
            <Heading fontSize={'4xl'}>Sign in to your account</Heading>
          </Stack>
          <Box rounded={'lg'} boxShadow={'lg'} p={8}>
            <form onSubmit={handleSubmit(signIn)}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel htmlFor="email">Email address</FormLabel>
                  <Input id="email" type="email" {...register('email', { required: true })} />
                  <FormErrorMessage>
                    {errors.email?.type === 'required' && 'Email is required'}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    {...register('password', { required: true })}
                  />
                  <FormErrorMessage>{errors.password && 'Password is required'}</FormErrorMessage>
                </FormControl>
                <Stack spacing={10}>
                  <Link color={'teal.400'}>Forgot password?</Link>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    bg={'teal.400'}
                    color={'white'}
                    _hover={{
                      bg: 'teal.500',
                    }}
                  >
                    Sign in
                  </Button>
                </Stack>

                <Stack pt={6}>
                  <Text align={'center'}>
                    Don't have an account?{' '}
                    <Link color={'teal.500'} onClick={() => navigate('/signup')}>
                      Sign Up
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Flex>
    </>
  );
};
