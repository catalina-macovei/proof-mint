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
    mapping(address => string) public didToEASUID; 
    mapping(string => mapping(address => bool)) public existingLicenses;
    string[] public easUIDs; 

    event LicenseIssued(string easUID, address studentDID, string ipfsCID);
    event LicenseRevoked(string easUID, address studentDID);
    event IssuerAdded(address issuer);
    event IssuerRemoved(address issuer);

    modifier onlyOwner(string memory _easUID) {
        require(licenses[_easUID].studentDID == msg.sender, "Not the license owner");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Contract deployer = Admin
        _grantRole(ISSUER_ROLE, msg.sender); // Deployer is also an issuer
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
        didToEASUID[_studentDID] = _easUID;
        existingLicenses[_ipfsCID][_studentDID] = true;
        easUIDs.push(_easUID);

        emit LicenseIssued(_easUID, _studentDID, _ipfsCID);
    }

    function revokeLicense(string memory _easUID) external onlyRole(ISSUER_ROLE) onlyOwner(_easUID) {
        require(bytes(_easUID).length > 0, "Invalid EAS UID");
        require(licenses[_easUID].studentDID != address(0), "License does not exist");

        licenses[_easUID].isValid = false;
        address student = licenses[_easUID].studentDID;
        string memory ipfsCID = licenses[_easUID].ipfsCID;

        // Remove the mappings
        delete didToEASUID[student];
        delete existingLicenses[ipfsCID][student];

        // Remove from easUIDs array
        for (uint256 i = 0; i < easUIDs.length; i++) {
            if (keccak256(abi.encodePacked(easUIDs[i])) == keccak256(abi.encodePacked(_easUID))) {
                easUIDs[i] = easUIDs[easUIDs.length - 1];
                easUIDs.pop(); 
                break;
            }
        }

        emit LicenseRevoked(_easUID, student);
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

    function getLicenseByDID(address _studentDID) external view onlyOwner(didToEASUID[_studentDID]) returns (
        string memory, string memory, address, bool, uint256, string memory
    ) {
        string memory easUID = didToEASUID[_studentDID];
        require(bytes(easUID).length > 0, "No license found for this DID");
        License memory license = licenses[easUID];
        return (license.ipfsCID, license.easUID, license.studentDID, license.isValid, license.timestamp, license.proof);
    }

    function getAllLicenses() external view onlyRole(ISSUER_ROLE) returns (License[] memory) {
        License[] memory allLicenses = new License[](easUIDs.length);
        for (uint256 i = 0; i < easUIDs.length; i++) {
            allLicenses[i] = licenses[easUIDs[i]];
        }
        return allLicenses;
    }
}
