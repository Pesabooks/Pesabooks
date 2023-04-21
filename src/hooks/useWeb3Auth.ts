import React from 'react';
import { Web3AuthContext } from '../contexts/Web3AuthProvider';

export function useWeb3Auth() {
  return React.useContext(Web3AuthContext);
}
