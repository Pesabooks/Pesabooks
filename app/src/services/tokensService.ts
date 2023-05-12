import { Token } from '@pesabooks/types';
import { allowedTokens } from '../data/allowedTokens';

export const getAllTokens = (): Token[] => {
  return Object.values(allowedTokens).flat();
};

export const getTokenByAddress = (address: string): Token => {
  const tokens = getAllTokens();
  const token = tokens.find((t) => t.address === address);

  if (!token) throw new Error('Cannot find token');
  return token;
};
