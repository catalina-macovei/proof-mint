import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import IssueLicense from './components/IssueLicense';
import VerifyLicense from './components/VerifyLicense';
import RevokeLicense from './components/RevokeLicense';
import Navbar from './components/Navbar';
import HomePage from './components/Homepage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center mt-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/issue-license" element={<IssueLicense />} />
            <Route path="/verify-license" element={<VerifyLicense />} />
            <Route path="/revoke-license" element={<RevokeLicense />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
