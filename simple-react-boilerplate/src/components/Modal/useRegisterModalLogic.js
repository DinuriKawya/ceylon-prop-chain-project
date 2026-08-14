import { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { registerUser } from '../../services/userService';

const useRegisterModalLogic = (onClose) => {
  const { account, contract } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', idPhoto: null, selfie: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.idPhoto || !formData.selfie) {
      alert('Please fill all fields and upload both photos');
      return;
    }
    setLoading(true);
    try {
      await registerUser(contract, account, formData.name, formData.email, formData.idPhoto, formData.selfie);
      alert('Registration request sent! Waiting for admin approval');
      onClose();
    } catch(err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return { loading, formData, setFormData, handleSubmit };
};

export default useRegisterModalLogic;
