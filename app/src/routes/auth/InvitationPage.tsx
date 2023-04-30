import { Box, Button, Heading, Stack, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import { useWeb3Auth } from '@pesabooks/hooks';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { acceptInvitation, getInvitation } from '../../services/invitationService';
import { Invitation } from '../../types';

export const InvitationPage = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useWeb3Auth();
  const { invitation_id } = useParams();
  const [invitation, setInvitation] = useState<Invitation | null>();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    if (invitation_id) getInvitation(invitation_id).then(setInvitation);
  }, [invitation_id]);

  const onJoin = async () => {
    setLoading(true);
    if (invitation) {
      try {
        await acceptInvitation(invitation.id);
        toast({
          title: 'You have joined the group',
          status: 'success',
          isClosable: true,
        });
        setLoading(false);
        navigate(`/pool/${invitation.pool_id}`);
      } catch (error) {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Invitation</title>
      </Helmet>

      {invitation ? (
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6} bg={bgColor}>
          <Stack spacing={4}>
            <Heading fontSize={'2xl'}>
              {' '}
              Join{' '}
              <Text as="span" color={'red'}>
                {invitation?.pool_name}
              </Text>{' '}
              on Pesabooks
            </Heading>
            <Text>
              {invitation?.invited_by} has invited you to join the tontine{' '}
              <b>{invitation?.pool_name}</b>.
            </Text>
          </Stack>

          {!isAuthenticated() && (
            <Button
              onClick={() =>
                navigate(`/auth/signin?returnUrl=${location.pathname}&email=${invitation?.email}`)
              }
            >
              Login to continue
            </Button>
          )}

          {isAuthenticated() && (
            <Stack align="center">
              <Button onClick={() => onJoin()} isLoading={loading}>
                Join Now
              </Button>
            </Stack>
          )}
        </Stack>
      ) : (
        <Box textAlign="center" py={10} px={6}>
          <Text fontSize="18px" mt={3} mb={2}>
            Invitation Not Found
          </Text>
          <Text color={'gray.500'} mb={6}>
            The invitation does not exist or is expired
          </Text>

          <Button
            onClick={() => navigate(`/`)}
            colorScheme="teal"
            bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
            color="white"
            variant="solid"
          >
            Go to Home
          </Button>
        </Box>
      )}
    </>
  );
};
