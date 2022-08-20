import { Button, ButtonProps } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { usePool } from '../../hooks/usePool';

export const DepositButton = (props: ButtonProps) => {
  const { pool } = usePool();
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(`/pool/${pool?.id}/deposit`)} {...props}>
      Deposit
    </Button>
  );
};
