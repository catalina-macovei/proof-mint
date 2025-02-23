// src/veramo/InMemoryDIDStore.js
import { AbstractDIDStore } from '@veramo/did-manager';

export class InMemoryDIDStore extends AbstractDIDStore {
  constructor() {
    super();
    this.loadFromStorage()
  }

  /**
   * Load stored DIDs from localStorage.
   */
  loadFromStorage() {
    const storedDIDs = localStorage.getItem('dids');
    this.dids = storedDIDs ? new Map(JSON.parse(storedDIDs)) : new Map();
  }


  /**
    * Save DIDs to localStorage.
    */
  saveToStorage() {
    localStorage.setItem('dids', JSON.stringify([...this.dids.entries()]));
  }

  /**
   * Import a DID into the store.
   * @param args - The DID object to store.
   * @returns boolean - Whether the import was successful.
   */
  async importDID(args) {
    if (!args.did) return false;
    this.dids.set(args.did, args);
    this.saveToStorage();
    return true;
  }

  /**
   * Retrieve a DID by DID string or alias.
   * @param {object} args - The lookup parameters.
   * @returns {Promise<IIdentifier | null>}
   */
  async getDID(args) {
    if ('did' in args) {
      return this.dids.get(args.did) || null;
    }
    if ('alias' in args) {
      return [...this.dids.values()].find(did => did.alias === args.alias) || null;
    }
    return null;
  }

  /**
   * Delete a DID from the store.
   * @param {object} args - The DID identifier to delete.
   * @returns {Promise<boolean>}
   */
  async deleteDID(args) {
    if (this.dids.has(args.did)) {
      this.dids.delete(args.did);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * List all stored DIDs, optionally filtered by alias or provider.
   * @param {object} [args] - Filtering options.
   * @returns {Promise<IIdentifier[]>}
   */
  async listDIDs(args) {
    let dids = [...this.dids.values()];
    if (args?.alias) {
      dids = dids.filter(did => did.alias === args.alias);
    }
    if (args?.provider) {
      dids = dids.filter(did => did.provider === args.provider);
    }
    return dids;
  }
}
