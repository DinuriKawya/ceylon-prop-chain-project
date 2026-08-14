import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { verifyOwnership } from '../../services/blockchain/verifyService';
import './VerifyCertificate.css';

const shortAddr = (a) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : '');

const VerifyCertificate = () => {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const apt = params.get('apt');
    const addr = params.get('addr');

    if (apt === null || !addr) {
      setState({ status: 'error', message: 'Invalid verification link.' });
      return;
    }

    (async () => {
      try {
        const res = await verifyOwnership(apt, addr);
        setState({ status: 'done', res });
      } catch (e) {
        setState({ status: 'error', message: e.message || 'Could not reach the blockchain.' });
      }
    })();
  }, []);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-brand"><FontAwesomeIcon icon={faShieldAlt} /> CeylonPropChain</div>
        <h2 className="verify-heading">Ownership Verification</h2>

        {state.status === 'loading' && (
          <div className="verify-loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Checking the blockchain…
          </div>
        )}

        {state.status === 'error' && (
          <div className="verify-result fail">
            <FontAwesomeIcon icon={faTimesCircle} className="verify-icon" />
            <div className="verify-status-text">Could Not Verify</div>
            <p>{state.message}</p>
          </div>
        )}

        {state.status === 'done' && state.res.verified && (
          <div className="verify-result ok">
            <FontAwesomeIcon icon={faCheckCircle} className="verify-icon" />
            <div className="verify-status-text">Ownership Verified</div>
            {state.res.property && (
              <div className="verify-prop">{state.res.property.title} · {state.res.property.location}</div>
            )}
            <div className="verify-grid">
              {state.res.ownerName ? (
                <div><span>Owner</span><strong>{state.res.ownerName}</strong></div>
              ) : null}
              <div><span>Wallet</span><strong>{shortAddr(state.res.address)}</strong></div>
              <div><span>Tokens Owned</span><strong>{state.res.balance}</strong></div>
              <div><span>Ownership</span><strong>{state.res.pct.toFixed(2)}%</strong></div>
            </div>
            <div className="verify-badge"><FontAwesomeIcon icon={faCheckCircle} /> Confirmed on-chain — cannot be forged</div>
          </div>
        )}

        {state.status === 'done' && !state.res.verified && (
          <div className="verify-result fail">
            <FontAwesomeIcon icon={faTimesCircle} className="verify-icon" />
            <div className="verify-status-text">Not Verified</div>
            <p>This wallet does not currently own any tokens in this property.</p>
            <div className="verify-grid">
              <div><span>Wallet</span><strong>{shortAddr(state.res.address)}</strong></div>
              {state.res.property && <div><span>Property</span><strong>{state.res.property.title}</strong></div>}
            </div>
          </div>
        )}

        <a className="verify-home" href={window.location.pathname}>← Back to CeylonPropChain</a>
      </div>
    </div>
  );
};

export default VerifyCertificate;
