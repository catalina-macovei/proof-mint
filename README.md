# ProofMINT :rocket:
A blockchain app for decentralized certificate verification.


## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
  - [Diagrams](#diagrams)
- [Authors](#authors)

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
- Make sure to change .env variables
```
INFURA_API_KEY=
PRIVATE_KEY=
KEY=
PROOF=
```
- Run the app with        
```
npm start
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

### Diagrams
#### The process of uploading a file to IPFS:
![Process Diagram](frontend/public/images/process-diagram.png)
#### The workflow of the app:
![Workflow Diagram](frontend/public/images/image.png)

#### SSI concept diagram:
![SSI Diagram](frontend/public/images/ssi-diagram.png)

## Authors
- Macovei Catalina 