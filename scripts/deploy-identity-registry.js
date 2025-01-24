const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of IdentityRegistry...");
  
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  console.log("Contract factory created, deploying...");
  
  const identityRegistry = await IdentityRegistry.deploy();
  console.log("Waiting for deployment transaction...");
  
  await identityRegistry.waitForDeployment();
  const address = await identityRegistry.getAddress();
  
  console.log("✅ IdentityRegistry deployed successfully!");
  console.log("📝 Contract Address:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
