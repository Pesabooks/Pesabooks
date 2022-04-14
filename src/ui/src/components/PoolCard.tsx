import { Avatar, AvatarGroup, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { Pool } from '../types';
import { Card, CardBody, CardHeader } from './Card';
import { Separator } from './Layout/Separator';

interface PoolCardProps {
  pool: Pool;
}
export const PoolCard = ({ pool }: PoolCardProps) => {
  const textColor = useColorModeValue('gray.700', 'white');

  return (
    <Card alignSelf="flex-start" w={350}>
      <CardHeader mb="18px">
        <Flex justify="space-between" w="100%">
          <Flex direction="column">
            <Text fontSize="md" color={textColor} fontWeight="bold" mb="8px">
              {pool.name}
            </Text>
            <AvatarGroup size="xs">
              {pool.members?.map((member, index) => {
                return <Avatar key={index} name={member.name} />;
              })}
            </AvatarGroup>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction="column">
          <Text color="gray.400" fontSize="sm" fontWeight="normal">
            {pool.description}
          </Text>
          <Separator my="22px" />
          <Flex justify="space-between" w="100%">
            <Flex direction="column">
              <Text fontSize="md" color={textColor} fontWeight="bold" mb="6px">
                {pool.members?.length}
              </Text>
              <Text color="gray.400" fontSize="sm" fontWeight="normal">
                Members
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};
