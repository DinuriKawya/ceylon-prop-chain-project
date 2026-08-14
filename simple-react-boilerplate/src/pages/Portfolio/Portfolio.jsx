import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet, faChartPie, faMapMarkerAlt, faCoins, faGem, faHandHoldingUsd, faExchangeAlt, faMoneyBillWave, faBuilding,
  faChevronRight, faPercent, faArrowUp, faArrowDown, faHistory, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import usePortfolioLogic from './usePortfolioLogic';
import useTransactionsLogic from '../Transactions/useTransactionsLogic';
import { useWallet } from '../../hooks/useWallet';
import './Portfolio.css';

const COLORS = ['#16213e', '#ff7a59', '#2dd4bf', '#f2a65a', '#5b6b9e', '#5eead4'];

const ACTIVITY_META = {
  BUY: { icon: faArrowUp, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)', verb: 'Bought' },
  SELL: { icon: faArrowDown, color: '#e0524f', bg: 'rgba(224, 82, 79, 0.12)', verb: 'Sold' },
  TRANSFER: { icon: faExchangeAlt, color: '#5b6b9e', bg: 'rgba(91, 107, 158, 0.12)', verb: 'Transferred' }
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: 'rgba(13, 21, 38, 0.95)', padding: '15px 20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', boxShadow: '0 10px 25px rgba(22,33,62,0.3)', color: 'white' }}>
        <p className="label" style={{ fontWeight: '700', color: '#ff7a59', margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{`${payload[0].payload.name}`}</p>
        <p className="intro" style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>{payload[0].value} ETH</p>
        <p className="desc" style={{ margin: 0, fontSize: '13px', color: '#5eead4' }}>Tokens Owned: {payload[0].payload.amount}</p>
      </div>
    );
  }
  return null;
};

const KpiMini = ({ icon, value, label, color }) => (
  <div className="col">
    <div className="kpi-mini">
      <FontAwesomeIcon icon={icon} style={{ color, fontSize: '14px', marginBottom: '6px' }} />
      <strong><span key={value} className="stat-pop d-inline-block">{value}</span></strong>
      <small>{label}</small>
    </div>
  </div>
);

