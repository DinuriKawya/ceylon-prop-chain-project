import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkUserStatus } from '../services/blockchain/contractService';
import { WalletContext } from './WalletContext';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { contract, account } = useContext(WalletContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      if (contract && account) {
        const status = await checkUserStatus(contract, account);
        setIsAdmin(status.isAdmin);
        setIsVerified(status.isVerified);
        setIsRegistered(status.isRegistered);
      }
    };
    loadStatus();
  }, [contract, account]);

  return (
    <UserContext.Provider value={{ isAdmin, isVerified, isRegistered }}>
      {children}
    </UserContext.Provider>
  );
};
