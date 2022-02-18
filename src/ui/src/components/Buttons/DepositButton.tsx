import { Button } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { usePool } from '../../hooks/usePool';

export const DepositButton = () => {
  const { pool } = usePool();
  const { active } = useWeb3React();
  const navigate = useNavigate();

  return active && pool ? (
    <>
      <Button onClick={() => navigate(`/pool/${pool.id}/deposit`)}>Deposit</Button>
    </>
  ) : null;
};
