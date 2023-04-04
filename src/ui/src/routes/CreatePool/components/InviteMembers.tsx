import { SmallCloseIcon } from '@chakra-ui/icons';
import {
  Button, Card,
  CardBody,
  CardHeader, Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaUser } from 'react-icons/fa';
import { Invitation } from '../../../types';

interface InviteMembersProps {
  members: Partial<Invitation>[];
  onAdd: (member: Partial<Invitation>) => void;
  onRemove: (member: Partial<Invitation>) => void;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export interface InviteMemberFormValue {
  email: string;
  name: string;
}

const InviteForm = ({
  onAdd,
  onClose,
}: {
  onAdd: (member: Partial<Invitation>) => void;
  onClose: () => void;
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValue>();

  const onSubmit = async (form: InviteMemberFormValue) => {
    onAdd(form);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Stack spacing={4}>
          <HStack>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input id="name" {...register('name', { required: true })} />
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input id="email" type="email" {...register('email', { required: true })} />
            </FormControl>
          </HStack>
          <HStack mt={4}>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </HStack>
        </Stack>
      </Card>
    </form>
  );
};

export const InviteMembers = ({
  members,
  onAdd,
  onPrev,
  onNext,
  onRemove,
  loading,
}: InviteMembersProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <Card>
      <CardHeader>
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          w="80%"
          mx="auto"
        >
          <Text color="gray.400" fontWeight="normal" fontSize="sm">
            Who are the group members? (minimum 2 are required).
          </Text>
        </Flex>
      </CardHeader>
      <CardBody flexDirection="column">
        <List spacing={3} textAlign="left">
          {members.map((member, index) => (
            <ListItem key={index}>
              <ListIcon as={FaUser} color="green.500" mr={5} />
              <b>{member.name}</b> {member.email}
              <IconButton
                aria-label={''}
                variant="unstyled"
                icon={<SmallCloseIcon />}
                onClick={() => onRemove(member)}
              ></IconButton>
            </ListItem>
          ))}
        </List>
        {isOpen ? (
          <InviteForm
            onClose={onClose}
            onAdd={(m) => {
              onAdd(m);
              onClose();
            }}
          />
        ) : (
          <Button variant="ghost" onClick={onOpen}>
            + Add member
          </Button>
        )}

        <Flex justify="space-between" mt="100px">
          <Button
            variant="outline"
            alignSelf="flex-end"
            w={{ sm: '75px', lg: '100px' }}
            h="35px"
            onClick={onPrev}
            isLoading={loading}
          >
            Prev
          </Button>
          <Button
            alignSelf="flex-end"
            w={150}
            h="35px"
            disabled={members.length < 2}
            isLoading={loading}
            onClick={onNext}
          >
            Create group
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};
