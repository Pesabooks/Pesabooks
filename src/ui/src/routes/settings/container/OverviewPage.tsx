import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import {
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  EditableTextarea,
  HStack,
  IconButton,
  Stack,
  Text,
  useEditableControls
} from '@chakra-ui/react';
import React from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { WalletAddress } from '../../../components/WalletAddress';
import { usePool } from '../../../hooks/usePool';
import { updatePoolInformation } from '../../../services/poolsService';

export interface UpdatePoolFormValue {
  name?: string;
  description?: string;
}

const EditableControls1 = () => {
  const { isEditing, getEditButtonProps } = useEditableControls();
  return !isEditing ? (
    <IconButton
      variant="ghost"
      aria-label=""
      size="sm"
      icon={<EditIcon />}
      {...getEditButtonProps()}
    />
  ) : null;
};

const EditableControls = () => {
  const { isEditing, getSubmitButtonProps, getCancelButtonProps } = useEditableControls();

  return isEditing ? (
    <ButtonGroup justifyContent="end" size="xs" w="full" spacing={2} mt={2}>
      <IconButton aria-label="Save modification" icon={<CheckIcon />} {...getSubmitButtonProps()} />
      <IconButton
        aria-label="Cancel modification"
        icon={<CloseIcon boxSize={3} />}
        {...getCancelButtonProps()}
      />
    </ButtonGroup>
  ) : null;
};

export const OverviewPage = () => {
  const { pool, refresh } = usePool();

  const submit = async (values: UpdatePoolFormValue) => {
    if (pool) {
      await updatePoolInformation(pool.id, values);
      refresh?.();
    }
  };

  return (
    <Card>
      <CardHeader mb="40px">
        <Text fontSize="lg" fontWeight="bold">
          Group info
        </Text>
      </CardHeader>
      <CardBody>
        <Stack spacing={8}>
          <HStack>
            <Text w="200px">Name:</Text>
            <Editable
              defaultValue={pool?.name}
              isPreviewFocusable={false}
              submitOnBlur={false}
              onSubmit={(val) => submit({ name: val })}
            >
              <HStack>
                <EditablePreview /> <EditableControls1 />
              </HStack>
              <EditableInput />
              <EditableControls />
            </Editable>
          </HStack>

          <HStack>
            <Text w="200px">Description:</Text>
            <Editable
              defaultValue={pool?.description}
              isPreviewFocusable={false}
              submitOnBlur={false}
              onSubmit={(val) => submit({ description: val })}
            >
              <HStack>
                <EditablePreview /> <EditableControls1 />
              </HStack>
              <EditableTextarea />
              <EditableControls />
            </Editable>
          </HStack>

          <HStack>
            <Text w="200px">Address:</Text>
            {pool && <WalletAddress chainId={pool?.chain_id} address={pool?.contract_address} />}
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};
