import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useProperties } from '../../hooks/useProperties';
import { useUser } from '../../hooks/useUser';
import { buyTokens } from '../../services/tokenService';
import { loadTopHoldersForApartment } from '../../services/blockchain/contractService';

const useMarketplaceLogic = () => {
  const { account, contract, web3 } = useWallet();
  const { apartments: allApartments, refreshData } = useProperties();
  const { isVerified } = useUser();
  const [buyForm, setBuyForm] = useState({ apartmentId: null, amount: '' });
  const [loading, setLoading] = useState(false);
  const [topHolders, setTopHolders] = useState({});

  const apartments = allApartments.filter(apt => apt.isVerified && !apt.isRejected);


  const fetchTopHolders = async () => {
    if (!contract || apartments.length === 0) return;
    const holders = {};
    for (const apt of apartments) {
      try {
        const result = await loadTopHoldersForApartment(contract, apt.id);
        if (result) holders[apt.id] = result;
      } catch (e) {
      }
    }
    setTopHolders(holders);
  };

  useEffect(() => {
    fetchTopHolders();
  }, [contract, apartments.length]);

  const handleBuyTokens = async (apt) => {
    if (!buyForm.amount || parseFloat(buyForm.amount) <= 0) {
      alert('Enter valid amount');
      return;
    }
    setLoading(true);
    try {
      await buyTokens(contract, web3, account, apt.id, buyForm.amount, apt.tokenPrice);
      alert(`Bought ${buyForm.amount} tokens!`);
      setBuyForm({ apartmentId: null, amount: '' });
      refreshData();
      await fetchTopHolders(); 
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  return {
    apartments,
    isVerified,
    buyForm,
    setBuyForm,
    loading,
    topHolders,
    handleBuyTokens
  };
};

export default useMarketplaceLogic;
