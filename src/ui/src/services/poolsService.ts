import { Web3Provider } from '@ethersproject/providers';
import { PoolSafe__factory } from '@pesabooks/contracts/typechain';
import { networks } from '../data/networks';
import { handleSupabaseError, poolsTable, supabase } from '../supabase';
import { AddressLookup, Pool, Token } from '../types';
import { defaultProvider, getPoolContract } from './blockchainServices';

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
  chainId: number,
) => {
  const registryAddress = networks[chainId].registryAddress;

  if (!registryAddress) throw new Error('Registry address missing from config');
  const signer = provider.getSigner();
  const factory = new PoolSafe__factory(signer);
  const poolSafe = await factory.deploy(token.address, registryAddress);
  await poolSafe.deployed();

  const { data, error } = await supabase.rpc<number>('create_pool2', {
    chain_id: chainId,
    name: name,
    description: description ?? '',
    token_id: token.id,
    contract_address: poolSafe.address,
  });

  handleSupabaseError(error);

  return data;
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

export const isSignerAnAdmin = async (pool: Pool, provider: Web3Provider) => {
  if (!provider) return false;

  const signer = provider.getSigner();

  const signerAddress = await signer.getAddress();
  const poolContract = await getPoolContract(pool.contract_address, provider);

  return poolContract.isAdmin(signerAddress);
};

export const addAdmin = async (pool: Pool, address: AddressLookup, provider: Web3Provider) => {
  if (!provider) return false;
  const signer = provider.getSigner();

  const poolContract = await getPoolContract(pool.contract_address, signer);
  const tx = await poolContract.addAdmin(address.address);

  return tx;
};

export const removeAdmin = async (pool: Pool, address: AddressLookup, provider: Web3Provider) => {
  if (!provider) return false;
  const signer = provider.getSigner();

  const poolContract = await getPoolContract(pool.contract_address, signer);
  const tx = await poolContract.removeAdmin(address.address);

  return tx;
};

export const getAdminAddresses = async (pool: Pool) => {
  const provider = defaultProvider(pool.chain_id);

  const poolContract = await getPoolContract(pool.contract_address, provider);
  return poolContract.getAdmins();
};
