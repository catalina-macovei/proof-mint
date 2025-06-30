import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ethers } from 'ethers';
import { PRIVATE_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import { getAttestation, decodeAttestationData } from '../eas/fetch_attestation_data';
import { HiMiniShieldCheck } from "react-icons/hi2";
import { RevokeLicenseButton } from './RevokeLicenseButton';
import PrivateLicense from '../artifacts/contracts/PrivateLicense.sol/PrivateLicense.json';
import { FaCopy } from 'react-icons/fa';
import IPFSFilePreview from './IPFSFilePreview';

const PrivateLicenseDetails = () => {
    const { easUID } = useParams();
    const [license, setLicense] = useState(null);
    const [attestation, setAttestation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (easUID) {
            fetchLicenseDetails();
        }
    }, [easUID]);


    const fetchLicenseDetails = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                PRIVATE_LICENSE_CONTRACT_ADDRESS,
                PrivateLicense.abi,
                provider
            );

            console.log("License Details uid:", easUID);
            const [ipfsCID, , studentDID, isValid, timestamp, proof] = await contract.getLicenseDetails(easUID, {
                gasLimit: 1000000 
            });

            if (!easUID) {
                setLoading(false);
                return;
            }
            setLicense({ isValid, studentDID, ipfsCID, easUID, proof, timestamp });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching license details:', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                    Attestation Details
                </h2>

                {loading ? (
                    <div className="text-center">Loading license details...</div>
                ) : license ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                Attestation Information
                            </h3>
                            <p className="text-md flex flex-row font-medium text-gray-600 dark:text-gray-300">
                                IPFS CID: {license.ipfsCID}
                            </p>
                            <p className="text-md font-medium text-gray-600 dark:text-gray-300">
                                Student DID: {license.studentDID}
                            </p>
                            <p className="text-md font-medium text-gray-600 dark:text-gray-300">
                                Status:{' '}
                                <span className={`font-bold ${license.isValid ? 'text-green-500' : 'text-red-500'}`}>
                                    {license.isValid ? 'Valid' : 'Revoked'}
                                </span>
                            </p>
                            {license.easUID && (
                                <p className="text-md font-medium text-gray-600 dark:text-gray-300">
                                    EAS UID: {license.easUID}
                                </p>
                            )}

                            <div className="p-4 bg-gray-100 rounded-lg">
                                <div className="bg-white p-3 rounded-md shadow-sm">
                                    <p className="text-sm font-mono break-words overflow-hidden text-gray-700">
                                        <strong>Multi-Proof JSON:</strong>
                                    </p>
                                    <pre className="p-2 bg-gray-200 rounded-md text-sm text-gray-800 overflow-x-auto">
                                        {(() => {
                                            try {
                                                let cleanedProof = license.proof;
                                                if (typeof cleanedProof === "string") {
                                                    cleanedProof = cleanedProof.replace(/\\n/g, "\n").replace(/\\"/g, '"');
                                                }

                                                if (cleanedProof.startsWith('"') && cleanedProof.endsWith('"')) {
                                                    cleanedProof = cleanedProof.slice(1, -1);
                                                }

                                                return <pre>{cleanedProof}</pre>;
                                            } catch (e) {
                                                console.error("Failed to process proof string:", e);
                                                return "Invalid proof format";
                                            }
                                        })()}
                                    </pre>

                                    <button
                                        onClick={() => {
                                            try {
                                                let cleanedProof = license.proof.replace(/\\n/g, "\n").replace(/\\"/g, '"');
                                                if (cleanedProof.startsWith('"') && cleanedProof.endsWith('"')) {
                                                    cleanedProof = cleanedProof.slice(1, -1);
                                                }
                                                navigator.clipboard.writeText(cleanedProof);
                                            } catch (e) {
                                                console.error("Failed to copy JSON");
                                            }
                                        }}
                                        className="mt-2 p-2 w-full text-gray-500 hover:text-blue-500 transition-colors flex justify-center items-center"
                                    >
                                        <FaCopy className="mr-2" /> Copy Proof JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                        <RevokeLicenseButton easUID={license.easUID} contractType="private" className="absolute"></RevokeLicenseButton>
                        {/* IPFS File Preview Section */}
                        {license.ipfsCID && (
                            <IPFSFilePreview cid={license.ipfsCID} />
                        )}
                    </div>
                ) : (
                    <div className="text-center text-red-500">License not found</div>
                )}
            </div>
        </div>
    );
};

export default PrivateLicenseDetails;
