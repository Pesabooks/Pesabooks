import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { ConnectedChain } from '../../components/ConnectedChain';
import { AvatarMenu } from '../../components/Layout/AvatarMenu';
import { Logo } from '../../components/Layout/Logo';
import { PoolCard } from '../../components/PoolCard';
import { WalletAddress } from '../../components/WalletAddress';
import { networks } from '../../data/networks';
import { useNativeBalance } from '../../hooks/useNativeBalance';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { getMyPools } from '../../services/poolsService';
import { Pool } from '../../types';

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

export const ProfilePage = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const { account, chainId, user } = useWeb3Auth();
  const { balance } = useNativeBalance();
  const navigate = useNavigate();

  const network = networks[chainId];

  useEffect(() => {
    getMyPools()
      .then((pools) => setPools(pools ?? []))
      .finally(() => setLoading(false));
  }, []);

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
    default:
      break;
  }

  return (
    <Flex direction="column" align="center" overflow="hidden">
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
          <Avatar size={'xl'} name={user?.email} mb={4} pos={'relative'} />
          <Heading fontSize={'2xl'} fontFamily={'body'}>
            {user?.email}
          </Heading>
          <Box fontWeight={600} color={'gray.500'} mb={4}>
            {account && <WalletAddress type="address" chainId={4} address={account} />}
          </Box>
          <Text textAlign={'center'} color={useColorModeValue('gray.700', 'gray.400')} px={3}>
            {balance} {network?.nativeCurrency.symbol}
          </Text>

          <ButtonGroup variant="outline" spacing="4" mt={8}>
            <Button leftIcon={<FiArrowDownLeft />}>Receive</Button>
            <Link
              variant="no-decoration"
              href={`https://buy.ramp.network/?userAddress=${account}&swapAsset=${swapAsset}`}
              target="_blank"
            >
              <Button leftIcon={<FiCreditCard />}>Buy</Button>
            </Link>

            <Button leftIcon={<FiArrowUpRight />}>Send</Button>
            <Button leftIcon={<FiCreditCard />}>Swap</Button>
          </ButtonGroup>
        </Flex>
      </Center>

      <Container maxW="container.xl" centerContent>
        <Card mt="8" bg="transparent">
          <CardHeader p="6px 0px 22px 0px">
            <Text fontSize="lg" fontWeight="bold">
              My groups
            </Text>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Spinner thickness="4px" speed="0.65s" size="xl" />
            ) : (
              <Grid
                templateColumns={{
                  sm: '1fr',
                  md: 'repeat(2, auto)',
                  lg: 'repeat(3, auto)',
                }}
                templateRows={{ md: 'repeat(3, auto)', lg: 'repeat(2, auto)' }}
                gap="30px"
              >
                {pools.map((pool, index) => {
                  return (
                    <Button
                      key={index}
                      variant="no-hover"
                      w="100%"
                      h="100%"
                      onClick={() => navigate(`/pool/${pool.id}`)}
                    >
                      <PoolCard pool={pool}></PoolCard>{' '}
                    </Button>
                  );
                })}
              </Grid>
            )}
          </CardBody>
        </Card>
      </Container>
    </Flex>
  );
};