const Portfolio = ({ setActiveTab }) => {
  const {
    userTokens,
    apartments,
    loading,
    isActionActive,
    chartData,
    totalValue,
    getForm,
    updateForm,
    handleTransferTokens,
    handleSellTokens,
    ownerBalances,
    handleWithdraw,
    claimableRentalIncome,
    handleClaimRentalIncome
  } = usePortfolioLogic();

  const { account } = useWallet();
  const { transactions: allTransactions, getPropertyName, formatDate } = useTransactionsLogic();
  const myTransactions = allTransactions.filter(tx =>
    tx.from?.toLowerCase() === account?.toLowerCase() || tx.to?.toLowerCase() === account?.toLowerCase()
  );

  const holdingsList = Object.entries(userTokens)
    .map(([aptId, amount]) => {
      const apt = apartments[parseInt(aptId)];
      if (!apt) return null;
      return {
        aptId,
        apt,
        amount,
        pct: (amount / apt.totalTokens) * 100,
        value: apt.tokenPrice * amount,
        rentalIncome: claimableRentalIncome[aptId] || 0
      };
    })
    .filter(Boolean);

  const listedList = Object.entries(ownerBalances)
    .map(([aptId, balance]) => {
      const apt = apartments[parseInt(aptId)];
      if (!apt) return null;
      return { aptId, apt, balance };
    })
    .filter(Boolean);

  const hasHoldings = holdingsList.length > 0;
  const hasListed = listedList.length > 0;
  const [view, setView] = useState(hasHoldings ? 'holdings' : 'listed');
  const [selectedId, setSelectedId] = useState(null);

  if (!hasHoldings && !hasListed) {
    return (
      <div className="container" style={{ marginTop: '100px', paddingBottom: '64px' }}>
        <div className="portfolio-header">
          <h1>My Portfolio</h1>
          <p>Your token holdings and real-time analytics</p>
        </div>
        <p className="no-tokens fade-in-item">
          <FontAwesomeIcon icon={faWallet} style={{ fontSize: '32px', opacity: 0.5, display: 'block', margin: '0 auto 16px' }} />
          You don't own any tokens yet. <button className="link-btn" onClick={() => setActiveTab('browse')}>Browse Properties</button> to invest!
        </p>
      </div>
    );
  }

  const activeList = view === 'holdings' ? holdingsList : listedList;
  const selected = activeList.find(x => x.aptId === selectedId) || activeList[0];
  const form = selected ? getForm(selected.aptId) : null;

  return (
    <div className="container" style={{ marginTop: '100px', paddingBottom: '64px' }}>
      <div className="portfolio-header">
        <h1>My Portfolio</h1>
        <p>Your token holdings and real-time analytics</p>
      </div>

      {hasHoldings && hasListed && (
        <div className="d-inline-flex flex-wrap gap-1 p-1 rounded-pill mb-3 portfolio-tab-bar">
          <button
            className="btn btn-sm rounded-pill px-3 border-0 d-flex align-items-center"
            style={view === 'holdings' ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 14px rgba(255,122,89,0.32)' } : { background: 'transparent', color: 'var(--text-muted)' }}
            onClick={() => { setView('holdings'); setSelectedId(null); }}
          >
            <FontAwesomeIcon icon={faCoins} className="me-2" /> My Holdings
          </button>
          <button
            className="btn btn-sm rounded-pill px-3 border-0 d-flex align-items-center"
            style={view === 'listed' ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 14px rgba(255,122,89,0.32)' } : { background: 'transparent', color: 'var(--text-muted)' }}
            onClick={() => { setView('listed'); setSelectedId(null); }}
          >
            <FontAwesomeIcon icon={faBuilding} className="me-2" /> My Listed Properties
          </button>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-4 d-flex flex-column gap-3">
          {hasHoldings && (
            <div className="hero-float">
              <div className="card gradient-hero portfolio-hero-deep border-0 rounded-4 text-white position-relative overflow-hidden fade-in-item">
                <div className="card-body d-flex flex-column py-3 px-4 position-relative" style={{ zIndex: 1 }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.14)' }}>
                      <FontAwesomeIcon icon={faWallet} />
                    </div>
                    <small className="text-uppercase" style={{ letterSpacing: '1px', opacity: 0.75, fontSize: '11px' }}>Portfolio Value</small>
                  </div>
                  <h2 className="fw-bold mb-1">
                    <span key={totalValue} className="stat-pop d-inline-block" style={{ fontSize: '32px' }}>{totalValue}</span>{' '}
                    <span style={{ fontSize: '16px', opacity: 0.7, fontWeight: 500 }}>ETH</span>
                  </h2>
                  <p className="mb-0" style={{ fontSize: '12px', opacity: 0.75 }}>Invested across {chartData.length} propert{chartData.length === 1 ? 'y' : 'ies'}</p>
                </div>
              </div>
            </div>
          )}

          {hasHoldings && (
            <div className="chart-container fade-in-item" style={{ animationDelay: '0.1s' }}>
              <h3><FontAwesomeIcon icon={faChartPie} className="me-2" style={{ color: 'var(--primary)' }} />Asset Allocation Breakdown</h3>
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative flex-shrink-0" style={{ width: 130, height: 130 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        innerRadius={44}
                        outerRadius={62}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={chartData.length > 1 ? 3 : 0}
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--bg-primary)', lineHeight: 1.1 }}>{totalValue}</div>
                    <small className="text-muted text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>ETH</small>
                  </div>
                </div>
                <div className="flex-grow-1 d-flex flex-column gap-2" style={{ minWidth: 0 }}>
                  {chartData.map((d, index) => (
                    <div key={d.name} className="d-flex align-items-center gap-2">
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                      <span className="text-truncate" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{d.value} ETH</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="portfolio-list-panel">
            {activeList.map(item => (
              <button
                key={item.aptId}
                className={`portfolio-list-row ${selected?.aptId === item.aptId ? 'active' : ''}`}
                onClick={() => setSelectedId(item.aptId)}
              >
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 36, height: 36, background: selected?.aptId === item.aptId ? 'rgba(255,255,255,0.22)' : 'rgba(255, 122, 89, 0.12)', color: selected?.aptId === item.aptId ? '#fff' : 'var(--primary)', fontSize: 14 }}
                >
                  <FontAwesomeIcon icon={view === 'holdings' ? faCoins : faBuilding} />
                </div>
                <div className="flex-grow-1 text-start" style={{ minWidth: 0 }}>
                  <div className="fw-semibold text-truncate" style={{ fontSize: '14px' }}>{item.apt.title}</div>
                  <div className="text-truncate" style={{ fontSize: '12px', opacity: 0.75 }}>{item.apt.location}</div>
                </div>
                <div className="text-end flex-shrink-0" style={{ fontSize: '13px', fontWeight: 700 }}>
                  {view === 'holdings' ? `${item.pct.toFixed(1)}%` : `${item.balance.toFixed(2)} ETH`}
                </div>
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '11px', opacity: 0.5 }} />
              </button>
            ))}
          </div>
        </div>

        <div className="col-lg-8">
          {selected && view === 'holdings' && (
            <div key={selected.aptId} className="portfolio-detail fade-in-item">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="icon-chip rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, background: 'rgba(255, 122, 89, 0.12)', color: 'var(--primary)', fontSize: 20 }}>
                  <FontAwesomeIcon icon={faCoins} />
                </div>
                <div>
                  <h3 className="mb-0">{selected.apt.title}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '13px' }}><FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />{selected.apt.location}</p>
                </div>
              </div>

              <div className="row row-cols-2 row-cols-md-4 g-2 mb-4">
                <KpiMini icon={faCoins} value={selected.amount} label="Tokens" color="#ff7a59" />
                <KpiMini icon={faPercent} value={`${selected.pct.toFixed(1)}%`} label="Ownership" color="#5b6b9e" />
                <KpiMini icon={faGem} value={`${selected.value.toFixed(2)} ETH`} label="Value" color="#0d9488" />
                <KpiMini icon={faHandHoldingUsd} value={selected.rentalIncome ? `${selected.rentalIncome.toFixed(2)} ETH` : '—'} label="Rental Income" color="#c17a1f" />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Ownership of total supply</span>
                  <span>{selected.pct.toFixed(2)}%</span>
                </div>
                <div className="ownership-bar"><div style={{ width: `${Math.min(selected.pct, 100)}%` }} /></div>
              </div>

              {selected.rentalIncome > 0 && (
                <div className="claim-callout mb-4">
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rental Income Available</div>
                    <strong style={{ fontSize: '18px', color: '#0d9488' }}>{selected.rentalIncome.toFixed(2)} ETH</strong>
                  </div>
                  <button className="claim-btn" onClick={() => handleClaimRentalIncome(parseInt(selected.aptId))} disabled={loading}>
                    <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" />
                    {isActionActive(parseInt(selected.aptId), 'claim') ? 'Claiming...' : 'Claim'}
                  </button>
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="portfolio-action-box">
                    <h4><FontAwesomeIcon icon={faExchangeAlt} className="me-2" />Transfer Tokens</h4>
                    <input type="number" placeholder="Amount to transfer" value={form.amount} onChange={e => updateForm(selected.aptId, 'amount', e.target.value)} />
                    <input type="text" placeholder="To Address (0x...)" value={form.toAddress} onChange={e => updateForm(selected.aptId, 'toAddress', e.target.value)} />
                    <button className="btn-primary" onClick={() => handleTransferTokens(parseInt(selected.aptId))} disabled={loading}>
                      {isActionActive(parseInt(selected.aptId), 'transfer') ? 'Transferring...' : 'Transfer'}
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="portfolio-action-box">
                    <h4><FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />Sell Tokens</h4>
                    <input type="number" min="1" max={selected.amount} placeholder={`Max ${selected.amount}`} value={form.sellAmount} onChange={e => updateForm(selected.aptId, 'sellAmount', e.target.value)} />
                    <button className="btn-outline" onClick={() => handleSellTokens(parseInt(selected.aptId), selected.amount)} disabled={loading}>
                      {isActionActive(parseInt(selected.aptId), 'sell') ? 'Selling...' : 'Sell'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selected && view === 'listed' && (
            <div key={selected.aptId} className="portfolio-detail fade-in-item">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="icon-chip rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, background: 'rgba(91, 107, 158, 0.12)', color: '#5b6b9e', fontSize: 20 }}>
                  <FontAwesomeIcon icon={faBuilding} />
                </div>
                <div>
                  <h3 className="mb-0">{selected.apt.title}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '13px' }}><FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />{selected.apt.location}</p>
                </div>
              </div>

              <div className="kpi-mini mb-4" style={{ maxWidth: 260 }}>
                <FontAwesomeIcon icon={faGem} style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '6px' }} />
                <strong><span key={selected.balance} className="stat-pop d-inline-block">{selected.balance.toFixed(2)} ETH</span></strong>
                <small>Available to Withdraw</small>
              </div>

              <button className="btn-primary" onClick={() => handleWithdraw(parseInt(selected.aptId), selected.balance)} disabled={loading}>
                <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" />
                {isActionActive(parseInt(selected.aptId), 'withdraw') ? 'Withdrawing...' : `Withdraw ${selected.balance.toFixed(2)} ETH`}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="section-title"><FontAwesomeIcon icon={faHistory} className="me-2" />My Transaction History</h2>
        {myTransactions.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '14px' }}>You haven't bought, sold, or transferred any tokens yet.</p>
        ) : (
          <div className="portfolio-history-panel">
            {myTransactions.slice(0, 10).map((tx, idx) => {
              const meta = ACTIVITY_META[tx.type];
              return (
                <div key={idx} className="portfolio-history-row">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 38, height: 38, background: meta.bg, color: meta.color }}>
                    <FontAwesomeIcon icon={meta.icon} />
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {meta.verb} {tx.amount} tokens · {getPropertyName(tx.apartmentId)}
                    </div>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(tx.timestamp)}
                      <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--accent)', fontSize: '10px' }} />
                    </div>
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
  );
};
export default Portfolio;
