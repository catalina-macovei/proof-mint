const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");
const { ethers } = require("ethers");
require("dotenv").config();

const easContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
const schemaUID = "0x20351f973fdec1478924c89dfa533d8f872defa108d9c3c6512267d7e7e5dbc2";

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);


async function testSigner() {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        console.log("Signer address:", await signer.getAddress());

        const balance = await provider.getBalance(signer.address);
        console.log("Signer balance:", ethers.formatEther(balance), "ETH");

    } catch (error) {
        console.error("Signer test error:", error);
    }
}

testSigner();


async function createAttestationWithProof(studentDID, studentName, graduationYear, degree, issuanceDate, CID, recipientAddress) {
    try {
        const eas = new EAS(easContractAddress);
        console.log("Before eas.connect");
        await eas.connect(signer);
        console.log("After eas.connect");
 

        const schemaEncoder = new SchemaEncoder("string studentDID,string studentName,string graduationYear,string degree,string issuanceDate,string CID");
        const encodedData = schemaEncoder.encodeData([
            { name: "studentDID", value: studentDID, type: "string" },
            { name: "studentName", value: studentName, type: "string" },
            { name: "graduationYear", value: graduationYear, type: "string" },
            { name: "degree", value: degree, type: "string" },
            { name: "issuanceDate", value: issuanceDate, type: "string" },
            { name: "CID", value: CID, type: "string" }
        ]);


        // Commented out offchain part
        const offchain = await eas.getOffchain();
        const offchainAttestation = await offchain.signOffchainAttestation(
            {
                recipient: recipientAddress,
                expirationTime: 0,
                time: 1671219636,
                revocable: true,
                schema: schemaUID,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData,
            },
            signer
        );
        console.log("Generated Off-chain Attestation Proof:", offchainAttestation);

        // Simple on-chain attestation
        const tx = await eas.attest({
            schema: schemaUID,
            data: {           
                recipient: recipientAddress,
                expirationTime: 0,
                time: 1671219636,
                revocable: true,
                schema: schemaUID,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData,            
            },
        });

        const receipt = await tx.wait();
        console.log("Attestation Submitted On-chain. Receipt:", receipt);

        // Commented out offchain return.
        return { receipt, offchainAttestation };

    } catch (error) {
        console.error("Error creating attestation with proof:", error);
        throw error;
    }
}


async function runTest() {
    try {
        const recipient = process.env.EAS_ATTESTATION_RECIPIENT;

        // Example diploma data
        const studentDID = "did:example:123456789abcdef";
        const studentName = "John Doe";
        const graduationYear = "2024";
        const degree = "Bachelor of Science in Computer Science";
        const issuanceDate = "2025-06-15";
        const CID = "QmExampleCIDFromIPFS";

        const { receipt, offchainAttestation } = await createAttestationWithProof(studentDID, studentName, graduationYear, degree, issuanceDate, CID, recipient);

        console.log("Attestation Receipt:", receipt);
        console.log("Off-chain Proof:", offchainAttestation);
    } catch (error) {
        console.error("Error in test:", error);
    }
}

// Execute the function
runTest();