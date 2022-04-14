import {
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BsCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/Layout/Navbar';
import { ChooseNetworkTab } from '../components/Tabs/ChooseNetworkTab';
import { ConnectToYourWalletTab } from '../components/Tabs/ConnectToYourWalletTab';
import { CreatePoolFormValue, PoolFormTab } from '../components/Tabs/PoolFormTab';
import { createNewPool } from '../services/poolsService';
import { getAllTokens } from '../services/tokensService';
import { Token } from '../types';

export const CreatePoolPage = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const navigate = useNavigate();
  const { library, chainId: connectedChainId } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const textColor = useColorModeValue('gray.700', 'white');

  const [activeBullets, setActiveBullets] = useState({
    network: true,
    account: false,
    address: false,
  });

  const [chainId, setChainId] = useState<number | null>(null);

  const networkTab = useRef<HTMLButtonElement>(null);
  const connectTab = useRef<HTMLButtonElement>(null);
  const poolTab = useRef<HTMLButtonElement>(null);

  const createPool = async (values: CreatePoolFormValue) => {
    setLoading(true);
    try {
      const { name, description, token } = values;

      const pool_id = await createNewPool(library, name, description, token);

      navigate(`/pool/${pool_id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : null;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
      setLoading(false);
      throw e;
    }
  };

  useEffect(() => {
    getAllTokens().then(setTokens);
  }, []);

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
        <Tabs variant="unstyled" mt="24px" display="flex" flexDirection="column">
          <TabList display="flex" alignSelf="center" justifySelf="center">
            <Tab
              ref={networkTab}
              _focus={{}}
              w={{ sm: '120px', md: '250px', lg: '300px' }}
              onClick={() =>
                setActiveBullets({
                  network: true,
                  account: false,
                  address: false,
                })
              }
            >
              <Flex
                direction="column"
                justify="center"
                align="center"
                position="relative"
                _before={{
                  content: "''",
                  width: { sm: '145px', md: '275px', lg: '345px' },
                  height: '3px',
                  bg: activeBullets.account ? textColor : 'gray.200',
                  left: { sm: '12px', md: '50px' },
                  top: { sm: activeBullets.network ? '6px' : '4px', md: '' },
                  position: 'absolute',
                  bottom: activeBullets.network ? '40px' : '38px',
                  zIndex: -1,
                  transition: 'all .3s ease',
                }}
              >
                <Icon
                  as={BsCircleFill}
                  color={activeBullets.network ? textColor : 'gray.300'}
                  w={activeBullets.network ? '16px' : '12px'}
                  h={activeBullets.network ? '16px' : '12px'}
                  mb="8px"
                />
                <Text
                  color={activeBullets.network ? { textColor } : 'gray.300'}
                  fontWeight={activeBullets.network ? 'bold' : 'normal'}
                  display={{ sm: 'none', md: 'block' }}
                  fontSize="sm"
                >
                  select a network
                </Text>
              </Flex>
            </Tab>
            <Tab
              isDisabled={!chainId}
              ref={connectTab}
              _focus={{}}
              w={{ sm: '120px', md: '250px', lg: '300px' }}
              onClick={() =>
                setActiveBullets({
                  network: true,
                  account: true,
                  address: false,
                })
              }
            >
              <Flex
                direction="column"
                justify="center"
                align="center"
                position="relative"
                _before={{
                  content: "''",
                  width: { sm: '140px', md: '270px', lg: '320px' },
                  height: '3px',
                  bg: activeBullets.address ? textColor : 'gray.200',
                  left: { sm: '12px', md: '28px' },
                  top: { sm: activeBullets.account ? '6px' : '4px', md: '' },
                  position: 'absolute',
                  bottom: activeBullets.account ? '40px' : '38px',
                  zIndex: -1,
                  transition: 'all .3s ease',
                }}
              >
                <Icon
                  as={BsCircleFill}
                  color={activeBullets.account ? textColor : 'gray.300'}
                  w={activeBullets.account ? '16px' : '12px'}
                  h={activeBullets.account ? '16px' : '12px'}
                  mb="8px"
                />
                <Text
                  color={activeBullets.account ? { textColor } : 'gray.300'}
                  fontWeight={activeBullets.account ? 'bold' : 'normal'}
                  transition="all .3s ease"
                  fontSize="sm"
                  _hover={{ color: textColor }}
                  display={{ sm: 'none', md: 'block' }}
                >
                  Connect wallet
                </Text>
              </Flex>
            </Tab>
            <Tab
              isDisabled={chainId !== connectedChainId}
              ref={poolTab}
              _focus={{}}
              w={{ sm: '120px', md: '250px', lg: '300px' }}
              onClick={() =>
                setActiveBullets({
                  network: true,
                  account: true,
                  address: true,
                })
              }
            >
              <Flex
                direction="column"
                justify="center"
                align="center"
                position="relative"
                _before={{
                  content: "''",
                  width: { sm: '120px', md: '250px', lg: '320px' },
                  height: '3px',
                  // bg: activeBullets.profile ? textColor : "gray.200",
                  left: { sm: '12px', md: '32px' },
                  top: { sm: activeBullets.address ? '6px' : '4px', md: '' },
                  position: 'absolute',
                  bottom: activeBullets.address ? '40px' : '38px',
                  zIndex: -1,
                  transition: 'all .3s ease',
                }}
              >
                <Icon
                  as={BsCircleFill}
                  color={activeBullets.address ? textColor : 'gray.300'}
                  w={activeBullets.address ? '16px' : '12px'}
                  h={activeBullets.address ? '16px' : '12px'}
                  mb="8px"
                />
                <Text
                  color={activeBullets.address ? { textColor } : 'gray.300'}
                  fontWeight={activeBullets.address ? 'bold' : 'normal'}
                  transition="all .3s ease"
                  fontSize="sm"
                  _hover={{ color: textColor }}
                  display={{ sm: 'none', md: 'block' }}
                >
                  Info
                </Text>
              </Flex>
            </Tab>
          </TabList>
          <TabPanels mt="24px" maxW={{ md: '90%', lg: '100%' }} mx="auto">
            <TabPanel w={{ sm: '330px', md: '700px', lg: '850px' }} mx="auto">
              <ChooseNetworkTab
                onNext={() => connectTab?.current?.click()}
                onSelect={setChainId}
                chainId={chainId}
              />
            </TabPanel>
            <TabPanel w={{ sm: '330px', md: '700px', lg: '850px' }} mx="auto">
              {chainId && (
                <ConnectToYourWalletTab
                  chainId={chainId}
                  onNext={() => poolTab?.current?.click()}
                  onPrev={() => networkTab?.current?.click()}
                />
              )}
            </TabPanel>
            <TabPanel w={{ sm: '330px', md: '700px', lg: '850px' }} mx="auto">
              {chainId && (
                <PoolFormTab
                  chainId={chainId}
                  tokens={tokens}
                  onCreate={createPool}
                  loading={loading}
                  onPrev={() => connectTab?.current?.click()}
                ></PoolFormTab>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </>
  );
};
