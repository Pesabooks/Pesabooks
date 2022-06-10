import { Button, ButtonProps, IconButton, IconButtonProps, Switch, SwitchProps, Tooltip } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { forwardRef, useMemo } from 'react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { usePool } from '../hooks/usePool';

type A = {
  onlyAdmin?: boolean;
};

export function withConnectedWallet<T>(Component: React.ComponentType<T>) {
  return forwardRef(({ onlyAdmin: requiredAdmin, ...props }: T & A, _) => {
    const componentsProps: any = { ...props };

    const { chainId } = useWeb3React();
    const { pool } = usePool();

    const isAdmin = useIsAdmin();

    const message = useMemo(() => {
      if (pool?.chain_id && chainId !== pool?.chain_id) return 'Connect your wallet';
      else if (requiredAdmin && !isAdmin) return 'You wallet is not a administrator of the safe';

      return null;
    }, [chainId, isAdmin, pool?.chain_id, requiredAdmin]);

    if (message)
      return (
        <Tooltip label={message} shouldWrapChildren>
          <Component {...componentsProps} isDisabled disabled />
        </Tooltip>
      );
    return <Component {...componentsProps} />;
  });
}


export  const ButtonWithConnectedWallet = withConnectedWallet<ButtonProps>(Button);
export  const SwitchWithConnectedWallet = withConnectedWallet<SwitchProps>(Switch);
export const IconButtonWithConnectedWallet = withConnectedWallet<IconButtonProps>(IconButton);