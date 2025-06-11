import React, { useState } from 'react';
import { ethers } from 'ethers';
import LicenseManager from '../artifacts/contracts/LicenseManager.sol/LicenseManager.json';
import { CONTRACT_ADDRESS } from '../config/contract';

const RevokeLicenseButton = ({ ipfsCID }) => {
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    const revokeLicense = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, LicenseManager.abi, signer);
    
            const tx = await contract.revokeLicense(ipfsCID);
            setTxHash(tx.hash);
            
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
        <div className="mb-4">
            <button
                onClick={revokeLicense}
                className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
            >
                Revoke Attestation
            </button>

            {txHash && (
                <p className="mt-2 text-green-500 text-sm truncate">
                    Transaction: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                        {txHash}
                    </a>
                </p>
            )}

            {error && (
                <p className="mt-2 text-red-500 text-sm">
                    {error}
                </p>
            )}
        </div>
    );
};

export { RevokeLicenseButton };
