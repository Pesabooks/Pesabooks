import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';

import { usePool, useSafeAdmins } from '@pesabooks/hooks';
import {
  BsArrowDownLeftCircleFill,
  BsArrowLeftRight,
  BsArrowUpRightCircleFill,
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export const NewTransactionMenu = () => {
  const { pool } = usePool();
  const navigate = useNavigate();
  const { isSafeAdmin } = useSafeAdmins();

  const DepositLogo = () => <Icon as={BsArrowDownLeftCircleFill} boxSize={6} color="green.400" />;
  const WithdrawLogo = () => <Icon as={BsArrowUpRightCircleFill} boxSize={6} color="red.400" />;
  const SwapLogo = () => <Icon as={BsArrowLeftRight} boxSize={6} />;

  return (
    <>
      {pool?.gnosis_safe_address && (
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            New Transaction
          </MenuButton>
          <MenuList>
            <MenuItem icon={<DepositLogo />} onClick={() => navigate(`/pool/${pool?.id}/deposit`)}>
              Deposit
            </MenuItem>
            {/* <MenuItem icon={<DepositLogo />} onClick={() => navigate(`/pool/${pool?.id}/ramp`)}>
          Deposit with Card
        </MenuItem> */}
            <MenuItem
              icon={<WithdrawLogo />}
              onClick={() => navigate(`/pool/${pool?.id}/withdraw`)}
              isDisabled={!isSafeAdmin}
            >
              Withdraw
            </MenuItem>
            <MenuItem
              icon={<SwapLogo />}
              onClick={() => navigate(`/pool/${pool?.id}/swap`)}
              isDisabled={!isSafeAdmin}
            >
              Swap
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </>
  );
};
