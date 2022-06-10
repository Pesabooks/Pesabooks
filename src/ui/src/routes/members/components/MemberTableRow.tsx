import {
  Avatar,
  Badge,
  Button,
  Flex, IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Td,
  Text,
  Tr,
  useClipboard,
  useColorModeValue
} from '@chakra-ui/react';
import { FiMoreVertical } from 'react-icons/fi';

interface MembleTableRowProps {
  name: string | undefined;
  email: string | undefined;
  active: boolean;
  status: string;
  isInvitation: boolean;
  id: string;
  onRemove?: (id: string) => void;
  role?: string;
}

export const MemberTableRow = ({
  name,
  email,
  status,
  active,
  isInvitation,
  id,
  onRemove,
  role,
}: MembleTableRowProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  let bgStatus = useColorModeValue('gray.400', '#1a202c');
  let colorStatus = useColorModeValue('white', 'gray.400');

  const link = `${window.location.origin}/auth/invitation/${id}`;
  const { onCopy } = useClipboard(link);

  if (isInvitation) {
    bgStatus = 'orange.300';
    colorStatus = 'white';
  } else if (active) {
    bgStatus = 'green.400';
    colorStatus = 'white';
  }

  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl="0px">
        <Flex align="center" minWidth="100%" flexWrap="nowrap">
          <Avatar name={name} w="50px" borderRadius="12px" me="18px" />

          <Text fontSize="md" color={textColor} fontWeight="bold" minWidth="100%">
            {name}
          </Text>
        </Flex>
      </Td>
      <Td>
        <Text fontSize="sm" color="gray.400" fontWeight="normal">
          {email}
        </Text>
      </Td>
      <Td>
        <Badge bg={bgStatus} color={colorStatus} fontSize="16px" p="3px 10px" borderRadius="8px">
          {status}
        </Badge>
      </Td>
      {/* <Td>
          {isInvitation && (
            <Button colorScheme="teal" variant="link">
              Resend
            </Button>
          )}
        </Td> */}
      <Td>
        {isInvitation && (
          <Button colorScheme="teal" variant="link" onClick={onCopy}>
            Copy Link
          </Button>
        )}
      </Td>
      <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FiMoreVertical />}
            variant="ghost"
          />
          <MenuList>
            {isInvitation && <MenuItem isDisabled>Resend invitation email</MenuItem>}
            <MenuItem isDisabled={!isInvitation} onClick={() => onRemove?.(id)}>
              Remove
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};
