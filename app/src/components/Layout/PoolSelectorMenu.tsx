import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Link, Menu, MenuButton, MenuDivider, MenuItem, MenuList } from '@chakra-ui/react';
import { useWeb3Auth } from '@pesabooks/hooks';
import { updateLastPool } from '@pesabooks/services/profilesService';
import { Pool } from '@pesabooks/types';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

interface PoolSelectorMenuProps {
  pool: Pool | undefined;
  pools: Pool[];
}

export const PoolSelectorMenu = ({ pool, pools }: PoolSelectorMenuProps) => {
  const { user } = useWeb3Auth();
  const navigate = useNavigate();

  const selectPool = async (pool_id: string) => {
    if (user) await updateLastPool(user.id, pool_id);
    navigate(`/pool/${pool_id}`);
    // window.location.replace(`/pool/${pool_id}`);
  };

  if (pool) {
    return (
      <>
        <Menu>
          <MenuButton variant="ghost" as={Button} rightIcon={<ChevronDownIcon />}>
            {pool?.name}
          </MenuButton>
          <MenuList>
            {pools
              .filter((p) => p.id !== pool.id)
              .map((p, index) => {
                return (
                  <MenuItem onClick={() => selectPool(p.id)} key={index}>
                    {p.name}
                  </MenuItem>
                );
              })}

            <MenuDivider />
            <MenuItem onClick={() => navigate('/new-pool')} icon={<AddIcon />}>
              Create New Group
            </MenuItem>
          </MenuList>
        </Menu>
      </>
    );
  } else {
    return (
      <Link
        variant="no-decoration"
        as={RouterLink}
        to="/"
        display="flex"
        fontWeight="bold"
        justifyContent="start"
        alignItems="center"
        fontSize="11px"
      >
        <Logo />
      </Link>
    );
  }
};
