import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { ButtonGroup, IconButton, useEditableControls } from '@chakra-ui/react';

export const EditableControls = () => {
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
