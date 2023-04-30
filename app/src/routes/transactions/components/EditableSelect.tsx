import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import { ButtonGroup, Flex, IconButton, Select, SelectProps, Spacer } from '@chakra-ui/react';
import { IconButtonWithAdmingRights } from '@pesabooks/components/withConnectedWallet';
import { useState } from 'react';

interface EditableSelectProps extends Omit<SelectProps, 'onSelect'> {
  options: { value: string | number | undefined; name: string }[];
  onSelect: (value: string | number | undefined) => void;
}

export const EditableSelect = ({ options, defaultValue, onSelect }: EditableSelectProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [selectedValue, setSelectedValue] = useState<string>();

  const onCancel = () => {
    setIsEditing(false);
  };

  const onSave = () => {
    setValue(selectedValue);
    setIsEditing(false);
    onSelect(selectedValue);
  };

  return (
    <>
      {!isEditing && (
        <Flex>
          {options.find((o) => o.value?.toString() === value?.toString())?.name}
          <Spacer />
          <IconButtonWithAdmingRights
            onClick={() => setIsEditing(true)}
            variant="ghost"
            aria-label=""
            size="sm"
            icon={<EditIcon />}
          />
        </Flex>
      )}

      {isEditing && (
        <>
          <Select defaultValue={defaultValue} onChange={(e) => setSelectedValue(e.target.value)}>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>

          <ButtonGroup justifyContent="end" size="xs" w="full" spacing={2} mt={2}>
            <IconButton onClick={onSave} aria-label="Save modification" icon={<CheckIcon />} />
            <IconButton
              onClick={onCancel}
              aria-label="Cancel modification"
              icon={<CloseIcon boxSize={3} />}
            />
          </ButtonGroup>
        </>
      )}
    </>
  );
};
