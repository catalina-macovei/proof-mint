require("dotenv").config();
const { ethers } = require("ethers");
const { EAS, SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");

// Ensure you have the correct provider set up
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// EAS Contract Address for Sepolia
const EASContractAddress = process.env.EAS_CONTRACT_ADDRESS; 
const eas = new EAS(EASContractAddress);
eas.connect(provider);

// Schema Registry Contract Address for Sepolia
const schemaRegistryContractAddress = process.env.EAS_SCHEMA_REGISTRY_ADDRESS;
const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
schemaRegistry.connect(provider);

// Function to get Attestation Data
async function getAttestation(uid) {
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
const schemaUID = process.env.EAS_SCHEMA_UID;   // i will use license manager to store uids for user to get schema

// Fetch data
getSchema(schemaUID);
getAttestation(attestationUID);

