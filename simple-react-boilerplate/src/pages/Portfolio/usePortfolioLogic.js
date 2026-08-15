import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useTokens } from '../../hooks/useTokens';
import { useProperties } from '../../hooks/useProperties';
import { transferTokens, sellTokens, withdrawFunds, claimRentalIncome } from '../../services/tokenService';
import { loadOwnerBalances, loadClaimableRentalIncome } from '../../services/blockchain/contractService';
import { loadActiveResaleListings, listForResale, cancelResaleListing, loadMyResaleSales } from '../../services/blockchain/resaleService';

const usePortfolioLogic = () => {
  const { account, contract, web3 } = useWallet();
  const { userTokens, refreshData } = useTokens();
  const { apartments } = useProperties();
  const [transferForms, setTransferForms] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null); 
  const [ownerBalances, setOwnerBalances] = useState({});
  const [claimableRentalIncome, setClaimableRentalIncome] = useState({});
  const [myListings, setMyListings] = useState([]);
  const [saleAlerts, setSaleAlerts] = useState([]);

  const refreshOwnerBalances = useCallback(async () => {
    const balances = await loadOwnerBalances(contract, web3, apartments, account);
    setOwnerBalances(balances);
  }, [contract, web3, apartments, account]);

  const refreshRentalIncome = useCallback(async () => {
    const claimable = await loadClaimableRentalIncome(contract, web3, apartments, account);
    setClaimableRentalIncome(claimable);
  }, [contract, web3, apartments, account]);

  const refreshMyListings = useCallback(async () => {
    if (!contract || !web3 || !account) return;
    try {
      const all = await loadActiveResaleListings(contract, web3, null);
      setMyListings(all.filter(l => l.seller.toLowerCase() === account.toLowerCase()));
    } catch (e) {
      console.error('Failed to load resale listings:', e);
    }
  }, [contract, web3, account]);

  const seenKey = account ? `resaleSeen_${account.toLowerCase()}` : null;

  const refreshSaleAlerts = useCallback(async () => {
    if (!contract || !web3 || !account) return;
    const sales = await loadMyResaleSales(contract, web3, account);
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(`resaleSeen_${account.toLowerCase()}`) || '[]'); } catch (e) {}
    setSaleAlerts(sales.filter(s => !seen.includes(s.key)));
  }, [contract, web3, account]);

  useEffect(() => {
    refreshOwnerBalances();
    refreshRentalIncome();
    refreshMyListings();
    refreshSaleAlerts();
  }, [refreshOwnerBalances, refreshRentalIncome, refreshMyListings, refreshSaleAlerts]);

  const dismissSaleAlerts = () => {
    if (!seenKey) return;
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(seenKey) || '[]'); } catch (e) {}
    localStorage.setItem(seenKey, JSON.stringify([...seen, ...saleAlerts.map(s => s.key)]));
    setSaleAlerts([]);
  };

  const getForm = (aptId) => transferForms[aptId] || { toAddress: '', amount: '', sellAmount: '', resaleAmount: '', resalePrice: '' };

  const updateForm = (aptId, field, value) => {
    setTransferForms(prev => ({
      ...prev,
      [aptId]: { ...getForm(aptId), [field]: value }
    }));
  };

  const handleTransferTokens = async (aptId) => {
    const { toAddress, amount } = getForm(aptId);
    if (!toAddress || !amount) { alert('Fill all fields'); return; }
    setLoading(true);
    setActiveAction({ aptId, type: 'transfer' });
    try {
      await transferTokens(contract, account, aptId, toAddress, parseInt(amount));
      alert(`Transferred ${amount} tokens!`);
      setTransferForms(prev => ({ ...prev, [aptId]: { ...getForm(aptId), toAddress: '', amount: '' } }));
      refreshData();
    } catch(e) { alert(e.message); }
    setLoading(false);
    setActiveAction(null);
  };

  const handleSellTokens = async (apartmentId, ownedAmount) => {
    const { sellAmount } = getForm(apartmentId);
    const amount = sellAmount ? parseInt(sellAmount) : 0;
    if (!amount || amount <= 0) { alert('Enter a valid amount to sell'); return; }
    if (amount > ownedAmount) { alert(`You only own ${ownedAmount} tokens for this property`); return; }
    setLoading(true);
    setActiveAction({ aptId: apartmentId, type: 'sell' });
    try {
      await sellTokens(contract, account, apartmentId, amount);
      alert(`Sold ${amount} tokens!`);
      setTransferForms(prev => ({ ...prev, [apartmentId]: { ...getForm(apartmentId), sellAmount: '' } }));
      refreshData();
    } catch(e) { alert(e.message); }
    setLoading(false);
    setActiveAction(null);
  };

  const handleWithdraw = async (apartmentId, amount) => {
    setLoading(true);
    setActiveAction({ aptId: apartmentId, type: 'withdraw' });
    try {
      await withdrawFunds(contract, web3, account, apartmentId, amount);
      alert(`Withdrew ${amount} ETH!`);
      refreshOwnerBalances();
    } catch(e) { alert(e.message); }
    setLoading(false);
    setActiveAction(null);
  };

  const handleClaimRentalIncome = async (apartmentId) => {
    setLoading(true);
    setActiveAction({ aptId: apartmentId, type: 'claim' });
    try {
      await claimRentalIncome(contract, account, apartmentId);
      alert('Rental income claimed!');
      refreshRentalIncome();
    } catch(e) { alert(e.message); }
    setLoading(false);
    setActiveAction(null);
  };

  const handleListForResale = async (aptId, ownedAmount) => {
    const { resaleAmount, resalePrice } = getForm(aptId);
    const amount = resaleAmount ? parseInt(resaleAmount) : 0;
    if (!amount || amount <= 0) { alert('Enter a valid amount to list'); return; }
    if (amount > ownedAmount) { alert(`You only own ${ownedAmount} tokens for this property`); return; }
    if (!resalePrice || Number(resalePrice) <= 0) { alert('Enter a price per token in ETH'); return; }
    setLoading(true);
    setActiveAction({ aptId, type: 'resale' });
    try {
      await listForResale(contract, web3, account, aptId, amount, resalePrice);
      alert(`Listed ${amount} tokens for resale at ${resalePrice} ETH each!`);
      setTransferForms(prev => ({ ...prev, [aptId]: { ...getForm(aptId), resaleAmount: '', resalePrice: '' } }));
      refreshMyListings();
    } catch (e) { alert(e.message); }
    setLoading(false);
    setActiveAction(null);
  };

  const handleCancelListing = async (listingId) => {
    setLoading(true);
    try {
      await cancelResaleListing(contract, account, listingId);
      alert('Listing cancelled');
      refreshMyListings();
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const chartData = Object.entries(userTokens).map(([aptId, amount]) => {
    const apt = apartments[parseInt(aptId)];
    const value = apt ? (apt.tokenPrice * amount) : 0;
    return {
      name: apt ? apt.title : `Property ${aptId}`,
      value: parseFloat(value.toFixed(4)),
      amount: amount
    };
  }).filter(item => item.value > 0);

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0).toFixed(4);

  const isActionActive = (aptId, type) => activeAction?.aptId === aptId && activeAction?.type === type;

  return {
    userTokens,
    apartments,
    loading,
    isActionActive,
    chartData,
    totalValue,
    getForm,
    updateForm,
    handleTransferTokens,
    handleSellTokens,
    ownerBalances,
    handleWithdraw,
    claimableRentalIncome,
    handleClaimRentalIncome,
    myListings,
    handleListForResale,
    handleCancelListing,
    saleAlerts,
    dismissSaleAlerts
  };
};

export default usePortfolioLogic;
