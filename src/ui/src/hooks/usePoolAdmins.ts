import { useEffect, useState } from 'react';
import { getMembers } from '../services/membersService';
import { User } from '../types';
import { getTypedStorageItem } from '../utils/storage-utils';
import { usePool } from './usePool';

export const usePoolAdmins = (): { admins: User[]; isAdmin: boolean } => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { pool } = usePool();
  const [admins, setAdmins] = useState<User[]>([]);

  const user_id = getTypedStorageItem('user_id');

  useEffect(() => {
    if (pool?.id)
      getMembers(pool?.id).then((members) => {
        if (members) {
          setAdmins(members.filter((m) => m.role === 'admin').map((m) => m.user!));
        }
      });
  }, [pool?.id]);

  useEffect(() => {
    setIsAdmin(!!admins.find((u) => u.id === user_id));
  }, [admins, user_id]);

  return { admins, isAdmin };
};
