import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faMapMarkerAlt, faAlignLeft, faImage, faFileContract, faCloudUploadAlt, faCoins, faTimes
} from '@fortawesome/free-solid-svg-icons';
import useTokenizePropertyLogic from './useTokenizePropertyLogic';
import './TokenizeProperty.css';

const TokenizeProperty = ({ onClose }) => {
  const { loading, newApartment, setNewApartment, handleSubmit } = useTokenizePropertyLogic(onClose);

  const totalValue = newApartment.totalTokens && newApartment.tokenPrice
    ? (parseInt(newApartment.totalTokens) * parseFloat(newApartment.tokenPrice)).toFixed(4)
    : '0';

  return (
    <div className="modal-overlay tokenize-overlay">
      <div className="modal-content tokenize-modal-content tokenize-single-page">
        <button className="tokenize-close" onClick={onClose} aria-label="Close"><FontAwesomeIcon icon={faTimes} /></button>
        <h2><FontAwesomeIcon icon={faBuilding} className="me-2" style={{ color: 'var(--primary)' }} />Tokenize Your Property</h2>

        <div className="scrollable-form">
          <div className="tokenize-section fade-in-item">
            <h3 className="tokenize-section-title"><FontAwesomeIcon icon={faBuilding} className="me-2" />Property Details</h3>
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

          <div className="tokenize-section fade-in-item">
            <h3 className="tokenize-section-title"><FontAwesomeIcon icon={faFileContract} className="me-2" />Documents</h3>
            <div className="form-group">
              <label><FontAwesomeIcon icon={faImage} className="me-2" style={{ color: 'var(--text-muted)' }} />Property Image</label>
              <label className="tokenize-dropzone">
                <FontAwesomeIcon icon={faCloudUploadAlt} style={{ fontSize: '26px', color: 'var(--primary)' }} />
                <span>{newApartment.imageFile ? newApartment.imageFile.name : 'Click to upload a photo'}</span>
                <small>PNG or JPG</small>
                <input type="file" accept="image/*" onChange={e => setNewApartment({ ...newApartment, imageFile: e.target.files[0] })} />
              </label>
            </div>
            <div className="form-group">
              <label><FontAwesomeIcon icon={faFileContract} className="me-2" style={{ color: 'var(--text-muted)' }} />Property Ownership Document (Deed) *</label>
              <label className="tokenize-dropzone">
                <FontAwesomeIcon icon={faCloudUploadAlt} style={{ fontSize: '26px', color: 'var(--primary)' }} />
                <span>{newApartment.deedFile ? newApartment.deedFile.name : 'Click to upload the deed'}</span>
                <small>Image or PDF · Required for admin verification</small>
                <input type="file" accept="image/*,application/pdf" onChange={e => setNewApartment({ ...newApartment, deedFile: e.target.files[0] })} />
              </label>
            </div>
          </div>

          <div className="tokenize-section fade-in-item">
            <h3 className="tokenize-section-title"><FontAwesomeIcon icon={faCoins} className="me-2" />Tokenization Economics</h3>
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
            {newApartment.totalTokens && newApartment.tokenPrice && (
              <div className="tokenization-info">
                <h4><FontAwesomeIcon icon={faCoins} className="me-2" style={{ color: 'var(--primary)' }} />Tokenization Summary</h4>
                <p><span>Total Asset Value</span><strong key={totalValue} className="stat-pop d-inline-block">{totalValue} ETH</strong></p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit for Verification'}</button>
        </div>
      </div>
    </div>
  );
};
export default TokenizeProperty;
