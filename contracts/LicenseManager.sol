// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LicenseManager {
    struct License {
        string ipfsCID;      
        address studentDID;  
        bool isValid;        
        uint256 timestamp;   
    }

    mapping(string => License) public licenses;
    mapping(address => bool) public isIssuer;
    
    event LicenseIssued(string ipfsCID, address studentDID);
    event LicenseRevoked(string ipfsCID, address studentDID);
    event IssuerAdded(address issuer);
    event IssuerRemoved(address issuer);

    modifier onlyIssuer() {
        require(isIssuer[msg.sender], "Not authorized as issuer");
        _;
    }

    constructor() {
        isIssuer[msg.sender] = true;
        emit IssuerAdded(msg.sender);
    }

    // se verifica daca issuerul exista si daca nu este el insusi, altfel nu se poate adauga
    function addIssuer(address _newIssuer) external onlyIssuer {
        isIssuer[_newIssuer] = true;
        emit IssuerAdded(_newIssuer);
    }

    // se verifica daca issuerul exista si daca nu este el insusi, altfel nu se poate sterge
    function removeIssuer(address _issuer) external onlyIssuer {
        require(_issuer != msg.sender, "Cannot remove self");
        isIssuer[_issuer] = false;
        emit IssuerRemoved(_issuer);
    }

    // se verifica CID, DID si daca acestea deja exista -> nu se poate crea o noua licenta
    function issueLicense(string memory _ipfsCID, address _studentDID) external onlyIssuer {
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        require(_studentDID != address(0), "Invalid student DID");
        require(licenses[_ipfsCID].studentDID == address(0), "License already exists");

        licenses[_ipfsCID] = License({
            ipfsCID: _ipfsCID,
            studentDID: _studentDID,
            isValid: true,
            timestamp: block.timestamp
        });

        emit LicenseIssued(_ipfsCID, _studentDID);
    }

    // se verifica CID si daca exista deja o licenta cu acest CID -> se poate sterge
    function revokeLicense(string memory _ipfsCID) external onlyIssuer {
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        require(licenses[_ipfsCID].studentDID != address(0), "License does not exist");
        
        // Check if the license is already revoked (i.e., isValid is false)
        //require(licenses[_ipfsCID].isValid == false, "License is already revoked");

        licenses[_ipfsCID].isValid = false;
        
        emit LicenseRevoked(_ipfsCID, licenses[_ipfsCID].studentDID);
    }

    function verifyLicense(string memory _ipfsCID) external view returns (bool isValid, address studentDID) {
        License memory license = licenses[_ipfsCID];
        return (license.isValid, license.studentDID);
    }

    function getLicenseDetails(string memory _ipfsCID) external view returns (License memory) {
        return licenses[_ipfsCID];
    }
}
