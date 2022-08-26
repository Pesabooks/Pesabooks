import { Box, Button, ButtonGroup, Flex, Grid, Icon, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import { MdSubject } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { NavbarLight } from '../../components/Layout/NavbarLight';
import { PoolCard } from '../../components/PoolCard';
import { getMyPools } from '../../services/poolsService';
import { Pool } from '../../types';

export const HomePage = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyPools()
      .then((pools) => setPools(pools ?? []))
      .finally(() => setLoading(false));
  }, []);

  const hasPool = pools?.length > 0;

  return (
    <Flex direction="column" align="center" overflow="hidden">
      <NavbarLight />
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
      {!hasPool && (
        <Flex
          direction="column"
          textAlign="center"
          justifyContent="center"
          align="center"
          mt="6.5rem"
          mb="38px"
        >
          <Text fontSize="3xl" color="black" fontWeight="bold">
            Welcome to Pesabooks
          </Text>
          <Text fontSize="md" color="black" fontWeight="normal" mt="10px" mb="26px" maxW="600px">
            Pesabooks is a digital platform for your saving group. Pesabooks utilize blockchain
            technologies to facilitate payment through crypto currencies.
          </Text>
          <Flex>
            <ButtonGroup gap="4">
              <Button bg="teal" color="white" variant="solid" onClick={() => navigate('/new-pool')}>
                Create a group
              </Button>
              <Button leftIcon={<MdSubject />} color="black" variant="outline">
                View the documentation
              </Button>
            </ButtonGroup>
          </Flex>
        </Flex>
      )}
      {loading ? (
        <Spinner thickness="4px" speed="0.65s" size="xl" />
      ) : (
        hasPool && (
          <Box mt="6.5rem">
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
              gap="30px"
            >
              <Button variant="no-hover" w="100%" h="100%" onClick={() => navigate('/new-pool')}>
                <Card w={350} h={216}>
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
                    onClick={() => navigate(`/pool/${pool.id}`)}
                  >
                    <PoolCard pool={pool}></PoolCard>{' '}
                  </Button>
                );
              })}
            </Grid>
          </Box>
        )
      )}
    </Flex>
  );
};
