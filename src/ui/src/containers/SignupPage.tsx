import { useColorModeValue } from '@chakra-ui/color-mode';
import {} from '@chakra-ui/form-control';
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
  useToast,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { insertProfile } from '../services/profilesService';

interface SignupFormValue {
  name: string;
  email: string;
  password: string;
}

export const SignupPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  let [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  let signUp = async (values: SignupFormValue) => {
    try {
      const { name, email, password } = values;
      const userId = (await auth.signUp?.({ email, password })) ?? '';
      await insertProfile(userId, name, email);
      navigate(returnUrl);
    } catch (e) {
      const message = e instanceof Error ? e.message : null;
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
  } = useForm<SignupFormValue>();

  return (
    <>
      <Helmet>
        <title>Sign Up</title>
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
          minW="400px"
        >
          <Stack align={'center'}>
            <Heading fontSize={'4xl'}>Sign up</Heading>
          </Stack>
          <Box rounded={'lg'} boxShadow={'lg'} p={8}>
            <form onSubmit={handleSubmit(signUp)}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input id="name" {...register('name', { required: true })} />
                  <FormErrorMessage>{errors.name && 'Name is required'}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel htmlFor="email">Email address</FormLabel>
                  <Input id="email" type="email" {...register('email', { required: true })} />
                  <FormErrorMessage> {errors.email && 'Email is required'}</FormErrorMessage>
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
                <Stack spacing={10} pt={2}>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    bg={'teal.400'}
                    color={'white'}
                    _hover={{
                      bg: 'teal.500',
                    }}
                  >
                    Sign up
                  </Button>
                </Stack>

                <Stack pt={6}>
                  <Text align={'center'}>
                    Already a user?{' '}
                    <Link
                      color={'teal.500'}
                      onClick={() => navigate(`/signin?returnUrl=${returnUrl}`)}
                    >
                      Login
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
