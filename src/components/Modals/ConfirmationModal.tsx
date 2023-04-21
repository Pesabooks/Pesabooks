import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spacer,
  useDisclosure
} from '@chakra-ui/react';
import { forwardRef, Ref, useImperativeHandle, useState } from 'react';

export interface ConfirmationRef {
  open: (message: string, data?: unknown) => void;
}

//todo: use https://chakra-ui.com/docs/components/alert-dialog instead
export interface ConfirmationModalProps {
  ref: Ref<ConfirmationRef>;
  afterClosed: (confirmed: boolean, data?: any) => void | Promise<void>;
}

export const ConfirmationModal = forwardRef(
  ({ afterClosed }: ConfirmationModalProps, ref: Ref<ConfirmationRef>) => {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [message, setMessage] = useState('');
    const [data, setData] = useState<unknown>();

    useImperativeHandle(ref, () => ({
      open: (message: string, data?: unknown) => {
        setMessage(message);
        setData(data);
        onOpen();
      },
    }));

    const close = (confirmed: boolean) => {
      onClose();
      afterClosed(confirmed, data);
    };

    return (
      <Modal
        size="sm"
        isOpen={isOpen}
        onClose={() => close(false)}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody mt={8}>{message}</ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={() => close(false)}>
              No
            </Button>
            <Spacer />
            <Button onClick={() => close(true)}>Yes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
);
