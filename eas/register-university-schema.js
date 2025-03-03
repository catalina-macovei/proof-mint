require('dotenv').config();
const { ethers } = require("ethers");
const { SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");

async function registerSchema() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Correct Schema Registry Address for Sepolia
  const SCHEMA_REGISTRY_ADDRESS = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0";
  
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  const connectedSchemaRegistry = schemaRegistry.connect(wallet);

  const schemaDefinition = "string studentDID,string studentName,uint256 graduationYear,string degree,string issuanceDate,string CID";
  const resolverAddress = "0x0000000000000000000000000000000000000000";
  
  console.log("Registering schema...");
  const transaction = await connectedSchemaRegistry.register({
    schema: schemaDefinition,
    resolverAddress,
    revocable: true
  });

  const receipt = await transaction.wait();
  console.log("Transaction hash:", receipt.hash);
  
  const schemaUID = ethers.keccak256(ethers.toUtf8Bytes(schemaDefinition));
  console.log("Schema UID:", schemaUID);
  console.log("Schema registered successfully!");
}

registerSchema().catch(console.error);
