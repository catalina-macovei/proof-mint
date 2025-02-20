import React, { useState } from 'react';
import { ethers } from 'ethers';
import LicenseManager from '../artifacts/contracts/LicenseManager.sol/LicenseManager.json';
import { CONTRACT_ADDRESS } from '../config/contract';

const RevokeLicense = () => {
    const [ipfsCID, setIpfsCID] = useState('');
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    const revokeLicense = async () => {
        if (!ipfsCID) {
            setError('Please enter an IPFS CID');
            return;
        }
    
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                LicenseManager.abi,
                signer
            );
    
            const tx = await contract.revokeLicense(ipfsCID);
            setTxHash(tx.hash);
            
            // Revoke Veramo credential
            await fetch(`http://localhost:8000/api/v1/revoke-license?cid=${ipfsCID}`);
            
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                setError('');
                alert('License revoked successfully!');
            }
        } catch (error) {
            console.error('Error revoking license:', error);
            setError('Error revoking license: ' + error.message);
        }
    };
    

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
            <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Revoke License</h2>

                <input
                    type="text"
                    placeholder="Enter IPFS CID"
                    value={ipfsCID}
                    onChange={(e) => setIpfsCID(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                    onClick={revokeLicense}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                >
                    Revoke License
                </button>

                {txHash && (
                    <p className="mt-4 text-green-500 font-medium truncate">
                        Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                            {txHash}
                        </a>
                    </p>
                )}

                {error && (
                    <p className="mt-4 text-red-500 font-medium">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RevokeLicense;
