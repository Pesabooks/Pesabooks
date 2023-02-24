import { Web3Provider } from '@ethersproject/providers';
import { handleSupabaseError, poolsTable, supabase, transationsTable } from '../supabase';
import { Pool, Token, User } from '../types';
import { deploySafe } from './gnosisServices';
import { getMembers } from './membersService';

export const getPool = async (pool_id: string) => {
  const { data, error } = await poolsTable()
    .select(
      `
        *,
        token:token_id(*),
        organizer:user_id(*),
        members2: members(*)
      `,
    )
    .eq('id', pool_id);
  handleSupabaseError(error);

  return data?.[0] as Pool;
};

export const getMyPools = async () => {
  const { data, error } = await supabase().rpc('get_my_pools');
  handleSupabaseError(error);
  return (data as Pool[] | null) ?? [];
};

export const createNewPool = async (
  name: string,
  description: string,
  token: Token,
  chainId: number,
) => {
  const { data: poolId, error } = await supabase()
    .rpc('create_pool', {
      chain_id: chainId,
      name: name,
      description: description ?? '',
      token_id: token.id,
    })
    .single();

  handleSupabaseError(error);

  return getPool(poolId!);
};

export const deployNewSafe = async (provider: Web3Provider, pool_id: string) => {
  const signer = provider.getSigner();

  const members = await getMembers(pool_id);
  const gnosis_address = await deploySafe(
    signer,
    members.map((m) => (m.user as User)!.wallet),
  );

  await poolsTable().update({ gnosis_safe_address: gnosis_address }).eq('id', pool_id);

  await transationsTable().insert({
    type: 'createSafe',
    pool_id,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    status: 'completed',
    category_id: null,
    memo: null,
  });

  return pool_id;
};

export const updatePoolInformation = async (id: string, pool: Partial<Pool>) => {
  const { error } = await poolsTable()
    .update({ name: pool.name, description: pool.description })
    .eq('id', id);
  handleSupabaseError(error);
};
