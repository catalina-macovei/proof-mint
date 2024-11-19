# ProofMINT :rocket:
A blockchain app for decentralized certificate verification.

## Getting Started
### Prerequisites   
- Node.js
- npm
- Hardhat
- Metamask
- Infura
- Web3.storage
- React

### Installing
- Clone the repository
- Install the dependencies
```
npm install
```
- Run the app with        
```
npm start
```
- Make sure to change .env variables
```
INFURA_API_KEY=
PRIVATE_KEY=
KEY=
PROOF=
```

- In another terminal run the server.js
```
node server.js
```

- Compile the contracts
```
npx hardhat compile
```
- Deploy the contract
```
npx hardhat run scripts/deploy-contract-name.js --network sepolia
```
- Run the tests
```
npx hardhat test
```

The process of uploading a file to IPFS:
![Process Diagram](frontend/public/images/process-diagram.png)


## Authors
- Macovei Catalina 