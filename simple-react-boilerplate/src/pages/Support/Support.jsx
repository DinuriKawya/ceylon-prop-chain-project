import React, { useState } from 'react';
import './Support.css';
import { useChat } from '../../context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faWallet, faUserCheck, faBuilding, faCoins, faExchangeAlt, faHandHoldingUsd, faChevronDown, faComments,
  faQuestionCircle, faChartLine, faRocket, faBookOpen, faHeadset, faSearch, faCheck
} from '@fortawesome/free-solid-svg-icons';

const STEPS = [
  { icon: faWallet, title: 'Connect Your Wallet', desc: 'Click "Connect Wallet" in the top navigation and approve the connection in MetaMask.' },
  { icon: faUserCheck, title: 'Register & Get Verified', desc: 'Submit your name, email, a government ID photo, and a selfie. An admin reviews and approves your registration (KYC).' },
  { icon: faBuilding, title: 'Browse Properties', desc: 'Once verified, explore tokenized Sri Lankan apartments in the Properties marketplace.' },
  { icon: faCoins, title: 'Buy Tokens', desc: 'Purchase fractional ownership tokens in any listed property directly with ETH via MetaMask.' },
  { icon: faChartLine, title: 'Track & Earn', desc: 'Monitor your holdings in Portfolio, claim rental income when distributed, and transfer or sell tokens anytime.' }
];

const HOW_IT_WORKS = [
  { icon: faBuilding, color: '#5b6b9e', bg: 'rgba(91, 107, 158, 0.12)', title: 'Tokenization', body: 'Property owners submit details, images, and ownership documents through the Tokenize form. An admin verifies the submission before it appears on the marketplace.' },
  { icon: faCoins, color: '#ff7a59', bg: 'rgba(255, 122, 89, 0.12)', title: 'Fractional Ownership', body: 'Each property is divided into a fixed number of tokens. Owning tokens represents a proportional share of that property.' },
  { icon: faExchangeAlt, color: '#16213e', bg: 'rgba(22, 33, 62, 0.08)', title: 'Trading Tokens', body: 'From your Portfolio, you can transfer tokens to another wallet address or sell them back for ETH, subject to available liquidity.' },
  { icon: faHandHoldingUsd, color: '#0d9488', bg: 'rgba(45, 212, 191, 0.14)', title: 'Rental Income', body: 'When a property earns real-world rental income, the admin distributes ETH to the contract, split proportionally among current token holders. Claim your share anytime from Portfolio.' }
];

const FAQS = [
  { q: 'Do I need to verify my identity?', a: 'Yes. Registration requires your name, email, a photo ID, and a selfie. An admin manually reviews and approves each registration before you can buy tokens or tokenize a property.' },
  { q: 'What is the minimum investment?', a: 'The minimum is the price of a single token, which is set individually by each property owner when they tokenize the property.' },
  { q: 'Can I sell my tokens whenever I want?', a: 'You can request a sale anytime, but the transaction depends on that property having enough ETH liquidity available to buy back your tokens.' },
  { q: 'How do I receive rental income?', a: 'When an admin distributes rental income for a property, it is split proportionally among all current token holders. You can claim your share from the Portfolio page whenever it becomes available.' },
  { q: 'Is my ID and selfie kept secure?', a: 'They are used solely by the platform admin to verify your identity before approving your registration.' },
  { q: 'What wallet do I need?', a: 'CeylonPropChain uses MetaMask for all wallet connections, purchases, and transfers.' },
  { q: 'What is the Investment Score?', a: 'It’s a machine-learning score calculated from historical location data — growth potential, price accessibility, market stability, and location trend — shown on each property’s detail page.' }
];

const SECTIONS = [
  { key: 'getting-started', label: 'Getting Started', icon: faRocket },
  { key: 'how-it-works', label: 'How It Works', icon: faBookOpen },
  { key: 'faq', label: 'FAQ', icon: faQuestionCircle },
  { key: 'contact', label: 'Contact', icon: faHeadset }
];

const Support = ({ setActiveTab }) => {
  const [section, setSection] = useState('getting-started');
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState('');
  const { setIsOpen: setChatOpen } = useChat();

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="support-page">
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '64px' }}>
        <button className="back-button" onClick={() => setActiveTab('home')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
        </button>

        <div className="mb-4">
          <span className="section-tag">Help Center</span>
          <h1 className="fw-bold mb-1" style={{ color: 'var(--bg-primary)' }}>How can we help?</h1>
          <p className="text-muted mb-0">Everything you need to know about investing in tokenized Sri Lankan real estate.</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-3">
            <div className="support-sidebar">
              {SECTIONS.map(s => (
                <button
                  key={s.key}
                  className={`support-nav-btn ${section === s.key ? 'active' : ''}`}
                  onClick={() => setSection(s.key)}
                >
                  <span className="support-nav-icon"><FontAwesomeIcon icon={s.icon} /></span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-lg-9">
            {section === 'getting-started' && (
              <div className="support-panel fade-in-item">
                <h2 className="support-heading">Getting Started</h2>
                <div className="timeline">
                  {STEPS.map((s, i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-marker"><FontAwesomeIcon icon={s.icon} /></div>
                      <div className="timeline-content">
                        <h4>{s.title}</h4>
                        <p>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'how-it-works' && (
              <div className="support-panel fade-in-item">
                <h2 className="support-heading">How It Works</h2>
                <div className="how-grid">
                  {HOW_IT_WORKS.map((h, i) => (
                    <div key={i} className="how-card">
                      <div className="how-icon" style={{ background: h.bg, color: h.color }}>
                        <FontAwesomeIcon icon={h.icon} />
                      </div>
                      <h4>{h.title}</h4>
                      <p>{h.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'faq' && (
              <div className="support-panel fade-in-item">
                <h2 className="support-heading">Frequently Asked Questions</h2>
                <div className="faq-search">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="faq-list">
                  {filteredFaqs.length === 0 ? (
                    <p className="faq-empty-note">No questions match "{search}".</p>
                  ) : filteredFaqs.map((f, i) => (
                    <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={f.q}>
                      <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span>{f.q}</span>
                        <FontAwesomeIcon icon={faChevronDown} className="faq-chevron" />
                      </button>
                      {openFaq === i && <div className="faq-answer">{f.a}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'contact' && (
              <div className="support-panel fade-in-item">
                <h2 className="support-heading">Contact & Support</h2>
                <div className="contact-hero">
                  <div className="contact-hero-icon"><FontAwesomeIcon icon={faComments} /></div>
                  <h3>Chat with our AI Investment Assistant</h3>
                  <p>Ask about tokenization, investment areas, fractional ownership, or how anything on the platform works — get instant answers.</p>
                  <button className="btn-primary" onClick={() => setChatOpen(true)}>
                    <FontAwesomeIcon icon={faComments} className="me-2" /> Open AI Assistant
                  </button>
                </div>
                <ul className="contact-checklist">
                  <li><FontAwesomeIcon icon={faCheck} /> Available anytime, no waiting for a human agent</li>
                  <li><FontAwesomeIcon icon={faCheck} /> Knows about tokenization, ML investment scores, and platform mechanics</li>
                  <li><FontAwesomeIcon icon={faCheck} /> For account-specific issues (verification, transactions), an admin reviews requests through the platform</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
