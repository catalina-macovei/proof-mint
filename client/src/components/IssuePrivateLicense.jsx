import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import LicenseManager from '../artifacts/contracts/LicenseManager.sol/LicenseManager.json';
import { CONTRACT_ADDRESS } from '../config/contract';
import { FaCopy } from 'react-icons/fa';
import { createAttestation, verifyProof } from '../eas/merkel_private_attestation';

const IssuePrivateLicense = ({ account }) => {
  const [proof, setProof] = useState(null);
  const [studentDID, setStudentDID] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureFile = (event) => {
    const selectedProof = event.target.files[0];
    setProof(selectedProof);
    console.log('Document selected:', selectedProof);
  };

  const processForm = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formattedDID = studentDID.startsWith('did:ethr:')
      ? studentDID
      : `did:ethr:${studentDID}`;
    const studentAddress = formattedDID.split(':').pop();

    try {
      const uploadData = new FormData();
      uploadData.append('file', proof);
      uploadData.append('studentDID', formattedDID);

      // Upload the file and metadata to your server
      const result = await axios.post('http://localhost:8000/api/v1/proof', uploadData);

      console.log('File uploaded successfully:', result);

      // Use the browser's provider/signer (MetaMask)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Contract address", CONTRACT_ADDRESS,
        LicenseManager.abi,
        signer);

      // Connect to your LicenseManager contract using the signer
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LicenseManager.abi,
        signer
      );

      console.log('Contract connected:', contract);

      console.log('calling args:', result.data.ipfsHash.trim(),
        studentAddress.trim());

      // Define a values object for your attestation.
      const values = [
        { name: "universityDID", value: "did:ethr:0xb4baa0098fe8ff203c2a419a8bd24173e5f94eb1", type: "string" },
        { name: "studentDID", value: "did:ethr:0xe83F39161C51B68ecC5eDC09Fe8C5FCb0359FED7", type: "string" },
        { name: "studentName", value: "Test Name", type: "string" },
        { name: "graduationYear", value: 2024, type: "uint256" },
        { name: "degree", value: "Test Degree", type: "string" },
        { name: "issuanceDate", value: "2024-01-01", type: "string" },
        { name: "CID", value: "QmTestCID", type: "string" },
      ];

      // Create the EAS attestation using the same signer and the values object
      const {attestationUID, multiProofJson} = await createAttestation(signer, values);
      console.log('Attestation UID:', attestationUID);
      console.log('Proof:', multiProofJson);

      const res = await verifyProof(signer, attestationUID, multiProofJson);
      console.log('Proof verified:', res);


      // Call the contract to issue the license with the attestation UID
      const tx = await contract.issueLicense(
        result.data.ipfsHash.trim(),
        attestationUID, // Pass the attestationUID here
        studentAddress.trim()
      );

      setMessage('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();

      setMessage({
        type: 'success',
        text: `License issued successfully! Attestation UID: ${attestationUID}`,
        hash: receipt.transactionHash, // Ensure you're using the correct field
        multiProofJson: multiProofJson,
      });

    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: error.message,
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Issue Private License</h2>

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
          <div className="mt-4 space-y-2">
            <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={message.type === 'success' ? 'text-green-700 break-words overflow-hidden' : 'text-red-700 break-words overflow-hidden'}>
                {message.text}
              </p>
            </div>
            {message.hash && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm font-mono break-words overflow-hidden text-gray-700">
                    {message.hash}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(message.hash)}
                    className="ml-2 p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            )}
                {message.multiProofJson && (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm font-mono break-words overflow-hidden text-gray-700">
                        <strong>Multi-Proof JSON:</strong>
                    </p>
                    <pre className="p-2 bg-gray-200 rounded-md text-sm text-gray-800 overflow-x-auto">
                        {message.multiProofJson}
                    </pre>
                    <button
                        onClick={() => navigator.clipboard.writeText(message.multiProofJson)}
                        className="mt-2 p-2 w-full text-gray-500 hover:text-blue-500 transition-colors flex justify-center items-center"
                    >
                        <FaCopy className="mr-2" /> Copy Proof JSON
                    </button>
                    </div>
                </div>
                )}
          </div>
        )}

      </div>
    </div>
  );
};

export default IssuePrivateLicense;
