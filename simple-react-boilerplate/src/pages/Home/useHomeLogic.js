import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { analyzeLocation } from '../../services/mlService';

const useHomeLogic = () => {
  const { account, connectToMetaMask } = useWallet();
  const [mlLocation, setMlLocation] = useState('');
  const [mlPostalCode, setMlPostalCode] = useState('');
  const [mlResult, setMlResult] = useState(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const handleAnalyzeLocation = () => {
    try {
      const result = analyzeLocation(mlLocation, mlPostalCode);
      setMlResult(result);
    } catch (e) {
      alert(e.message);
    }
  };

  return {
    account,
    connectToMetaMask,
    mlLocation,
    setMlLocation,
    mlPostalCode,
    setMlPostalCode,
    mlResult,
    handleAnalyzeLocation
  };
};

export default useHomeLogic;
