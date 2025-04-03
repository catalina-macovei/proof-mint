import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ethers } from 'ethers';
import { PUBLIC_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import { getAttestation, decodeAttestationData } from '../eas/fetch_attestation_data';
import { HiMiniShieldCheck } from "react-icons/hi2";
import { RevokeLicenseButton } from './RevokeLicenseButton';
import PublicLicense from '../artifacts/contracts/PublicLicense.sol/PublicLicense.json';


const LicenseDetails = () => {
    const { easUID } = useParams();
    const [license, setLicense] = useState(null);
    const [attestation, setAttestation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only fetch license details if easUID is available
        if (easUID) {
            fetchLicenseDetails();
        }
    }, [easUID]);

    const formatAttestationData = async (attestationArray) => {
        const decodedData = await decodeAttestationData(attestationArray[9]);
        return {
            uid: attestationArray[0],
            schema: attestationArray[1],
            time: new Date(Number(attestationArray[2]) * 1000).toLocaleString(),
            expirationTime:
                Number(attestationArray[3]) === 0
                    ? 'No expiration'
                    : new Date(Number(attestationArray[3]) * 1000).toLocaleString(),
            revocationTime: Number(attestationArray[4]),
            refUID: attestationArray[5],
            attester: attestationArray[6],
            recipient: attestationArray[7],
            revocable: attestationArray[8],
            data: decodedData
        };
    };

    const fetchLicenseDetails = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                PUBLIC_LICENSE_CONTRACT_ADDRESS,
                PublicLicense.abi,
                provider
            );

            console.log("License Details uid:" ,easUID);
    
            // Fetch full license details using easUID (directly from useParams)
            const [ipfsCID, , studentDID, isValid, timestamp] = await contract.getLicenseDetails(easUID);
    
            
    
            if (!easUID) {
                setLoading(false);
                return;
            }

            // Store license details in state
            setLicense({ isValid, studentDID, ipfsCID, easUID });

            let attestationData = null;
            const fetchedAttestation = await getAttestation(easUID);

            console.log("Raw attestation:", fetchedAttestation);
            if (fetchedAttestation) {
                // Convert the Proxy object to an array
                const attestationArray = Array.from(fetchedAttestation);
                attestationData = await formatAttestationData(attestationArray);
                console.log("Formatted attestation:", attestationData);
            }

            setAttestation(attestationData);
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
                    License Details
                </h2>


                {loading ? (
                    <div className="text-center">Loading license details...</div>
                ) : license ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                License Information
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
                        </div>

                        {attestation && (
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center">
                                    Digital Certificate Details
                                </h3>

                                <div className="p-4 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                            Attestation Details
                                        </h2>
                                        <HiMiniShieldCheck className="text-yellow-500 text-2xl" />
                                    </div>
                                    <div className="flex flex-col text-gray-700 dark:text-gray-300 text-sm ">
                                        <div className="flex flex-row gap-1">
                                            <strong className="w-28 text-left">UID:</strong>
                                            <span className="text-left truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">{attestation.uid}</span>
                                        </div>
                                        <div className="flex">
                                            <strong className="text-left w-28">Schema:</strong>
                                            <span className="text-left truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">{attestation.schema}</span>
                                        </div>
                                        <div className="flex">
                                            <strong className="text-left w-28">Time:</strong>
                                            <span className="text-left truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">{attestation.time}</span>
                                        </div>
                                        <div className="text-left flex">
                                            <strong className=" text-left w-28">Expiration:</strong>
                                            <span className="text-left truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">{attestation.expirationTime}</span>
                                        </div>
                                        <div className="flex">
                                            <strong className="text-left w-28">Revocable:</strong>
                                            <span className='text-left'>{attestation.revocable ? "Yes" : "No"}</span>
                                        </div>

                                        <h3 className="text-xl text-left font-medium mt-3 text-gray-900 dark:text-white">Data:</h3>
                                        <div className="p-3 border text-left border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-sm">
                                            <div className="flex">
                                                <strong className="w-28">Issuer:</strong>
                                                <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">{attestation.data.issuer}</span>
                                            </div>
                                            <div className="flex">
                                                <strong className="w-28">Recipient:</strong>
                                                <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">{attestation.data.recipient}</span>
                                            </div>
                                            <div className="flex">
                                                <strong className="w-28">Name:</strong>
                                                <span>{attestation.data.name}</span>
                                            </div>
                                            <div className="flex">
                                                <strong className="w-28">Year:</strong>
                                                <span>{attestation.data.year}</span>
                                            </div>
                                            <div className="flex">
                                                <strong className="w-28">Degree:</strong>
                                                <span>{attestation.data.degree}</span>
                                            </div>
                                            <div className="flex">
                                                <strong className="w-28">Date:</strong>
                                                <span>{attestation.data.date}</span>
                                            </div>
                                            <div className="flex">
                                                <strong className="w-28">CID:</strong>
                                                <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">{attestation.data.cid}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <RevokeLicenseButton ipfsCID={license.ipfsCID} className="absolute"></RevokeLicenseButton>

                    </div>
                ) : (
                    <div className="text-center text-red-500">License not found</div>
                )}
            </div>
        </div>
    );
};

export default LicenseDetails;
