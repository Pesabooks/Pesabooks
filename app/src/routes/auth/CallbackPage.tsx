import { Text } from '@chakra-ui/layout';
import { Flex } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import Loading from '@pesabooks/components/Loading';
import { useWeb3Auth } from '@pesabooks/hooks';
import { GetAccessTokenRequest, GetAccessTokenResponse } from '@pesabooks/supabase/functions';
import {
  clearTypedStorageItem,
  getTypedStorageItem,
  setTypedStorageItem,
} from '@pesabooks/utils/storage-utils';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initSupabaseClient, supabase, usersTable } from '../../supabase';
import { User } from '../../types';

export const CallbackPage = () => {
  const { web3Auth, isInitialised, setUser } = useWeb3Auth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallBack = async () => {
      const user_id = getTypedStorageItem('user_id');
      if (isInitialised && web3Auth) {
        const { idToken, email } = await web3Auth.getUserInfo();

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
        initSupabaseClient(data?.access_token);

        const { data: newUSer } = await usersTable()
          .upsert({ id: user_id!, wallet: address, email: email! })
          .select()
          .single();

        setUser(newUSer as User);

        const returnUrl = getTypedStorageItem('redirect_url') ?? '/';
        navigate(returnUrl);
        clearTypedStorageItem('redirect_url');
      }
    };

    handleCallBack();
  }, [web3Auth, isInitialised, navigate, setUser]);

  return (
    <Flex w="100%" direction="column" textAlign="center" gap={10}>
      <Loading />
      <Text>Initializing...</Text>
    </Flex>
  );
};
