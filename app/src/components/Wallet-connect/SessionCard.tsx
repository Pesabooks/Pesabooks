import { DeleteIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Heading,
  IconButton,
  Text,
} from '@chakra-ui/react';

interface IProps {
  topic?: string;
  logo?: string;
  name?: string;
  url?: string;
  disconnect?: () => void;
}

export const SessionCard = ({ name, url, logo, disconnect, ...cardProps }: IProps & CardProps) => {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow="hidden"
      variant="outline"
      alignItems={'center'}
      {...cardProps}
    >
      <CardHeader>
        <Avatar name={name} src={logo} />
      </CardHeader>

      <CardBody>
        <Heading size="md">{name}</Heading>
        <Text py="2">{url?.split('https://')[1] ?? 'Unknown'}</Text>
      </CardBody>
      {disconnect && (
        <IconButton
          variant="outline"
          aria-label="Disconnect"
          icon={<DeleteIcon />}
          onClick={disconnect}
          marginRight={2}
        />
      )}
    </Card>
  );
};
