import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faMapMarkerAlt, faAlignLeft, faImage, faFileContract, faCloudUploadAlt, faCoins, faCheck, faArrowRight, faArrowLeft, faTimes
} from '@fortawesome/free-solid-svg-icons';
import useTokenizePropertyLogic from './useTokenizePropertyLogic';
import './TokenizeProperty.css';

const STEPS = [
  { key: 1, label: 'Property Details', icon: faBuilding },
  { key: 2, label: 'Documents', icon: faFileContract },
  { key: 3, label: 'Tokenization', icon: faCoins }
];

const TokenizeProperty = ({ onClose }) => {
  const { loading, newApartment, setNewApartment, handleSubmit } = useTokenizePropertyLogic(onClose);
  const [step, setStep] = useState(1);

  const step1Valid = newApartment.title && newApartment.location && newApartment.description;
  const step2Valid = newApartment.deedFile;
  const canGoNext = step === 1 ? step1Valid : step === 2 ? step2Valid : true;

  const goNext = () => canGoNext && setStep(s => Math.min(s + 1, 3));
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  const totalValue = newApartment.totalTokens && newApartment.tokenPrice
    ? (parseInt(newApartment.totalTokens) * parseFloat(newApartment.tokenPrice)).toFixed(4)
    : '0';

  return (
    <div className="modal-overlay tokenize-overlay">
      <div className="modal-content tokenize-modal-content">
        <button className="tokenize-close" onClick={onClose} aria-label="Close"><FontAwesomeIcon icon={faTimes} /></button>
        <h2><FontAwesomeIcon icon={faBuilding} className="me-2" style={{ color: 'var(--primary)' }} />Tokenize Your Property</h2>

        <div className="tokenize-stepper">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.key}>
              <div className={`tokenize-step ${step === s.key ? 'active' : ''} ${step > s.key ? 'done' : ''}`}>
                <div className="tokenize-step-circle">
                  {step > s.key ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={s.icon} />}
                </div>
                <span className="tokenize-step-label">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className={`tokenize-step-line ${step > s.key ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="scrollable-form">
          {step === 1 && (
            <div key="step1" className="fade-in-item">
              <div className="form-group">
                <label><FontAwesomeIcon icon={faBuilding} className="me-2" style={{ color: 'var(--text-muted)' }} />Property Title *</label>
                <input type="text" className="form-control" placeholder="e.g., Luxury Ocean View Apartment" value={newApartment.title} onChange={e => setNewApartment({ ...newApartment, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" style={{ color: 'var(--text-muted)' }} />Location *</label>
                <input type="text" className="form-control" placeholder="e.g., Colombo 03" value={newApartment.location} onChange={e => setNewApartment({ ...newApartment, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faAlignLeft} className="me-2" style={{ color: 'var(--text-muted)' }} />Description *</label>
                <textarea className="form-control" placeholder="Describe your property..." value={newApartment.description} onChange={e => setNewApartment({ ...newApartment, description: e.target.value })} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div key="step2" className="fade-in-item">
              <div className="form-group">
                <label><FontAwesomeIcon icon={faImage} className="me-2" style={{ color: 'var(--text-muted)' }} />Property Image</label>
                <label className="tokenize-dropzone">
                  <FontAwesomeIcon icon={faCloudUploadAlt} style={{ fontSize: '26px', color: 'var(--primary)' }} />
                  <span>{newApartment.imageFile ? newApartment.imageFile.name : 'Click to upload a photo'}</span>
                  <small>PNG or JPG</small>
                  <input type="file" accept="image/*" onChange={e => { const file = e.target.files[0]; setNewApartment({ ...newApartment, imageFile: file, imagePreview: URL.createObjectURL(file) }); }} />
                </label>
                {newApartment.imagePreview && <img src={newApartment.imagePreview} alt="Property Preview" className="property-preview" />}
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faFileContract} className="me-2" style={{ color: 'var(--text-muted)' }} />Property Ownership Document (Deed) *</label>
                <label className="tokenize-dropzone">
                  <FontAwesomeIcon icon={faCloudUploadAlt} style={{ fontSize: '26px', color: 'var(--primary)' }} />
                  <span>{newApartment.deedFile ? newApartment.deedFile.name : 'Click to upload the deed'}</span>
                  <small>Image or PDF · Required for admin verification</small>
                  <input type="file" accept="image/*,application/pdf" onChange={e => { const file = e.target.files[0]; setNewApartment({ ...newApartment, deedFile: file, deedPreview: URL.createObjectURL(file) }); }} />
                </label>
                {newApartment.deedPreview && (
                  <div className="deed-preview-container"><FontAwesomeIcon icon={faCheck} className="me-2" style={{ color: 'var(--accent)' }} />Document uploaded (Admin will review)</div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div key="step3" className="fade-in-item">
              <div className="form-row">
                <div className="form-group">
                  <label><FontAwesomeIcon icon={faCoins} className="me-2" style={{ color: 'var(--text-muted)' }} />Total Tokens *</label>
                  <input type="number" className="form-control" placeholder="e.g., 10000" value={newApartment.totalTokens} onChange={e => setNewApartment({ ...newApartment, totalTokens: e.target.value })} />
                  <small>Total number of tokens to create</small>
                </div>
                <div className="form-group">
                  <label><FontAwesomeIcon icon={faCoins} className="me-2" style={{ color: 'var(--text-muted)' }} />Token Price (ETH) *</label>
                  <input type="number" className="form-control" step="0.001" placeholder="e.g., 0.01" value={newApartment.tokenPrice} onChange={e => setNewApartment({ ...newApartment, tokenPrice: e.target.value })} />
                  <small>Price per token</small>
                </div>
              </div>
              <div className="tokenization-info">
                <h4><FontAwesomeIcon icon={faCoins} className="me-2" style={{ color: 'var(--primary)' }} />Tokenization Summary</h4>
                <p><span>Total Value</span><strong key={totalValue} className="stat-pop d-inline-block">{totalValue} ETH</strong></p>
                <p><span>Minimum Investment</span><strong>{newApartment.tokenPrice || '0'} ETH per token</strong></p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {step === 1 ? (
            <button className="btn-outline" onClick={onClose}>Cancel</button>
          ) : (
            <button className="btn-outline" onClick={goBack}><FontAwesomeIcon icon={faArrowLeft} className="me-2" />Back</button>
          )}
          {step < 3 ? (
            <button className="btn-primary" onClick={goNext} disabled={!canGoNext}>Next<FontAwesomeIcon icon={faArrowRight} className="ms-2" /></button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit for Verification'}</button>
          )}
        </div>
      </div>
    </div>
  );
};
export default TokenizeProperty;
