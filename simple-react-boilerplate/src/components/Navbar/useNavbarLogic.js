import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useUser } from '../../hooks/useUser';
import { useProperties } from '../../hooks/useProperties';
import { loadPendingCount } from '../../services/blockchain/contractService';

const useNavbarLogic = () => {
  const { account, contract, connectToMetaMask } = useWallet();
  const { isVerified, isAdmin, isRegistered } = useUser();
  const { pendingProperties } = useProperties();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showTokenizeForm, setShowTokenizeForm] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (contract && isAdmin) {
        const count = await loadPendingCount(contract);
        setPendingCount(count);
      } else {
        setPendingCount(0);
      }
    };
    fetchPendingCount();
  }, [contract, isAdmin, account]);

  return {
    account,
    connectToMetaMask,
    isVerified,
    isAdmin,
    isRegistered,
    pendingProperties,
    showRegisterForm,
    setShowRegisterForm,
    showTokenizeForm,
    setShowTokenizeForm,
    pendingCount
  };
};

export default useNavbarLogic;
