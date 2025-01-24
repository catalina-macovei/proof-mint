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
    const selectedProof = event.target.files[0];
    setProof(selectedProof);
    console.log('Document selected:', selectedProof);
  };

  const processForm = async (event) => {
    event.preventDefault();
    
    const formattedDID = studentDID.startsWith('did:ethr:sepolia:') 
      ? studentDID 
      : `did:ethr:sepolia:${studentDID}`;
  
    // Extract the Ethereum address from the DID string
    const studentAddress = formattedDID.split(':').pop();
  
    try {
      const uploadData = new FormData();
      uploadData.append('file', proof);
      uploadData.append('studentDID', formattedDID);
  
      const result = await axios.post('http://localhost:8000/api/v1/proof', uploadData);
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LicenseManager.abi,
        signer
      );
  
      // Pass the IPFS hash and the extracted Ethereum address
      const tx = await contract.issueLicense(
        result.data.ipfsHash,
        studentAddress // Now passing just the Ethereum address
      );
      
      setMessage('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setMessage('License issued successfully! Transaction hash: ' + receipt.hash);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message);
    }
    setIsSubmitting(false);
  };
  

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Issue License</h2>
        
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

// did:ethr:sepolia:0xe83f39161c51b68ecc5edc09fe8c5fcb0359fed7
// Your DID: did:ethr:sepolia:0xb4baa0098fe8ff203c2a419a8bd24173e5f94eb1