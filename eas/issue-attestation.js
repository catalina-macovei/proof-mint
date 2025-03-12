const { ethers } = require("ethers");
const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
require('dotenv').config();

/**
 * Setup provider and wallet.
 * @returns {Object} wallet instance.
 */
function setupWallet() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    return { provider, wallet };
}

/**
 * Check if the wallet has enough balance.
 * @param {Object} provider - The Ethereum provider.
 * @param {Object} wallet - The wallet instance.
 * @returns {Promise<boolean>} Returns true if balance is sufficient.
 */
async function checkBalance(provider, wallet) {
    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

    if (balance < ethers.parseEther("0.01")) {
        console.error("Error: Insufficient balance. Please fund your wallet.");
        return false;
    }
    return true;
}

/**
 * Encodes attestation data based on schema.
 * @param {Object[]} attestationData - Array of attestation field objects.
 * @returns {string} Encoded data.
 */
function encodeAttestationData(attestationData) {
    const schemaString = "string universityDID,string studentDID,string studentName,uint256 graduationYear,string degree,string issuanceDate,string CID";
    const schemaEncoder = new SchemaEncoder(schemaString);
    return schemaEncoder.encodeData(attestationData);
}

/**
 * Issues an attestation on EAS.
 * @param {Object[]} attestationData - Custom attestation fields.
 */
async function issueAttestation(attestationData) {
    try {
        // Setup wallet
        const { provider, wallet } = setupWallet();

        // Check balance
        if (!(await checkBalance(provider, wallet))) return;

        // Initialize EAS contract
        const eas = new EAS(process.env.EAS_CONTRACT_ADDRESS).connect(wallet);
        const schemaUID = process.env.EAS_SCHEMA_UID;

        // Encode attestation data
        const encodedData = encodeAttestationData(attestationData);

        // Issue attestation
        try {
            const tx = await eas.attest({
                schema: schemaUID,
                data: {
                    recipient: process.env.EAS_ATTESTATION_RECIPIENT,
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
}

// Example call with custom fields (can be passed from a component)
const attestationFields = [
    { name: "universityDID", value: "did:ethr:0xb4baa0098fe8ff203c2a419a8bd24173e5f94eb1", type: "string" }, 
    { name: "studentDID", value: "did:ethr:0xe83F39161C51B68ecC5eDC09Fe8C5FCb0359FED7", type: "string" },
    { name: "studentName", value: "Test Name", type: "string" },
    { name: "graduationYear", value: 2024, type: "uint256" },
    { name: "degree", value: "Test Degree", type: "string" },
    { name: "issuanceDate", value: "2024-01-01", type: "string" },
    { name: "CID", value: "QmTestCID", type: "string" },
];


issueAttestation(attestationFields);
