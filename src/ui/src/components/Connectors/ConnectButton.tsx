import { Avatar, Button, Stack, Text } from '@chakra-ui/react';

interface ConnectButtonProps {
  name: string;
  description: string;
  onClick: () => void;
}

export const ConnectButton = ({ name, description, onClick }: ConnectButtonProps) => {
  return (
    <Button
      height="150px"
      p="4"
      size="lg"
      display="flex"
      justifyContent="start"
      key={name}
      onClick={onClick}
      variant="outline"
      style={{
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }}
    >
      <Stack direction={'row'} spacing={4} align={'center'}>
        <Avatar size="lg" p="2" src={`/images/wallet/${name}.png`} />
        <Stack direction={'column'} align="start" spacing={2}>
          <Text fontSize={'md'} fontWeight={600}>
            {name}
          </Text>
          <Text align="left" fontSize={'sm'} color={'gray.500'}>
            {description}
          </Text>
        </Stack>
      </Stack>
    </Button>
  );
};
