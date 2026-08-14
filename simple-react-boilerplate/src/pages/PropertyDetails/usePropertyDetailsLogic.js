import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useProperties } from '../../hooks/useProperties';
import { useUser } from '../../hooks/useUser';
import { buyTokens } from '../../services/tokenService';
import { loadTopHoldersForApartment, getPastTransactions } from '../../services/blockchain/contractService';
import { analyzeLocation, calculateInvestmentScore } from '../../services/mlService';

const usePropertyDetailsLogic = (apartmentId) => {
  const { account, contract, web3 } = useWallet();
  const { apartments, refreshData } = useProperties();
  const { isVerified } = useUser();
  const [buyAmount, setBuyAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [topHolders, setTopHolders] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [investmentScore, setInvestmentScore] = useState(null);
  const [roiYears, setRoiYears] = useState(3);
  const [roiAmount, setRoiAmount] = useState(10);

  const apartment = apartments && apartments[apartmentId] ? apartments[apartmentId] : null;

  const fetchDetails = useCallback(async () => {
    if (!contract || !web3 || !apartment) return;
    try {
      const holders = await loadTopHoldersForApartment(contract, apartmentId);
      setTopHolders(holders);
      
      const allTxns = await getPastTransactions(contract, web3);
      const propertyTxns = allTxns.filter(tx => tx.apartmentId === apartmentId);
      setTransactions(propertyTxns.slice(0, 10));
    } catch (e) {
      console.error('Error fetching property details:', e);
    }
  }, [contract, web3, apartment, apartmentId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // ML investment score
  useEffect(() => {
    if (!apartment) return;
    try {
      const mlResult = analyzeLocation(apartment.location);
      const score = calculateInvestmentScore(mlResult);
      setInvestmentScore(score);
    } catch (e) {
      setInvestmentScore(null);
    }
  }, [apartment]);

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      alert('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      await buyTokens(contract, web3, account, apartmentId, buyAmount, apartment.tokenPrice);
      alert(`Successfully purchased ${buyAmount} tokens!`);
      setBuyAmount('');
      refreshData();
      fetchDetails();
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  const calculateROI = () => {
    if (!apartment || !investmentScore) return [];
    const growthRate = investmentScore.breakdown.growthPotential / 100 * 0.35;
    const investedValue = roiAmount * apartment.tokenPrice;
    const results = [];
    for (let year = 1; year <= roiYears; year++) {
      const projectedValue = investedValue * Math.pow(1 + growthRate, year);
      const profit = projectedValue - investedValue;
      results.push({
        year,
        invested: parseFloat(investedValue.toFixed(4)),
        projected: parseFloat(projectedValue.toFixed(4)),
        profit: parseFloat(profit.toFixed(4)),
        roi: parseFloat(((profit / investedValue) * 100).toFixed(1))
      });
    }
    return results;
  };

  const roiData = calculateROI();

  const soldPercentage = apartment ? ((apartment.tokensSold / apartment.totalTokens) * 100).toFixed(1) : 0;

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return {
    apartment,
    isVerified,
    buyAmount,
    setBuyAmount,
    loading,
    topHolders,
    transactions,
    investmentScore,
    roiYears,
    setRoiYears,
    roiAmount,
    setRoiAmount,
    roiData,
    soldPercentage,
    formatAddress,
    formatDate,
    handleBuy
  };
};

export default usePropertyDetailsLogic;
