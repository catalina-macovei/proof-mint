import { ethers } from "ethers";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { EAS_CONTRACT_ADDRESS, EAS_SCHEMA_UID, EAS_ATTESTATION_RECIPIENT, SEPOLIA_RPC_URL, PRIVATE_KEY } from "../config/contract";

const setupWallet = () => {
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return { provider, wallet };
};

const checkBalance = async (provider, wallet) => {
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.error("Error: Insufficient balance. Please fund your wallet.");
    return false;
  }
  return true;
};

const encodeAttestationData = (data) => {
  const schemaString = "string universityDID,string studentDID,string studentName,uint256 graduationYear,string degree,string issuanceDate,string CID";
  const schemaEncoder = new SchemaEncoder(schemaString);

  return schemaEncoder.encodeData(data);
};

export const issueAttestation = async (attestationData) => {
  try {
    console.log("Starting attestation process...", attestationData);
    const { provider, wallet } = setupWallet();

    const eas = new EAS(EAS_CONTRACT_ADDRESS).connect(wallet);
    const encodedData = encodeAttestationData(attestationData);
    console.log("endc", encodedData);
    

    try {
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
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
    } catch (error) {
      console.error("Gas estimation or transaction submission failed:", error);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};
