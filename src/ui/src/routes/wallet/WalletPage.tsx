import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { BalancesReponse } from '@pesabooks/supabase/functions';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { formatBigNumber } from '../../bignumber-utils';
import { Card } from '../../components/Card';
import { ConnectedChain } from '../../components/ConnectedChain';
import { AvatarMenu } from '../../components/Layout/AvatarMenu';
import { Logo } from '../../components/Layout/Logo';
import Loading from '../../components/Loading';
import { WalletAddress } from '../../components/WalletAddress';
import { networks } from '../../data/networks';
import { useNativeBalance } from '../../hooks/useNativeBalance';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { getBalances } from '../../services/covalentServices';
import { AssetsList } from '../dashboard/components/AssetsList';
import { ReceiveModal } from './components/ReceiveModal';

export const NetworkSelectorMenu = () => {
  const { setChainId } = useWeb3Auth();
  const includeTestnets = process.env.REACT_APP_INCLUDE_TESTNETS === 'true';

  return (
    <Menu>
      <MenuButton variant="ghost" as={Button} rightIcon={<ChevronDownIcon />}>
        <ConnectedChain />
      </MenuButton>
      <MenuList>
        {Object.keys(networks)
          .map((key) => ({ chainId: +key, network: networks[+key] }))
          .filter(({ network }) => network.active)
          .filter(({ network }) => (includeTestnets ? true : !network.isTest))
          .map(({ chainId, network }, index) => {
            return (
              <MenuItem key={index} onClick={() => setChainId(chainId)}>
                <Image
                  boxSize="2rem"
                  borderRadius="full"
                  src={`${process.env.PUBLIC_URL}/${network.logoUrl}`}
                  alt="Fluffybuns the destroyer"
                  mr="12px"
                />
                <span>{network.chainName}</span>
              </MenuItem>
            );
          })}
      </MenuList>
    </Menu>
  );
};

export const WalletPage = () => {
  const { account, chainId, user } = useWeb3Auth();
  const { balance, loading: balanceLoading } = useNativeBalance();
  const { isOpen: isOpenReceive, onOpen: onOpenReceive, onClose: onCloseReceive } = useDisclosure();
  const [balances, setBalances] = useState<BalancesReponse[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(true);

  const balanceColor = useColorModeValue('gray.700', 'gray.400');
  const network = networks[chainId];

  useEffect(() => {
    if (account) {
      getBalances(chainId, account)
        .then((balances) => {
          setBalances(balances ?? []);
        })
        .finally(() => {
          setBalancesLoading(false);
        });
    }
  }, [account, chainId]);

  let swapAsset: string = '';
  switch (chainId) {
    case 1:
      swapAsset = 'ETH_ETH,ETH_USDC,ETH_DAI';
      break;
    case 137:
      swapAsset = 'MATIC_MATIC,MATIC_USDC,MATIC_DAI';
      break;
    case 56:
      swapAsset = 'BSC_BNB,BSC_BUSD';
      break;
    case 5:
      swapAsset = 'GOERLI_*';
      break;
    default:
      break;
  }

  const buy = async () => {
    new RampInstantSDK({
      hostAppName: 'Pesabooks',
      hostLogoUrl: 'https://pesabooks.com/assets/img/logo-dark.png',
      swapAsset,
      userAddress: account!,
      userEmailAddress: user?.email,
      hostApiKey: process.env.REACT_APP_RAMP_API_KEY,
    }).show();
  };

  return (
    <>
      <Helmet>
        <title>My Wallet</title>
      </Helmet>

      <Flex direction="column" align="center" overflow="hidden" h="100%">
        <Flex
          h={20}
          alignItems={'center'}
          justifyContent={'space-between'}
          pb="8px"
          right="30px"
          px={{
            sm: '30px',
            md: '30px',
          }}
          ps={{
            xl: '12px',
          }}
          pt="8px"
          w={{ sm: 'calc(100vw - 30px)', xl: 'calc(100vw - 75px - 275px)' }}
        >
          <Link
            variant="no-decoration"
            as={RouterLink}
            to="/"
            display="flex"
            fontWeight="bold"
            justifyContent="start"
            alignItems="center"
            fontSize="11px"
          >
            <Logo />
          </Link>

          <Stack direction={'row'} spacing={7}>
            <NetworkSelectorMenu />

            <AvatarMenu />
          </Stack>
        </Flex>

        <Heading as="h2" size="lg">
          My Wallet
        </Heading>

        <Center py={6}>
          <Flex
            direction="column"
            alignItems="center"
            maxW={'520px'}
            w={'full'}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={'2xl'}
            rounded={'lg'}
            p={6}
            textAlign={'center'}
          >
            <Avatar size={'xl'} name={user?.name} mb={4} pos={'relative'} />
            <Heading fontSize={'2xl'} fontFamily={'body'}>
              {user?.email}
            </Heading>
            <Box fontWeight={600} color={'gray.500'} mb={4}>
              {account && <WalletAddress type="address" chainId={chainId} address={account} />}
            </Box>
            {balanceLoading ? (
              <Loading />
            ) : (
              <Text textAlign={'center'} color={balanceColor} px={3}>
                {formatBigNumber(balance)} {network?.nativeCurrency.symbol}
              </Text>
            )}

            <ButtonGroup variant="outline" spacing="4" mt={8}>
              <Button leftIcon={<FiArrowDownLeft />} onClick={onOpenReceive}>
                Receive
              </Button>

              <Button leftIcon={<FiCreditCard />} onClick={buy}>
                Buy
              </Button>

              <Button leftIcon={<FiArrowUpRight />} disabled>
                Send
              </Button>
              <Button leftIcon={<FiCreditCard />} disabled>
                Swap
              </Button>
            </ButtonGroup>
          </Flex>
        </Center>
      </Flex>

      <Container>
        <Card>
          <Tabs isLazy isFitted>
            <TabList>
              <Tab>Assets</Tab>
              {/* <Tab>Transactions</Tab> */}
            </TabList>
            <TabPanels>
              {/* initially mounted */}
              <TabPanel>
                <AssetsList balances={balances} loading={balancesLoading} />
              </TabPanel>
              {/* initially not mounted */}
              <TabPanel>
                <p>two!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </Container>
      {account && (
        <ReceiveModal
          isOpen={isOpenReceive}
          onClose={onCloseReceive}
          address={account}
          chainId={chainId}
        />
      )}
      <Flex
        direction="column"
        width="100%"
        position="fixed"
        p="2"
        bottom="0px"
        gap={2}
        alignItems="center"
      >
        <Flex direction="row" justifyContent="center" alignItems="start" gap={2}>
          <Text fontSize="sm"> Self-Custodial wallet powered by</Text>
          <Link href="https://web3auth.io/docs/overview/what-is-web3auth" isExternal>
            <Image
              w={100}
              src="https://dashboard.web3auth.io/img/web3auth-dark.1ed10b5c.svg"
            ></Image>
          </Link>
        </Flex>
      </Flex>
    </>
  );
};
