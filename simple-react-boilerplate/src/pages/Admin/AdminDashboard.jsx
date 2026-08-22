import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie, faUserClock, faUsers, faCoins, faBuilding, faCheckCircle, faChevronDown, faCheck, faTimes, faExternalLinkAlt,
  faArrowUp, faArrowDown, faExchangeAlt, faHistory, faEnvelope, faWallet, faCrown, faClock, faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import useAdminDashboardLogic from './useAdminDashboardLogic';
import './AdminDashboard.css';

const CLUSTER_COLORS = ['#ff7a59', '#f2a65a', '#2dd4bf', '#5b6b9e'];
const TXN_COLORS = ['#2dd4bf', '#e0524f', '#5b6b9e'];

const ACTIVITY_META = {
  BUY: { icon: faArrowUp, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)', verb: 'bought' },
  SELL: { icon: faArrowDown, color: '#e0524f', bg: 'rgba(224, 82, 79, 0.12)', verb: 'sold' },
  TRANSFER: { icon: faExchangeAlt, color: '#5b6b9e', bg: 'rgba(91, 107, 158, 0.12)', verb: 'transferred' }
};

const AVATAR_COLORS = ['#16213e', '#5b6b9e', '#ff7a59', '#0d9488', '#7c8bc4', '#e0524f'];

const avatarColor = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
};

const formatAddr = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

