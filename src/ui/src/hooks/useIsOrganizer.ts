import { usePool } from './usePool';
import { useWeb3Auth } from './useWeb3Auth';

export const useIsOrganizer = (): boolean => {
  const { pool } = usePool();

  const { user } = useWeb3Auth();

  return !!user && pool?.organizer.id === user?.id;
};
