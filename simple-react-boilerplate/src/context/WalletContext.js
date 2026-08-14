import React, { createContext, useState, useEffect, useRef } from "react";
import { initWeb3AndContract } from "../services/blockchain/web3Service";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const accountRef = useRef("");

  const connectToMetaMask = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const {
          web3: w3,
          contract: c,
          account: acc,
        } = await initWeb3AndContract();
        setWeb3(w3);
        setContract(c);
        setAccount(acc);
        accountRef.current = acc;
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();

    const reloadIfAccountChanged = (nextAccount) => {
      const current = nextAccount || "";
      if (
        accountRef.current &&
        current &&
        current.toLowerCase() !== accountRef.current.toLowerCase()
      ) {
        window.location.reload();
        return;
      }
      accountRef.current = current;
      setAccount(current);
    };

    const handleAccountsChanged = (accounts) => {
      reloadIfAccountChanged(accounts && accounts[0]);
    };

    const pollAccount = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        reloadIfAccountChanged(accounts && accounts[0]);
      } catch (e) {}
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    const pollId = setInterval(pollAccount, 1500);

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      }
      clearInterval(pollId);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{ web3, contract, account, loading, connectToMetaMask }}
    >
      {children}
    </WalletContext.Provider>
  );
};
