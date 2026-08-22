import { useState, useEffect } from "react";
import { useWallet } from "../../hooks/useWallet";
import {analyzeLocation,analyzeByPostalCode,analyzeByDistrict,getCityOptions,
  getPostalCodeOptions,getDistrictOptions,} from "../../services/mlService";

const useHomeLogic = () => {
  const { account, connectToMetaMask } = useWallet();

  const [cityOptions] = useState(getCityOptions);
  const [postalOptions] = useState(getPostalCodeOptions);
  const [districtOptions] = useState(getDistrictOptions);

  const [mlCity, setMlCityRaw] = useState("");
  const [mlPostalCode, setMlPostalCodeRaw] = useState("");
  const [mlDistrict, setMlDistrictRaw] = useState("");
  const [mlResult, setMlResult] = useState(null);

  const setMlCity = (value) => {
    setMlCityRaw(value);
    if (value) {
      setMlPostalCodeRaw("");
      setMlDistrictRaw("");
    }
  };

  const setMlPostalCode = (value) => {
    setMlPostalCodeRaw(value);
    if (value) {
      setMlCityRaw("");
      setMlDistrictRaw("");
    }
  };

  const setMlDistrict = (value) => {
    setMlDistrictRaw(value);
    if (value) {
      setMlCityRaw("");
      setMlPostalCodeRaw("");
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleAnalyzeLocation = () => {
    try {
      let result;
      if (mlCity) {
        result = analyzeLocation(mlCity);
      } else if (mlPostalCode) {
        result = analyzeByPostalCode(mlPostalCode);
      } else if (mlDistrict) {
        result = analyzeByDistrict(mlDistrict);
      } else {
        throw new Error("Pick a city, postal code, or district first.");
      }
      setMlResult(result);
    } catch (e) {
      alert(e.message);
    }
  };

  return {
    account,
    connectToMetaMask,
    cityOptions,
    postalOptions,
    districtOptions,
    mlCity,
    setMlCity,
    mlPostalCode,
    setMlPostalCode,
    mlDistrict,
    setMlDistrict,
    mlResult,
    handleAnalyzeLocation,
  };
};

export default useHomeLogic;
