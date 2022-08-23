import { Text } from '@chakra-ui/layout';
import { Flex } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { GetAccessTokenRequest, GetAccessTokenResponse } from '@pesabooks/supabase/functions';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { supabase, usersTable } from '../../supabase';
import {
  clearTypedStorageItem,
  getTypedStorageItem,
  setTypedStorageItem
} from '../../utils/storage-utils';

export const CallbackPage = () => {
  const { web3Auth, isInitialised } = useWeb3Auth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallBack = async () => {
      const user_id = getTypedStorageItem('user_id');
      if (isInitialised && web3Auth) {
        const { idToken, name, email } = await web3Auth.getUserInfo();

        const provider = new Web3Provider(web3Auth.provider!);

        const address = await provider.getSigner().getAddress();

        const body: GetAccessTokenRequest = {
          user_id: user_id!,
          id_token: idToken!,
        };
        const { data, error } = await supabase().functions.invoke<GetAccessTokenResponse>(
          'get-access-token',
          {
            body: JSON.stringify(body),
          },
        );

        if (error) {
          throw error;
        }
        setTypedStorageItem('supabase_access_token', data?.access_token ?? '');

        await usersTable().upsert({ id: user_id!, name, wallet: address, email });

        const returnUrl = getTypedStorageItem('redirect_url') ?? '/';
        navigate(returnUrl);
        clearTypedStorageItem('redirect_url');
      }
    };

    handleCallBack();
  }, [web3Auth, isInitialised, navigate]);

  return (
    <Flex w="100%" direction="column" textAlign="center" gap={10}>
      <Loading />
      <Text>Initializing...</Text>
    </Flex>
  );
};
