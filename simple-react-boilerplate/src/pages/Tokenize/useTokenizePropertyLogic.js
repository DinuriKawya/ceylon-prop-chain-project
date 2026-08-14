import { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { submitPropertyForVerification } from '../../services/propertyService';
import { useProperties } from '../../hooks/useProperties';

const useTokenizePropertyLogic = (onClose) => {
  const { account, contract, web3 } = useWallet();
  const { refreshData } = useProperties();
  const [loading, setLoading] = useState(false);
  const [newApartment, setNewApartment] = useState({
    title: '', location: '', description: '', totalTokens: '', tokenPrice: '', imageFile: null, imagePreview: null, deedFile: null, deedPreview: null
  });

  const handleSubmit = async () => {
    const { title, location, description, totalTokens, tokenPrice, deedFile } = newApartment;
    if (!title || !location || !totalTokens || !tokenPrice || !deedFile) {
      alert('Please fill all fields and upload property deed');
      return;
    }
    setLoading(true);
    try {
      await submitPropertyForVerification(contract, web3, newApartment, account);
      alert('Property submitted for admin verification!');
      setNewApartment({ title: '', location: '', description: '', totalTokens: '', tokenPrice: '', imageFile: null, imagePreview: null, deedFile: null, deedPreview: null });
      refreshData();
      if (onClose) onClose();
    } catch(e) { 
      alert(e.message); 
    }
    setLoading(false);
  };

  return { loading, newApartment, setNewApartment, handleSubmit };
};

export default useTokenizePropertyLogic;
