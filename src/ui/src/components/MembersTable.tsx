import {
  Avatar,
  Badge,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { Member } from '../types/Member';

interface MembersTableProps {
  members: Member[];
}
export const MembersTable = ({ members }: MembersTableProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const bgStatus = useColorModeValue('gray.400', '#1a202c');
  const colorStatus = useColorModeValue('white', 'gray.400');

  return (
    <Table variant="simple">
      <Thead>
        <Tr my=".8rem" pl="0px" color="gray.400">
          <Th pl="0px" color="gray.400">
            Author
          </Th>
          <Th color="gray.400">Role</Th>
          <Th color="gray.400">Status</Th>
          {/* <Th color="gray.400">Member since</Th> */}
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {members.map((row, index) => {
          return (
            <Tr key={index}>
              <Td minWidth={{ sm: '250px' }} pl="0px">
                <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
                  <Avatar name={row.user?.name} w="50px" borderRadius="12px" me="18px" />
                  <Flex direction="column">
                    <Text fontSize="md" color={textColor} fontWeight="bold" minWidth="100%">
                      {row.user?.name}
                    </Text>
                    <Text fontSize="sm" color="gray.400" fontWeight="normal">
                      {row.user?.email}
                    </Text>
                  </Flex>
                </Flex>
              </Td>

              <Td>
                <Flex direction="column">
                  <Text fontSize="md" color={textColor} fontWeight="bold">
                    {row.role}
                  </Text>
                </Flex>
              </Td>
              <Td>
                <Badge
                  bg={row.active ? 'green.400' : bgStatus}
                  color={row.active ? 'white' : colorStatus}
                  fontSize="16px"
                  p="3px 10px"
                  borderRadius="8px"
                >
                  {row.active ? 'active' : ' inactive'}
                </Badge>
              </Td>
              {/* <Td>
                <Text fontSize="md" color={textColor} fontWeight="bold" pb=".5rem">
                  {row.created_at}
                </Text>
              </Td> */}
              <Td>
                {/* <Button p="0px" bg="transparent" variant="no-hover">
                  <Text fontSize="md" color="gray.400" fontWeight="bold" cursor="pointer">
                    Edit
                  </Text>
                </Button> */}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
