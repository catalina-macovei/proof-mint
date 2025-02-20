import { createAgent } from '@veramo/core';
import { DIDManager } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Entities, KeyStore, DIDStore, PrivateKeyStore } from '@veramo/data-store';
import { DataSource } from 'typeorm';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import dotenv from 'dotenv';

dotenv.config();

const dbConnection = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: Entities,
  synchronize: true,
  logging: false,
});

const veramoAgent = createAgent({
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

export { veramoAgent };
