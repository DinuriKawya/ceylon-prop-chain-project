import { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { registerUser } from '../../services/userService';
import { loadVerifiedUsersDetailed } from '../../services/blockchain/contractService';

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
      const verifiedUsers = await loadVerifiedUsersDetailed(contract);
      const emailTaken = verifiedUsers.some(
        (u) => u.email && u.email.trim().toLowerCase() === formData.email.trim().toLowerCase()
      );
      if (emailTaken) {
        alert('This email is already registered to a verified account. Please use a different email.');
        setLoading(false);
        return;
      }

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
