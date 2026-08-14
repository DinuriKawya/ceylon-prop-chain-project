import React, { createContext, useState, useContext, useEffect } from 'react';
import { WalletContext } from './WalletContext';
import { loadApartments, loadUserTokens } from '../services/blockchain/contractService';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { contract, web3, account } = useContext(WalletContext);
  const [apartments, setApartments] = useState([]);
  const [userTokens, setUserTokens] = useState({});
  const [pendingProperties, setPendingProperties] = useState([]);

  const refreshData = async () => {
    if (contract && web3) {
      const apts = await loadApartments(contract, web3);
      setApartments(apts);
      if (account) {
        const tokens = await loadUserTokens(contract, apts, account);
        setUserTokens(tokens);
      }
      setPendingProperties(apts.filter(apt => !apt.isVerified && !apt.isRejected));
    }
  };

  useEffect(() => {
    refreshData();
  }, [contract, web3, account]);

  return (
    <AppContext.Provider value={{ apartments, userTokens, pendingProperties, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};
