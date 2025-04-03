import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PrivateLicense from '../artifacts/contracts/PrivateLicense.sol/PrivateLicense.json';
import { PRIVATE_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import { Link } from 'react-router';

const ViewPrivateLicenses = () => {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                PRIVATE_LICENSE_CONTRACT_ADDRESS,
                PrivateLicense.abi,
                signer
            );

            let fetchedLicenses = [];

            try {
                // Try fetching all licenses (admin-only)
                fetchedLicenses = await contract.getAllLicenses();
            } catch (error) {
                console.warn("Admin access denied or transaction reverted. Trying per-user fetch...");
                const userAddress = await signer.getAddress();
                const formattedAddress = ethers.getAddress(userAddress.trim());

                // Call getLicensesByDID instead
                const [easUIDs, ipfsCIDs, isValidArray, timestamps] = await contract.getLicensesByDID(formattedAddress);

                if (easUIDs.length > 0) {
                    fetchedLicenses = easUIDs.map((easUID, index) => ({
                        easUID,
                        ipfsCID: ipfsCIDs[index],
                        studentDID: formattedAddress,
                        isValid: isValidArray[index],
                        timestamp: timestamps[index],
                    }));
                }
            }

            console.log("Final Licenses:", fetchedLicenses);
            setLicenses(fetchedLicenses);
        } catch (error) {
            console.error("Error fetching licenses:", error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-10">
            <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                    All Licenses
                </h2>

                {loading ? (
                    <div className="text-center">Loading licenses...</div>
                ) : licenses.length === 0 ? (
                    <div className="text-center text-red-500 font-semibold">
                        No licenses found
                    </div>
                ) : (
                    <div className="space-y-4 flex flex-col gap-2">
                        {licenses.map((license, index) => (
                            <Link to={`/private-license/${license.easUID}`} key={index}>
                                <div key={index} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        CID: {license.ipfsCID}
                                    </p>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Student DID: {license.studentDID}
                                    </p>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Status: {license.isValid ? 'Valid' : 'Revoked'}
                                    </p>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        EAS certificate: {license.easUID}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ViewPrivateLicenses;
