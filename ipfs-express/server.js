import express from 'express';
import multer from 'multer';
import { Blob } from 'buffer'; 
import cors from 'cors';
import dotenv from 'dotenv';
import W3client from './w3client.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const LicenseManager = require('../artifacts/contracts/LicenseManager.sol/LicenseManager.json');

dotenv.config();

console.log('Environment variables loaded:', {
    hasRpcUrl: !!process.env.SEPOLIA_RPC_URL,
    hasPrivateKey: !!process.env.PRIVATE_KEY,
    hasContractAddress: !!process.env.CONTRACT_ADDRESS
});


// After your imports
console.log('Contract ABI:', LicenseManager.abi ? 'Loaded' : 'Not loaded');
console.log('Contract Address:', process.env.CONTRACT_ADDRESS);

// Initialize contract with explicit values
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : `0x${process.env.PRIVATE_KEY}`;


const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    LicenseManager.abi,
    signer
);

const application = express();
const port = 8000;

const w2client = new W3client();  
await w2client.init();

application.use(cors());

const blobStorage = multer.memoryStorage();
const upload = multer({ blobStorage });

const testAddress = "0x742e642c45a0f10159e4f3d46c2468dc85e9d706"; // student did


// application.post('/api/v1/proof', upload.single('file'), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//     }

//     try {
//         const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
//         const uploadOptions = {}; 
//         const cid = await w2client.client.uploadFile(fileBlob, uploadOptions);
        
//         const studentDID = req.body.studentDID.split(':')[2]; // Extract address from DID
//         const tx = await contract.issueLicense(cid, studentDID);
//         const receipt = await tx.wait();

//         console.log('File uploaded and license issued -> CID:', cid, 'TX:', receipt.transactionHash);
        
//         res.status(200).json({
//             message: 'Success',
//             cid: cid,
//             transactionHash: receipt.transactionHash
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: 'Error processing request' });
//     }
// });

application.post('/api/v1/proof', upload.single('file'), async (req, res) => {
    try {
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const uploadOptions = {}; 
        const cid = await w2client.client.uploadFile(fileBlob, uploadOptions);
        
        const cidString = cid.toString();
        
        const tx = await contract.issueLicense(cidString, testAddress);
        const receipt = await tx.wait();
    
        console.log('File uploaded and license issued -> CID:', cidString, 'TX:', receipt.hash);
        
        res.status(200).json({
            message: 'Success',
            cid: cidString,
            transactionHash: receipt.hash
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
    
});


application.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
