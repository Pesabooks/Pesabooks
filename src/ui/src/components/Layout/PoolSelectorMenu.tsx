import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Link, Menu, MenuButton, MenuDivider, MenuItem, MenuList } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { updateLastPool } from '../../services/profilesService';
import { Pool } from '../../types';

interface PoolSelectorMenuProps {
  pool: Pool | undefined;
  pools: Pool[];
}

export const PoolSelectorMenu = ({ pool, pools }: PoolSelectorMenuProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const selectPool = async (pool_id: number) => {
    if (user) await updateLastPool(user.id, pool_id);
    window.location.replace(`/pool/${pool_id}`);
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
              Add a Pool
            </MenuItem>
          </MenuList>
        </Menu>
      </>
    );
  } else {
    return (
      <Link href="/" fontWeight="bold">
        Pesabooks
      </Link>
    );
  }
};
