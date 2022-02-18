import { handleSupabaseError, tokensTable } from '../supabase';
import { Token } from '../types';

export const getAllTokens = async (): Promise<Token[]> => {
  const { data, error } = await tokensTable().select().eq('active', true);

  handleSupabaseError(error);

  return data ?? [];
};

export const getTokenById = async (id: number): Promise<Token> => {
  const tokens = await getAllTokens();
  const token = tokens.find((t) => t.id === id);

  if (!token) throw new Error('Cannot find token');
  return token;
};
