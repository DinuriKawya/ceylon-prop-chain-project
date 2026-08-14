import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCheckCircle, faArrowRight, faCoins, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import useMarketplaceLogic from './useMarketplaceLogic';
import './Marketplace.css';

const PAGE_SIZE = 4;

const Marketplace = ({ onViewDetails }) => {
  const { apartments } = useMarketplaceLogic();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleApartments = apartments.slice(0, visibleCount);

  return (
    <div className="container" style={{ marginTop: '100px', paddingBottom: '48px' }}>
      <div className="page-header"><h1>Tokenized Properties</h1><p>Browse and invest in Sri Lankan apartments</p></div>
      <div className="apartment-grid">
        {apartments.length === 0 && (
          <div className="no-properties"><p>No verified properties yet. Properties appear here after admin approval.</p></div>
        )}
        {visibleApartments.map((apt) => {
          const soldPct = (apt.tokensSold / apt.totalTokens) * 100;
          return (
            <div
              className="apartment-card"
              key={apt.id}
              onClick={() => onViewDetails && onViewDetails(apt.id)}
              onKeyDown={e => { if (onViewDetails && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onViewDetails(apt.id); } }}
              role={onViewDetails ? 'button' : undefined}
              tabIndex={onViewDetails ? 0 : undefined}
            >
              {apt.imageUrl && (<div className="property-image"><img src={apt.imageUrl} alt={apt.title} /></div>)}
              <div className="badge">{apt.availableTokens > 0 ? `${apt.availableTokens} Tokens Available` : 'Sold Out'}</div>
              <div className="card-content">
                <h3>{apt.title}</h3>
                <p className="location"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />{apt.location}</p>

                <p className="desc desc-clamped">{apt.description}</p>

                <div className="ownership-verified">
                  <FontAwesomeIcon icon={faCheckCircle} className="verified-icon" /> Ownership Verified
                  {apt.deedUrl && (
                    <a href={apt.deedUrl} target="_blank" rel="noopener noreferrer" className="deed-link" onClick={e => e.stopPropagation()}> · View Deed</a>
                  )}
                </div>

                <div className="quick-stats">
                  <div className="quick-stat">
                    <FontAwesomeIcon icon={faCoins} />
                    <div>
                      <strong>{apt.tokenPrice} ETH</strong>
                      <span>per token</span>
                    </div>
                  </div>
                  <div className="quick-stat">
                    <FontAwesomeIcon icon={faLayerGroup} />
                    <div>
                      <strong>{apt.totalTokens.toLocaleString()}</strong>
                      <span>total tokens</span>
                    </div>
                  </div>
                </div>

                <div className="progress-row">
                  <div className="progress"><div style={{ width: `${soldPct}%` }}></div></div>
                  <small>{soldPct.toFixed(0)}% sold</small>
                </div>

                {onViewDetails && (
                  <button className="view-details-btn" onClick={e => { e.stopPropagation(); onViewDetails(apt.id); }}>
                    View Full Details & Invest <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < apartments.length && (
        <div className="load-more-wrap">
          <button className="btn-outline" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
            Load More Properties ({apartments.length - visibleCount} more)
          </button>
        </div>
      )}
    </div>
  );
};
export default Marketplace;
