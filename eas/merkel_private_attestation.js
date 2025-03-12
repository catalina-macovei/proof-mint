const { EAS, NO_EXPIRATION, MerkleValue, PrivateData, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
const { ethers } = require("ethers");
require("dotenv").config();

// Initialize EAS
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const eas = new EAS(process.env.EAS_CONTRACT_ADDRESS);
eas.connect(signer);

// Create private data
const values = [
  { type: "string", name: "name", value: "Alice Johnson" },
  { type: "uint256", name: "age", value: 28 },
  { type: "bool", name: "isStudent", value: false },
  {
    type: "address",
    name: "wallet",
    value: "0xb4Baa0098fE8fF203C2A419a8Bd24173E5f94Eb1",
  },
  {
    type: "bytes32",
    name: "dataHash",
    value: ethers.id("confidential information"),
  },
];

const privateData = new PrivateData(values);
const fullTree = privateData.getFullTree();

// Create an attestation with the Merkle root
const schemaEncoder = new SchemaEncoder("bytes32 privateData");
const encodedData = schemaEncoder.encodeData([
  { name: "privateData", value: fullTree.root, type: "bytes32" },
]);

// Private data schema
const schemaUID = "0x20351f973fdec1478924c89dfa533d8f872defa108d9c3c6512267d7e7e5dbc2";

async function createAttestation() {
  try {
    const transaction = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: process.env.EAS_ATTESTATION_RECIPIENT,
        expirationTime: NO_EXPIRATION,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await transaction.wait();
    console.log("New attestation UID:", newAttestationUID);

    // Generate a multi-proof to selectively reveal some data
    const proofIndexes = [0, 2]; // Revealing only name and isStudent
    const multiProof = privateData.generateMultiProof(proofIndexes);

    const multiProofJson = JSON.stringify(multiProof, null, 2);
    console.log("Multi-proof for selective reveal (JSON format):", multiProofJson);
  } catch (error) {
    console.error("Error creating attestation:", error);
  }
}

// Execute the function
createAttestation();
