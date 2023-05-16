import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';

export interface ChangeThresholdModalProps {
  isOpen: boolean;
  onClose: (hash?: string) => void;
  onChange: (threshold: number) => void;
  currenThreshold: number;
  adminsCount: number;
}

export interface ChangeThresholdFormValue {
  threshold: number;
}

export const ChangeThresholdModal = ({
  isOpen,
  onClose,
  onChange,
  currenThreshold,
  adminsCount,
}: ChangeThresholdModalProps) => {
  const methods = useForm<ChangeThresholdFormValue>({
    defaultValues: { threshold: currenThreshold },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change required confirmations</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormProvider {...methods}>
            <FormControl isInvalid={!!methods.formState.errors.threshold} isRequired>
              <FormLabel htmlFor="category">New Threshold</FormLabel>
              <FormHelperText mb={4}>Any transaction requires the confirmation of:</FormHelperText>
              <HStack gap={4}>
                <Select w={70} {...methods.register('threshold', { required: true })}>
                  {[...Array(adminsCount).keys()]
                    .map((el) => el + 1)
                    .map((t) => (
                      <option value={t} key={t}>
                        {t}
                      </option>
                    ))}
                </Select>
                <Text>out of {adminsCount} admins</Text>
              </HStack>
              <FormErrorMessage>
                {methods.formState.errors.threshold && methods.formState.errors.threshold.message}
              </FormErrorMessage>
            </FormControl>
          </FormProvider>
        </ModalBody>

        <ModalFooter>
          <Button
            isLoading={methods.formState.isSubmitting}
            onClick={methods.handleSubmit((val) => onChange(val.threshold))}
          >
            Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
