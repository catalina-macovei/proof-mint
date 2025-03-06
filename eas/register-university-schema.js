require('dotenv').config();
const { ethers } = require("ethers");
const { SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");

async function registerSchema() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Schema Registry Address for Sepolia
  const SCHEMA_REGISTRY_ADDRESS = process.env.EAS_SCHEMA_REGISTRY_ADDRESS;
  
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  const connectedSchemaRegistry = schemaRegistry.connect(wallet);

  const schemaDefinition = "string studentDID,string studentName,uint256 graduationYear,string degree,string issuanceDate,string CID";
  const resolverAddress = process.env.LICENSE_RESOLVER_CONTRACT_ADDRESS;
  
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