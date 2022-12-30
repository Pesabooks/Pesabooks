import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Switch,
  SwitchProps,
  Tooltip,
} from '@chakra-ui/react';
import { forwardRef, useMemo } from 'react';
import { usePool } from '../hooks/usePool';
import { usePoolAdmins } from '../hooks/usePoolAdmins';
import { useSafeAdmins } from '../hooks/useSafeAdmins';

type A = {
  onlyAdmin?: boolean;
};

export function withAdminRight<T>(Component: React.ComponentType<T>) {
  return forwardRef(({ ...props }: T & A, _) => {
    const componentsProps: any = { ...props };

    const { isAdmin } = usePoolAdmins();
    const { isSafeAdmin } = useSafeAdmins();
    const { pool } = usePool();

    const authorized = useMemo(() => {
      if (!pool?.gnosis_safe_address) return isAdmin;
      else return isSafeAdmin;
    }, [isAdmin, isSafeAdmin, pool?.gnosis_safe_address]);

    if (!authorized)
      return (
        <Tooltip label="You are not an administrator" shouldWrapChildren>
          <Component {...componentsProps} isDisabled disabled />
        </Tooltip>
      );
    return <Component {...componentsProps} />;
  });
}

export const ButtonWithAdmingRights = withAdminRight<ButtonProps>(Button);
export const SwitchWithAdmingRights = withAdminRight<SwitchProps>(Switch);
export const IconButtonWithAdmingRights = withAdminRight<IconButtonProps>(IconButton);
