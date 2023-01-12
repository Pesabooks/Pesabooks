import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Switch,
  SwitchProps,
  Tooltip
} from '@chakra-ui/react';
import { forwardRef, useMemo } from 'react';
import { usePool } from '../hooks/usePool';
import { usePoolAdmins } from '../hooks/usePoolAdmins';
import { useWeb3Auth } from '../hooks/useWeb3Auth';

type A = {
  onlyAdmin?: boolean;
};

export function withAdminRight<T>(Component: React.ComponentType<T>) {
  return forwardRef(({ ...props }: T & A, _) => {
    const componentsProps: any = { ...props };

    const { isAdmin } = usePoolAdmins();
    const { user } = useWeb3Auth();
    const { pool, isDeployed } = usePool();

    const isOrganizer = pool?.organizer.id === user?.id;

    const authorized = useMemo(() => {
      if (!isDeployed) return isOrganizer;
      else return isOrganizer || isAdmin;
    }, [isAdmin, isDeployed, isOrganizer]);

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
