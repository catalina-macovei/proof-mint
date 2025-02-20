// src/veramo/setup.js
import { createAgent } from '@veramo/core';
import { DIDManager } from '@veramo/did-manager';
import { KeyManager } from '@veramo/key-manager';
import { KeyStore } from '@veramo/data-store';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { Web3Provider } from '@ethersproject/providers';

const INFURA_PROJECT_ID = 'de45f863bca94210b908eb51d7de3c49';

const getWeb3Provider = () => {
  if (typeof window.ethereum !== 'undefined') {
    return new Web3Provider(window.ethereum);
  } else {
    throw new Error('MetaMask not installed');
  }
};

// Setup an in-memory KeyStore and KMS
const secretKey = 'my-secret-key'; // In production, use a secure, unpredictable key.
const keyStore = new KeyStore();
const kmsLocal = new KeyManagementSystem(keyStore, new SecretBox(secretKey));

const agent = createAgent({
  plugins: [
    new KeyManager({
      store: keyStore,
      kms: {
        local: kmsLocal,
      },
    }),
    new DIDManager({
      providers: {
        'did:ethr': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'sepolia', // Using the Sepolia test network
          rpcUrl: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
        }),
      },
      defaultProvider: 'did:ethr',
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
      }),
    }),
    new CredentialPlugin(),
  ],
});

export { agent, getWeb3Provider };
