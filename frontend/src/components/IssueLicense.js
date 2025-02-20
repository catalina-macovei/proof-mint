import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import LicenseManager from '../artifacts/contracts/LicenseManager.sol/LicenseManager.json';
import { CONTRACT_ADDRESS } from '../config/contract';
import { agent } from '../veramo/setup';

const IssueLicense = ({ account }) => {
  const [proof, setProof] = useState(null);
  const [studentDID, setStudentDID] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyDID = async (did) => {
    try {
      const formattedDID = did.startsWith('did:ethr:sepolia:') 
        ? did 
        : `did:ethr:sepolia:${did}`;
        
      const resolution = await agent.resolveDid({ didUrl: formattedDID });
      return resolution.didDocument !== null;
    } catch (error) {
      return false;
    }
  };

  const captureFile = (event) => {
    setProof(event.target.files[0]);
  };

  const processForm = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    if (!proof) {
      setMessage('Please upload a file.');
      setIsSubmitting(false);
      return;
    }

    let formattedDID = studentDID.startsWith('did:ethr:sepolia:') 
      ? studentDID 
      : `did:ethr:sepolia:${studentDID}`;

    console.log('Formatted DID:', formattedDID);

    // Verify the DID
    const isValidDID = await verifyDID(formattedDID);
    if (!isValidDID) {
      setMessage('Invalid DID format or DID not found.');
      setIsSubmitting(false);
      return;
    }

    // Extract Ethereum address from DID
    let studentAddress = formattedDID.split(':').pop();
    try {
      studentAddress = ethers.getAddress(studentAddress); // Validate Ethereum address
    } catch (error) {
      setMessage('Invalid Ethereum address extracted from DID.');
      setIsSubmitting(false);
      return;
    }

    console.log('Student Ethereum Address:', studentAddress);

    try {
      // Upload proof file to IPFS backend
      const uploadData = new FormData();
      uploadData.append('file', proof);
      uploadData.append('studentDID', formattedDID);

      const result = await axios.post('http://localhost:8000/api/v1/proof', uploadData);
      console.log('IPFS Response:', result.data);
      
      const cidString = typeof result.data.cid === 'object' ? result.data.cid['/'] || JSON.stringify(result.data.cid) : result.data.cid;
      console.log('Extracted CID:', cidString);
      

      console.log('IPFS CID:', cidString);

      if (!window.ethereum) {
        setMessage('Please install MetaMask.');
        setIsSubmitting(false);
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, LicenseManager.abi, signer);

      console.log('Sending transaction...');
      const tx = await contract.issueLicense(cidString, studentAddress);
      console.log('Transaction submitted. Hash:', tx.hash);

      setMessage('Transaction submitted. Waiting for confirmation...');

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 1) {
        setMessage(`License issued successfully! Tx: ${receipt.hash}`);
      } else {
        setMessage('Transaction failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.reason || error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
          Issue License
        </h2>
        
        <form onSubmit={processForm} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Student DID"
              value={studentDID}
              onChange={(e) => setStudentDID(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div>
            <input
              type="file"
              onChange={captureFile}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isSubmitting ? 'Processing...' : 'Issue License'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueLicense;
