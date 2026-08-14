import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp, faArrowDown, faExchangeAlt, faGem, faListUl, faInbox, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import useTransactionsLogic from './useTransactionsLogic';
import './Transactions.css';

const TYPE_META = {
  BUY: { badge: 'text-bg-success', icon: faArrowUp, color: '#16a34a' },
  SELL: { badge: 'text-bg-danger', icon: faArrowDown, color: '#e0524f' },
  TRANSFER: { badge: 'text-bg-primary', icon: faExchangeAlt, color: '#5b6b9e' }
};

const BREAKDOWN = [
  { key: 'buys', label: 'Purchases', icon: faArrowUp, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  { key: 'sells', label: 'Sales', icon: faArrowDown, color: '#e0524f', bg: 'rgba(224, 82, 79, 0.12)' },
  { key: 'transfers', label: 'Transfers', icon: faExchangeAlt, color: '#5b6b9e', bg: 'rgba(91, 107, 158, 0.12)' }
];

const Transactions = () => {
  const {
    transactions,
    loading,
    filter,
    setFilter,
    stats,
    getPropertyName,
    formatAddress,
    formatDate
  } = useTransactionsLogic();

  const filters = [
    { key: 'ALL', label: 'All', icon: faListUl, count: stats.total },
    { key: 'BUY', label: 'Buys', icon: faArrowUp, count: stats.buys },
    { key: 'SELL', label: 'Sells', icon: faArrowDown, count: stats.sells },
    { key: 'TRANSFER', label: 'Transfers', icon: faExchangeAlt, count: stats.transfers }
  ];

  return (
    <div className="container" style={{ marginTop: '100px', paddingBottom: '64px' }}>
      <div className="mb-4">
        <h1 className="fw-bold mb-0" style={{ color: 'var(--bg-primary)' }}>Transaction Activity</h1>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-4 hero-float">
          <div className="card gradient-hero border-0 rounded-4 h-100 text-white position-relative overflow-hidden fade-in-item">
            <div className="card-body d-flex flex-column justify-content-center py-4 px-4 position-relative" style={{ zIndex: 1 }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.14)' }}>
                  <FontAwesomeIcon icon={faGem} />
                </div>
                <small className="text-uppercase" style={{ letterSpacing: '1px', opacity: 0.75, fontSize: '11px' }}>Total Volume</small>
              </div>
              <h2 className="fw-bold mb-1">
                <span key={stats.totalVolume} className="stat-pop" style={{ fontSize: '36px' }}>{stats.totalVolume}</span>{' '}
                <span style={{ fontSize: '18px', opacity: 0.7, fontWeight: 500 }}>ETH</span>
              </h2>
              <p className="mb-0" style={{ fontSize: '13px', opacity: 0.75 }}>Across {stats.total} on-chain transactions</p>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100 fade-in-item" style={{ animationDelay: '0.1s' }}>
            <div className="card-body p-4 d-flex align-items-center gap-4 flex-wrap">
              {stats.total === 0 ? (
                <div className="text-center text-muted py-4 w-100">
                  <FontAwesomeIcon icon={faInbox} className="mb-2" style={{ fontSize: '28px', opacity: 0.5 }} />
                  <div style={{ fontSize: '13px' }}>No activity yet</div>
                </div>
              ) : (
                <>
                  <div className="position-relative flex-shrink-0" style={{ width: 150, height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={BREAKDOWN.map(b => ({ ...b, value: stats[b.key] }))}
                          dataKey="value"
                          innerRadius={50}
                          outerRadius={70}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {BREAKDOWN.map(b => (
                            <Cell key={b.key} fill={b.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div key={stats.total} className="stat-pop fw-bold" style={{ fontSize: '28px', color: 'var(--bg-primary)', lineHeight: 1 }}>{stats.total}</div>
                      <small className="text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Total</small>
                    </div>
                  </div>

                  <div className="flex-grow-1 d-flex flex-column gap-3" style={{ minWidth: 220 }}>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <FontAwesomeIcon icon={faGem} style={{ color: 'var(--primary)' }} />
                      Activity Breakdown
                    </div>
                    {BREAKDOWN.map(b => {
                      const pct = stats.total > 0 ? (stats[b.key] / stats.total) * 100 : 0;
                      return (
                        <div key={b.key} className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 34, height: 34, background: b.bg, color: b.color, fontSize: 13 }}
                          >
                            <FontAwesomeIcon icon={b.icon} />
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>{b.label}</span>
                              <span key={stats[b.key]} className="stat-pop" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--bg-primary)' }}>{stats[b.key]}</span>
                            </div>
                            <div style={{ height: 5, background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden', marginTop: 5 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: b.color, borderRadius: '999px', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-inline-flex flex-wrap gap-1 p-1 rounded-pill mb-4 txn-filter-bar">
        {filters.map(f => (
          <button
            key={f.key}
            className="btn btn-sm rounded-pill px-3 border-0 d-flex align-items-center"
            style={filter === f.key
              ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 14px rgba(255,122,89,0.32)' }
              : { background: 'transparent', color: 'var(--text-muted)' }}
            onClick={() => setFilter(f.key)}
          >
            <FontAwesomeIcon icon={f.icon} className="me-2" />
            {f.label}
            <span
              key={f.count}
              className="ms-2 rounded-pill d-inline-flex align-items-center justify-content-center stat-pop"
              style={{
                minWidth: 20,
                height: 20,
                fontSize: '11px',
                padding: '0 6px',
                background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--border-light)',
                color: filter === f.key ? '#fff' : 'var(--text-muted)'
              }}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted fst-italic py-5">Loading blockchain events...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center rounded-4 py-5" style={{ background: 'var(--bg-cream)', border: '1px dashed var(--border-light)' }}>
          <FontAwesomeIcon icon={faInbox} className="mb-3" style={{ fontSize: '36px', color: 'var(--text-muted)', opacity: 0.6 }} />
          <p className="text-muted mb-0">
            No transactions found{filter !== 'ALL' ? ` for filter: ${filter}` : ''}. Transactions will appear here after tokens are bought, sold, or transferred.
          </p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-item" style={{ animationDelay: '0.2s' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="text-uppercase text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                  <th className="ps-4 py-3">Type</th>
                  <th className="py-3">Property</th>
                  <th className="py-3">Details</th>
                  <th className="py-3">Value</th>
                  <th className="text-end pe-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="fade-in-item" style={{ animationDelay: `${0.25 + idx * 0.04}s` }}>
                    <td className="ps-4" style={{ borderLeft: `3px solid ${TYPE_META[tx.type].color}` }}>
                      <span className={`badge rounded-pill ${TYPE_META[tx.type].badge}`}>
                        <FontAwesomeIcon icon={TYPE_META[tx.type].icon} className="me-1" style={{ fontSize: '10px' }} />
                        {tx.type}
                      </span>
                    </td>
                    <td className="fw-semibold">{getPropertyName(tx.apartmentId)}</td>
                    <td className="text-muted small">
                      {tx.type === 'BUY' && <>Buyer: <code>{formatAddress(tx.from)}</code></>}
                      {tx.type === 'SELL' && <>Seller: <code>{formatAddress(tx.from)}</code></>}
                      {tx.type === 'TRANSFER' && <><code>{formatAddress(tx.from)}</code> → <code>{formatAddress(tx.to)}</code></>}
                      <span className="ms-1">· {tx.amount} tokens</span>
                    </td>
                    <td>
                      {tx.totalValue ? (
                        <span className="fw-semibold" style={{ color: 'var(--primary)' }}>{tx.totalValue.toFixed(4)} ETH</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <div className="small text-muted">{formatDate(tx.timestamp)}</div>
                      <div className="small" style={{ color: 'var(--accent)' }}>
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        Confirmed
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
