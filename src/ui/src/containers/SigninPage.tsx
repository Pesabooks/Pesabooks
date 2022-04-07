import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel, Input,
  Link,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface SigninFormValue {
  email: string;
  password: string;
}

export const SignInPage = () => {
  const titleColor = useColorModeValue('teal.300', 'teal.200');
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.700');

  let navigate = useNavigate();
  const toast = useToast();

  let auth = useAuth();
  let [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  let signIn = async (values: SigninFormValue) => {
    try {
      const { email, password } = values;
      await auth.signIn?.({ email, password });
      navigate(returnUrl);
    } catch {
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
  } = useForm<SigninFormValue>();

  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>

      <Flex alignItems="center" justifyContent="center" mb="60px" mt="20px">
        <form onSubmit={handleSubmit(signIn)}>
          <Flex
            direction="column"
            w="445px"
            background="transparent"
            borderRadius="15px"
            p="40px"
            mx={{ base: '100px' }}
            bg={bgColor}
            boxShadow="0 20px 27px 0 rgb(0 0 0 / 5%)"
          >
            <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign="center" mb="22px">
              Sign In to your account
            </Text>

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
          </Flex>
        </form>
      </Flex>
    </>
  );
};
