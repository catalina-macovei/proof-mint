// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/access/Ownable.sol";

contract LicenseManager is Ownable {
    // Structure for storing license details
    struct License {
        string ipfsCID;      // IPFS hash of the diploma
        address studentDID;  // Student's DID (digital identity)
        bool isValid;        // Validity status
        uint256 timestamp;   // When the license was issued
    }

    // Mapping from license CID to License struct
    mapping(string => License) public licenses;
    
    // Events
    event LicenseIssued(string ipfsCID, address studentDID);
    event LicenseRevoked(string ipfsCID, address studentDID);

    constructor() Ownable(msg.sender) {}

    // Issue a new license
    function issueLicense(string memory _ipfsCID, address _studentDID) 
        external 
        onlyOwner 
    {
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

    // Revoke a license
    function revokeLicense(string memory _ipfsCID) 
        external 
        onlyOwner 
    {
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        require(licenses[_ipfsCID].studentDID != address(0), "License does not exist");
        
        licenses[_ipfsCID].isValid = false;
        
        emit LicenseRevoked(_ipfsCID, licenses[_ipfsCID].studentDID);
    }

    // Verify if a license is valid
    function verifyLicense(string memory _ipfsCID) 
        external 
        view 
        returns (bool isValid, address studentDID) 
    {
        License memory license = licenses[_ipfsCID];
        return (license.isValid, license.studentDID);
    }

    // Get full license details
    function getLicenseDetails(string memory _ipfsCID)
        external
        view
        returns (License memory)
    {
        return licenses[_ipfsCID];
    }
}