const { ethers } = require("ethers");
const { EAS, SchemaEncoder } = require("@ethereum-attestation-service/eas-sdk");

async function issueAttestation() {
  try {
    // --------------------------------------------------------------
    // 1. Setup Provider and Wallet
    // --------------------------------------------------------------
    // Connect to the Sepolia network using an Infura endpoint.
    const provider = new ethers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/de45f863bca94210b908eb51d7de3c49"
    );
    // Create a wallet instance using your private key and connect it to the provider.
    const wallet = new ethers.Wallet(
      "0x5202286b0b2a5fc7f7d03e452a910e82c846846e98e5e7d85900a29a9ff9fb3b",
      provider
    );

    // --------------------------------------------------------------
    // 2. Check Wallet Balance
    // --------------------------------------------------------------
    // Retrieve the wallet balance as a native BigInt.
    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

    // Ensure there is at least 0.01 ETH to cover gas fees.
    if (balance < ethers.parseEther("0.01")) {
      console.error("Error: Insufficient balance. Please fund your wallet.");
      return;
    }

    // --------------------------------------------------------------
    // 3. Initialize the EAS Contract Instance
    // --------------------------------------------------------------
    // The EAS contract is used to issue attestations.
    // Sepolia EAS Contract Address: 0xC2679fBD37d54388Ce493F1DB75320D236e1815e
    const eas = new EAS("0xC2679fBD37d54388Ce493F1DB75320D236e1815e").connect(wallet);

    // --------------------------------------------------------------
    // 4. Define the Attestation Schema and Encode Data
    // --------------------------------------------------------------
    // Use the schema UID of your pre-registered schema.
    const schemaUID = "0x56021403d12a79cf689428a334b1a5c693e41233ff5d3b7e56e32fde6378320d";
    // Define the exact schema structure as registered.
    const schemaEncoder = new SchemaEncoder(
        "string studentDID,string studentName,uint256 graduationYear,string degree,string issuanceDate,string CID"
      );
  
      // Encode the attestation data to match the schema.
      const encodedData = schemaEncoder.encodeData([
        { name: "studentDID", value: "did:ethr:0xe83F39161C51B68ecC5eDC09Fe8C5FCb0359FED7", type: "string" },
        { name: "studentName", value: "Test Name", type: "string" },
        { name: "graduationYear", value: 2024, type: "uint256" }, // Example value
        { name: "degree", value: "Test Degree", type: "string" }, // Example value
        { name: "issuanceDate", value: "2024-01-01", type: "string" }, // Example value
        { name: "CID", value: "QmTestCID", type: "string" }, // Example value
      ]);
  

    // --------------------------------------------------------------
    // 5. Estimate Gas and Issue the Attestation Transaction
    // --------------------------------------------------------------
    try {
      // Submit the attestation transaction with a gas limit buffer (doubling the estimate).
      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: "0xe83F39161C51B68ecC5eDC09Fe8C5FCb0359FED7",
          data: encodedData,
          expirationTime: 0,
          revocable: true,
        },
        gasLimit: 3000000, // Or a higher value
      });
      console.log("Transaction submitted:", tx.hash);

      // Wait for transaction confirmation.
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
    } catch (error) {
      console.error("Gas estimation or transaction submission failed:", error);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Execute the function to issue the attestation.
issueAttestation();
