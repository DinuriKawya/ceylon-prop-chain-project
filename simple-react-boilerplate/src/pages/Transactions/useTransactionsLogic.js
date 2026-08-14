import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useProperties } from '../../hooks/useProperties';
import { getPastTransactions } from '../../services/blockchain/contractService';

const useTransactionsLogic = () => {
  const { contract, web3 } = useWallet();
  const { apartments } = useProperties();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const txns = await getPastTransactions(contract, web3);
      setTransactions(txns);
    } catch (e) {
      console.error('Error loading transactions:', e);
    }
    setLoading(false);
  }, [contract, web3]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = filter === 'ALL' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const getPropertyName = (apartmentId) => {
    if (apartments && apartments[apartmentId]) {
      return apartments[apartmentId].title;
    }
    return `Property #${apartmentId}`;
  };

  const stats = {
    total: transactions.length,
    buys: transactions.filter(tx => tx.type === 'BUY').length,
    sells: transactions.filter(tx => tx.type === 'SELL').length,
    transfers: transactions.filter(tx => tx.type === 'TRANSFER').length,
    totalVolume: transactions
      .filter(tx => tx.totalValue)
      .reduce((sum, tx) => sum + tx.totalValue, 0)
      .toFixed(4)
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${day} ${month} ${year} · ${h}:${minutes} ${ampm}`;
  };

  return {
    transactions: filteredTransactions,
    loading,
    filter,
    setFilter,
    stats,
    getPropertyName,
    formatAddress,
    formatDate,
    refresh: fetchTransactions
  };
};

export default useTransactionsLogic;
