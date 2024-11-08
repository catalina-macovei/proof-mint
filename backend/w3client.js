import * as Client from '@web3-storage/w3up-client';
import * as Proof from '@web3-storage/w3up-client/proof';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import { Signer } from '@web3-storage/w3up-client/principal/ed25519';

export class W3client {
    constructor() {
        this.client = null;
    }

    async init() {
        // initializare client cu un PK
        const p = Signer.parse(process.env.KEY);
        const s = new StoreMemory();
        this.client = await Client.create({ p, s });

        // Delegare drepturi agentului pentru incarcare fisiere
        const proof = await Proof.parse(process.env.PROOF);
        const space = await this.client.addSpace(proof); 
        await this.client.setCurrentSpace(space.did());
    }
};

export default W3client;