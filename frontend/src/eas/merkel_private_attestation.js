// merkel_private_attestation.js
import { EAS, NO_EXPIRATION, PrivateData, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

/**
 * Creates an attestation using the provided signer and values object.
 *
 * @param {ethers.Signer} signer - The MetaMask signer.
 * @param {Array} values - An array of objects defining the data to attest. Each object should have type, name, and value.
 * @returns {Promise<string>} - The attestation UID.
 */
export async function createAttestation(signer, values) {
  // Use default values if none are provided (optional)
  if (!values) {
    values = [
      { type: "string", name: "name", value: "Alice Johnson" },
      { type: "uint256", name: "age", value: 28 },
      { type: "bool", name: "isStudent", value: false },
      { type: "address", name: "wallet", value: await signer.getAddress() },
      { type: "bytes32", name: "dataHash", value: ethers.id("confidential information") },
    ];
  }

  // Initialize EAS with your contract address (configure via env or directly)
  const easContractAddress = process.env.REACT_APP_EAS_CONTRACT_ADDRESS || "0xYourEASContractAddress";
  const eas = new EAS(easContractAddress);
  eas.connect(signer);

  // Build the private data tree from the provided values
  const privateData = new PrivateData(values);
  const fullTree = privateData.getFullTree();

  // Encode the data for attestation
  const schemaEncoder = new SchemaEncoder("bytes32 privateData");
  const encodedData = schemaEncoder.encodeData([
    { name: "privateData", value: fullTree.root, type: "bytes32" },
  ]);

  // Define your attestation schema UID
  const schemaUID = "0x20351f973fdec1478924c89dfa533d8f872defa108d9c3c6512267d7e7e5dbc2";

  try {
    const transaction = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: await signer.getAddress(), // you can also pass a different recipient if needed
        expirationTime: NO_EXPIRATION,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await transaction.wait();
    console.log("New attestation UID:", newAttestationUID);
    return newAttestationUID;
  } catch (error) {
    console.error("Error creating attestation:", error);
    throw error;
  }
}
