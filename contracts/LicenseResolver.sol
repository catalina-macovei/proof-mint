// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";

contract LicenseResolver is SchemaResolver {
    constructor(IEAS _eas) SchemaResolver(_eas) {}

    // Approves all attestations
    function onAttest(
        Attestation calldata attestation,
        uint256 value
    ) internal override returns (bool) {
        return true;
    }

    // Does not allow revocations (but can be modified if needed)
    function onRevoke(
        Attestation calldata attestation,
        uint256 value
    ) internal override returns (bool) {
        return false;
    }
}
