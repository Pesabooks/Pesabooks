import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { usePool } from '../../hooks/usePool';

export const WithdrawButton = () => {
  const { pool } = usePool();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  return isAdmin ? (
    <>
      <Button onClick={() => navigate(`/pool/${pool?.id}/withdraw`)}>Withdraw</Button>
    </>
  ) : null;
};
