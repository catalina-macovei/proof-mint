const { EAS, recoverOffchainAttestationSigner } = require("@ethereum-attestation-service/eas-sdk");
const { ethers } = require("ethers");
require("dotenv").config();

const easContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia EAS contract address
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const eas = new EAS(easContractAddress);
eas.connect(provider);

/**
 * Verify off-chain attestation proof
 * @param {Object} offchainProof - The signed off-chain attestation proof
 */
async function verifyOffchainAttestation(offchainProof) {
    try {
        const recoveredSigner = recoverOffchainAttestationSigner(offchainProof);
        console.log("Recovered Signer:", recoveredSigner);

        if (recoveredSigner.toLowerCase() === process.env.SIGNER_ADDRESS.toLowerCase()) {
            console.log("✅ Off-chain attestation is valid.");
        } else {
            console.log("❌ Off-chain attestation is invalid.");
        }
    } catch (error) {
        console.error("Error verifying off-chain attestation:", error);
    }
}

/**
 * Verify on-chain attestation
 * @param {string} attestationUID - The attestation UID from EAS
 */
async function verifyOnchainAttestation(attestationUID) {
    try {
        const attestation = await eas.getAttestation(attestationUID);
        
        if (attestation) {
            console.log("✅ Attestation exists on-chain:", attestation);
        } else {
            console.log("❌ Attestation not found on-chain.");
        }
    } catch (error) {
        console.error("Error verifying on-chain attestation:", error);
    }
}

// Example test function
async function runVerification() {
    // Replace with actual data
    const attestationUID = "0x20351f973fdec1478924c89dfa533d8f872defa108d9c3c6512267d7e7e5dbc2"; // Replace with a real attestation UID
    const offchainProof = {
        version: 2,
        uid: '0x7316843198812b93d2d65bf8f69a2f1c4c0c4545bae2f41894be3e5b13d4000f',
        domain: {
          name: 'EAS Attestation',
          version: '0.26',
          chainId: 11155111n,
          verifyingContract: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'
        },
        primaryType: 'Attest',
        message: {
          version: 2,
          recipient: '0xe83F39161C51B68ecC5eDC09Fe8C5FCb0359FED7',
          expirationTime: 0,
          time: 1671219636,
          revocable: true,
          schema: '0x20351f973fdec1478924c89dfa533d8f872defa108d9c3c6512267d7e7e5dbc2',
          refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
          data: '0x00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000001b6469643a6578616d706c653a313233343536373839616263646566000000000000000000000000000000000000000000000000000000000000000000000000084a6f686e20446f6500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000043230323400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002742616368656c6f72206f6620536369656e636520696e20436f6d707574657220536369656e636500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a323032352d30362d3135000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014516d4578616d706c6543494446726f6d49504653000000000000000000000000',
          salt: '0x097ba3407d882b5f22cb1c9675dd4727315dfbeb468b9bd763d7c38cfbd9fede'
        },
        types: {
          Attest: [
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object], [Object],
            [Object]
          ]
        },
        signature: {
          v: 27,
          r: '0x41f3a81d44d59b66e2553c65292331ca6aff1ddb81131ed42b5b317647743ef3',
          s: '0x2b61bff2a33f8153c723589134b8f55458601ea90c3d070c719c697abebf23d8'
        }
      }; // Replace with a real off-chain proof object

    console.log("🔍 Verifying off-chain attestation...");
    await verifyOffchainAttestation(offchainProof);

    console.log("\n🔍 Verifying on-chain attestation...");
    await verifyOnchainAttestation(attestationUID);
}

// Execute verification
runVerification();
