import express from 'express';
import multer from 'multer';
import { Blob } from 'buffer';
import cors from 'cors';
import dotenv from 'dotenv';
import W3client from './w3client.js';
import { ethers } from 'ethers';
import { createVeramoAgent } from './veramo/setup.js'

// Initialize the agent before setting up routes
const agent = await createVeramoAgent()

dotenv.config();

// Dynamically import the LicenseManager contract JSON using native ESM:
const LicenseManagerModule = await import(
  '../artifacts/contracts/LicenseManager.sol/LicenseManager.json',
  { assert: { type: 'json' } }
);
const LicenseManager = LicenseManagerModule.default;

console.log('Environment variables loaded:', {
  hasRpcUrl: !!process.env.SEPOLIA_RPC_URL,
  hasPrivateKey: !!process.env.PRIVATE_KEY,
  hasContractAddress: !!process.env.CONTRACT_ADDRESS,
});

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

// Global middleware: CORS and JSON parser.
application.use(cors());
application.use(express.json());

// Initialize your web3 client.
const w2client = new W3client();
await w2client.init();

// Configure multer with the correct option name "storage".
const storage = multer.memoryStorage();
const upload = multer({ storage });


const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const issuerDid = `did:ethr:sepolia:${wallet.getAddress()}`;


// Route: Issue a proof credential.
application.post('/api/v1/proof', upload.single('file'), async (req, res) => {
  try {
    const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
    const cid = await w2client.client.uploadFile(fileBlob);

    const credential = await agent.createVerifiableCredential({
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'ProofMintCertificate'],
          issuer: { id: issuerDid },
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: cid,
            type: 'License',
          },
        },
        proofFormat: 'jwt'
      })
      

    res.json({ cid, credential });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: error.message,
      details: 'Error processing credential issuance',
    });
  }
});

// Route: Revoke license (issue revocation credential).
application.get('/api/v1/revoke-license', async (req, res) => {
  const { cid } = req.query;
  if (!cid) {
    return res.status(400).send('Missing required parameter: CID');
  }
  try {
    const revokedCredential = await agent.createVerifiableCredential({
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'CredentialStatusList2017'],
        issuer: issuerDid,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: cid,
          type: 'RevocationList2017',
          status: 'revoked',
        },
      },
    });
    res.json({
      success: true,
      message: 'Credential revoked',
      revokedCredential,
    });
  } catch (error) {
    console.error('Veramo: Error revoking credential:', error);
    res.status(500).send('Error revoking credential');
  }
});

application.get('/api/v1/verify-license', async (req, res) => {
    const { cid } = req.query
    if (!cid) {
      return res.status(400).send('Missing required parameter: CID')
    }
    try {
      const identifiers = await agent.didManagerFind()
      if (identifiers.length === 0) {
        throw new Error('No DIDs found - please ensure agent is properly initialized')
      }
      
      const issuerDid = identifiers[0].did
      const credential = await agent.createVerifiableCredential({
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'ProofMintCertificate'],
          issuer: { id: issuerDid },
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: cid,
            type: 'License',
          },
        },
        proofFormat: 'jwt'
      })
      
      res.json({ success: true, credential })
    } catch (error) {
      console.error('Error retrieving credential:', error)
      res.status(500).send('Error retrieving credential')
    }
  })
  

// Route: Test credentials creation & presentation.
application.post('/api/v1/test-credentials', async (req, res) => {
  try {
    const credential = await agent.createVerifiableCredential({
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'ProofMintCertificate'],
        issuer: issuerDid,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'did:ethr:sepolia:0x123',
          achievement: 'Test Certificate',
          course: 'Blockchain Development',
        },
      },
    });
    const presentation = await agent.createVerifiablePresentation({
      presentation: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        holder: issuerDid,
        verifiableCredential: [credential],
      },
      challenge: 'test-challenge',
      domain: 'proofmint.com',
    });
    res.json({ credential, presentation });
  } catch (error) {
    console.error('Credential creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

application.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
