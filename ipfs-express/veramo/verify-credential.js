import { agent } from './setup.js';

async function verifyCredential() {
  const credential = {
    // Your credential object here
  };

  const result = await agent.verifyCredential({ credential });
  console.log('Credential verified:', result.verified);
}

verifyCredential().catch(console.error);
