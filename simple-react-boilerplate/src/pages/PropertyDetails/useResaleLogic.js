import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useUser } from '../../hooks/useUser';
import { loadActiveResaleListings, buyResaleListing } from '../../services/blockchain/resaleService';

const useResaleLogic = (apartmentId) => {
  const { contract, web3, account } = useWallet();
  const { isVerified } = useUser();
  const [listings, setListings] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const refresh = useCallback(async () => {
    if (!contract || !web3 || apartmentId === null || apartmentId === undefined) return;
    try {
      const all = await loadActiveResaleListings(contract, web3, apartmentId);
      setListings(all);
    } catch (e) {
      console.error('Failed to load resale listings:', e);
    }
  }, [contract, web3, apartmentId]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleBuy = async (listing) => {
    setBusyId(listing.id);
    try {
      await buyResaleListing(contract, web3, account, listing);
      alert(`Bought ${listing.amount} tokens for ${listing.total} ETH!`);
      await refresh();
    } catch (e) {
      alert(e.message);
    }
    setBusyId(null);
  };

  return { listings, busyId, account, isVerified, handleBuy };
};

export default useResaleLogic;
