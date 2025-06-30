// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

contract LicenseResolver is SchemaResolver {
    // Events
    event LicenseAttested(bytes32 indexed uid, address indexed recipient, address indexed attester);
    event LicenseRevoked(bytes32 indexed uid, address indexed recipient, address indexed revoker);

    // State variables
    mapping(bytes32 => uint256) public attestationTimestamps;

    constructor(IEAS _eas) SchemaResolver(_eas) {}

    // Attestation validation 
    function onAttest(
        Attestation calldata attestation,
        uint256 value
    ) internal override returns (bool) {
        //Recipient is not zero address
        require(attestation.recipient != address(0), "Invalid recipient");

        //Validate attestation data (check if data is not empty)
        require(attestation.data.length > 0, "Attestation data cannot be empty");

        //Time-based validation (not in the future)
        require(attestation.time <= block.timestamp, "Attestation time cannot be in the future");

        attestationTimestamps[attestation.uid] = block.timestamp;

        emit LicenseAttested(attestation.uid, attestation.recipient, attestation.attester);

        return true;
    }

    // Revocation validation with essential checks
    function onRevoke(
        Attestation calldata attestation,
        uint256 value
    ) internal override returns (bool) {
        require(attestationTimestamps[attestation.uid] > 0, "Attestation does not exist");

        require(attestation.recipient != address(0), "Invalid recipient");

        emit LicenseRevoked(attestation.uid, attestation.recipient, msg.sender);

        return true;
    }

    function getAttestationTimestamp(bytes32 uid) external view returns (uint256) {
        return attestationTimestamps[uid];
    }
}
