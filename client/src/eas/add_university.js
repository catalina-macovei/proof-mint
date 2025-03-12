const { ethers } = require("ethers");

async function addVerifiedUniversity() {
    try {
        // Connect to the blockchain
        const provider = new ethers.JsonRpcProvider(
            "https://sepolia.infura.io/v3/de45f863bca94210b908eb51d7de3c49"
        );
        const wallet = new ethers.Wallet(
            "0x5202286b0b2a5fc7f7d03e452a910e82c846846e98e5e7d85900a29a9ff9fb3b",
            provider
        );

        // Replace with your deployed resolver contract address
        const resolverAddress = "0x6ea31D00D3f23F953c18F0F65ddd48AD465e4429";

        // ABI with only the function you need
        const resolverAbi = [
            "function addVerifiedUniversity(string memory universityDID) public"
        ];

        // Connect to the contract
        const resolverContract = new ethers.Contract(resolverAddress, resolverAbi, wallet);

        // Call the function to add the university
        const tx = await resolverContract.addVerifiedUniversity("did:ethr:0xb4baa0098fe8ff203c2a419a8bd24173e5f94eb1");
        console.log("Transaction submitted:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("University added successfully:", receipt);
    } catch (error) {
        console.error("Error adding university:", error);
    }
}

// Call the function before issuing the attestation
addVerifiedUniversity();
