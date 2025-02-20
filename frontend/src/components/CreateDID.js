import React, { useState } from 'react';
import { getContract } from '../utils/wallet';
import IdentityRegistry from '../artifacts/contracts/IdentityRegistry.sol/IdentityRegistry.json';
import { IDENTITY_REGISTRY_ADDRESS } from '../config/contract';
import { agent } from '../veramo/setup';
import { ethers } from 'ethers';

const CreateDID = () => {
  const [did, setDid] = useState('');
  const [loading, setLoading] = useState(false);

  const createIdentity = async () => {
    setLoading(true);
    try {
        const resolvedDid = await agent.resolveDid({
            didUrl: 'did:ethr:sepolia:' + window.ethereum.selectedAddress
        });
        
        const didString = resolvedDid.didDocument.id;
        setDid(didString);
        
        const didBytes = ethers.encodeBytes32String(didString.slice(0, 31));
        const registry = await getContract(IDENTITY_REGISTRY_ADDRESS, IdentityRegistry.abi);
        const tx = await registry.createIdentity(didBytes);
        await tx.wait();
        
    } catch (error) {
        console.error('Error creating DID:', error);
    }
    setLoading(false);
};


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-10">
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">Create Digital Identity</h2>
        <button
          onClick={createIdentity}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {loading ? 'Creating...' : 'Create DID'}
        </button>
        {did && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="break-all">Your DID: {did}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDID;
