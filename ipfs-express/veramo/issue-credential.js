import { agent } from './setup.js';

async function issueCredential() {
  const identifier = await agent.didManagerGetByAlias({ alias: 'default' });

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: identifier.did },
      credentialSubject: {
        id: 'did:web:example.com',
        you: 'Rock',
      },
    },
    proofFormat: 'jwt',
  });

  console.log('Credential issued:', verifiableCredential);
}

issueCredential().catch(console.error);
