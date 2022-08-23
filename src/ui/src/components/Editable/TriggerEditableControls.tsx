import { EditIcon } from '@chakra-ui/icons';
import { useEditableControls } from '@chakra-ui/react';
import { IconButtonWithAdmingRights } from '../withConnectedWallet';

export const TriggerEditableControls = () => {
  const { isEditing, getEditButtonProps } = useEditableControls();
  
  return !isEditing ? (
    <IconButtonWithAdmingRights
      variant="ghost"
      aria-label=""
      size="sm"
      icon={<EditIcon />}
      {...getEditButtonProps()}
    />
  ) : null;
};
