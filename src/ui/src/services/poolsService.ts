import { Web3Provider } from '@ethersproject/providers';
import { Account__factory } from '@pesabooks/contracts/typechain';
import { handleSupabaseError, poolsTable, supabase } from '../supabase';
import { AddressLookup, Pool, Token } from '../types';
import { createPoolAccountContract, getPoolContract } from './blockchainServices';

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
  const { data, error } = await poolsTable()
    .select('*,members:profiles!members(name)')
    .eq('active', true);
  handleSupabaseError(error);

  return data;
};

export const createNewPool = async (
  provider: Web3Provider,
  name: string,
  description: string,
  token: Token,
) => {
  const poolContract = await createPoolAccountContract(provider, token.address);
  const primaryAccountContract = Account__factory.connect(
    await poolContract.defaultAccount(),
    provider,
  );

  const { data, error } = await supabase.rpc<number>('create_pool', {
    name: name,
    description: description ?? '',
    token_id: token.id,
    pool_address: poolContract.address,
    account_address: primaryAccountContract.address,
  });

  handleSupabaseError(error);

  return data;
};

export const getAddressLookUp = async (
  pool_id: number,
  type?: 'user' | 'account',
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

export const isSignerAnAdmin = async (pool: Pool, provider: Web3Provider) => {
  if (!provider) return false;

  const signer = provider.getSigner();

  const signerAddress = await signer.getAddress();
  const poolContract = await getPoolContract(pool.contract_address, provider);

  return poolContract.isAdmin(signerAddress);
};
