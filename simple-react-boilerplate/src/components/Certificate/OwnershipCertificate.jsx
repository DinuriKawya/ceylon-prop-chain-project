import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload, faShieldAlt, faCheckCircle, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { useWallet } from '../../hooks/useWallet';
import './OwnershipCertificate.css';

const shortAddr = (a) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : '');

const OwnershipCertificate = ({ item, account, onClose }) => {
  const { contract } = useWallet();
  const [ownerName, setOwnerName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const info = await contract.methods.getUserInfo(account).call();
        if (active) setOwnerName(info[0] || 'Verified Owner');
      } catch (e) {
        if (active) setOwnerName('Verified Owner');
      }
    })();
    return () => { active = false; };
  }, [contract, account]);

  const verifyUrl = `${window.location.origin}${window.location.pathname}?verify=1&apt=${item.aptId}&addr=${account}`;
  const issued = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = `CPC-${String(item.aptId).padStart(3, '0')}-${account.slice(2, 8).toUpperCase()}`;

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `Certificate-${item.apt.title.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Could not generate the certificate image. You can still screenshot it.');
    }
    setDownloading(false);
  };

  return (
    <div className="cert-overlay" onClick={onClose}>
      <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cert-close" onClick={onClose} aria-label="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="cert-card" ref={certRef}>
          <div className="cert-watermark"><FontAwesomeIcon icon={faShieldAlt} /></div>

          <div className="cert-header">
            <div className="cert-brand">
              <FontAwesomeIcon icon={faShieldAlt} className="cert-brand-icon" />
              <span>CeylonPropChain</span>
            </div>
            <div className="cert-title">Certificate of Ownership</div>
            <div className="cert-sub">Blockchain-Verified Fractional Property Ownership</div>
          </div>

          <div className="cert-body">
            <div className="cert-prop-img" style={{ backgroundImage: `url(${item.apt.imageUrl})` }} />
            <div className="cert-details">
              <div className="cert-line"><span>This certifies that</span><strong>{ownerName || '—'}</strong></div>
              <div className="cert-line"><span>owns a verified share of</span><strong>{item.apt.title}</strong></div>
              <div className="cert-line"><span>Location</span><strong>{item.apt.location}</strong></div>
              <div className="cert-metrics">
                <div className="cert-metric"><div className="cert-metric-val">{item.amount}</div><div className="cert-metric-lbl">Tokens</div></div>
                <div className="cert-metric"><div className="cert-metric-val">{item.pct.toFixed(2)}%</div><div className="cert-metric-lbl">Ownership</div></div>
                <div className="cert-metric"><div className="cert-metric-val">{item.value.toFixed(2)}</div><div className="cert-metric-lbl">Value (ETH)</div></div>
              </div>
            </div>
          </div>

          <div className="cert-footer">
            <div className="cert-meta">
              <div><span>Certificate ID</span><strong>{certId}</strong></div>
              <div><span>Wallet</span><strong>{shortAddr(account)}</strong></div>
              <div><span>Issued</span><strong>{issued}</strong></div>
            </div>
            <div className="cert-qr">
              <QRCodeCanvas value={verifyUrl} size={94} level="M" />
              <small>Scan to verify</small>
            </div>
          </div>
        </div>

        <div className="cert-actions">
          <div className="cert-note">
            <FontAwesomeIcon icon={faCheckCircle} /> Backed by the blockchain — this certificate cannot be forged.
          </div>
          <div className="cert-btn-group">
            <a className="cert-verify-btn" href={verifyUrl} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faQrcode} className="me-2" />Verify
            </a>
            <button className="cert-download-btn" onClick={handleDownload} disabled={downloading}>
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              {downloading ? 'Preparing…' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnershipCertificate;
