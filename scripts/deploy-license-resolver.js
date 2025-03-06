const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with address:", deployer.address);

    // EAS contract address on Sepolia
    const easAddress = process.env.EAS_CONTRACT_ADDRESS;

    // Deploy LicenseResolver
    const LicenseResolver = await ethers.getContractFactory("LicenseResolver");
    const licenseResolver = await LicenseResolver.deploy(easAddress);

    await licenseResolver.waitForDeployment();

    console.log("LicenseResolver deployed to:", await licenseResolver.getAddress());
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});
