// src/veramo/inMemoryKeyStore.js
import { AbstractKeyStore } from '@veramo/key-manager';

export class InMemoryKeyStore extends AbstractKeyStore {
  constructor() {
    super();
    this.keys = new Map();
  }

  async importKey(key) {
    this.keys.set(key.kid, key);
    return key;
  }

  async getKey(kid) {
    return this.keys.get(kid);
  }

  async getKeys() {
    return Array.from(this.keys.values());
  }
}
