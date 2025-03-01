import { agent } from './setup.js';

async function createIdentifier() {
  const identifier = await agent.didManagerCreate({ alias: 'default' });
  console.log('Identifier created:', identifier.did);
}

createIdentifier().catch(console.error);
