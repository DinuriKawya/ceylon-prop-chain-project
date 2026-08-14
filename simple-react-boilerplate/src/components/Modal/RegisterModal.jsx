import React from 'react';
import useRegisterModalLogic from './useRegisterModalLogic';
import './RegisterModal.css';

const RegisterModal = ({ onClose }) => {
  const { loading, formData, setFormData, handleSubmit } = useRegisterModalLogic(onClose);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Complete Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Government ID Photo</label>
            <input type="file" className="form-control" accept="image/*" onChange={e => setFormData({...formData, idPhoto: e.target.files[0]})} required />
          </div>
          <div className="form-group">
            <label>Clear Selfie</label>
            <input type="file" className="form-control" accept="image/*" onChange={e => setFormData({...formData, selfie: e.target.files[0]})} required />
          </div>
          
          <div className="modal-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Submitting...' : 'Register'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RegisterModal;
