// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LicenseManager {
    struct License {
        string ipfsCID;
        string easUID;    
        address studentDID;
        bool isValid;
        uint256 timestamp;
    }

    mapping(string => License) public licenses;
    mapping(address => string) public didToCID;
    mapping(address => bool) public isIssuer;
    string[] public licenseCIDs;

    event LicenseIssued(string ipfsCID, string easUID, address studentDID);
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

    function addIssuer(address _newIssuer) external onlyIssuer {
        isIssuer[_newIssuer] = true;
        emit IssuerAdded(_newIssuer);
    }

    function removeIssuer(address _issuer) external onlyIssuer {
        require(_issuer != msg.sender, "Cannot remove self");
        isIssuer[_issuer] = false;
        emit IssuerRemoved(_issuer);
    }

    function issueLicense(string memory _ipfsCID, string memory _easUID, address _studentDID) external onlyIssuer {
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        require(bytes(_easUID).length > 0, "Invalid EAS UID");
        require(_studentDID != address(0), "Invalid student DID");
        require(licenses[_ipfsCID].studentDID == address(0), "License already exists");
        require(bytes(didToCID[_studentDID]).length == 0, "DID already has a license");

        licenses[_ipfsCID] = License(_ipfsCID, _easUID, _studentDID, true, block.timestamp);
        didToCID[_studentDID] = _ipfsCID;
        licenseCIDs.push(_ipfsCID);

        emit LicenseIssued(_ipfsCID, _easUID, _studentDID);
    }

    function revokeLicense(string memory _ipfsCID) external onlyIssuer {
        require(bytes(_ipfsCID).length > 0, "Invalid IPFS CID");
        require(licenses[_ipfsCID].studentDID != address(0), "License does not exist");

        licenses[_ipfsCID].isValid = false;
        address student = licenses[_ipfsCID].studentDID;

        // Remove the mapping
        delete didToCID[student];

        // Remove from licenseCIDs array
        for (uint256 i = 0; i < licenseCIDs.length; i++) {
            if (keccak256(abi.encodePacked(licenseCIDs[i])) == keccak256(abi.encodePacked(_ipfsCID))) {
                licenseCIDs[i] = licenseCIDs[licenseCIDs.length - 1]; // Swap
                licenseCIDs.pop(); // Remove
                break;
            }
        }

        emit LicenseRevoked(_ipfsCID, student);
    }

    function verifyLicense(string memory _ipfsCID) external view returns (bool isValid, address studentDID) {
        License memory license = licenses[_ipfsCID];
        return (license.isValid, license.studentDID);
    }

    function getLicenseDetails(string memory _ipfsCID) external view returns (
        string memory, string memory, address, bool, uint256
    ) {
        License memory license = licenses[_ipfsCID];
        return (license.ipfsCID, license.easUID, license.studentDID, license.isValid, license.timestamp);
    }

    function getLicenseByDID(address _studentDID) external view returns (
        string memory, string memory, address, bool, uint256
    ) {
        string memory ipfsCID = didToCID[_studentDID];
        require(bytes(ipfsCID).length > 0, "No license found for this DID");
        License memory license = licenses[ipfsCID];
        return (license.ipfsCID, license.easUID, license.studentDID, license.isValid, license.timestamp);
    }

    function getAllLicenses() external view returns (License[] memory) {
        License[] memory allLicenses = new License[](licenseCIDs.length);
        for (uint256 i = 0; i < licenseCIDs.length; i++) {
            allLicenses[i] = licenses[licenseCIDs[i]];
        }
        return allLicenses;
    }
}
