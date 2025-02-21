// src/veramo/setup.js
import { createAgent } from '@veramo/core';
import { DIDManager } from '@veramo/did-manager';
import { KeyManager } from '@veramo/key-manager';
import { InMemoryKeyStore } from './inMemoryKeyStore';
// Updated DID store:
import { InMemoryDIDStore } from './inMemoryDIDStore';
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

const secretKey = 'my-secret-key'; // Use environment variables in production

const keyStore = new InMemoryKeyStore();
const didStore = new InMemoryDIDStore();

const kmsLocal = new KeyManagementSystem(keyStore, new SecretBox(secretKey));

const agent = createAgent({
  plugins: [
    new KeyManager({
      store: keyStore,
      kms: { local: kmsLocal },
    }),
    new DIDManager({
      store: didStore,
      defaultProvider: 'did:ethr',
      providers: {
        'did:ethr': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'sepolia',
          rpcUrl: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
        }),
      },
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
