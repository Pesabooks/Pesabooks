// Chakra imports
import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
import { setTypedStorageItem } from '../../utils/storage-utils';

interface SignupFormValue {
  name: string;
  email: string;
  password: string;
  agree: boolean;
}

export const SignUpPage = () => {
  const titleColor = useColorModeValue('teal.300', 'teal.200');
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.700');

  const { signUp } = useWeb3Auth();
  const navigate = useNavigate();
  const toast = useToast();
  let [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';
  const email = searchParams.get('email') ?? '';
  const name = searchParams.get('name') ?? '';

  let submit = async (values: SignupFormValue) => {
    setTypedStorageItem('redirect_url', returnUrl);
    const { name, email, password } = values;

    try {
      await signUp?.(name, email, password);
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
  } = useForm<SignupFormValue>({ defaultValues: { name, email } });

  return (
    <>
      <Helmet>
        <title>Sign Up</title>
      </Helmet>

      <form onSubmit={handleSubmit(submit)}>
        <Flex
          direction="column"
          w="445px"
          background="transparent"
          borderRadius="15px"
          p="40px"
          mt={{ md: '150px', lg: '80px' }}
          bg={bgColor}
          boxShadow="0 20px 27px 0 rgb(0 0 0 / 5%)"
        >
          <Text fontSize="xl" color={textColor} fontWeight="bold" textAlign="center" mb="22px">
            Sign Up
          </Text>

          <FormControl isInvalid={!!errors.name} mb="24px">
            <FormLabel htmlFor="name" ms="4px" fontSize="sm" fontWeight="normal">
              Display Name
            </FormLabel>
            <Input
              id="name"
              {...register('name', { required: true })}
              fontSize="sm"
              ms="4px"
              borderRadius="15px"
              type="text"
              placeholder="Your display name"
              size="lg"
            />
            <FormErrorMessage>{errors.name && 'Name is required'}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email} mb="24px">
            <FormLabel htmlFor="email" ms="4px" fontSize="sm" fontWeight="normal">
              Email address
            </FormLabel>
            <Input
              id="email"
              type="email"
              fontSize="sm"
              ms="4px"
              borderRadius="15px"
              placeholder="Your email address"
              size="lg"
              {...register('email', { required: true })}
            />
            <FormErrorMessage> {errors.email && 'Email is required'}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password} mb="24px">
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
              size="lg"
              {...register('password', { required: true, minLength: 6 })}
            />
            <FormErrorMessage>
              {errors.password?.type === 'required' && 'Password is required'}
            </FormErrorMessage>
            <FormErrorMessage>
              {errors.password?.type === 'minLength' && 'Password should be 6 characters minimum'}
            </FormErrorMessage>
          </FormControl>

          <FormControl  alignItems="center" mb="24px"  isInvalid={!!errors.agree}>
            <Checkbox id= "agree" {...register('agree', { validate: {required: (value) => value}})}>
              {' '}
              I agree to the{' '}
              <Link variant="decoration" href="https://pesabooks.com/terms" isExternal>
                Terms and conditions
              </Link>
            </Checkbox>
            <FormErrorMessage>
              {'You have to agree to the terms and conditions'}
            </FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            isLoading={isSubmitting}
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
            SIGN UP
          </Button>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            maxW="100%"
            mt="0px"
          >
            <Text color={textColor} fontWeight="medium">
              Already have an account?
              <Link
                color={titleColor}
                onClick={() => navigate(`/auth/signin?returnUrl=${returnUrl}`)}
                as="span"
                ms="5px"
                href="#"
                fontWeight="bold"
              >
                Sign In
              </Link>
            </Text>
          </Flex>
        </Flex>
      </form>
    </>
  );
};
