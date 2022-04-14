import { Box, Button, Flex, Grid, Icon, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { BsPlus } from 'react-icons/bs';
import { MdSubject } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../components/Card';
import { Navbar } from '../components/Layout/Navbar';
import { PoolCard } from '../components/PoolCard';
import { getMyPools } from '../services/poolsService';
import { Pool } from '../types';

export const HomePage = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyPools()
      .then((pools) => setPools(pools ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Flex direction="column" align="center" overflow="hidden">
      <Navbar />
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
      {/* <Container maxW="2xl"> */}
      <Flex direction="column" justifyContent="center" mt="6.5rem" mb="38px">
        <Text fontSize="3xl" color="white" fontWeight="bold">
          Welcome to Pesabooks
        </Text>
        <Text
          fontSize="md"
          color="white"
          fontWeight="normal"
          mt="10px"
          mb="26px"
          maxW="600px"
          // w={{ base: "90%", sm: "60%", lg: "40%", xl: "30%" }}
        >
          Pesabooks is a digital platform for your saving group (also call Tontine). Pesabooks
          utilize blockchain technologies to facilitate payment through crypto currencies, for more
          transparency and security.
        </Text>
        <Box>
          <Button leftIcon={<MdSubject />} colorScheme="white" variant="outline">
            View the documentation
          </Button>
        </Box>
      </Flex>
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
          <Card  w={350}>
            <CardBody h="100%">
              <Flex w="100%" h="100%">
                <Button variant="no-hover" w="100%" h="100%" onClick={() => navigate('/new-pool')}>
                  <Flex direction="column" align="center" justify="center" color="gray.500">
                    <Icon as={BsPlus} w="30px" h="30px" mb="12px" fontWeight="bold" />
                    <Text fontSize="lg" fontWeight="bold">
                      Create a New Group
                    </Text>
                  </Flex>
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {pools.map((pool, index) => {
            return (
              <Button
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
      {/* </Container> */}
    </Flex>
  );
};
