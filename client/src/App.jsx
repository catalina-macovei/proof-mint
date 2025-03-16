import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MetaMaskLogin from './components/MetaMaskLogin';
import Welcome from './components/Welcome';
import Navbar from './components/Navbar';
import './App.css'
import FAQ from './components/FAQ';
import IssueLicense from './components/IssueLicense';
import ViewAllLicenses from './components/ViewAllLicenses';
import LicenseServices from './components/LicenseServices';
import VerifyLicense from './components/VerifyLicense';
import LicenseDetails from './components/LicenseDetails';
import IssuePrivateLicense from './components/IssuePrivateLicense';
import VerifyPrivateLicense from './components/VerifyPrivateLicense';
import WalletLogin from './components/WalletLogin';
import Services from './components/Services';
import Home from './components/Home';

function App() {
    const [account, setAccount] = useState(null);
    const [count, setCount] = useState(0);
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
        <BrowserRouter>
            {<div className="min-h-screen flex flex-col">
                <Navbar account={account} />
                <div className="flex-grow flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-violet-300 via-white to-blue-300 opacity-20 blur-3xl z-[-1]"></div>

                    <Routes>
                        {/* <Route path="/login" element={<MetaMaskLogin onLogin={handleLogin} />} /> */}
                        <Route path="/login" element={<WalletLogin onLogin={handleLogin} />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/welcome" element={<Welcome />} />
                        <Route path="/faq" element={ <FAQ />} />
                        <Route path="/issue-license" element={account ? <IssueLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path="/licenses" element={account ? <ViewAllLicenses /> : <Navigate to="/login" />} />
                        <Route path="/verify-license" element={account ? <VerifyLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path="/license-services" element={<LicenseServices/>} />
                        <Route path="/license/:ipfsCID" element={<LicenseDetails />} />
                        <Route path="/issue-private-license" element={account ? <IssuePrivateLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path="/verify-private-license" element={account ? <VerifyPrivateLicense /> : <Navigate to="/login" />} />
                        <Route path="/services" element={<Services />} />          
                    </Routes>

                </div>
            </div>}
        </BrowserRouter>
    )
}

export default App
