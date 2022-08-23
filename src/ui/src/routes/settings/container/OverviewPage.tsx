import {
  Editable,
  EditableInput,
  EditablePreview,
  EditableTextarea,
  HStack, Stack,
  Text
} from '@chakra-ui/react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { EditableControls } from '../../../components/Editable/EditableControls';
import { TriggerEditableControls } from '../../../components/Editable/TriggerEditableControls';
import { WalletAddress } from '../../../components/WalletAddress';
import { usePool } from '../../../hooks/usePool';
import { updatePoolInformation } from '../../../services/poolsService';

export interface UpdatePoolFormValue {
  name?: string;
  description?: string;
}



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
                <EditablePreview /> <TriggerEditableControls />
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
                <EditablePreview /> <TriggerEditableControls />
              </HStack>
              <EditableTextarea />
              <EditableControls />
            </Editable>
          </HStack>

          {pool?.gnosis_safe_address && <HStack>
            <Text w="200px">Safe Address:</Text>
            {pool && <WalletAddress chainId={pool?.chain_id} address={pool.gnosis_safe_address} type="address" />}
          </HStack>}
        </Stack>
      </CardBody>
    </Card>
  );
};
