import React, { useEffect } from 'react';
import { scrollToSection } from '../../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faChartLine, faCoins, faLink, faGem, faGlobe, faChartPie } from '@fortawesome/free-solid-svg-icons';
import useHomeLogic from './useHomeLogic';
import AnimatedCounter from './AnimatedCounter';
import LocationMap from '../../components/LocationMap/LocationMap';
import './Home.css';

const Home = ({ setActiveTab }) => {
  const {
    account,
    connectToMetaMask,
    mlLocation,
    setMlLocation,
    mlPostalCode,
    setMlPostalCode,
    mlResult,
    handleAnalyzeLocation
  } = useHomeLogic();

  return (
    <>
      <section className="hero-full">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Premium Sri Lankan Real Estate Tokenization</h1>
            <p>Join the thousands of investors gaining cutting-edge access to fractional luxury real estate. Advance your portfolio and make a positive impact on the local economy.</p>
            <div className="hero-buttons">
              {!account ? (
                <button className="btn-primary" onClick={connectToMetaMask}>Connect Wallet</button>
              ) : (
                <button className="btn-primary" onClick={() => setActiveTab('browse')}>Explore Properties</button>
              )}
              <button className="btn-outline" onClick={() => scrollToSection('about')}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

    
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-header reveal-on-scroll"><span className="section-tag">About Us</span><h2>Revolutionizing Real Estate Investment in Sri Lanka</h2><p>We're making property investment accessible, transparent, and borderless through blockchain technology.</p></div>
          <div className="about-grid">
            <div className="about-card reveal-on-scroll" style={{transitionDelay: '0.1s'}}>
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" alt="Blockchain" className="card-top-image" />
              <div className="card-content-inner">
                <div className="about-icon"><FontAwesomeIcon icon={faLink} /></div><h3>Blockchain Powered</h3><p>Every transaction is recorded on the Ethereum blockchain, ensuring complete transparency and security.</p>
              </div>
            </div>
            <div className="about-card reveal-on-scroll" style={{transitionDelay: '0.2s'}}>
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" alt="Fractional" className="card-top-image" />
              <div className="card-content-inner">
                <div className="about-icon"><FontAwesomeIcon icon={faGem} /></div><h3>Fractional Ownership</h3><p>Buy as little as $10 worth of tokens, making luxury real estate accessible to everyone.</p>
              </div>
            </div>
            <div className="about-card reveal-on-scroll" style={{transitionDelay: '0.3s'}}>
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" alt="Global" className="card-top-image" />
              <div className="card-content-inner">
                <div className="about-icon"><FontAwesomeIcon icon={faGlobe} /></div><h3>Global Access</h3><p>Invest from anywhere in the world with just a MetaMask wallet - no bank accounts needed.</p>
              </div>
            </div>
            <div className="about-card reveal-on-scroll" style={{transitionDelay: '0.4s'}}>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="ML Insights" className="card-top-image" />
              <div className="card-content-inner">
                <div className="about-icon"><FontAwesomeIcon icon={faChartPie} /></div><h3>ML-Powered Insights</h3><p>AI-driven location analysis helps you make smarter investment decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ml-section" className="ml-section">
        <div className="container">
          <div className="ml-grid">
            <div className="ml-content">
              <span className="section-tag reveal-on-scroll">ML Location Analysis</span>
              <h2 className="reveal-on-scroll" style={{transitionDelay: '0.1s'}}>Smart Investment Decisions with AI</h2>
              <p className="reveal-on-scroll" style={{transitionDelay: '0.2s'}}>Our machine learning model analyzes historical property data, price trends, and infrastructure development to classify Sri Lankan locations into investment clusters.</p>
              <ul className="ml-features">
                <li className="reveal-on-scroll" style={{transitionDelay: '0.3s'}}><FontAwesomeIcon icon={faMapMarkerAlt} className="feature-icon text-gold" /> Expensive & Stable - High price, steady growth</li>
                <li className="reveal-on-scroll" style={{transitionDelay: '0.4s'}}><FontAwesomeIcon icon={faChartLine} className="feature-icon text-gold" /> Fast Growing - Medium price, rising quickly</li>
                <li className="reveal-on-scroll" style={{transitionDelay: '0.5s'}}><FontAwesomeIcon icon={faCoins} className="feature-icon text-gold" /> Budget & Rising - Low price, high potential</li>
              </ul>
            </div>
            <div className="ml-demo reveal-on-scroll" style={{transitionDelay: '0.4s'}}>
              <div className="ml-card">
                <h3>Location Cluster Predictor</h3>
                <input type="text" placeholder="Enter city name (e.g., Kadawatha)" value={mlLocation} onChange={(e) => setMlLocation(e.target.value)} className="ml-input" />
                <input type="text" placeholder="Postal code (optional, e.g., 11850)" value={mlPostalCode} onChange={(e) => setMlPostalCode(e.target.value)} className="ml-input" />
                <button className="btn-primary" onClick={handleAnalyzeLocation}>Analyze Location →</button>
                {mlResult && (<div className="ml-result"><h4>Analysis Result</h4><div className="result-item"><strong>Cluster:</strong> <span className={`cluster ${mlResult.cluster === 'Expensive & Stable' ? 'expensive' : mlResult.cluster === 'Fast Growing' ? 'growing' : 'budget'}`}>{mlResult.cluster}</span></div><div className="result-item"><strong>Average Price:</strong> Rs {mlResult.avgPrice} /sqft</div><div className="result-item"><strong>Growth Rate:</strong> {mlResult.growth !== null ? `${mlResult.growth}% (1-year)` : 'Insufficient data for trend'}</div><div className="result-item"><strong>Similar Cities:</strong> {mlResult.similar.join(', ')}</div>{mlResult.note && (<div className="result-item ml-note">{mlResult.note}</div>)}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="map-section" className="container">
        <div className="map-header reveal-on-scroll">
          <span className="section-tag">Interactive Map</span>
          <h2>Explore Investment Clusters Across Sri Lanka</h2>
          {/* <p>Visualize price tiers across 44 analyzed locations</p> */}
        </div>
        <LocationMap />
      </section>

{/*
      <section className="tokenization-section">
        <div className="container">
          <div className="token-header"><span className="section-tag">How It Works</span><h2>The Future of Real Estate Investment</h2><p>Our tokenization protocol makes property investment accessible to everyone</p></div>
          <div className="token-grid"><div className="token-card"><div className="token-number">1</div><h3>Property Tokenization</h3><p>Each apartment is converted into 10,000+ digital tokens representing fractional ownership.</p></div><div className="token-card"><div className="token-number">2</div><h3>Buy & Sell Tokens</h3><p>Purchase tokens from as low as $10. Trade them freely on our platform.</p></div><div className="token-card"><div className="token-number">3</div><h3>Earn Value</h3><p>As property value appreciates, your token value increases proportionally.</p></div><div className="token-card"><div className="token-number">4</div><h3>Complete Transparency</h3><p>All transactions recorded on blockchain - fully auditable and secure.</p></div></div>
          <div className="token-stats"><div className="stat"><h3>$10</h3><p>Minimum Investment</p></div><div className="stat"><h3>100%</h3><p>Blockchain Secured</p></div><div className="stat"><h3>24/7</h3><p>Trading Available</p></div><div className="stat"><h3>Global</h3><p>Invest from Anywhere</p></div></div>
        </div>
      </section> */}

        <div className="stats-banner reveal-on-scroll">
        <div className="stats-grid">
          <div className="stat-item">
            <h3><AnimatedCounter end={10} prefix="$" /></h3>
            <p>Minimum investment to start your fractional real estate journey.</p>
          </div>
          <div className="stat-item">
            <h3><AnimatedCounter end={100} suffix="%" /></h3>
            <p>Blockchain secured transactions ensuring complete transparency.</p>
          </div>
          <div className="stat-item">
            <h3><AnimatedCounter end={10390} suffix="+" /></h3>
            <p>Tokens successfully minted across verified properties.</p>
          </div>
          <div className="stat-item">
            <h3><AnimatedCounter end={24} suffix="/7" /></h3>
            <p>Trading available across global markets without restrictions.</p>
          </div>
        </div>
      </div>

      <section className="testimonials-section">
        <div className="container">
          <div className="testimonials-header reveal-on-scroll"><span className="section-tag">Testimonials</span><h2>What Our Investors Say</h2><p>Join hundreds of satisfied investors using CeylonPropChain</p></div>
          <div className="testimonials-grid">
            <div className="testimonial-card reveal-on-scroll" style={{transitionDelay: '0.1s'}}>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Investor" className="card-top-image" />
              <div className="card-content-inner">
                <div className="quote-icon">"<strong>David Chen</strong>"</div><p>CeylonPropChain made it possible for me to invest in Sri Lankan real estate from abroad. The fractional ownership model is revolutionary!</p><div className="testimonial-author"><span>Investor from Singapore</span></div>
              </div>
            </div>
            <div className="testimonial-card reveal-on-scroll" style={{transitionDelay: '0.2s'}}>
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" alt="Investor" className="card-top-image" />
              <div className="card-content-inner">
                <div className="quote-icon">"<strong>Sarah Johnson</strong>"</div><p>The ML location analysis helped me identify the best areas to invest. I've seen 25% growth in my portfolio in just 6 months!</p><div className="testimonial-author"><span>UK Investor</span></div>
              </div>
            </div>
            <div className="testimonial-card reveal-on-scroll" style={{transitionDelay: '0.3s'}}>
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800" alt="Investor" className="card-top-image" />
              <div className="card-content-inner">
                <div className="quote-icon">"<strong>Amal Perera</strong>"</div><p>Finally, a platform that makes real estate investment transparent and accessible. The team is incredibly supportive.</p><div className="testimonial-author"><span>Local Investor</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Home;
