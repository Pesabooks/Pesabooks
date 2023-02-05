import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  Grid,
  Icon,
  Link,
  Spinner,
  Text
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import { MdSubject } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { NavbarLight } from '../../components/Layout/NavbarLight';
import { ChooseUsernameModal } from '../../components/Modals/ChooseUsername';
import { PoolCard } from '../../components/PoolCard';
import { getMyPools } from '../../services/poolsService';
import { Pool } from '../../types';
import { PendingInvitation } from './components/PendingInvitation';

export const HomePage = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    getMyPools()
      .then((pools) => setPools(pools ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const boxW = 250;
  const boxH = 216;
  return (
    <Box px={10}>
      <NavbarLight theme="dark" />
      <Center>
        <Flex
          direction="column"
          align={{
            sm: 'center',
            md: 'start',
          }}
          overflow="hidden"
        >
          <Box
            position="absolute"
            minH={{ base: '70vh', xl: '50vh' }}
            w={{ sm: 'calc(100vw - 25px)', md: 'calc(100vw - 25px)' }}
            borderRadius={{ sm: '15px' }}
            left="0"
            right="0"
            bgRepeat="no-repeat"
            overflow="hidden"
            zIndex="-1"
            top="0"
            bgImage="url('/images/auth-bg.png')"
            bgSize="cover"
            mx={{ sm: 'auto' }}
            mt={{ sm: '14px' }}
          ></Box>
          <PendingInvitation onAccepted={loadData} />

          <Flex direction="column" textAlign="start" justifyContent="center" mt="2.5rem" px={4}>
            <Text fontSize="3xl" color="black" fontWeight="bold">
              Welcome to Pesabooks
            </Text>
            <Text fontSize="md" color="black" fontWeight="normal" mt="10px" mb="26px" maxW="600px">
              Save and invest together with group of friends in the cryptocurrency market by
              leveraging the power of decentralized technology and multi-sig wallets
            </Text>
            <Flex>
              <ButtonGroup gap="4">
                <Link w="100%" isExternal href="https://docs.pesabooks.com">
                  <Button leftIcon={<MdSubject />} color="black" variant="outline" _hover={{}}>
                    View the documentation
                  </Button>
                </Link>
              </ButtonGroup>
            </Flex>
          </Flex>

          {loading ? (
            <Spinner thickness="4px" speed="0.65s" size="xl" />
          ) : (
            <Box mt="3.5rem">
              <Box p="6px 0px 22px 20px">
                <Text fontSize="xl" fontWeight="bold">
                  Recent groups
                </Text>
              </Box>
              <Grid
                templateColumns={{
                  sm: '1fr',
                  md: 'repeat(2, auto)',
                  lg: 'repeat(3, auto)',
                }}
                templateRows={{ md: 'repeat(3, auto)', lg: 'repeat(2, auto)' }}
                gap={5}
                columnGap={5}
              >
                <Button
                  variant="no-hover"
                  w="100%"
                  h="100%"
                  onClick={() => navigate('/new-pool')}
                  p={0}
                >
                  <Card w={boxW} h={boxH}>
                    <Flex
                      w="100%"
                      h="100%"
                      direction="column"
                      align="center"
                      justify="center"
                      color="gray.500"
                    >
                      <Icon as={BsPlus} w="30px" h="30px" mb="12px" fontWeight="bold" />
                      <Text fontSize="lg" fontWeight="bold">
                        Create a group
                      </Text>
                    </Flex>
                  </Card>
                </Button>

                {pools.map((pool, index) => {
                  return (
                    <Button
                      key={index}
                      variant="no-hover"
                      w="100%"
                      h="100%"
                      p={0}
                      onClick={() => navigate(`/pool/${pool.id}`)}
                    >
                      <PoolCard pool={pool} w={boxW} h={boxH}></PoolCard>{' '}
                    </Button>
                  );
                })}
              </Grid>
            </Box>
          )}
          <ChooseUsernameModal />
        </Flex>
      </Center>
    </Box>
  );
};
