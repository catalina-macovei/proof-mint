import { createAgent } from '@veramo/core';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDManager } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { Entities, KeyStore, DIDStore, PrivateKeyStore } from '@veramo/data-store';
import { DataSource } from 'typeorm';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const address = await wallet.getAddress();
console.log('Derived Address:', address);

const issuerDid = `did:ethr:sepolia:${address}`;
console.log('Issuer DID:', issuerDid);

const dbConnection = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: Entities,
  synchronize: true,
  logging: false,
  enableWAL: true,
  busyTimeout: 3000,
});

let agent;

const createVeramoAgent = async () => {
  try {
    await dbConnection.initialize();
    console.log('Database initialized');

    agent = createAgent({
      plugins: [
        new KeyManager({
          store: new KeyStore(dbConnection),
          kms: {
            local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(process.env.KMS_SECRET_KEY))),
          },
        }),
        new DIDManager({
          store: new DIDStore(dbConnection),
          defaultProvider: 'did:ethr:sepolia',
          providers: {
            'did:ethr:sepolia': new EthrDIDProvider({
              defaultKms: 'local',
              network: 'sepolia',
              rpcUrl: process.env.SEPOLIA_RPC_URL,
              privateKey: process.env.PRIVATE_KEY,
            }),
          },
        }),
        new DIDResolverPlugin({
          resolver: {
            ...ethrDidResolver({ infuraProjectId: process.env.INFURA_PROJECT_ID }),
            ...webDidResolver(),
          },
        }),
        new CredentialPlugin(),
      ],
    });

    // Attempt to create a DID if none exists
    const identifiers = await agent.didManagerFind();
    if (identifiers.length === 0) {
      const identifier = await agent.didManagerCreate({
        provider: 'did:ethr:sepolia',
        alias: 'default',
        kms: 'local',
      });
      console.log('DID created:', identifier.did);
    } else {
      console.log('Existing DID found:', identifiers[0].did);
    }

    return agent;
  } catch (error) {
    console.error('Error initializing agent:', error);
    throw error;
  }
};

export { createVeramoAgent };
