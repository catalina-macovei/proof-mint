import React, { useState } from 'react';
import { ethers } from 'ethers';
import LicenseManager from '../artifacts/contracts/LicenseManager.sol/LicenseManager.json';
import { CONTRACT_ADDRESS } from '../config/contract';

const VerifyLicense = () => {
    const [ipfsCID, setIpfsCID] = useState('');
    const [isLicenseValid, setIsLicenseValid] = useState(null);
    const [licenseStudentDID, setLicenseStudentDID] = useState('');
    const [credential, setCredential] = useState(null);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!ipfsCID) {
            setError('Please enter an IPFS CID');
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                LicenseManager.abi,
                provider
            );

            const [isValid, studentDID] = await contract.verifyLicense(ipfsCID);
            
            setIsLicenseValid(isValid);
            setLicenseStudentDID(studentDID);
            setError('');
        } catch (err) {
            setError('Error verifying license: ' + err.message);
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-10">
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                    Verify Public Attestation
                </h2>

                <input
                    type="text"
                    placeholder="Enter IPFS CID"
                    value={ipfsCID}
                    onChange={(e) => setIpfsCID(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                />

                <button
                    onClick={handleVerify}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Verify 
                </button>

                {error && (
                    <p className="mt-4 text-red-500 font-medium">{error}</p>
                )}

                {isLicenseValid !== null && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-lg font-medium">
                            Status: <span className={isLicenseValid ? "text-green-500" : "text-red-500"}>
                                {isLicenseValid ? "Valid" : "Invalid"}
                            </span>
                        </p>
                        <p className="text-md mt-2 break-all">
                            Student DID: {licenseStudentDID}
                        </p>
                    </div>
                )}

                {credential && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Verifiable Credential:</h3>
                        <pre className="overflow-auto text-sm">
                            {JSON.stringify(credential, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};


export default VerifyLicense;
