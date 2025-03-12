import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { EAS_CONTRACT_ADDRESS, EAS_SCHEMA_UID, EAS_ATTESTATION_RECIPIENT} from "../config/contract";

const encodeAttestationData = (data) => {
  const schemaString = "string universityDID,string studentDID,string studentName,uint256 graduationYear,string degree,string issuanceDate,string CID";
  const schemaEncoder = new SchemaEncoder(schemaString);
  return schemaEncoder.encodeData(data);
};

export const issueAttestation = async (attestationData, wallet) => {
  try {
    console.log("Starting attestation process...", attestationData);

    const eas = new EAS(EAS_CONTRACT_ADDRESS).connect(wallet);
    const encodedData = encodeAttestationData(attestationData);
    console.log("Encoded data:", encodedData);

    try {
      // Perform the attestation
      const tx = await eas.attest({
        schema: EAS_SCHEMA_UID,
        data: {
          recipient: EAS_ATTESTATION_RECIPIENT,
          data: encodedData,
          expirationTime: 0,
          revocable: true,
        },
        gasLimit: 3000000,
      });

      console.log("Transaction submitted:", tx.hash);

      // Wait for transaction confirmation and receipt
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Extract the Attestation UID from the logs
      const attestationUID = receipt

      if (attestationUID) {
        console.log("Attestation UID:", attestationUID);
        return attestationUID;
      } else {
        throw new Error("Attestation UID not found in transaction receipt.");
      }
    } catch (error) {
      console.error("Error during transaction submission:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
};
