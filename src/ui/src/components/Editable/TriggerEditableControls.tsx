import { EditIcon } from '@chakra-ui/icons';
import { useEditableControls } from '@chakra-ui/react';
import { IconButtonWithConnectedWallet } from '../withConnectedWallet';

export const TriggerEditableControls = () => {
  const { isEditing, getEditButtonProps } = useEditableControls();
  
  return !isEditing ? (
    <IconButtonWithConnectedWallet onlyAdmin={true}
      variant="ghost"
      aria-label=""
      size="sm"
      icon={<EditIcon />}
      {...getEditButtonProps()}
    />
  ) : null;
};
