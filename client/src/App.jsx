import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Welcome from './components/Welcome';
import Navbar from './components/Navbar';
import './App.css'
import FAQ from './components/FAQ';
import IssueLicense from './components/IssueLicense';
import ViewPublicLicenses from './components/ViewPublicLicenses';
import LicenseServices from './components/LicenseServices';
import VerifyLicense from './components/VerifyLicense';
import LicenseDetails from './components/LicenseDetails';
import IssuePrivateLicense from './components/IssuePrivateLicense';
import VerifyPrivateLicense from './components/VerifyPrivateLicense';
import WalletLogin from './components/WalletLogin';
import Services from './components/Services';
import Home from './components/Home';
import ViewPrivateLicenses from './components/ViewPrivateLicenses';
import PrivateLicenseDetails from './components/PrivateLicenseDetails';
import Portal from './components/Portal';
import Register from './components/Register';
import ApplicationForm from './components/ApplicationForm';
import StudentApplications from './components/StudentApplications';
import FacultyApplications from './components/FacultyApplications';


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
                        {/* Authentication */}
                        <Route path="/login" element={<WalletLogin onLogin={handleLogin} />} />
                        <Route path="/register" element={<Register/>} />
                        
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/welcome" element={<Welcome />} />
                        <Route path="/faq" element={ <FAQ />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/license-services" element={<LicenseServices/>} />
                        
                        {/* Protected Routes - Portal */}
                        <Route path='/portal' element={account ? <Portal/> : <Navigate to="/login" />} />
                        
                        {/* Protected Routes - Applications */}
                        <Route path='/apply' element={account ? <ApplicationForm/> : <Navigate to="/login" />} />
                        <Route path='/student-applications' element={account ? <StudentApplications/> : <Navigate to="/login" />} />
                        <Route path='/all-applications' element={account ? <StudentApplications/> : <Navigate to="/login" />} />
                        
                        {/* Protected Routes - Public Licenses/Attestations */}
                        <Route path="/issue-license" element={account ? <IssueLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path="/view-public-licenses" element={account ? <ViewPublicLicenses /> : <Navigate to="/login" />} />
                        <Route path="/verify-license" element={account ? <VerifyLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path="/license/:easUID" element={<LicenseDetails />} />
                        
                        {/* Protected Routes - Private Licenses/Attestations */}
                        <Route path="/issue-private-license" element={account ? <IssuePrivateLicense account={account} /> : <Navigate to="/login" />} />
                        <Route path='/view-private-licenses' element={account ? <ViewPrivateLicenses /> : <Navigate to="/login" />} />
                        <Route path="/verify-private-license" element={account ? <VerifyPrivateLicense /> : <Navigate to="/login" />} />
                        <Route path='/private-license/:easUID' element={<PrivateLicenseDetails />} />
                        <Route path='/faculty-applications' element={<FacultyApplications/>} />
                    </Routes>

                </div>
            </div>}
        </BrowserRouter>
    )
}

export default App
