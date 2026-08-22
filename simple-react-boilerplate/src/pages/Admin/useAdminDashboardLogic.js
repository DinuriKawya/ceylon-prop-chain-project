import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useUser } from '../../hooks/useUser';
import { useProperties } from '../../hooks/useProperties';
import { loadPendingUsers, loadVerifiedUsersDetailed } from '../../services/blockchain/contractService';
import { approveUser, rejectUser } from '../../services/userService';
import { approveProperty, rejectProperty, distributeRentalIncome } from '../../services/propertyService';
import { getPastTransactions } from '../../services/blockchain/contractService';
import { analyzeLocation } from '../../services/mlService';

const useAdminDashboardLogic = () => {
  const { account, contract, web3 } = useWallet();
  const { isAdmin } = useUser();
  const { pendingProperties, refreshData, apartments } = useProperties();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedRegisteredUser, setExpandedRegisteredUser] = useState(null);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rentalAmounts, setRentalAmounts] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [rejectingPropertyId, setRejectingPropertyId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!contract || !account || !isAdmin) {
        setPendingUsers([]);
        setRegisteredUsers([]);
        setTransactions([]);
        return;
      }
      try {
        const users = await loadPendingUsers(contract, account);
        setPendingUsers(users);
        const verified = await loadVerifiedUsersDetailed(contract);
        setRegisteredUsers(verified);
        if (web3) {
          const txns = await getPastTransactions(contract, web3);
          setTransactions(txns);
        }
      } catch (e) {
        console.error('Failed to load admin dashboard data:', e);
        setPendingUsers([]);
        setRegisteredUsers([]);
        setTransactions([]);
      }
    };
    fetchUsers();
  }, [contract, account, web3, isAdmin]);

  const handleRefreshUsers = async () => {
    if (!isAdmin) return;
    try {
      const users = await loadPendingUsers(contract, account);
      setPendingUsers(users);
      const verified = await loadVerifiedUsersDetailed(contract);
      setRegisteredUsers(verified);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleApproveUser = async (userAddress) => {
    setLoading(true);
    try {
      await approveUser(contract, account, userAddress);
      alert('User approved successfully!');
      const users = await loadPendingUsers(contract, account);
      setPendingUsers(users);
      const verified = await loadVerifiedUsersDetailed(contract);
      setRegisteredUsers(verified);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const handleRejectUser = async (userAddress) => {
    setLoading(true);
    try {
      await rejectUser(contract, account, userAddress);
      alert('User rejected');
      const users = await loadPendingUsers(contract, account);
      setPendingUsers(users);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const handleApproveProperty = async (propertyId) => {
    setLoading(true);
    try {
      await approveProperty(contract, account, propertyId);
      alert('Property approved and listed on Marketplace!');
      refreshData();
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const updateRejectionReason = (propertyId, value) => {
    setRejectionReasons(prev => ({ ...prev, [propertyId]: value }));
  };

  const handleRejectProperty = async (propertyId) => {
    const reason = (rejectionReasons[propertyId] || '').trim();
    if (!reason) { alert('Reason for rejecting this property.'); return; }
    setLoading(true);
    try {
      await rejectProperty(contract, account, propertyId, reason);
      alert('Property rejected.');
      setRejectionReasons(prev => ({ ...prev, [propertyId]: '' }));
      setRejectingPropertyId(null);
      refreshData();
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const handleDistributeRentalIncome = async (apartmentId) => {
    const amount = rentalAmounts[apartmentId];
    if (!amount || parseFloat(amount) <= 0) { alert('Enter a valid ETH amount to distribute'); return; }
    setLoading(true);
    try {
      await distributeRentalIncome(contract, web3, account, apartmentId, amount);
      alert(`Distributed ${amount} ETH in rental income to token holders!`);
      setRentalAmounts(prev => ({ ...prev, [apartmentId]: '' }));
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const verifiedApartments = apartments.filter(a => a.isVerified && !a.isRejected && a.tokensSold > 0);

  const updateRentalAmount = (apartmentId, value) => {
    setRentalAmounts(prev => ({ ...prev, [apartmentId]: value }));
  };

  // Analytics data
  const totalProperties = apartments.length;
  const verifiedProperties = apartments.filter(a => a.isVerified && !a.isRejected).length;
  const totalTokensSold = apartments.reduce((sum, a) => sum + (a.tokensSold || 0), 0);
  const totalValueLocked = apartments.reduce((sum, a) => sum + (a.tokensSold || 0) * (a.tokenPrice || 0), 0).toFixed(4);

  // Cluster distribution on pie chart
  const clusterData = (() => {
    const clusters = { 'Expensive & Stable': 0, 'Fast Growing': 0, 'Budget & Rising': 0, 'Unknown': 0 };
    for (const apt of apartments) {
      try {
        const ml = analyzeLocation(apt.location);
        clusters[ml.cluster] = (clusters[ml.cluster] || 0) + 1;
      } catch {
        clusters['Unknown'] += 1;
      }
    }
    return Object.entries(clusters)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  })();

  // Transaction volume by type
  const txnTypeData = [
    { name: 'Purchases', value: transactions.filter(t => t.type === 'BUY').length },
    { name: 'Sales', value: transactions.filter(t => t.type === 'SELL').length },
    { name: 'Transfers', value: transactions.filter(t => t.type === 'TRANSFER').length }
  ].filter(d => d.value > 0);

  return {
    totalProperties,
    verifiedProperties,
    totalTokensSold,
    totalValueLocked,
    clusterData,
    txnTypeData,
    apartments,
    verifiedApartments,
    rentalAmounts,
    updateRentalAmount,
    rejectionReasons,
    updateRejectionReason,
    rejectingPropertyId,
    setRejectingPropertyId,
    transactions,
    pendingProperties,
    pendingUsers,
    registeredUsers,
    expandedUser,
    setExpandedUser,
    expandedRegisteredUser,
    setExpandedRegisteredUser,
    expandedProperty,
    setExpandedProperty,
    loading,
    refreshData,
    handleRefreshUsers,
    handleApproveUser,
    handleRejectUser,
    handleDistributeRentalIncome,
    handleApproveProperty,
    handleRejectProperty
  };
};

export default useAdminDashboardLogic;
