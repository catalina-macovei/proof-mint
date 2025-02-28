import { createAgent } from '@veramo/core';
import { InMemoryKeyStore } from './inMemoryKeyStore';
import { InMemoryDIDStore } from './inMemoryDIDStore';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import { Resolver } from 'did-resolver';
import { BrowserProvider, Contract, verifyMessage, keccak256, toUtf8Bytes, randomBytes, ethers } from 'ethers';
import { getResolver as KeyDidResolver } from 'key-did-resolver';
import { createJWT } from 'did-jwt';
// VC issuance plugin
import { CredentialIssuer } from '@veramo/credential-w3c';
import { DataStoreJson } from '@veramo/data-store-json';

// DID Providers
import { DIDManager } from '@veramo/did-manager';
import { KeyDIDProvider } from '@veramo/did-provider-key';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';

// Import KeyManager so that keyManagerCreate is available
import { KeyManager } from '@veramo/key-manager';

import { SiweMessage } from 'siwe';

const INFURA_PROJECT_ID = 'de45f863bca94210b908eb51d7de3c49';
const ETTHR_DID_REGISTRY_ADDRESS = '0x03d5003bf0e79C5F5223588F347ebA39AfbC3818'; // Sepolia Registry

const getWeb3Provider = () => {
  if (typeof window.ethereum !== 'undefined') {
    return new BrowserProvider(window.ethereum);
  } else {
    throw new Error('MetaMask not installed');
  }
};

const secretKey = 'my-secret-key';

const keyStore = new InMemoryKeyStore();
const didStore = new InMemoryDIDStore();
const kmsLocal = new KeyManagementSystem(keyStore, new SecretBox(secretKey));

const databaseFile = './database.json';
const dataStore = new DataStoreJson({
  databasePath: databaseFile,
  migrations: []
});

// Create the agent with KeyManager and DIDManager configured with providers.
const agent = createAgent({
  plugins: [
    new KeyManager({  // KeyManager plugin is *essential*
      store: keyStore,
      kms: { local: kmsLocal }
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({
          infuraProjectId: INFURA_PROJECT_ID,
          networks: [{
            name: 'sepolia',
            rpcUrl: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
            registry: ETTHR_DID_REGISTRY_ADDRESS,
            chainId: 11155111,
          }],
        }),
        ...webDidResolver(),
        ...KeyDidResolver,
      }),
    }),
    new CredentialIssuer(), // For VC issuance
    new DataStoreJson({
      databasePath: databaseFile,
      migrations: [],
    }),
    new DIDManager({
      store: didStore,
      kms: kmsLocal, // *** CRUCIAL: Link KMS to DIDManager ***
      providers: {
        'did:key': new KeyDIDProvider({
          defaultKms: 'local',
          keyType: 'Secp256k1'
        }),
        'did:ethr': new EthrDIDProvider({
          defaultKms: 'local',
          web3Provider: getWeb3Provider,
          network: 'sepolia',
          registry: ETTHR_DID_REGISTRY_ADDRESS
        })
      }
    })
  ],
});


async function verifySignature(message, signature, address) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}
async function verifySepoliaDID(didUrl) {
  try {
    console.log('Verifying DID on Sepolia network...', didUrl);
    const resolution = await agent.resolveDid({ didUrl });
    console.log('DID resolution Document:', resolution);

    if (!resolution.didDocument) {
      throw new Error('No DID document found');
    }

    return {
      success: true,
      didDocument: resolution.didDocument
    };
  } catch (error) {
    console.error('DID verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

const issueDiplomaVC = async (did, kid) => {
  console.log('Issuing Diploma VC...', did, kid);
  
  try {
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'DiplomaCredential'],
      issuer: did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did,
        degree: 'Bachelor of Science',
        major: 'Computer Science',
        pdfDocument: {
          type: 'DigitalDocument',
          ipfsCID: 'Qm...PDF_HASH',
        },
      },
    };
  
    const didResolution = await agent.resolveDid({ didUrl: did }); // Pass { didUrl: ... }
    const didDocument = didResolution.didDocument;

    if (!didDocument) {
      throw new Error("Could not resolve DID document for organization DID.");
    }

    const keyInfo = await agent.keyManagerGet({ kid });
    console.log('KeyInfo:', keyInfo);
    const privateKeyJWK = keyInfo.privateKey;

    if (!privateKeyJWK) {
      throw new Error("Private key not found. Check KeyManager configuration and KID.");
    }

    const jwtPayload = {
      ...credential,
      iss: did,
      sub: did,
      iat: Math.floor(Date.now() / 1000),
      // ... any other claims
    };

    const jwt = await createJWT(jwtPayload, {
      privateKey: privateKeyJWK,
      alg: 'ES256K', // Or the correct algorithm
      kid: kid
    });

    console.log('Credential Issued Successfully (JWT):', jwt);
    return { success: true, verifiableCredential: jwt };

  } catch (error) {
    console.error('VC issuance failed:', error);
    return { success: false, error: error.message };
  }
};

async function generateOrganizationKey() {
  try {
    const key = await kmsLocal.createKey({
      kms: 'local',
      type: 'Secp256k1',
      privateKeyHex: randomBytes(32).toString('hex')
    });
    return key.kid;
  } catch (error) {
    console.error('Error creating key:', error);
    return null;
  }
}

async function createOrganizationDID(keyId) {
  try {
    const did = await agent.didManagerCreate({
      provider: 'did:key',
      kms: 'local',
      options: { key: keyId }
    });
    console.log("Organization DID Created Successfully", did);
    return did.did;
  } catch (error) {
    console.error('Error creating organization DID:', error);
    return null;
  }
}

async function createEthrDID(address) {
  try {
    const provider = getWeb3Provider();
    const signer = provider.getSigner(address); // Get the signer

    const did = await agent.didManagerCreate({
      provider: 'did:ethr',
      kms: 'local',
      options: { from: address, network: 'sepolia', signer: signer } // Pass the signer here
    });

    console.log("Ethr DID Created Successfully", did);
    return did;
  } catch (error) {
    console.error('Error creating Ethr DID:', error);
    return null;
  }
}

// async function addDelegate(mainAddress, mainDid, delegateDid) {
//   if (!mainDid || !delegateDid) {
//     console.error("Missing mainDid or delegateDid");
//     return;
//   }

//   const provider = getWeb3Provider();
//   const signer = provider.getSigner(mainAddress); // Get the signer (same as in createEthrDID)

//   const didRegistry = new Contract(
//     ETTHR_DID_REGISTRY_ADDRESS,
//     ["function addDelegate(bytes32 identity, bytes32 delegate, string memory types) external"],
//     signer // Use the signer
//   );

//   const identityBytes32 = keccak256(toUtf8Bytes(mainDid));
//   const delegateBytes32 = keccak256(toUtf8Bytes(delegateDid));

//   try {
//     const tx = await didRegistry.addDelegate(identityBytes32, delegateBytes32, "veriKey");
//     const receipt = await tx.wait();
//     console.log("Delegate added successfully", receipt);
//   } catch (error) {
//     console.error('Error from Smart contract Add Delegate:', error);
//     if (error.reason) {
//       console.error("Revert Reason:", error.reason);
//     }
//   }
// }


export {
  agent,
  getWeb3Provider,
  verifySepoliaDID,
  issueDiplomaVC,
  verifySignature,
  generateOrganizationKey,
  createOrganizationDID,
  createEthrDID
};
