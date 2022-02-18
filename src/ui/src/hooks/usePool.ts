import React from 'react';
import { PoolContext } from '../contexts/PoolContext';

export function usePool() {
  return React.useContext(PoolContext);
}
