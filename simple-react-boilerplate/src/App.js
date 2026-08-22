import React, { useState, useEffect } from 'react';
import { WalletProvider } from './context/WalletContext';
import { UserProvider } from './context/UserContext';
import { AppProvider } from './context/AppContext';
import { ChatProvider, useChat } from './context/ChatContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatWidget from './components/ChatWidget/ChatWidget';
import PropertyStatusNotifications from './components/PropertyStatusNotifications/PropertyStatusNotifications';
import Home from './pages/Home/Home';
import Marketplace from './pages/Marketplace/Marketplace';
import TokenizeProperty from './pages/Tokenize/TokenizeProperty';
import Portfolio from './pages/Portfolio/Portfolio';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PropertyDetails from './pages/PropertyDetails/PropertyDetails';
import Transactions from './pages/Transactions/Transactions';
import VerifyCertificate from './pages/Verify/VerifyCertificate';
import './index.css';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const { setIsOpen: setChatOpen } = useChat();

  const viewPropertyDetails = (apartmentId) => {
    setSelectedApartmentId(apartmentId);
    setActiveTab('property-details');
  };


  useEffect(() => {
    setChatOpen(false);
  }, [activeTab, setChatOpen]);

  return (
    <div className="app">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div key={activeTab} className="page-transition">
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'browse' && <Marketplace onViewDetails={viewPropertyDetails} />}
        {activeTab === 'property-details' && <PropertyDetails apartmentId={selectedApartmentId} setActiveTab={setActiveTab} />}

        {activeTab === 'portfolio' && <Portfolio setActiveTab={setActiveTab} />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'admin' && <AdminDashboard setActiveTab={setActiveTab} />}
      </div>

      {activeTab === 'home' && <Footer setActiveTab={setActiveTab} />}

      <PropertyStatusNotifications />
      <ChatWidget />
    </div>
  );
};

function App() {
  const isVerify = new URLSearchParams(window.location.search).get('verify') === '1';
  if (isVerify) {
    return <VerifyCertificate />;
  }

  return (
    <WalletProvider>
      <UserProvider>
        <AppProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </AppProvider>
      </UserProvider>
    </WalletProvider>
  );
}

export default App;