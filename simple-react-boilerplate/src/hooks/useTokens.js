import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useTokens = () => {
  const { userTokens, refreshData } = useContext(AppContext);
  return { userTokens, refreshData };
};
