import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MetaMaskLogin from './components/MetaMaskLogin';
import HomePage from './components/Homepage';
import Navbar from './components/Navbar';
import './App.css'
import FAQ from './components/FAQ';
import IssueLicense from './components/IssueLicense';
import RevokeLicense from './components/RevokeLicense';
import ViewAllLicenses from './components/ViewAllLicenses';

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

                    <Routes>
                        <Route path="/login" element={<MetaMaskLogin onLogin={handleLogin} />} />
                        <Route path="/" element={account ? <HomePage /> : <Navigate to="/login" />} />
                        <Route path="/faq" element={account ? <FAQ /> : <Navigate to="/login" />} />
                        <Route path="/issue-license" element={account ? <IssueLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path="/revoke-license" element={account ? <RevokeLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path="/licenses" element={account ? <ViewAllLicenses /> : <Navigate to="/login" />} />

                    </Routes>

                </div>
            </div>}
        </BrowserRouter>
    )
}

export default App
