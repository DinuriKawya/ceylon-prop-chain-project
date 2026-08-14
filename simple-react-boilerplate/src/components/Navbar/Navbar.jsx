import React from 'react';
import { scrollToSection } from '../../utils/helpers';
import RegisterModal from '../Modal/RegisterModal';
import TokenizeProperty from '../../pages/Tokenize/TokenizeProperty';
import useNavbarLogic from './useNavbarLogic';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
  const {
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
  } = useNavbarLogic();

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => setActiveTab('home')}>
             <img src="/lion.png"alt="Ceylon PropChain Logo" className="brand-logo"/>
            <span className="brand-name">CeylonPropChain</span>
          </div>
          <div className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about', setActiveTab); }}>About</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('browse'); }}>Properties</a>
            {isAdmin && <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('transactions'); }}>History</a>}
            {isVerified && <a href="#" onClick={(e) => { e.preventDefault(); setShowTokenizeForm(true); }}>Tokenize</a>}
            {isVerified && <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('portfolio'); }}>Portfolio</a>}
            {isAdmin && <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('admin'); }}>Admin {pendingCount + pendingProperties.length > 0 && <span className="nav-badge">{pendingCount + pendingProperties.length}</span>}</a>}
          </div>
          <div className="nav-user">
            {account ? (
              <>
                <span className="address">{account.slice(0,6)}...{account.slice(-4)}</span>
                <span className={`status ${isVerified ? 'verified' : isRegistered ? 'pending' : 'unregistered'}`}>
                  {isVerified ? '✓ Verified' : isAdmin ? '👑 Admin' : isRegistered ? 'Pending' : 'Unregistered'}
                </span>
                {!isVerified && !isAdmin && (
                  <button className="register-btn" onClick={() => setShowRegisterForm(true)}>Register</button>
                )}
              </>
            ) : (
              <button className="connect-btn" onClick={connectToMetaMask}>Connect Wallet</button>
            )}
          </div>
        </div>
      </nav>
      {showRegisterForm && <RegisterModal onClose={() => setShowRegisterForm(false)} />}
      {showTokenizeForm && <TokenizeProperty onClose={() => setShowTokenizeForm(false)} />}
    </>
  );
};

export default Navbar;
