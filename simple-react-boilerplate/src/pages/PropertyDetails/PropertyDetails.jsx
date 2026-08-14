import React, { useState } from 'react';
import './PropertyDetails.css';
import usePropertyDetailsLogic from './usePropertyDetailsLogic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Map, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import cityMapData from '../../data/city_map_data.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faMapMarkerAlt, faCoins, faTrophy, faChartLine, faCalculator, faImage, faCheckCircle,
  faWallet, faListAlt, faSeedling, faTag, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const SCORE_METRIC_META = {
  growthPotential: { label: 'Growth Potential', icon: faSeedling, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  priceAccessibility: { label: 'Price Accessibility', icon: faTag, color: '#5b6b9e', bg: 'rgba(91, 107, 158, 0.12)' },
  marketStability: { label: 'Market Stability', icon: faShieldAlt, color: '#16213e', bg: 'rgba(22, 33, 62, 0.08)' },
  locationTrend: { label: 'Location Trend', icon: faMapMarkerAlt, color: '#ff7a59', bg: 'rgba(255, 122, 89, 0.12)' }
};

const scoreTier = (score) => {
  if (score >= 85) return { tone: 'strong', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' };
  if (score >= 70) return { tone: 'solid', color: '#ff7a59', bg: 'rgba(255, 122, 89, 0.14)' };
  if (score >= 55) return { tone: 'moderate', color: '#c17a1f', bg: 'rgba(242, 166, 90, 0.18)' };
  return { tone: 'conservative', color: '#5b6b9e', bg: 'rgba(91, 107, 158, 0.12)' };
};

const toTitleCase = (str) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const findCityCoords = (location) => {
  if (!location || !location.trim()) return null;
  const clean = toTitleCase(location.trim());
  let match = cityMapData.find(c => c.city === clean);
  if (!match) {
    const partials = cityMapData.filter(c => c.city.startsWith(clean));
    if (partials.length > 0) {
      match = partials.reduce((best, c) => (c.listing_count > best.listing_count ? c : best), partials[0]);
    }
  }
  return match ? { lat: match.lat, lng: match.lng, city: match.city } : null;
};

const TABS = [
  { key: 'overview', label: 'Overview', icon: faListAlt },
  { key: 'roi', label: 'ROI Simulator', icon: faCalculator },
  { key: 'holders', label: 'Top Holders', icon: faTrophy }
];

const PropertyDetails = ({ apartmentId, setActiveTab }) => {
  const {
    apartment,
    isVerified,
    buyAmount,
    setBuyAmount,
    loading,
    topHolders,
    investmentScore,
    roiYears,
    setRoiYears,
    roiAmount,
    setRoiAmount,
    roiData,
    soldPercentage,
    formatAddress,
    handleBuy
  } = usePropertyDetailsLogic(apartmentId);

  const [tab, setTab] = useState('overview');
  const [imgError, setImgError] = useState(false);

  if (!apartment) {
    return <div className="property-details-container">Loading or Not Found...</div>;
  }

  const hasImage = apartment.imageUrl && !imgError;
  const coords = findCityCoords(apartment.location);
  const soldOut = apartment.tokensSold >= apartment.totalTokens;

  return (
    <div className="property-details-container">
      <button className="back-button" onClick={() => setActiveTab('browse')}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Browse
      </button>

      <div className={`property-hero ${hasImage ? '' : 'property-hero-fallback'}`}>
        {hasImage ? (
          <img src={apartment.imageUrl} alt={apartment.title} onError={() => setImgError(true)} />
        ) : (
          <FontAwesomeIcon icon={faImage} className="property-hero-fallback-icon" />
        )}
        <div className="property-hero-badges">
          {apartment.isVerified && <span className="hero-badge hero-badge-verified"><FontAwesomeIcon icon={faCheckCircle} className="me-1" />Verified</span>}
          <span className="hero-badge">{soldPercentage}% Sold</span>
        </div>
        <div className="property-hero-overlay">
          <h1 className="property-hero-title">{apartment.title}</h1>
          <p className="property-hero-location"><FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />{apartment.location}</p>
        </div>
      </div>

      <div className="property-layout">
        {/* Main column: tabbed content */}
        <div className="property-main">
          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                <FontAwesomeIcon icon={t.icon} className="me-2" />{t.label}
                {t.key === 'holders' && topHolders?.[0]?.length > 0 && <span className="tab-count">{topHolders[0].length}</span>}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="details-section fade-in-item">
              {investmentScore ? (
                <>
                  <h2 className="pd-section-title"><FontAwesomeIcon icon={faChartLine} className="me-2" />Investment Score</h2>
                  <div className="score-circle-container">
                    <div
                      className="score-circle"
                      style={{ background: `conic-gradient(var(--primary) ${investmentScore.totalScore}%, var(--bg-cream) 0)` }}
                    >
                      <span key={investmentScore.totalScore} className="score-value stat-pop">{investmentScore.totalScore}</span>
                    </div>
                  </div>

                  <div className="score-summary">
                    <span
                      className="score-pill"
                      style={{ background: scoreTier(investmentScore.totalScore).bg, color: scoreTier(investmentScore.totalScore).color }}
                    >
                      {investmentScore.recommendation}
                    </span>
                    <p>{investmentScore.summary}</p>
                  </div>

                  <div className="score-grid">
                    {Object.entries(investmentScore.breakdown).map(([key, val]) => {
                      const meta = SCORE_METRIC_META[key];
                      return (
                        <div className="score-metric-card" key={key}>
                          <div className="score-metric-icon" style={{ background: meta.bg, color: meta.color }}>
                            <FontAwesomeIcon icon={meta.icon} />
                          </div>
                          <div className="score-metric-info">
                            <div className="score-metric-top">
                              <span>{meta.label}</span>
                              <strong>{val}/100</strong>
                            </div>
                            <div className="score-metric-bar">
                              <div style={{ width: `${val}%`, background: meta.color }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-muted-note">No ML investment analysis available for this location yet.</p>
              )}
            </div>
          )}

          {tab === 'roi' && (
            <div className="details-section fade-in-item">
              <h2 className="pd-section-title"><FontAwesomeIcon icon={faCalculator} className="me-2" />ROI Simulator</h2>
              <div className="roi-inputs">
                <div className="roi-input-group">
                  <label>Investment (Tokens)</label>
                  <input
                    type="number"
                    value={roiAmount}
                    onChange={(e) => setRoiAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div className="roi-input-group">
                  <label>Years</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={roiYears}
                    onChange={(e) => setRoiYears(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              {roiData.length > 0 ? (
                <>
                  <div className="roi-chart" style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart data={roiData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} />
                        <YAxis hide />
                        <Tooltip
                          formatter={(value, name) => [value, name === 'projected' ? 'Projected Value' : 'Invested']}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Bar dataKey="invested" stackId="a" fill="var(--bg-primary)" />
                        <Bar dataKey="profit" stackId="a" fill="var(--primary)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <table className="roi-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Value</th>
                        <th>Profit</th>
                        <th>ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiData.map((data) => (
                        <tr key={data.year}>
                          <td>{data.year}</td>
                          <td>{data.projected}</td>
                          <td style={{ color: 'var(--accent)', fontWeight: 600 }}>+{data.profit}</td>
                          <td>{data.roi}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p className="text-muted-note">ROI Simulator requires ML Investment Score data for this location.</p>
              )}
            </div>
          )}

          {tab === 'holders' && (
            <div className="details-section fade-in-item">
              <h2 className="pd-section-title"><FontAwesomeIcon icon={faTrophy} className="me-2" />Top Token Holders</h2>
              {topHolders && topHolders[0] && topHolders[0].length > 0 ? (
                <ul className="data-list">
                  {topHolders[0].map((address, idx) => (
                    <li key={idx} className="data-item">
                      <span>{formatAddress(address)}</span>
                      <strong>{topHolders[1][idx]} Tokens</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-note">No holders data available.</p>
              )}
            </div>
          )}
        </div>

        {/* sidebar: the transaction */}
        <div className="property-sidebar">
          <div className="buy-box">
            <div className="buy-box-price">
              <span>Token Price</span>
              <strong>{apartment.tokenPrice} <em>ETH</em></strong>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${soldPercentage}%` }}></div>
            </div>
            <div className="buy-box-supply">{apartment.tokensSold} / {apartment.totalTokens} tokens sold</div>

            {soldOut ? (
              <div className="sold-out-panel">
                <span className="sold-out-flag">🏁</span>
                <strong>Fully Sold Out</strong>
                <p>All {apartment.totalTokens.toLocaleString()} tokens are owned. Check the <b>Top Holders</b> tab to see the current owners.</p>
              </div>
            ) : !isVerified ? (
              <p className="unverified-message">You must be KYC verified to purchase tokens.</p>
            ) : (
              <div className="buy-container">
                <div className="buy-input-group">
                  <input
                    type="number"
                    className="buy-input"
                    placeholder="Enter amount to buy"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                  />
                </div>
                <button
                  className="buy-btn buy-btn-full"
                  onClick={handleBuy}
                  disabled={loading || !buyAmount}
                >
                  <FontAwesomeIcon icon={faCoins} className="me-2" />
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            )}
          </div>

          <div className="listed-by-card">
            <div className="listed-by-avatar"><FontAwesomeIcon icon={faWallet} /></div>
            <div>
              <small>Listed By</small>
              <code>{formatAddress(apartment.owner)}</code>
            </div>
          </div>

          {coords && (
            <div className="mini-map-card">
              <Map center={[coords.lat, coords.lng]} zoom={13} style={{ height: '200px', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <CircleMarker center={[coords.lat, coords.lng]} radius={10} color="#ff7a59" fillColor="#ff7a59" fillOpacity={0.7}>
                  <Popup>{apartment.title}<br />{coords.city}</Popup>
                </CircleMarker>
              </Map>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
