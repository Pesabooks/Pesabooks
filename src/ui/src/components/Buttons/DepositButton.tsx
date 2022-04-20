import { Button } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { usePool } from '../../hooks/usePool';


export const DepositButton = () => {
  const { pool } = usePool();
  const { isActive,chainId } = useWeb3React();
  const navigate = useNavigate();

  return isActive && pool?.chain_id===chainId ? (
    <>
      <Button onClick={() => navigate(`/pool/${pool?.id}/deposit`)}>Deposit</Button>
    </>
  ) : null;
};
