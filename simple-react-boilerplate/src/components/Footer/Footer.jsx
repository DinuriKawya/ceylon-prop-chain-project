import React from 'react';
import useFooterLogic from './useFooterLogic';
import './Footer.css';

const Footer = ({ setActiveTab }) => {
  const { handleTabChange, handleScrollToSection } = useFooterLogic(setActiveTab);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/lion.png" alt="Ceylon PropChain Logo" className="brand-logo" />
            <h3>CeylonPropChain</h3>
            <p>Blockchain-Based Sri Lankan Apartment Tokenization Platform</p>
          </div>
          <div className="footer-links">
            <h4>Products</h4>
            <a href="#" onClick={(e) => handleTabChange(e, 'browse')}>Tokenization Protocol</a>
            <a href="#" onClick={(e) => handleTabChange(e, 'browse')}>Investment Platform</a>
            <a href="#" onClick={(e) => handleScrollToSection(e, 'ml-section')}>ML Analysis</a>
            <a href="#" onClick={(e) => handleScrollToSection(e, 'ai-section')}>AI Assistant</a>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <a href="#" onClick={(e) => handleScrollToSection(e, 'about')}>About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">Whitepaper</a>
            <a href="#" onClick={(e) => handleTabChange(e, 'support')}>FAQ</a>
            <a href="#" onClick={(e) => handleTabChange(e, 'support')}>Support</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © 2026 CeylonPropChain. All rights reserved. |
            Redefining Sri Lankan real estate through blockchain innovation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
