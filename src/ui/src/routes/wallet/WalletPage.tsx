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
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
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
import {
  RampInstantEvents,
  RampInstantEventTypes,
  RampInstantSDK
} from '@ramp-network/ramp-instant-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard, FiMoreVertical } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { formatBigNumber } from '../../bignumber-utils';
import { Card } from '../../components/Card';
import { ConnectedChain } from '../../components/ConnectedChain';
import { AvatarMenu } from '../../components/Layout/AvatarMenu';
import { Logo } from '../../components/Layout/Logo';
import Loading from '../../components/Loading';
import { Pagination } from '../../components/Pagination';
import { WalletAddress } from '../../components/WalletAddress';
import { networks } from '../../data/networks';
import { useNativeBalance } from '../../hooks/useNativeBalance';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { getBalances, TokenBalance } from '../../services/covalentServices';
import { getAllActivities, purchaseToken } from '../../services/walletServices';
import { Activity, TokenBase, TransactionType } from '../../types';
import { AssetsList } from '../dashboard/components/AssetsList';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../transactions/components/TransactionSubmittedModal';
import { ActivitiesList } from './components/ActivitiesList';
import { ReceiveModal } from './components/ReceiveModal';
import { SendModal } from './components/SendModal';
import { SwapModal } from './components/SwapModal';

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
  const { account, chainId, user, web3Auth } = useWeb3Auth();
  const { balance, loading: balanceLoading } = useNativeBalance();
  const { isOpen: isOpenReceive, onOpen: onOpenReceive, onClose: onCloseReceive } = useDisclosure();
  const { isOpen: isOpenSend, onOpen: onOpenSend, onClose: onCloseSend } = useDisclosure();
  const { isOpen: isOpenSwap, onOpen: onOpenSwap, onClose: onCloseSwap } = useDisclosure();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [activities, setActivities] = useState<{ data: Activity[]; total: number }>({
    data: [],
    total: 0,
  });
  const [balancesLoading, setBalancesLoading] = useState(true);
  const txSubmittedRef = useRef<TransactionSubmittedModalRef>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { pageIndex, pageSize } = pagination;
  const changePage = (page: number) => {
    setPagination({ ...pagination, pageIndex: page });
  };

  const balanceColor = useColorModeValue('gray.700', 'gray.400');
  const network = networks[chainId];

  const getData = useCallback(async (chainId, account) => {
    if (account) {
      setBalancesLoading(true);
      getBalances(chainId, account)
        .then((balances) => {
          setBalances(balances ?? []);
        })
        .finally(() => {
          setBalancesLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    getAllActivities(chainId, pageSize, pageIndex).then((a) => {
      setActivities(a);
    });
  }, [chainId, pageIndex, pageSize]);

  useEffect(() => {
    setBalances([]);
    setActivities({ data: [], total: 0 });
    getData(chainId, account);
  }, [account, chainId, getData]);

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
      webhookStatusUrl: `${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/ramp-callback`,
    })
      .on<RampInstantEvents>(RampInstantEventTypes.PURCHASE_CREATED, (event) => {
        const purchase = event.payload?.purchase;
        const purchaseViewToken = event.payload?.purchaseViewToken;
        if (!purchase) return;
        const { id, finalTxHash, receiverAddress, cryptoAmount, asset } = purchase;

        const token: TokenBase = {
          address: asset.address ?? '',
          name: asset.name,
          decimals: asset.decimals,
          symbol: asset.symbol,
          image: '',
          is_native: asset.type === 'NATIVE',
        };

        purchaseToken(
          chainId,
          id,
          purchaseViewToken,
          receiverAddress,
          cryptoAmount,
          finalTxHash,
          token,
        );
      })
      .show();
  };

  const onTxSubmitted = useCallback(
    (type: TransactionType, hash: string) => {
      txSubmittedRef.current?.open(type, hash);
      getData(chainId, account);
    },
    [account, chainId, getData],
  );

  const getPrivateKey = async () => {
    const privateKey = await web3Auth?.provider?.request({
      method: 'eth_private_key',
    });
    console.log('privateKey', privateKey);
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

        <Flex>
          <Heading as="h2" size="lg">
            My Wallet
          </Heading>
          <Spacer />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<FiMoreVertical />}
              variant="ghost"
            />
            <MenuList>
              <MenuItem onClick={getPrivateKey}>print key</MenuItem>
            </MenuList>
          </Menu>
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
            <Avatar size={'xl'} name={user?.username ?? undefined} mb={4} pos={'relative'} />
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
                {formatBigNumber(balance, network.nativeCurrency.decimals)}{' '}
                {network?.nativeCurrency.symbol}
              </Text>
            )}

            <ButtonGroup variant="outline" spacing="4" mt={8}>
              <Button leftIcon={<FiArrowDownLeft />} onClick={onOpenReceive}>
                Receive
              </Button>

              <Button leftIcon={<FiCreditCard />} onClick={buy}>
                Buy
              </Button>

              <Button leftIcon={<FiArrowUpRight />} onClick={onOpenSend}>
                Send
              </Button>
              <Button leftIcon={<FiCreditCard />} onClick={onOpenSwap}>
                Swap
              </Button>
            </ButtonGroup>
          </Flex>
        </Center>
      </Flex>

      <Container>
        <Card>
          <Tabs isFitted>
            <TabList>
              <Tab>Assets</Tab>
              <Tab>Activities</Tab>
            </TabList>
            <TabPanels>
              {/* initially mounted */}
              <TabPanel>
                <AssetsList balances={balances} loading={balancesLoading} />
              </TabPanel>
              {/* initially not mounted */}
              <TabPanel>
                <Stack gap={5}>
                  <ActivitiesList activities={activities.data} />
                  <Pagination
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    total={activities.total}
                    onChangePage={changePage}
                  />
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </Container>
      {account && (
        <>
          {isOpenReceive && (
            <ReceiveModal
              isOpen={isOpenReceive}
              onClose={onCloseReceive}
              address={account}
              chainId={chainId}
            />
          )}

          {isOpenSwap && (
            <SwapModal
              isOpen={isOpenSwap}
              onClose={onCloseSwap}
              address={account}
              chainId={chainId}
              assets={balances
                .filter((b: TokenBalance) => b.type !== 'dust')
                .map((b) => b.token.address)}
              onTxSubmitted={onTxSubmitted}
            />
          )}
          {isOpenSend && (
            <SendModal
              isOpen={isOpenSend}
              onClose={onCloseSend}
              chainId={chainId}
              balances={balances}
              onTxSubmitted={onTxSubmitted}
            />
          )}
        </>
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
      <TransactionSubmittedModal ref={txSubmittedRef} chainId={chainId} />
    </>
  );
};