const formatWhen = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${day} ${months[date.getMonth()]} · ${h}:${minutes} ${ampm}`;
};

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: faChartPie },
  { key: 'pending-users', label: 'Pending Users', icon: faUserClock },
  { key: 'registered-users', label: 'Registered Users', icon: faUsers },
  { key: 'rental-income', label: 'Rental Income', icon: faCoins },
  { key: 'pending-properties', label: 'Property Approvals', icon: faBuilding }
];

const CountBadge = ({ count }) =>
  count > 0 ? (
    <span
      key={count}
      className="stat-pop rounded-pill d-inline-flex align-items-center justify-content-center"
      style={{ minWidth: 22, height: 22, fontSize: '12px', padding: '0 6px', background: 'var(--primary)', color: '#fff', fontWeight: 700 }}
    >
      {count}
    </span>
  ) : null;

const Chevron = ({ open }) => (
  <FontAwesomeIcon
    icon={faChevronDown}
    className="expand-icon"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
  />
);

const StatusPill = ({ tone, icon, label }) => {
  const TONES = {
    verified: { bg: 'rgba(45, 212, 191, 0.15)', color: '#0d9488' },
    owner: { bg: 'rgba(255, 122, 89, 0.15)', color: '#ff7a59' },
    pending: { bg: 'rgba(242, 166, 90, 0.18)', color: '#c17a1f' }
  };
  const t = TONES[tone];
  return (
    <span
      className="rounded-pill d-inline-flex align-items-center gap-1 flex-shrink-0"
      style={{ background: t.bg, color: t.color, fontSize: '11px', fontWeight: 700, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: '10px' }} />
      {label}
    </span>
  );
};

const UserListItem = ({ user, isExpanded, onToggle, statusPill, actions }) => (
  <div className="user-card">
    <div className="user-header" onClick={onToggle}>
      <div className="user-avatar" style={{ background: avatarColor(user.name || user.address) }}>{initials(user.name)}</div>
      <div className="user-info">
        <span className="user-name">{user.name}</span>
        <span className="user-email"><FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '11px', marginRight: '6px', opacity: 0.7 }} />{user.email}</span>
      </div>
      {statusPill}
      <Chevron open={isExpanded} />
    </div>
    {isExpanded && (
      <div className="user-details-expanded">
        <p><FontAwesomeIcon icon={faWallet} style={{ marginRight: '8px', color: 'var(--text-muted)' }} /><strong>Wallet:</strong> <code>{user.address}</code></p>
        {(user.idPhoto || user.selfie) && (
          <div className="photos">
            {user.idPhoto && <div><strong>ID Photo</strong><img src={user.idPhoto} alt="ID" onError={e => e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found'} /></div>}
            {user.selfie && <div><strong>Selfie</strong><img src={user.selfie} alt="Selfie" onError={e => e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found'} /></div>}
          </div>
        )}
        {actions}
      </div>
    )}
  </div>
);

const PropertyListItem = ({ prop, isExpanded, onToggle, actions }) => (
  <div className="property-card">
    <div className="property-header" onClick={onToggle}>
      <div className="user-avatar" style={{ background: avatarColor(prop.title || String(prop.id)) }}>
        <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '14px' }} />
      </div>
      <div className="user-info">
        <span className="property-title">{prop.title}</span>
        <span className="property-location"><FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: '11px', marginRight: '6px', opacity: 0.7 }} />{prop.location}</span>
      </div>
      <StatusPill tone="pending" icon={faClock} label="Pending" />
      <Chevron open={isExpanded} />
    </div>
    {isExpanded && (
      <div className="property-details-expanded">
        <p><strong>Owner:</strong> <code>{prop.owner}</code></p>
        <p><strong>Description:</strong> {prop.description}</p>
        <p><strong>Total Tokens:</strong> {prop.totalTokens}</p>
        <p><strong>Token Price:</strong> {prop.tokenPrice} ETH</p>
        <p><strong>Total Value:</strong> {(prop.totalTokens * prop.tokenPrice).toFixed(4)} ETH</p>
        {prop.imageUrl && (
          <div className="property-image-admin">
            <strong>Property Image:</strong>
            <img src={prop.imageUrl} alt="Property" />
          </div>
        )}
        {prop.deedUrl && (
          <div className="property-deed-admin">
            <strong>Ownership Deed:</strong>{' '}
            <a href={prop.deedUrl} target="_blank" rel="noopener noreferrer">
              View Full Document <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '11px' }} />
            </a>
            <iframe src={prop.deedUrl} title="Deed" />
          </div>
        )}
        {actions}
      </div>
    )}
  </div>
);

const AdminDashboard = ({ setActiveTab }) => {
  const {
    totalProperties,
    verifiedProperties,
    totalValueLocked,
    clusterData,
    txnTypeData,
    apartments,
    transactions,
    verifiedApartments,
    rentalAmounts,
    updateRentalAmount,
    rejectionReasons,
    updateRejectionReason,
    rejectingPropertyId,
    setRejectingPropertyId,
    pendingProperties,
    pendingUsers,
    registeredUsers,
    expandedUser,
    setExpandedUser,
    expandedRegisteredUser,
    setExpandedRegisteredUser,
    expandedProperty,
    setExpandedProperty,
    loading,
    refreshData,
    handleRefreshUsers,
    handleApproveUser,
    handleRejectUser,
    handleApproveProperty,
    handleRejectProperty,
    handleDistributeRentalIncome
  } = useAdminDashboardLogic();

  const [activeSection, setActiveSection] = useState('overview');

  const badgeFor = (key) => {
    if (key === 'pending-users') return pendingUsers.length;
    if (key === 'pending-properties') return pendingProperties.length;
    return 0;
  };

  const overviewStats = [
    { key: 'verified', value: registeredUsers.length, label: 'Verified Users', icon: faUsers, color: '#16213e', colorSoft: '#2a3c66', tint: 'rgba(22, 33, 62, 0.16)', tintLight: 'rgba(22, 33, 62, 0.05)', shadow: 'rgba(22, 33, 62, 0.35)' },
    { key: 'properties', value: totalProperties, label: 'Total Properties', icon: faBuilding, color: '#5b6b9e', colorSoft: '#7c8bc4', tint: 'rgba(91, 107, 158, 0.2)', tintLight: 'rgba(91, 107, 158, 0.06)', shadow: 'rgba(91, 107, 158, 0.35)' },
    { key: 'listed', value: verifiedProperties, label: 'Listed Properties', icon: faCheckCircle, color: '#16a34a', colorSoft: '#34d17e', tint: 'rgba(22, 163, 74, 0.2)', tintLight: 'rgba(22, 163, 74, 0.06)', shadow: 'rgba(22, 163, 74, 0.3)' },
    { key: 'tvl', value: `${parseFloat(totalValueLocked).toFixed(2)} ETH`, label: 'Total Value Locked', icon: faCoins, color: '#ff7a59', colorSoft: '#ff9c81', tint: 'rgba(255, 122, 89, 0.2)', tintLight: 'rgba(255, 122, 89, 0.06)', shadow: 'rgba(255, 122, 89, 0.35)' }
  ];

  return (
    <div className="admin-page-bg">
      <div className="admin-page-bg-decor" />
      <div className="container position-relative" style={{ zIndex: 1, paddingTop: '100px', paddingBottom: '64px' }}>
        <div className="mb-4">
          <h1 className="fw-bold mb-0" style={{ color: 'var(--bg-primary)' }}>Admin Dashboard</h1>
        </div>

        <div className="row g-4">
          <div className="col-lg-3">
            <div className="admin-sidebar card border-0 shadow-sm rounded-4 p-2">
              {NAV_ITEMS.map(item => {
                const badge = badgeFor(item.key);
                return (
                  <button
                    key={item.key}
                    className={`admin-nav-btn ${activeSection === item.key ? 'active' : ''}`}
                    onClick={() => setActiveSection(item.key)}
                  >
                    <span className="admin-nav-icon"><FontAwesomeIcon icon={item.icon} /></span>
                    <span className="admin-nav-label">{item.label}</span>
                    {badge > 0 && <CountBadge count={badge} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-lg-9">
            {activeSection === 'overview' && (
              <div key="overview" className="fade-in-item">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
                  {overviewStats.map((s, idx) => (
                    <div className="col card-float" style={{ animationDelay: `${idx * 0.25}s` }} key={s.key}>
                      <div
                        className="card stat-card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden"
                        style={{ background: `linear-gradient(140deg, ${s.tint} 0%, ${s.tintLight} 100%)`, borderTop: `3px solid ${s.color}` }}
                      >
                        <FontAwesomeIcon
                          icon={s.icon}
                          style={{ position: 'absolute', right: -12, bottom: -16, fontSize: '84px', color: s.color, opacity: 0.07, pointerEvents: 'none' }}
                        />
                        <div className="card-body d-flex align-items-center gap-2 py-2 px-3 position-relative" style={{ zIndex: 1 }}>
                          <div
                            className="icon-chip rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: 38,
                              height: 38,
                              background: `linear-gradient(135deg, ${s.color} 0%, ${s.colorSoft} 100%)`,
                              color: '#ffffff',
                              fontSize: 15,
                              boxShadow: `0 6px 14px ${s.shadow}`
                            }}
                          >
                            <FontAwesomeIcon icon={s.icon} />
                          </div>
                          <div>
                            <h3 className="fw-bold mb-0" style={{ color: 'var(--bg-primary)', fontSize: '19px', lineHeight: 1.2 }}>
                              <span key={s.value} className="stat-pop d-inline-block">{s.value}</span>
                            </h3>
                            <small className="text-uppercase text-muted" style={{ letterSpacing: '0.5px', fontSize: '10px' }}>{s.label}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row g-3">
                  <div className="col-lg-6">
                    <div className="admin-chart-card">
                      <h3>Property Clusters</h3>
                      {clusterData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={clusterData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                              {clusterData.map((entry, index) => (
                                <Cell key={index} fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p>No property data yet</p>}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="admin-chart-card">
                      <h3>Transaction Activity</h3>
                      {txnTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={txnTypeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                              {txnTypeData.map((entry, index) => (
                                <Cell key={index} fill={TXN_COLORS[index % TXN_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p>No transactions yet</p>}
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-4 mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-3" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                    <h3 className="mb-0 d-flex align-items-center gap-2" style={{ fontSize: '16px', color: 'var(--bg-primary)' }}>
                      <FontAwesomeIcon icon={faHistory} />
                      Recent Activity
                    </h3>
                    {transactions.length > 0 && (
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill"
                        onClick={() => setActiveTab && setActiveTab('transactions')}
                      >
                        View All ({transactions.length}) →
                      </button>
                    )}
                  </div>
                  {transactions.length === 0 ? (
                    <p className="text-muted text-center mb-0" style={{ padding: '24px 0' }}>No transactions yet</p>
                  ) : (
                    <div className="d-flex flex-column">
                      {transactions.slice(0, 6).map((tx, idx) => {
                        const meta = ACTIVITY_META[tx.type];
                        const propertyName = apartments[tx.apartmentId]?.title || `Property #${tx.apartmentId}`;
                        return (
                          <div
                            key={idx}
                            className="d-flex align-items-center gap-3 py-2"
                            style={{ borderBottom: idx < Math.min(transactions.length, 6) - 1 ? '1px solid var(--border-light)' : 'none' }}
                          >
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 36, height: 36, background: meta.bg, color: meta.color, fontSize: 13 }}
                            >
                              <FontAwesomeIcon icon={meta.icon} />
                            </div>
                            <div className="flex-grow-1">
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                                {formatAddr(tx.from)} {meta.verb} {tx.amount} tokens
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{propertyName} · {formatWhen(tx.timestamp)}</div>
                            </div>
                            {tx.totalValue ? (
                              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>{tx.totalValue.toFixed(4)} ETH</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'pending-users' && (
              <div key="pending-users" className="card border-0 shadow-sm rounded-4 p-4 fade-in-item">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--bg-primary)' }}>
                    <FontAwesomeIcon icon={faUserClock} />
                    Pending User Verifications
                    <CountBadge count={pendingUsers.length} />
                  </h5>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={handleRefreshUsers}>Refresh</button>
                </div>
                {pendingUsers.length === 0 ? <p className="text-muted mb-0">No pending user verifications.</p> : pendingUsers.map((user, idx) => (
                  <UserListItem
                    key={idx}
                    user={user}
                    isExpanded={expandedUser === idx}
                    onToggle={() => setExpandedUser(expandedUser === idx ? null : idx)}
                    statusPill={<StatusPill tone="pending" icon={faClock} label="Pending" />}
                    actions={
                      <div className="actions">
                        <button className="approve" onClick={() => handleApproveUser(user.address)} disabled={loading}><FontAwesomeIcon icon={faCheck} className="me-2" />Approve User</button>
                        <button className="reject" onClick={() => handleRejectUser(user.address)} disabled={loading}><FontAwesomeIcon icon={faTimes} className="me-2" />Reject User</button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}

            {activeSection === 'registered-users' && (
              <div key="registered-users" className="card border-0 shadow-sm rounded-4 p-4 fade-in-item">
                <h5 className="mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--bg-primary)' }}>
                  <FontAwesomeIcon icon={faUsers} />
                  Registered Users
                  <CountBadge count={registeredUsers.length} />
                </h5>
                {registeredUsers.length === 0 ? <p className="text-muted mb-0">No registered users yet.</p> : registeredUsers.map((user, idx) => (
                  <UserListItem
                    key={idx}
                    user={user}
                    isExpanded={expandedRegisteredUser === idx}
                    onToggle={() => setExpandedRegisteredUser(expandedRegisteredUser === idx ? null : idx)}
                    statusPill={user.name === 'Admin'
                      ? <StatusPill tone="owner" icon={faCrown} label="Owner" />
                      : <StatusPill tone="verified" icon={faCheckCircle} label="Verified" />}
                  />
                ))}
              </div>
            )}

            {activeSection === 'rental-income' && (
              <div key="rental-income" className="card border-0 shadow-sm rounded-4 p-4 fade-in-item">
                <h5 className="mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--bg-primary)' }}>
                  <FontAwesomeIcon icon={faCoins} />
                  Distribute Rental Income
                  <CountBadge count={verifiedApartments.length} />
                </h5>
                {verifiedApartments.length === 0 ? <p className="text-muted mb-0">No listed properties with token holders yet.</p> : verifiedApartments.map((apt) => (
                  <div className="rental-card" key={apt.id}>
                    <div className="rental-card-info">
                      <span className="rental-card-title">{apt.title}</span>
                      <span className="rental-card-location">{apt.location}</span>
                    </div>
                    <div className="rental-card-actions">
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="Rent collected (ETH)"
                        value={rentalAmounts[apt.id] || ''}
                        onChange={e => updateRentalAmount(apt.id, e.target.value)}
                      />
                      <button onClick={() => handleDistributeRentalIncome(apt.id)} disabled={loading}>
                        {loading ? 'Distributing...' : 'Distribute to Holders'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'pending-properties' && (
              <div key="pending-properties" className="card border-0 shadow-sm rounded-4 p-4 fade-in-item">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--bg-primary)' }}>
                    <FontAwesomeIcon icon={faBuilding} />
                    Pending Property Verifications
                    <CountBadge count={pendingProperties.length} />
                  </h5>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={refreshData}>Refresh</button>
                </div>
                {pendingProperties.length === 0 ? <p className="text-muted mb-0">No pending property verifications.</p> : pendingProperties.map((prop, idx) => (
                  <PropertyListItem
                    key={prop.id}
                    prop={prop}
                    isExpanded={expandedProperty === idx}
                    onToggle={() => setExpandedProperty(expandedProperty === idx ? null : idx)}
                    actions={
                      rejectingPropertyId === prop.id ? (
                        <div className="actions">
                          <textarea
                            placeholder="Reason for rejection (the lister will be notified with this)"
                            value={rejectionReasons[prop.id] || ''}
                            onChange={e => updateRejectionReason(prop.id, e.target.value)}
                            rows={2}
                            autoFocus
                            style={{ width: '100%', resize: 'vertical', borderRadius: 10, border: '1px solid var(--border-light)', padding: '8px 10px', fontSize: 13, marginBottom: 8 }}
                          />
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              className="btn btn-sm btn-outline-secondary rounded-pill"
                              onClick={() => setRejectingPropertyId(null)}
                              disabled={loading}
                              style={{ flex: 1 }}
                            >
                              Cancel
                            </button>
                            <button className="reject" style={{ flex: 1 }} onClick={() => handleRejectProperty(prop.id)} disabled={loading}>
                              <FontAwesomeIcon icon={faTimes} className="me-2" />Confirm Rejection
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="actions">
                          <button className="approve" onClick={() => handleApproveProperty(prop.id)} disabled={loading}><FontAwesomeIcon icon={faCheck} className="me-2" />Approve Property & List</button>
                          <button className="reject" onClick={() => setRejectingPropertyId(prop.id)} disabled={loading}><FontAwesomeIcon icon={faTimes} className="me-2" />Reject Property</button>
                        </div>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
