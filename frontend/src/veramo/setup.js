// src/veramo/setup.js
import { createAgent } from '@veramo/core';

import { InMemoryKeyStore } from './inMemoryKeyStore';
import { InMemoryDIDStore } from './inMemoryDIDStore';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { Web3Provider } from '@ethersproject/providers';

import { getResolver as webDidResolver } from 'web-did-resolver'
import { Resolver } from 'did-resolver'

const INFURA_PROJECT_ID = 'de45f863bca94210b908eb51d7de3c49';


const getWeb3Provider = () => {
  if (typeof window.ethereum !== 'undefined') {
    return new Web3Provider(window.ethereum);
  } else {
    throw new Error('MetaMask not installed');
  }
};

const secretKey = 'my-secret-key'; // Use environment variables in production

const keyStore = new InMemoryKeyStore();
const didStore = new InMemoryDIDStore();

const kmsLocal = new KeyManagementSystem(keyStore, new SecretBox(secretKey));

const agent = createAgent({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),
  ],
})

// Updated verification function to handle network check properly
const verifySepoliaDID = async (didUrl) => {
  try {
    console.log('Verifying DID on Sepolia network...', didUrl);
    // Then try to resolve the DID
    const resolution = await agent.resolveDid(
      { didUrl: didUrl },
    );

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
};

export { agent, getWeb3Provider, verifySepoliaDID };