// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import IssueLicense from './components/IssueLicense';
import VerifyLicense from './components/VerifyLicense';
import RevokeLicense from './components/RevokeLicense';
import Navbar from './components/Navbar';
import HomePage from './components/Homepage';
import ViewAllLicenses from './components/ViewAllLicenses';
import MetaMaskLogin from './MetaMaskLogin';
import LicenseServices from './components/LicenseServices';
import FAQ from './components/FAQ';
import 'cross-fetch/polyfill'


const App = () => {
  const [account, setAccount] = useState(null);
  const [did, setDid] = useState(null);

  // On mount, read stored account and DID from sessionStorage
  useEffect(() => {
    const storedAccount = sessionStorage.getItem('walletAddress');
    const storedDid = sessionStorage.getItem('did');
    if (storedAccount) {
      setAccount(storedAccount);
    }
    if (storedDid) {
      setDid(storedDid);
    }
  }, []);

  // Callback after a successful login
  const handleLogin = (walletAddress, newDid) => {
    setAccount(walletAddress);
    setDid(newDid);
    sessionStorage.setItem('walletAddress', walletAddress);
    sessionStorage.setItem('did', newDid);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar account={account} />
        {/* Center the routed content in the remaining space */}
        <div className="flex-grow flex items-center justify-center">
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<MetaMaskLogin onLogin={handleLogin} />} />

            {/* Protected routes: if not logged in, redirect to /login */}
            <Route path="/" element={account ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/licenses" element={account ? <ViewAllLicenses /> : <Navigate to="/login" />} />
            <Route path="/issue-license" element={account ? <IssueLicense account={account} /> : <Navigate to="/login" />} />
            <Route path="/verify-license" element={account ? <VerifyLicense account={account} /> : <Navigate to="/login" />} />
            <Route path="/revoke-license" element={account ? <RevokeLicense account={account} /> : <Navigate to="/login" />} />
            <Route path="/license-services" element={account ? <LicenseServices account={account} /> : <Navigate to="/login" />} />
            <Route path="/faq" element={account ? <FAQ /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
