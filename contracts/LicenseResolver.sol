// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

contract LicenseResolver is SchemaResolver {
    address public owner;
    mapping(string => bool) public verifiedUniversities;

    constructor(IEAS eas, address _owner) SchemaResolver(eas) {
        owner = _owner;
    }

    function addVerifiedUniversity(string memory universityDID) public {
        verifiedUniversities[universityDID] = true;
    }

    function onAttest(
        Attestation calldata attestation,
        uint256 value // Corrected: use uint256
    ) internal view override returns (bool) {
        (string memory universityDID, , uint256 graduationYear, , , ) = abi.decode(attestation.data, (string, string, uint256, string, string, string));
        return verifiedUniversities[universityDID];
    }

    function onRevoke(
        Attestation calldata, 
        uint256 value
    ) internal pure override returns (bool) {
        return true;
    }
}