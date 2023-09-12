/* eslint-disable prettier/prettier */
import {
    Avatar,
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Text
} from '@chakra-ui/react';
import { TextAreaMemoField } from '@pesabooks/routes/transactions/components/TextAreaMemoField';
import { Category } from '@pesabooks/types';
import { WalletConnectTransactionRequest } from 'hooks/useWalletConnect';
import { FormProvider, useForm } from 'react-hook-form';
import { SelectCategoryField } from '../Input/SelectCategoryField';

export interface TxRequestFormValue {
  memo?: string;
  category: Category;
}
interface IProps {
  isOpen: boolean;
  onClose: () => void;
  txRequestPayload: WalletConnectTransactionRequest | undefined;
  onSubmit: (formValue: TxRequestFormValue) => Promise<void>;
  onReject: () => void;
  categories: Category[];
}

export const TransactionRequestModal = ({
  isOpen,
  onClose,
  txRequestPayload,
  onSubmit,
  categories,
  onReject,
}: IProps) => {
  const methods = useForm<TxRequestFormValue>();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Heading size="md">{`Transaction Request`}</Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack mb={5}>
                <Box mr={2}>
                  <Avatar
                    mr={0}
                    name={txRequestPayload?.peerMetadata?.name}
                    src={txRequestPayload?.peerMetadata?.icons[0]}
                  />
                </Box>

                <Box>
                  <Text>{txRequestPayload?.peerMetadata?.name}</Text>
                  <Text>
                    {txRequestPayload?.peerMetadata?.url?.split('https://')[1] ?? 'Unknown'}
                  </Text>
                  
                </Box>
              </HStack>

              <SelectCategoryField mb="4" categories={categories ?? []} />

              <TextAreaMemoField mb="4" />
              <Flex></Flex>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" onClick={onReject}>
                Reject
              </Button>
              <Spacer />
              <Button isLoading={methods.formState.isSubmitting} type="submit">
                Create proposal
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </FormProvider>
    </Modal>
  );
};
