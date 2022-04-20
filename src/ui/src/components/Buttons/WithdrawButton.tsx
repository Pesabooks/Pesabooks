import { Button } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePool } from '../../hooks/usePool';
import { isSignerAnAdmin } from '../../services/poolsService';

export const WithdrawButton = () => {
  const { pool } = usePool();
  const { provider, isActive, account, chainId } = useWeb3React();
  const [isAdmin, setIsAdmin] = useState(true);
  const navigate = useNavigate();

  const connected = isActive && pool?.chain_id === chainId;

  useEffect(() => {
    if (pool && connected) isSignerAnAdmin(pool, provider as Web3Provider).then(setIsAdmin);
  }, [provider, pool, account, isActive, connected]);

  return connected ? (
    <>
      <Button onClick={() => navigate(`/pool/${pool?.id}/withdraw`)} disabled={!isAdmin}>
        Withdraw
      </Button>
    </>
  ) : null;
};
