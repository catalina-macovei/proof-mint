// src/veramo/inMemoryKeyStore.js
import { AbstractKeyStore } from '@veramo/key-manager';

export class InMemoryKeyStore {
  constructor() {
    this.keys = new Map();
  }

  async importKey(key) {
    this.keys.set(key.kid, key);
    return true;
  }


  async set(key) {
    // Ensure the key object includes the privateKey
    this.keys.set(key.kid, key);
    return key;
  }

  async get(kid) {
    return this.keys.get(kid);
  }

  async list() {
    return Array.from(this.keys.values());
  }
}

