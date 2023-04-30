import { Box, Flex, Icon, Stack, Tag, Text, useColorModeValue } from '@chakra-ui/react';
import { FiCheckCircle, FiCircle, FiXCircle } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';

interface TimelineRowProps {
  status: 'done' | 'pending' | 'rejected' | 'approved';
  logo: IconType;
  title: string;
  titleColor?: string;
  date?: string;
  tag?: {
    bgTag: string;
    titleTag: string;
  };
  description?: string;
  last?: boolean;
}

export const TimelineRow = (props: TimelineRowProps) => {
  const { title, status, date, tag, description, last } = props;
  const textColor = useColorModeValue('gray.700', 'white.300');
  const bgIconColor = useColorModeValue('white.300', 'gray.700');

  let logo;
  let color;

  switch (status) {
    case 'done':
      logo = FiCircle;
      color = 'teal.300';
      break;
    case 'pending':
      logo = FiCircle;
      color = 'grey';
      break;
    case 'approved':
      logo = FiCheckCircle;
      color = 'teal.300';
      break;
    case 'rejected':
      logo = FiXCircle;
      color = 'red.300';
      break;
    default:
      break;
  }

  return (
    <Flex alignItems="center" minH="30px" justifyContent="start">
      <Flex direction="column" h="100%">
        <Icon
          as={logo}
          bg={bgIconColor}
          color={color}
          h={'30px'}
          w={'26px'}
          pe="6px"
          zIndex="1"
          position="relative"
          left={'-8px'}
        />
        {!last && <Box w="2px" bg="gray.200" mt={2} h="100%"></Box>}
      </Flex>
      <Flex direction="column" justifyContent="flex-start" h="100%">
        <Text fontSize="sm" color={textColor} fontWeight="bold">
          {title}
        </Text>
        {date && (
          <Text fontSize="sm" color="gray.400" fontWeight="normal" mb={2}>
            {date}
          </Text>
        )}
        {description !== undefined ? (
          <Text fontSize="sm" color="gray.400" fontWeight="normal" maxW="70%">
            {description}
          </Text>
        ) : null}
        {tag !== undefined ? (
          <Stack direction="row" spacing="6px">
            <Tag
              colorScheme={tag.bgTag}
              fontSize="xs"
              size="md"
              mb="16px"
              borderRadius="15px"
              alignSelf="flex-start"
              variant="outline"
            >
              {tag.titleTag}
            </Tag>
          </Stack>
        ) : null}
      </Flex>
    </Flex>
  );
};
