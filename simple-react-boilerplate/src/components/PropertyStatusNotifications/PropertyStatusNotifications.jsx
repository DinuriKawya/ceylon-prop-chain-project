import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useWallet } from '../../hooks/useWallet';
import { useProperties } from '../../hooks/useProperties';
import './PropertyStatusNotifications.css';

const AUTO_DISMISS_MS = 5 * 60 * 1000;

const seenKeyFor = (account) => `propertyStatusSeen_${account.toLowerCase()}`;

const loadSeen = (account) => {
  try { return JSON.parse(localStorage.getItem(seenKeyFor(account)) || '{}'); } catch (e) { return {}; }
};

const markSeen = (account, apartmentId, statusKey) => {
  const seen = loadSeen(account);
  seen[apartmentId] = statusKey;
  try { localStorage.setItem(seenKeyFor(account), JSON.stringify(seen)); } catch (e) {}
};

const PropertyStatusNotifications = () => {
  const { account } = useWallet();
  const { apartments } = useProperties();
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = (toast) => {
    markSeen(account, toast.id, toast.status);
    if (timersRef.current[toast.id]) {
      clearTimeout(timersRef.current[toast.id]);
      delete timersRef.current[toast.id];
    }
    setToasts(prev => prev.filter(t => t.id !== toast.id));
  };

  useEffect(() => {
    if (!account || !apartments || !apartments.length) return;

    const seen = loadSeen(account);
    const mine = apartments.filter(
      apt => apt.owner && apt.owner.toLowerCase() === account.toLowerCase() && (apt.isVerified || apt.isRejected)
    );

    setToasts(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const fresh = [];
      for (const apt of mine) {
        const statusKey = apt.isRejected ? 'rejected' : 'live';
        if (seen[apt.id] !== statusKey && !existingIds.has(apt.id)) {
          fresh.push({ id: apt.id, title: apt.title, status: statusKey, reason: apt.rejectionReason });
        }
      }
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [apartments, account]);

  useEffect(() => {
    toasts.forEach(t => {
      if (!timersRef.current[t.id]) {
        timersRef.current[t.id] = setTimeout(() => dismiss(t), AUTO_DISMISS_MS);
      }
    });
  }, [toasts]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="property-status-toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`property-status-toast ${t.status === 'rejected' ? 'is-rejected' : 'is-live'}`}>
          <span className="property-status-toast-icon">
            <FontAwesomeIcon icon={t.status === 'rejected' ? faTimesCircle : faCheckCircle} />
          </span>
          <div className="property-status-toast-body">
            <strong>{t.title}</strong>
            <span>
              {t.status === 'rejected'
                ? `Rejected${t.reason ? `: ${t.reason}` : ''}`
                : 'Live in the Marketplace!'}
            </span>
          </div>
          <button className="property-status-toast-close" onClick={() => dismiss(t)} aria-label="Dismiss notification">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PropertyStatusNotifications;
