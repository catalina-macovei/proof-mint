import React, { useState } from 'react';
import { ethers } from 'ethers';
import { verifyProof } from '../eas/merkel_private_attestation';
import { PRIVATE_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import PrivateLicense from '../artifacts/contracts/PrivateLicense.sol/PrivateLicense.json';

const VerifyPrivateLicense = () => {
    const [attestationUID, setAttestationUID] = useState('');
    const [multiProofJson, setMultiProofJson] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [contractVerificationResult, setContractVerificationResult] = useState(null);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        if (!attestationUID || !multiProofJson) {
            setError("Please enter all required fields.");
            return;
        }
    
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
    
            let cleanedAttestationUID = attestationUID.trim();
            if (!cleanedAttestationUID.startsWith("0x")) {
                cleanedAttestationUID = "0x" + cleanedAttestationUID;
            }
    
            if (!ethers.isHexString(cleanedAttestationUID)) {
                setError("Invalid Attestation UID format.");
                return;
            }
    
            let parsedMultiProof;
            
            if (typeof multiProofJson === "string") {
                try {
                    parsedMultiProof = JSON.parse(multiProofJson);
                    if (typeof parsedMultiProof !== "object" || parsedMultiProof === null) {
                        throw new Error("Parsed JSON is not an object.");
                    }
                } catch (e) {
                    setError("Invalid JSON format for multiProofJson.");
                    console.error("JSON Parse Error:", e.message);
                    return;
                }
            } else if (typeof multiProofJson === "object") {
                parsedMultiProof = multiProofJson;
            } else {
                setError("multiProofJson must be a valid JSON object.");
                return;
            }
    
            // **Ensure it is stringified before passing**
            const stringifiedProof = JSON.stringify(parsedMultiProof);
    
            console.log("Final MultiProof JSON String:", stringifiedProof);
    
            // Step 1: Verify the cryptographic proof
            const proofResult = await verifyProof(signer, cleanedAttestationUID, stringifiedProof);
            setVerificationResult(proofResult);
            
            // Step 2: Check attestation status on the private license contract
            // Uncomment and modify these lines once you have the private license contract setup
            
            const contract = new ethers.Contract(
                PRIVATE_LICENSE_CONTRACT_ADDRESS,
                PrivateLicense.abi,
                provider
            );

            // Assuming your private license contract has a method to check attestation status
            // You'll need to adjust the method name based on your actual contract
            const [isValid, studentDID] = await contract.verifyLicense(cleanedAttestationUID, {
                gasLimit: 1000000
            });
            
            setContractVerificationResult({
                isValid,
                studentDID
            });
            
            
            setError("");
        } catch (err) {
            setError("Error verifying proof: " + err.message);
            console.error(err);
        }
    };
    
    // Determine overall verification status
    const getOverallStatus = () => {
        if (verificationResult === null) return null;
        
        // If contract verification is implemented, both must be true
        if (contractVerificationResult !== null) {
            return verificationResult && contractVerificationResult.isValid;
        }
        
        // If only proof verification is done
        return verificationResult;
    };

    const overallStatus = getOverallStatus();
    
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-10">
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                    Verify Private Attestation
                </h2>

                <input
                    type="text"
                    placeholder="Enter Attestation UID"
                    value={attestationUID}
                    onChange={(e) => setAttestationUID(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                />

                <textarea
                    placeholder="Enter JSON proof"
                    value={multiProofJson}
                    onChange={(e) => setMultiProofJson(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32"
                />

                <button
                    onClick={handleVerify}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Verify Proof
                </button>

                {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
                
                {/* Overall Verification Result */}
                {overallStatus !== null && (
                    <div className={`mt-4 p-4 rounded-lg ${overallStatus ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        <p className={`text-lg font-medium ${overallStatus ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                            Verification Result: {overallStatus ? 'Valid' : 'Invalid'}
                        </p>
                    </div>
                )}

                {/* Detailed Results */}
                {verificationResult !== null && (
                    <div className="mt-4 space-y-2">
                        <div className={`p-3 rounded-lg ${verificationResult ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50'}`}>
                            <p className={`text-sm font-medium ${verificationResult ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                Cryptographic Proof: {verificationResult ? 'Valid' : 'Invalid'}
                            </p>
                        </div>
                        
                        {contractVerificationResult !== null && (
                            <div className={`p-3 rounded-lg ${contractVerificationResult.isValid ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50'}`}>
                                <p className={`text-sm font-medium ${contractVerificationResult.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                    Contract Status: {contractVerificationResult.isValid ? 'Valid (Not Revoked)' : 'Invalid (Revoked)'}
                                </p>
                                {contractVerificationResult.studentDID && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Student DID: {contractVerificationResult.studentDID}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default VerifyPrivateLicense;
