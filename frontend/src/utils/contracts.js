import { ethers } from 'ethers';
import LicenseManager from './LicenseManager.json';

// Function to initialize and validate the contract
const initializeContract = () => {
    try {
        // Validate environment variables
        if (!process.env.REACT_APP_SEPOLIA_RPC_URL) {
            throw new Error("Missing REACT_APP_SEPOLIA_RPC_URL in environment variables.");
        }
        if (!process.env.REACT_APP_PRIVATE_KEY) {
            throw new Error("Missing REACT_APP_PRIVATE_KEY in environment variables.");
        }
        if (!process.env.REACT_APP_CONTRACT_ADDRESS) {
            throw new Error("Missing REACT_APP_CONTRACT_ADDRESS in environment variables.");
        }

        // Initialize provider
        const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC_URL);

        // Validate and normalize private key
        const privateKey = process.env.REACT_APP_PRIVATE_KEY.startsWith('0x')
            ? process.env.REACT_APP_PRIVATE_KEY
            : `0x${process.env.REACT_APP_PRIVATE_KEY}`;

        if (!ethers.isHexString(privateKey, 32)) {
            throw new Error("Invalid private key format.");
        }

        // Initialize wallet and signer
        const signer = new ethers.Wallet(privateKey, provider);

        // Validate contract address
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        if (!ethers.isAddress(contractAddress)) {
            throw new Error(`Invalid contract address: ${contractAddress}`);
        }

        // Initialize contract instance
        const contract = new ethers.Contract(contractAddress, LicenseManager.abi, signer);

        console.log("Contract successfully initialized:", contract);
        return contract;
    } catch (error) {
        console.error("Error initializing contract:", error.message);
        throw error; // Re-throw the error for upstream handling
    }
};

// Export a hook for using the contract
export const useContract = () => {
    try {
        const contract = initializeContract();
        return contract;
    } catch (error) {
        console.error("Unable to use contract:", error.message);
        return null; 
    }
};
