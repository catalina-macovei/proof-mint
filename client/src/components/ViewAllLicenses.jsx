import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LicenseManager from '../artifacts/contracts/LicenseManager.sol/LicenseManager.json';
import { CONTRACT_ADDRESS } from '../config/contract';
import {Link } from 'react-router';


const ViewAllLicenses = () => {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                LicenseManager.abi,
                provider
            );

            const allLicenses = await contract.getAllLicenses();
            setLicenses(allLicenses);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching licenses:', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
            <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
                    All Licenses
                </h2>

                {loading ? (
                    <div className="text-center">Loading licenses...</div>
                ) : (
                    <div className="space-y-4 flex flex-col gap-2 ">
                        {licenses.map((license, index) => (
                            <Link to={`/license/${license.ipfsCID}`} key={index}>
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

export default ViewAllLicenses;
