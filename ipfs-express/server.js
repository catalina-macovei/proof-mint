import express from 'express';
import multer from 'multer';
import { Blob } from 'buffer'; 
import cors from 'cors';
import dotenv from 'dotenv';
import W3client from './w3client.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';
import fetch from 'node-fetch';

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



application.post('/api/v1/proof', upload.single('file'), async (req, res) => {
    try {
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const uploadOptions = {};
        const cid = await w2client.client.uploadFile(fileBlob, uploadOptions);
        const cidString = cid.toString();

        console.log('File uploaded to IPFS -> CID:', cidString);

        res.status(200).json({
            message: 'Success',
            ipfsHash: cidString
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});




// Route to revoke a license
application.use(express.json());


const gatewayUrl = (cid) => `https://${cid}.ipfs.w3s.link`;

// Route to get file metadata by HEAD request
application.get('/api/v1/file-info/:cid', async (req, res) => {
  const { cid } = req.params;
  if (!cid) return res.status(400).json({ message: 'CID is required' });

  const url = gatewayUrl(cid);
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok)
      return res.status(404).json({ message: 'File not found on IPFS gateway' });

    res.json({
      name: cid,
      type: response.headers.get('content-type') || 'application/octet-stream',
      size: parseInt(response.headers.get('content-length') || '0', 10),
      cid,
    });
  } catch (error) {
    console.error('Metadata Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching file metadata from IPFS gateway' });
  }
});

// Route to retrieve file content via gateway proxy
application.get('/api/v1/file/:cid', async (req, res) => {
  const { cid } = req.params;
  if (!cid) return res.status(400).json({ message: 'CID is required' });

  const url = gatewayUrl(cid);
  try {
    const response = await fetch(url);
    if (!response.ok)
      return res.status(404).json({ message: 'File not found on IPFS gateway' });

    // Forward relevant headers
    ['content-type', 'content-length', 'cache-control'].forEach((name) => {
      const value = response.headers.get(name);
      if (value) res.setHeader(name, value);
    });
    // Ensure inline disposition
    res.setHeader('Content-Disposition', `inline; filename="${cid}"`);

    // Stream the data
    response.body.pipe(res);
  } catch (error) {
    console.error('Content Fetch Error:', error);
    res.status(500).json({ message: 'Error fetching file content from IPFS gateway' });
  }
});





application.get('/api/v1/revoke-license', async (req, res) => {
    const { studentDID } = req.query;

    if (!studentDID) {
        console.log('Missing required parameter: studentDID');
        return res.status(400).send('Missing required parameter: studentDID');
    }

    try {
        // Fetch the CID for the studentDID 
        const cid = await fetchCIDForStudent(studentDID); 
        if (!cid) {
            console.log('CID not found for studentDID:', studentDID);
            return res.status(404).send('CID not found for student');
        }

        console.log('CID to revoke:', cid);

        // Call the revokeLicense function on the contract
        const tx = await contract.revokeLicense(cid);

        // Optionally, wait for the transaction to be mined 
        // const receipt = await tx.wait();

        console.log('License revoked -> CID:', cid, 'TX:', tx.hash);
        
        res.json({
            success: true,
            message: 'License revocation initiated',
            transactionHash: tx.hash
        });
    } catch (error) {
        console.error('Error revoking license:', error);
        res.status(500).send('Error revoking license');
    }
});

// Example function to fetch CID based on studentDID 
async function fetchCIDForStudent(studentDID) {
    //mock CID fetching logic
    const mockDatabase = {
        "student123": "bafkreihnz3bvpnojbhilcab2mv7zsfdr4pci5nlvab3pz76nfz4g3k6ne4",  //test CID
    };

    return mockDatabase[studentDID]; 
}




// Route to verify a license
application.get('/api/v1/verify-license', async (req, res) => {
    const { studentDID } = req.query;

    if (!studentDID) {
        console.log('Missing required parameter: studentDID');
        return res.status(400).send('Missing required parameter: studentDID');
    }

    try {
        const cid = "bafkreihnz3bvpnojbhilcab2mv7zsfdr4pci5nlvab3pz76nfz4g3k6ne4";  //test cid
        console.log('Verifying license with CID:', cid);

        const [isValid, licenseStudentDID] = await contract.verifyLicense(cid);
        console.log('License is valid:', isValid, 'for Student DID:', licenseStudentDID);
        res.json({ success: true, isValid, licenseStudentDID });
    } catch (error) {
        console.error('Error verifying license:', error);
        res.status(500).send('Error verifying license');
    }
});


application.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});