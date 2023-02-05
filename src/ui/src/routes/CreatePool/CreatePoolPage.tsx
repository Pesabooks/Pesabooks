import { Container, Flex, Text, useToast } from '@chakra-ui/react';
import { Step, Steps, useSteps } from 'chakra-ui-steps';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaEdit, FaEthereum, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { NavbarLight } from '../../components/Layout/NavbarLight';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { createInvitation } from '../../services/invitationService';
import { createNewPool } from '../../services/poolsService';
import { getAllTokens } from '../../services/tokensService';
import { Invitation, Token } from '../../types';
import { ChooseNetworkTab } from './components/ChooseNetworkTab';
import { CreatingPool } from './components/CreatingPool';
import { InviteMembers } from './components/InviteMembers';
import { CreatePoolFormValue, PoolFormTab } from './components/PoolFormTab';

export const CreatePoolPage = () => {
  const { user } = useWeb3Auth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [chainId, setChainId] = useState<number | null>(null);
  const [poolInfo, setPoolInfo] = useState<CreatePoolFormValue>();
  const [members, setMembers] = useState<Partial<Invitation>[]>([
    { name: user?.username ?? undefined, email: user?.email },
  ]);

  const { nextStep, prevStep, setStep, activeStep } = useSteps({
    initialStep: 0,
  });

  const createPool = async () => {
    setLoading(true);
    if (!chainId || !poolInfo) return;
    try {
      const { name, description, token } = poolInfo;

      nextStep();
      const pool = await createNewPool(name, description, token, chainId);
      if (pool) {
        await Promise.all(
          members
            .filter((m) => m.email !== user?.email!)
            .map((member) => createInvitation(pool, member.name!, member.email!, user?.username!)),
        );

        navigate(`/pool/${pool.id}`);
      }
    } catch (e: any) {
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

  const addMember = (member: Partial<Invitation>) => {
    if (!members.find((m) => m.email === member.email)) setMembers([...members, member]);
  };
  const removeMember = (member: Partial<Invitation>) => {
    setMembers([...members.filter((m) => m.email !== member.email)]);
  };

  const netWorkTab = <ChooseNetworkTab onNext={nextStep} onSelect={setChainId} chainId={chainId} />;

  const infoTab = chainId ? (
    <PoolFormTab
      chainId={chainId}
      tokens={tokens}
      onNext={(info) => {
        setPoolInfo(info);
        nextStep();
      }}
      onPrev={prevStep}
    ></PoolFormTab>
  ) : null;

  const inviteMembersTab = (
    <InviteMembers
      members={members}
      onAdd={addMember}
      onRemove={removeMember}
      loading={loading}
      onPrev={prevStep}
      onNext={createPool}
    ></InviteMembers>
  );

  const steps = [
    { label: 'Select a network', content: netWorkTab, icon: FaEthereum },
    { label: 'Group information', content: infoTab, icon: FaEdit },
    { label: 'Invite Members', content: inviteMembersTab, icon: FaUsers },
  ];

  return (
    <>
      <Helmet>
        <title>Create Group</title>
      </Helmet>
        <NavbarLight  />
      <Flex direction="column" minH="100vh" align="center" pt={{ sm: '125px', lg: '75px' }}>
        <Flex direction="column" textAlign="center" mb={{ sm: '25px', md: '45px' }}>
          <Text fontSize={{ sm: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold" mb="8px">
            Create Group
          </Text>
          {/* <Text color="gray.400" fontWeight="normal" fontSize={{ sm: 'sm', md: 'lg' }}>
            Setup a new Gnosis safe to get started
          </Text>
          <Text as="u">
            <Link
              color="gray.400"
              href="https://help.gnosis-safe.io/en/articles/3876456-what-is-gnosis-safe"
              isExternal
              fontSize="sm"
            >
              What is a Gnosis Safe? <ExternalLinkIcon mx="2px" />
            </Link>
          </Text> */}
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
