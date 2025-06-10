import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import axios from 'axios';
import { ethers } from 'ethers';
import PublicLicense from '../artifacts/contracts/PublicLicense.sol/PublicLicense.json';
import { PUBLIC_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import { FaCopy } from 'react-icons/fa';
import { issueAttestation } from '../eas/issue-attestation';

const IssueLicense = ({ account }) => {
  const location = useLocation();
  const certificateData = location.state; // Data passed from FacultyApplications

  const [proof, setProof] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    universityDID: '',
    studentDID: '',
    studentName: '',
    graduationYear: new Date().getFullYear(),
    degree: '',
    issuanceDate: new Date().toISOString().split('T')[0],
    studentEthAddress: ''
  });

  const [ipfsHash, setIpfsHash] = useState('');
  const [errors, setErrors] = useState({});

  // Predefined degree options
  const degreeOptions = [
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Information Technology',
    'Bachelor of Engineering',
    'Bachelor of Arts',
    'Master of Science in Computer Science',
    'Master of Business Administration',
    'Master of Engineering',
    'Doctor of Philosophy',
    'Bachelor of Science in Mathematics',
    'Bachelor of Science in Physics',
    'Bachelor of Science in Chemistry',
    'Bachelor of Science in Biology',
    'Other'
  ];

  useEffect(() => {
    // Auto-populate universityDID from session storage
    const walletAddress = sessionStorage.getItem('walletAddress');
    if (walletAddress) {
      setFormData(prev => ({
        ...prev,
        universityDID: `did:ethr:${walletAddress}`
      }));
    }

    // Auto-populate fields from passed certificate data
    if (certificateData) {
      setFormData(prev => ({
        ...prev,
        studentEthAddress: certificateData.studentAddress || '',
        studentDID: certificateData.studentAddress ? `did:ethr:${certificateData.studentAddress}` : '',
        studentName: certificateData.studentName || ''
      }));
    }

    // Check URL params as fallback (for direct links)
    const urlParams = new URLSearchParams(window.location.search);
    const studentAddress = urlParams.get('studentAddress');
    const studentName = urlParams.get('studentName');

    if (studentAddress && !certificateData) {
      setFormData(prev => ({
        ...prev,
        studentDID: `did:ethr:${studentAddress}`,
        studentEthAddress: studentAddress,
        studentName: studentName || ''
      }));
    }
  }, [certificateData]);

  const captureFile = (event) => {
    const selectedProof = event.target.files[0];
    setProof(selectedProof);
    console.log('Document selected:', selectedProof);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate studentDID when studentEthAddress changes
    if (name === 'studentEthAddress' && value) {
      setFormData(prev => ({
        ...prev,
        studentDID: `did:ethr:${value}`
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.universityDID.trim()) {
      newErrors.universityDID = 'University DID is required';
    }

    if (!formData.studentDID.trim()) {
      newErrors.studentDID = 'Student DID is required';
    } else if (!formData.studentDID.startsWith('did:ethr:')) {
      newErrors.studentDID = 'Student DID must start with "did:ethr:"';
    }

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required';
    } else if (formData.graduationYear < 1900 || formData.graduationYear > new Date().getFullYear() + 10) {
      newErrors.graduationYear = 'Please enter a valid graduation year';
    }

    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }

    if (!formData.issuanceDate) {
      newErrors.issuanceDate = 'Issuance date is required';
    }

    if (!formData.studentEthAddress.trim()) {
      newErrors.studentEthAddress = 'Student Ethereum address is required';
    } else if (!ethers.isAddress(formData.studentEthAddress)) {
      newErrors.studentEthAddress = 'Please enter a valid Ethereum address';
    }

    if (!proof) {
      newErrors.proof = 'Please select a proof document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processForm = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please fix the errors in the form before submitting.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', proof);
      uploadData.append('studentDID', formData.studentDID);

      // Upload the file and metadata to your server
      const result = await axios.post('http://localhost:8000/api/v1/proof', uploadData);
      console.log('File uploaded successfully:', result);
      setIpfsHash(result.data.ipfsHash.trim());

      // Use the browser's provider/signer (MetaMask)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Contract address", PUBLIC_LICENSE_CONTRACT_ADDRESS, PublicLicense.abi, signer);

      // Connect to your PublicLicense contract using the signer
      const contract = new ethers.Contract(
        PUBLIC_LICENSE_CONTRACT_ADDRESS,
        PublicLicense.abi,
        signer
      );

      console.log('Contract connected:', contract);

      // Create values object from form data
      const values = [
        { name: "universityDID", value: formData.universityDID, type: "string" },
        { name: "studentDID", value: formData.studentDID, type: "string" },
        { name: "studentName", value: formData.studentName, type: "string" },
        { name: "graduationYear", value: parseInt(formData.graduationYear), type: "uint256" },
        { name: "degree", value: formData.degree, type: "string" },
        { name: "issuanceDate", value: formData.issuanceDate, type: "string" },
        { name: "CID", value: result.data.ipfsHash.trim(), type: "string" },
      ];

      console.log('Creating attestation with values:', values);

      // Create the EAS attestation using the same signer and the values object
      const attestationUID = await issueAttestation(values, signer);
      console.log('Attestation UID:', attestationUID);

      // Call the contract to issue the license with the attestation UID
      const tx = await contract.issueLicense(
        attestationUID,
        result.data.ipfsHash.trim(),
        formData.studentEthAddress.trim()
      );

      setMessage('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();

      setMessage({
        type: 'success',
        text: `Public license issued successfully! Attestation UID: ${attestationUID}`,
        hash: receipt.transactionHash,
      });

      // Reset form after successful submission
      setFormData({
        universityDID: `did:ethr:${sessionStorage.getItem('walletAddress')}`,
        studentDID: '',
        studentName: '',
        graduationYear: new Date().getFullYear(),
        degree: '',
        issuanceDate: new Date().toISOString().split('T')[0],
        studentEthAddress: ''
      });
      setProof(null);

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
    <div className="mt-24 w-10/12 max-w-4xl flex flex-col items-center justify-center m-auto">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
        Issue Public License
        {certificateData && (
          <span className="block text-sm font-normal text-gray-600 mt-2">
            For: {certificateData.studentName} ({certificateData.studentAddress})
          </span>
        )}
      </h2>

      {/* Show application context if available */}
      {certificateData && (
        <div className="w-full mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Application Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-green-700">Student:</span>
              <span className="ml-2 text-green-900">{certificateData.studentName}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Email:</span>
              <span className="ml-2 text-green-900">{certificateData.studentEmail}</span>
            </div>
            <div>
              <span className="font-medium text-green-700">Attestation Type:</span>
              <span className="ml-2 text-green-900">{certificateData.attestationType}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-green-700">Ethereum Address:</span>
              <span className="ml-2 text-green-900 font-mono text-xs">{certificateData.studentAddress}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={processForm} className="w-full space-y-6 bg-white p-8 rounded-lg shadow-md">
        {/* University DID */}
        <div>
          <label htmlFor="universityDID" className="block text-sm font-medium text-gray-700 mb-2">
            University DID *
          </label>
          <input
            type="text"
            id="universityDID"
            name="universityDID"
            value={formData.universityDID}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.universityDID ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="did:ethr:0x..."
          />
          {errors.universityDID && <p className="text-red-500 text-sm mt-1">{errors.universityDID}</p>}
          <p className="text-gray-500 text-sm mt-1">Automatically populated from your wallet address</p>
        </div>

        {/* Student Ethereum Address */}
        <div>
          <label htmlFor="studentEthAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Student Ethereum Address *
          </label>
          <input
            type="text"
            id="studentEthAddress"
            name="studentEthAddress"
            value={formData.studentEthAddress}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.studentEthAddress ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="0x..."
          />
          {errors.studentEthAddress && <p className="text-red-500 text-sm mt-1">{errors.studentEthAddress}</p>}
        </div>

        {/* Student DID */}
        <div>
          <label htmlFor="studentDID" className="block text-sm font-medium text-gray-700 mb-2">
            Student DID *
          </label>
          <input
            type="text"
            id="studentDID"
            name="studentDID"
            value={formData.studentDID}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.studentDID ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="did:ethr:0x..."
          />
          {errors.studentDID && <p className="text-red-500 text-sm mt-1">{errors.studentDID}</p>}
          <p className="text-gray-500 text-sm mt-1">Automatically generated from student Ethereum address</p>
        </div>

        {/* Student Name */}
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
            Student Name *
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.studentName ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter student's full name"
          />
          {errors.studentName && <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>}
        </div>

        {/* Student Name */}
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
            Student Name *
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.studentName ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter student's full name"
          />
          {errors.studentName && <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>}
        </div>

        {/* Graduation Year */}
        <div>
          <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
            Graduation Year *
          </label>
          <input
            type="number"
            id="graduationYear"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleInputChange}
            min="1900"
            max={new Date().getFullYear() + 10}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.graduationYear ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.graduationYear && <p className="text-red-500 text-sm mt-1">{errors.graduationYear}</p>}
        </div>

        {/* Degree */}
        <div>
          <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
            Degree *
          </label>
          <select
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.degree ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Select a degree</option>
            {degreeOptions.map((degree, index) => (
              <option key={index} value={degree}>
                {degree}
              </option>
            ))}
          </select>
          {errors.degree && <p className="text-red-500 text-sm mt-1">{errors.degree}</p>}
        </div>

        {/* Issuance Date */}
        <div>
          <label htmlFor="issuanceDate" className="block text-sm font-medium text-gray-700 mb-2">
            Issuance Date *
          </label>
          <input
            type="date"
            id="issuanceDate"
            name="issuanceDate"
            value={formData.issuanceDate}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.issuanceDate ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.issuanceDate && <p className="text-red-500 text-sm mt-1">{errors.issuanceDate}</p>}
          <p className="text-gray-500 text-sm mt-1">Automatically set to today's date</p>
        </div>

        {/* Proof Document */}
        <div>
          <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-2">
            Proof Document *
          </label>
          <input
            type="file"
            id="proof"
            onChange={captureFile}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.proof ? 'border-red-500' : 'border-gray-300'
              }`}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {errors.proof && <p className="text-red-500 text-sm mt-1">{errors.proof}</p>}
          <p className="text-gray-500 text-sm mt-1">Upload supporting documentation (PDF, DOC, or image files)</p>
        </div>

        {/* IPFS Hash Display */}
        {ipfsHash && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IPFS Hash (CID)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={ipfsHash}
                readOnly
                className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(ipfsHash)}
                className="p-3 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <FaCopy />
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-1">Document uploaded to IPFS successfully</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Issue Public License'}
        </button>
      </form>

      {/* Messages */}
      {message && (
        <div className="mt-6 w-full space-y-4">
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`${message.type === 'success' ? 'text-green-700' : 'text-red-700'} break-words overflow-hidden`}>
              {message.text}
            </p>
          </div>

          {/* Transaction Hash */}
          {message.hash && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">Transaction Hash:</p>
                  <p className="text-sm font-mono break-words overflow-hidden text-gray-700">
                    {message.hash}
                  </p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(message.hash)}
                  className="ml-2 p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  title="Copy transaction hash"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Instructions */}
      <div className="mt-8 w-full bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Public License Instructions:</h3>
        <ul className="text-sm text-green-800 space-y-2">
          <li>• <strong>University DID:</strong> Automatically populated from your connected wallet</li>
          <li>• <strong>Student Address:</strong> Enter the student's Ethereum wallet address</li>
          <li>• <strong>Student DID:</strong> Automatically generated from the student's address</li>
          <li>• <strong>Student Name:</strong> Enter the full name as it should appear on the certificate</li>
          <li>• <strong>Graduation Year:</strong> The year the student graduated or will graduate</li>
          <li>• <strong>Degree:</strong> Select the appropriate degree from the dropdown</li>
          <li>• <strong>Issuance Date:</strong> Date when the certificate is being issued (defaults to today)</li>
          <li>• <strong>Proof Document:</strong> Upload supporting documentation (transcript, diploma, etc.)</li>
          <li>• <strong>Public License:</strong> This certificate will be publicly visible and verifiable on the blockchain</li>
        </ul>
      </div>
    </div>
  );
};

export default IssueLicense;
