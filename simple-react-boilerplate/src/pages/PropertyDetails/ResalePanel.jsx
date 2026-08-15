import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faCoins, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import useResaleLogic from './useResaleLogic';
import './ResalePanel.css';

const shortAddr = (a) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : '');

const ResalePanel = ({ apartmentId }) => {
  const { listings, busyId, account, isVerified, handleBuy } = useResaleLogic(apartmentId);

  return (
    <div className="details-section fade-in-item">
      <h2 className="pd-section-title"><FontAwesomeIcon icon={faStore} className="me-2" />Resale Listings</h2>
      <p className="resale-intro">Tokens being resold by current owners at their own price. You buy directly from the seller — no admin involved.</p>

      {listings.length === 0 ? (
        <p className="text-muted-note">No resale listings for this property yet. Owners can list their tokens from the Portfolio page.</p>
      ) : (
        <div className="resale-list">
          {listings.map(l => {
            const mine = account && l.seller.toLowerCase() === account.toLowerCase();
            const busy = busyId === l.id;
            return (
              <div key={l.id} className="resale-row">
                <div className="resale-info">
                  <div className="resale-amount"><FontAwesomeIcon icon={faCoins} className="me-2" />{l.amount} tokens</div>
                  <div className="resale-seller"><FontAwesomeIcon icon={faUser} className="me-1" />{shortAddr(l.seller)}{mine ? ' (you)' : ''}</div>
                </div>
                <div className="resale-price">
                  <div className="resale-per">{l.pricePerToken} ETH <span>/ token</span></div>
                  <div className="resale-total">{l.total} ETH total</div>
                </div>
                <button
                  className="resale-buy-btn"
                  disabled={busy || mine || !isVerified}
                  onClick={() => handleBuy(l)}
                  title={!isVerified ? 'You must be KYC verified to buy' : (mine ? 'This is your own listing' : '')}
                >
                  {busy ? <><FontAwesomeIcon icon={faSpinner} spin className="me-1" />Buying…</> : (mine ? 'Your listing' : 'Buy')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResalePanel;
