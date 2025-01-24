// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CredentialVerifier {
    struct Verification {
        address verifier;
        bytes32 documentHash;
        uint256 timestamp;
        bool isValid;
    }

    mapping(bytes32 => Verification) public verifications;
    bytes32[] public verifiedDocuments;

    event DocumentVerified(bytes32 indexed documentHash, address indexed verifier);
    event VerificationRevoked(bytes32 indexed documentHash, address indexed verifier);

    function verifyDocument(bytes32 _documentHash) external {
        require(verifications[_documentHash].verifier == address(0), "Document already verified");
        
        Verification memory newVerification = Verification({
            verifier: msg.sender,
            documentHash: _documentHash,
            timestamp: block.timestamp,
            isValid: true
        });
        
        verifications[_documentHash] = newVerification;
        verifiedDocuments.push(_documentHash);
        
        emit DocumentVerified(_documentHash, msg.sender);
    }

    function revokeVerification(bytes32 _documentHash) external {
        require(verifications[_documentHash].verifier == msg.sender, "Not the original verifier");
        require(verifications[_documentHash].isValid, "Verification already revoked");
        
        verifications[_documentHash].isValid = false;
        emit VerificationRevoked(_documentHash, msg.sender);
    }

    function getVerification(bytes32 _documentHash) external view returns (Verification memory) {
        return verifications[_documentHash];
    }

    function getAllVerifiedDocuments() external view returns (bytes32[] memory) {
        return verifiedDocuments;
    }
}
