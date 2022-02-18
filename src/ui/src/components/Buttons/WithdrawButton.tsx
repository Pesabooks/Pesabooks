import { Button } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePool } from '../../hooks/usePool';
import { isSignerAnAdmin } from '../../services/poolsService';

export const WithdrawButton = () => {
  const { pool } = usePool();
  const { library, active, account } = useWeb3React();
  const [isAdmin, setIsAdmin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (pool) isSignerAnAdmin(pool, library).then(setIsAdmin);
  }, [library, pool, account]);

  return active && pool ? (
    <>
      <Button onClick={() => navigate(`/pool/${pool.id}/withdraw`)} disabled={!isAdmin}>
        Withdraw
      </Button>
    </>
  ) : null;
};
