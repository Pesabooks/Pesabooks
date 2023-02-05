import { EmailIcon } from '@chakra-ui/icons';
import {
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Card } from '../../../components/Card';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { acceptInvitation, getActiveInvitationsByEmail } from '../../../services/invitationService';
import { Invitation } from '../../../types';

export interface PendingInvitationProps {
  onAccepted: () => void;
}
export const PendingInvitation = ({ onAccepted }: PendingInvitationProps) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { user } = useWeb3Auth();
  const [selectedInviations, setSelectedInviations] = useState<string[]>([]);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadData = useCallback(async () => {
    if (user) {
      const activeInvitations = await getActiveInvitationsByEmail(user.email);
      setInvitations(activeInvitations ?? []);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectInvitation = (invitationId: string) => {
    if (selectedInviations.includes(invitationId)) {
      setSelectedInviations(selectedInviations.filter((i) => i !== invitationId));
    } else setSelectedInviations([...selectedInviations, invitationId]);
  };

  const acceptInvitations = async () => {
    await Promise.all(selectedInviations.map((id) => acceptInvitation(id)));
    onClose();
    loadData();
    onAccepted();
    setSelectedInviations([]);

    toast({
      title: 'You have joined the selected group(s)',
      status: 'success',
      isClosable: true,
    });
  };

  return invitations.length > 0 ? (
    <>
      <Card px={10} py={1} >
        <Flex gap={5} align="center">
          <EmailIcon />
          <Text> You have {invitations.length} pending group invitations</Text>
          <Spacer />
          <Button variant="ghost" onClick={onOpen}>
            See invitations
          </Button>
        </Flex>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Accept group invitations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text> You've been invited to the following group as a member</Text>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th></Th>
                    <Th>Group</Th>
                    <Th>Invited by</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invitations.map((inviation, index) => (
                    <Tr key={index}>
                      <Td>
                        <Checkbox
                          isChecked={selectedInviations.includes(inviation.id)}
                          onChange={() => selectInvitation(inviation.id)}
                        ></Checkbox>
                      </Td>
                      <Td>{inviation.pool_name}</Td>
                      <Td>{inviation.invited_by}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              variant="ghost"
              disabled={selectedInviations.length === 0}
              onClick={acceptInvitations}
            >
              Accept {selectedInviations.length} invitation(s)
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  ) : null;
};
