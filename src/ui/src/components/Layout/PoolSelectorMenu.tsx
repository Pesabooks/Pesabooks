import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text
} from '@chakra-ui/react';
import React from 'react';
import { MdOutlineBubbleChart } from 'react-icons/md';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
        <Icon as={MdOutlineBubbleChart} w="32px" h="32px" me="10px" />

        <Text fontSize="sm" mt="3px" casing="uppercase">
          Pesabooks
        </Text>
      </Link>
    );
  }
};
