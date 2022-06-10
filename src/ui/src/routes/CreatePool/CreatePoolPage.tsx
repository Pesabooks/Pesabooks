import { Container, Flex, Text, useToast } from '@chakra-ui/react';
import type { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Step, Steps, useSteps } from 'chakra-ui-steps';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaEdit, FaEthereum, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { Navbar } from '../../components/Layout/Navbar';
import { createNewPool } from '../../services/poolsService';
import { getAllTokens } from '../../services/tokensService';
import { Token } from '../../types';
import { ChooseNetworkTab } from './components/ChooseNetworkTab';
import { ConnectToYourWalletTab } from './components/ConnectToYourWalletTab';
import { CreatingPool } from './components/CreatingPool';
import { CreatePoolFormValue, PoolFormTab } from './components/PoolFormTab';

export const CreatePoolPage = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const navigate = useNavigate();
  const { provider } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [chainId, setChainId] = useState<number | null>(null);

  const { nextStep, prevStep, setStep, activeStep } = useSteps({
    initialStep: 0,
  });

  const createPool = async (values: CreatePoolFormValue) => {
    setLoading(true);
    if (!chainId) return;
    try {
      const { name, description, token } = values;

      nextStep();
      const pool_id = await createNewPool(
        provider as Web3Provider,
        name,
        description,
        token,
        chainId,
      );

      navigate(`/pool/${pool_id}`);
    } catch (e :any) {
    
      toast({
        title: e.message,
        status: 'error',
        isClosable: true,
      });
      setLoading(false);
      setStep(steps.length - 1);
      throw e;
    }
  };

  useEffect(() => {
    getAllTokens().then(setTokens);
  }, []);

  const netWorkTab = <ChooseNetworkTab onNext={nextStep} onSelect={setChainId} chainId={chainId} />;

  const connectTab2 = chainId ? (
    <ConnectToYourWalletTab chainId={chainId} onNext={nextStep} onPrev={prevStep} />
  ) : null;

  const infoTab = chainId ? (
    <PoolFormTab
      chainId={chainId}
      tokens={tokens}
      onCreate={createPool}
      loading={loading}
      onPrev={prevStep}
    ></PoolFormTab>
  ) : null;

  const steps = [
    { label: 'Select a network', content: netWorkTab, icon: FaEthereum },
    { label: 'Connect your wallet', content: connectTab2, icon: FaWallet },
    { label: 'Group information', content: infoTab, icon: FaEdit },
  ];

  return (
    <>
      <Helmet>
        <title>Create a New Group</title>
      </Helmet>
      <Flex direction="column" minH="100vh" align="center" pt={{ sm: '125px', lg: '75px' }}>
        <Navbar />
        <Flex direction="column" textAlign="center" mb={{ sm: '25px', md: '45px' }}>
          <Text fontSize={{ sm: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold" mb="8px">
            Create a New Group
          </Text>
          <Text color="gray.400" fontWeight="normal" fontSize={{ sm: 'sm', md: 'lg' }}></Text>
        </Flex>
        <Container flexDir="column" maxW="2xl">
          <Steps activeStep={activeStep} orientation="vertical">
            {steps.map(({ label, content, icon }) => (
              <Step label={label} key={label} icon={icon}>
                {content}
              </Step>
            ))}
          </Steps>
          {activeStep === steps.length && <CreatingPool />}
        </Container>
      </Flex>
    </>
  );
};
