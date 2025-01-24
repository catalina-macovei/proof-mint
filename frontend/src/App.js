import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { agent } from './veramo/setup';
import IssueLicense from './components/IssueLicense';
import VerifyLicense from './components/VerifyLicense';
import RevokeLicense from './components/RevokeLicense';
import CreateDID from './components/CreateDID';
import Navbar from './components/Navbar';
import HomePage from './components/Homepage';

function App() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [didDoc, setDidDoc] = useState(null);

  const resolve = async () => {
    const doc = await agent.resolveDid({
      didUrl: 'did:ethr:sepolia:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
    });
    setDidDoc(doc);
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Failed to connect:", error);
      } finally {
        setLoading(false);
      }
    } else {
      window.alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    resolve();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col dark:bg-gray-900">
        <Navbar 
          account={account} 
          onConnect={handleConnectWallet}
          loading={loading}
        />
        <div className="flex justify-center items-center mt-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-did" element={<CreateDID didDoc={didDoc} />} />
            <Route path="/issue-license" element={<IssueLicense account={account} />} />
            <Route path="/verify-license" element={<VerifyLicense account={account} />} />
            <Route path="/revoke-license" element={<RevokeLicense account={account} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
