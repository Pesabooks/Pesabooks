import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Switch,
  SwitchProps,
  Tooltip,
} from '@chakra-ui/react';
import { usePool, useWeb3Auth } from '@pesabooks/hooks';
import { forwardRef, useMemo } from 'react';

type A = {
  onlyAdmin?: boolean;
};

export function withAdminRight<T>(Component: React.ComponentType<T>) {
  return forwardRef(({ ...props }: T & A, _) => {
    const componentsProps: any = { ...props };

    const { user } = useWeb3Auth();
    const { pool, isDeployed } = usePool();

    const isOrganizer = pool?.organizer.id === user?.id;

    const authorized = useMemo(() => {
      if (!isDeployed) return isOrganizer;
      //todo: refactor this
      else return true;
    }, [isDeployed, isOrganizer]);

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
