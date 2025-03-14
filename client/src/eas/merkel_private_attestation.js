// merkel_private_attestation.js
import { EAS, NO_EXPIRATION, PrivateData, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { EAS_CONTRACT_ADDRESS, EAS_ATTESTATION_RECIPIENT } from "../config/contract";


export async function createAttestation(signer, values) {
  const privateData = new PrivateData(values);
  const fullTree = privateData.getFullTree();

  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(signer);

  // Create an attestation with the Merkle root
  const schemaEncoder = new SchemaEncoder("bytes32 privateData");
  console.log("merkel root:", fullTree.root);
  const encodedData = schemaEncoder.encodeData([
    { name: "privateData", value: fullTree.root, type: "bytes32" },
  ]);

  // Private data schema
  const schemaUID = "0x20351f973fdec1478924c89dfa533d8f872defa108d9c3c6512267d7e7e5dbc2";

  try {
    const transaction = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: EAS_ATTESTATION_RECIPIENT,
        expirationTime: NO_EXPIRATION,
        revocable: true,
        data: encodedData,
      },
    });

    const attestationUID = await transaction.wait();
    console.log("New attestation UID:", attestationUID);

    // Generate a multi-proof to selectively reveal some data
    const proofIndexes = [0, 2]; // Revealing only name and isStudent
    const multiProof = privateData.generateMultiProof(proofIndexes);

    const multiProofJson = JSON.stringify(multiProof, null, 2);
    console.log("Multi-proof for selective reveal (JSON format):", multiProofJson);
    return {
      attestationUID,
      multiProofJson,
    };
  } catch (error) {
    console.error("Error creating attestation:", error);
  }
}

export async function verifyProof(signer, attestationUID, multiProofJson) {
  try {
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    // Fetch the attestation details
    const attestation = await eas.getAttestation(attestationUID);
    if (!attestation) {
      throw new Error("Attestation not found.");
    }

    console.log("Fetched attestation:", attestation);

    // Decode the stored Merkle root from attestation data
    const schemaEncoder = new SchemaEncoder("bytes32 privateData");
    const decodedData = schemaEncoder.decodeData(attestation.data);

    console.log("Decoded attestation data:", decodedData);

    if (!decodedData.length || !decodedData[0].value) {
      throw new Error("Invalid Merkle root in attestation.");
    }

    const merkleRoot = decodedData[0].value.value; // Extract the root value
    console.log("Extracted Merkle Root:", merkleRoot);

    // Parse multi-proof from JSON
    const multiProof = JSON.parse(multiProofJson);
    console.log("Parsed MultiProof:", multiProof);

    if (!multiProof.leaves || multiProof.leaves.length === 0) {
      throw new Error("Invalid proof: Leaves array is empty.");
    }

    // Verify the proof against the extracted root
    const isValid = PrivateData.verifyMultiProof(merkleRoot, multiProof);

    console.log("Proof verification result:", isValid);
    return isValid;
  } catch (error) {
    console.error("Error verifying proof:", error);
    return false;
  }
}




