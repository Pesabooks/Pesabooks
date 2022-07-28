import { Web3Provider } from '@ethersproject/providers';
import { handleSupabaseError, poolsTable, supabase, transationsTable } from '../supabase';
import { AddressLookup, Pool, Profile, Token, Transaction } from '../types';
import { deploySafe } from './gnosisServices';

export const getPool = async (pool_id: string) => {
  const { data, error } = await poolsTable()
    .select(
      `
        *,
        token:token_id(*)
      `,
    )
    .eq('id', pool_id);
  handleSupabaseError(error);

  return data?.[0];
};

export const getMyPools = async () => {
  const { data, error } = await supabase.rpc<Pool>('get_my_pools');
  handleSupabaseError(error);
  return data;
};

export const getPoolMembers = async (pool_id: number) => {
  const { data, error } = await supabase.rpc<Profile>('get_pool_users', { pool_id });
  handleSupabaseError(error);
  return data;
};

export const createNewPool = async (
  provider: Web3Provider,
  name: string,
  description: string,
  token: Token,
  chainId: number,
) => {
  const signer = provider.getSigner();
  const gnosis_address = await deploySafe(signer);
  const signer_address = await signer.getAddress();

  const { data: poolId, error } = await supabase.rpc<number>('create_pool', {
    chain_id: chainId,
    name: name,
    description: description ?? '',
    token_id: token.id,
    gnosis_safe_address: gnosis_address,
  });

  handleSupabaseError(error);

  const transaction: Partial<Transaction> = {
    type: 'createSafe',
    //@ts-ignore the function return a number, not an array
    pool_id: poolId,
    timestamp: Math.floor(new Date().valueOf() / 1000),
    signer_address,
    status: 'completed',
  };

  await transationsTable().insert(transaction);

  return poolId;
};

export const updatePoolInformation = async (id: number, pool: Partial<Pool>) => {
  const { error } = await poolsTable()
    .update({ name: pool.name, description: pool.description })
    .eq('id', id);
  handleSupabaseError(error);
};

export const getAddressLookUp = async (
  pool_id: number,
  type?: 'user' | 'pool',
): Promise<AddressLookup[]> => {
  let query = supabase.rpc<AddressLookup>('get_address_lookup', {
    pool_id: pool_id,
  });
  if (type) {
    query = query.filter('type', 'eq', type);
  }
  const { data, error } = await query;
  handleSupabaseError(error);

  return data ?? [];
};
