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

const testAddress = "0x742e642c45a0f10159e4f3d46c2468dc85e9d706"; // student DID

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

// Route to revoke a license
application.use(express.json());


application.get('/api/v1/revoke-license', async (req, res) => {
    const { studentDID } = req.query;

    if (!studentDID) {
        console.log('Missing required parameter: studentDID');
        return res.status(400).send('Missing required parameter: studentDID');
    }

    try {
        // Fetch the CID for the studentDID (this logic needs to be implemented based on your data store)
        const cid = await fetchCIDForStudent(studentDID); // Replace with real data fetching
        if (!cid) {
            console.log('CID not found for studentDID:', studentDID);
            return res.status(404).send('CID not found for student');
        }

        console.log('CID to revoke:', cid);

        // Call the revokeLicense function on the contract
        const tx = await contract.revokeLicense(cid);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Send response with transaction hash
        res.json({
            success: true,
            transactionHash: receipt.hash
        });
    } catch (error) {
        console.error('Error revoking license:', error);
        res.status(500).send('Error revoking license');
    }
});

// Example function to fetch CID based on studentDID (replace with actual logic)
async function fetchCIDForStudent(studentDID) {
    // Example: mock CID fetching logic, replace with actual data source (e.g., database)
    const mockDatabase = {
        "student123": "bafkreicvmiem7h67ur7gc26rjjqkcrwnwzmissrbesjmep4hdvlxp5f5dy",  // example CID
    };

    return mockDatabase[studentDID];  // Return the CID if exists, otherwise return undefined
}




// Route to verify a license
application.get('/api/v1/verify-license', async (req, res) => {
    const { studentDID } = req.query;

    if (!studentDID) {
        console.log('Missing required parameter: studentDID');
        return res.status(400).send('Missing required parameter: studentDID');
    }

    try {
        // Call the smart contract to verify if the student has a valid license
        const cid = "bafkreicvmiem7h67ur7gc26rjjqkcrwnwzmissrbesjmep4hdvlxp5f5dy";  // you would need to pass or get the CID
        console.log('hit:', cid);

        const [isValid, licenseStudentDID] = await contract.verifyLicense(cid);

        res.json({ success: true, isValid, licenseStudentDID });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying license');
    }
});


application.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
