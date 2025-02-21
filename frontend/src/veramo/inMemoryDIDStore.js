// src/veramo/InMemoryDIDStore.js
import { AbstractDIDStore } from '@veramo/did-manager';

export class InMemoryDIDStore extends AbstractDIDStore {
  constructor() {
    super();
    this.dids = new Map();
  }

  async importDID(didRecord) {
    // Ensure the DID record always has a `keys` array.
    if (!didRecord.keys) {
      didRecord.keys = [];
    }
    this.dids.set(didRecord.did, didRecord);
    return didRecord;
  }

  async getDID(did) {
    const record = this.dids.get(did);
    if (record && !record.keys) {
      record.keys = [];
    }
    return record;
  }

  async getDIDs() {
    return Array.from(this.dids.values()).map((record) => {
      if (!record.keys) {
        record.keys = [];
      }
      return record;
    });
  }
}
