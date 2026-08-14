import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useProperties = () => {
  const { apartments, pendingProperties, refreshData } = useContext(AppContext);
  return { apartments, pendingProperties, refreshData };
};
