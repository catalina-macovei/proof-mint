import { openDB } from 'idb';

const DB_NAME = 'veramoDIDStore';
const STORE_NAME = 'dids';

export async function getDB() {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        // Drop old store if exists to ensure clean schema
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        
        // Create store with compound key structure
        const store = db.createObjectStore(STORE_NAME);
        
        // Create indexes for efficient querying
        store.createIndex('by_address', 'address', { unique: true });
        store.createIndex('by_did', 'did', { unique: true });
      },
    });
  }
  
  export async function saveDID(address, didRecord) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const record = {
      address,
      did: didRecord.did,
      didDocument: didRecord.didDocument,
      keys: didRecord.keys,
      timestamps: {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    };
    
    await store.put(record);
    return record;
  }
  
  export async function getDIDByAddress(address) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_address');
    return index.get(address);
  }
  
  
  

export async function getDID(did) {
  try {
    console.log('Retrieving DID for:', did);
    const db = await getDB();
    const record = await db.get(STORE_NAME, did);
    console.log('Retrieved DID record:', record);
    return record;
  } catch (error) {
    console.error('Error retrieving DID record:', error);
  }
}



  export async function printAllDIDs() {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const allRecords = await store.getAll();
      console.log('All DID records:', allRecords);
    } catch (error) {
      console.error('Error retrieving all DID records:', error);
    }
  }
