// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract PrivateLicense is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct License {
        string ipfsCID;
        string easUID;    
        address studentDID;
        bool isValid;
        uint256 timestamp;
        string proof;
    }

    mapping(string => License) public licenses; 
    mapping(address => string[]) public didToEASUIDs; 
    mapping(string => mapping(address => bool)) public existingLicenses;
    string[] public easUIDs; 

    event LicenseIssued(string easUID, address studentDID, string ipfsCID, string proof);
    event LicenseRevoked(string easUID, address studentDID);
    event IssuerAdded(address issuer);
    event IssuerRemoved(address issuer);

    modifier onlyOwner(string memory _easUID) {
        require(licenses[_easUID].studentDID != address(0), "License does not exist");
        require(
            licenses[_easUID].studentDID == msg.sender || hasRole(ISSUER_ROLE, msg.sender), 
            "Not the license owner or issuer"
        );
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        emit IssuerAdded(msg.sender);
    }

    function addIssuer(address _newIssuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ISSUER_ROLE, _newIssuer);
        emit IssuerAdded(_newIssuer);
    }

    function removeIssuer(address _issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, _issuer);
        emit IssuerRemoved(_issuer);
    }

    function licenseExists(string memory _ipfsCID, address _studentDID) public view returns (bool) {
        return existingLicenses[_ipfsCID][_studentDID];
    }

    function getRole(address account) public view returns (string memory) {
        if (hasRole(DEFAULT_ADMIN_ROLE, account)) return "Admin";
        if (hasRole(ISSUER_ROLE, account)) return "Issuer";
        return "User";
    }

    function issueLicense(
        string memory _easUID, 
        string memory _ipfsCID, 
        address _studentDID,
        string memory _proof
    ) external onlyRole(ISSUER_ROLE) {
        require(bytes(_easUID).length > 0, "Invalid EAS UID");
        require(bytes(_ipfsCID).length > 0, "Invalid ipfsCID");
        require(_studentDID != address(0), "Invalid student DID");
        require(licenses[_easUID].studentDID == address(0), "License already exists");
        require(!licenseExists(_ipfsCID, _studentDID), "License with this ipfsCID and DID already exists");

        licenses[_easUID] = License(_ipfsCID, _easUID, _studentDID, true, block.timestamp, _proof);
        didToEASUIDs[_studentDID].push(_easUID);
        existingLicenses[_ipfsCID][_studentDID] = true;
        easUIDs.push(_easUID);

        emit LicenseIssued(_easUID, _studentDID, _ipfsCID, _proof);
    }

    function revokeLicense(string memory _easUID) external onlyOwner(_easUID) {
        require(licenses[_easUID].isValid, "License already revoked");
        
        address studentDID = licenses[_easUID].studentDID;

        licenses[_easUID].isValid = false;

        emit LicenseRevoked(_easUID, studentDID);
    }

    function verifyLicense(string memory _easUID) external view returns (bool isValid, address studentDID) {
        License memory license = licenses[_easUID];
        return (license.isValid, license.studentDID);
    }

    function getLicenseDetails(string memory _easUID) external view returns (
        string memory, string memory, address, bool, uint256, string memory
    ) {
        License memory license = licenses[_easUID];
        return (license.ipfsCID, license.easUID, license.studentDID, license.isValid, license.timestamp, license.proof);
    }

    function getLicensesByDID(address _studentDID) external view returns (
        string[] memory, string[] memory, bool[] memory, uint256[] memory, string[] memory
    ) {
        require(_studentDID == msg.sender, "Only license owner can access their licenses");
        
        string[] memory studentEASUIDs = didToEASUIDs[_studentDID];

        string[] memory ipfsCIDs = new string[](studentEASUIDs.length);
        bool[] memory isValidArray = new bool[](studentEASUIDs.length);
        uint256[] memory timestamps = new uint256[](studentEASUIDs.length);
        string[] memory proofs = new string[](studentEASUIDs.length);

        for (uint256 i = 0; i < studentEASUIDs.length; i++) {
            License memory license = licenses[studentEASUIDs[i]];
            ipfsCIDs[i] = license.ipfsCID;
            isValidArray[i] = license.isValid;
            timestamps[i] = license.timestamp;
            proofs[i] = license.proof;
        }

        return (studentEASUIDs, ipfsCIDs, isValidArray, timestamps, proofs);
    }

    function getAllLicenses() external view onlyRole(ISSUER_ROLE) returns (License[] memory) {
        License[] memory allLicenses = new License[](easUIDs.length);
        for (uint256 i = 0; i < easUIDs.length; i++) {
            allLicenses[i] = licenses[easUIDs[i]];
        }
        return allLicenses;
    }
}
