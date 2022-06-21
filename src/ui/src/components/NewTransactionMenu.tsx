import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';

import { useWeb3React } from '@web3-react/core';
import { BsArrowDownLeftCircleFill, BsArrowUpRightCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { usePool } from '../hooks/usePool';

export const NewTransactionMenu = () => {
  const { pool } = usePool();
  const { isActive, chainId } = useWeb3React();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  const walletConnected = isActive && pool?.chain_id === chainId;
  const DepositLogo = () => <Icon as={BsArrowDownLeftCircleFill} boxSize={6} color="green.400" />;
  const WithdrawLogo = () => <Icon as={BsArrowUpRightCircleFill} boxSize={6} color="red.400" />;



  return walletConnected ? (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        New Transaction
      </MenuButton>
      <MenuList>
        <MenuItem icon={<DepositLogo />} onClick={() => navigate(`/pool/${pool?.id}/deposit`)}>
          Deposit
        </MenuItem>
        <MenuItem icon={<DepositLogo />} onClick={() => navigate(`/pool/${pool?.id}/ramp`)}>
          Deposit with Card
        </MenuItem>
        <MenuItem
          icon={<WithdrawLogo />}
          onClick={() => navigate(`/pool/${pool?.id}/withdraw`)}
          isDisabled={!isAdmin}
        >
          Withdraw
        </MenuItem>
      </MenuList>
    </Menu>
  ) : null;
};
