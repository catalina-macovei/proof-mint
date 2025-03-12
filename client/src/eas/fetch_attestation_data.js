import { ethers } from 'ethers';
import { EAS, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { EAS_SCHEMA_UID, SEPOLIA_RPC_URL, EAS_CONTRACT_ADDRESS, EAS_SCHEMA_REGISTRY_ADDRESS } from '../config/contract';

// Ensure you have the correct provider set up
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

// EAS Contract Address for Sepolia
const EASContractAddress = EAS_CONTRACT_ADDRESS; 
const eas = new EAS(EASContractAddress);
eas.connect(provider);

// Schema Registry Contract Address for Sepolia
const schemaRegistryContractAddress = EAS_SCHEMA_REGISTRY_ADDRESS;
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
schemaRegistry.connect(provider);

const schemaTypes = [
    "string", 
    "string", 
    "string", 
    "uint256",
    "string", 
    "string", 
    "string"  
  ];

  export const decodeAttestationData = async (dataHex) => {
    try {
      const abiCoder = new ethers.AbiCoder();
      const decoded = abiCoder.decode(schemaTypes, dataHex);
      // Manually map each index to a key:
      const plainDecoded = {
        issuer: decoded[0],
        recipient: decoded[1],
        name: decoded[2],
        year: decoded[3].toString(), // convert BigNumber to string if needed
        degree: decoded[4],
        date: decoded[5],
        cid: decoded[6]
      };
      console.log("Decoded attestation data:", plainDecoded);
      return plainDecoded;
    } catch (error) {
      console.error("Error decoding attestation data:", error);
    }
  };
  
  

// Function to get Attestation Data
export const getAttestation = async (uid) => {
    try {
        const attestation = await eas.getAttestation(uid);
        console.log("Attestation Data:", attestation);
        return attestation;
    } catch (error) {
        console.error("Error fetching attestation:", error);
    }
}

// Function to get Schema Data
async function getSchema(schemaUID) {
    try {
        const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID });
        console.log("Schema Data:", schemaRecord);
        return schemaRecord;
    } catch (error) {
        console.error("Error fetching schema:", error);
    }
}

// Example UIDs (Replace with actual UIDs)
const attestationUID = "0x53db8fae83bfc83cc1f13ccad24dbcb152b8e8ce087860e66027e77a6bc38cb9"; // i will use license manager to store uids for user to get attestation
const schemaUID = EAS_SCHEMA_UID;   // i will use license manager to store uids for user to get schema

// Fetch data
getSchema(schemaUID);
getAttestation(attestationUID);

