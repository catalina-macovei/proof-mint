import React, { useState } from 'react';
import { ethers } from 'ethers';
import PublicLicense from '../artifacts/contracts/PublicLicense.sol/PublicLicense.json';
import PrivateLicense from '../artifacts/contracts/PrivateLicense.sol/PrivateLicense.json';
import { PUBLIC_LICENSE_CONTRACT_ADDRESS, PRIVATE_LICENSE_CONTRACT_ADDRESS } from '../config/contract';

const RevokeLicenseButton = ({ easUID, contractType = 'public' }) => {
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const getContractConfig = () => {
        switch (contractType) {
            case 'public':
                return {
                    address: PUBLIC_LICENSE_CONTRACT_ADDRESS,
                    abi: PublicLicense.abi
                };
            case 'private':
                return {
                    address: PRIVATE_LICENSE_CONTRACT_ADDRESS,
                    abi: PrivateLicense.abi
                };
            default:
                console.error('Invalid contract type:', contractType);
                return null;
        }
    };

        const extractErrorMessage = (error) => {
        // Check for user rejection first
        if (error.code === 'ACTION_REJECTED' || error.message?.includes('user rejected')) {
            return 'Transaction was rejected by user';
        }
        
        // Check for insufficient funds
        if (error.message?.includes('insufficient funds')) {
            return 'Insufficient funds for transaction';
        }
        
        // Check if it's a contract revert with a custom reason
        if (error.reason && typeof error.reason === 'string' && !error.reason.includes('CALL_EXCEPTION')) {
            return error.reason;
        }
        
        // For any other error (including the technical one you showed), return generic message
        return 'Failed to revoke license. Please try again.';
    };



    const revokeLicense = async () => {
        try {
            if (!easUID) {
                setError('EAS UID is required');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const contractConfig = getContractConfig();
            if (!contractConfig) {
                setError('Invalid contract configuration');
                return;
            }

            const contract = new ethers.Contract(contractConfig.address, contractConfig.abi, signer);
    
            console.log('Revoking license with EAS UID:', easUID);
            console.log('Contract type:', contractType);
            console.log('Contract address:', contractConfig.address);

            const tx = await contract.revokeLicense(easUID, {
            gasLimit: 1000000 
            });
            setTxHash(tx.hash);
            
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                setError('');
                setSuccess(true);
            }
        } catch (error) {
            console.error('Error revoking license:', error);
            const cleanErrorMessage = extractErrorMessage(error);
            setError(cleanErrorMessage);
            setSuccess(false);
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

            {success && (
                <p className="mt-2 text-green-500 text-sm font-medium">
                    License revoked successfully!
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
