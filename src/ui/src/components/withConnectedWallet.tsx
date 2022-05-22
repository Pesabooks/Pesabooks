import { Tooltip } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { usePool } from '../hooks/usePool';

export function withConnectedWallet<T>(Component: React.ComponentType<T>, requiredAdmin = false) {
  return (props: T) => {
    const { chainId } = useWeb3React();
    const { pool } = usePool();

    const isAdmin = useIsAdmin();

    if (!pool) return null;

    const message = useMemo(() => {
      if (chainId !== pool.chain_id) return 'Connect your wallet';
      else if (requiredAdmin && !isAdmin) return 'You wallet is not a administrator of the safe';

      return null;
    }, [chainId, isAdmin, pool.chain_id]);

    if (message)
      return (
        <Tooltip label={message} shouldWrapChildren>
          <Component {...props} isDisabled />
        </Tooltip>
      );
    return <Component {...props} />;
  };
}