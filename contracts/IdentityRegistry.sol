// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IdentityRegistry {
    struct Identity {
        address owner;
        bytes32 publicKey;
        bool isActive;
        uint256 createdAt;
    }

    mapping(address => Identity) public identities;
    address[] public registeredIdentities;
    
    event IdentityCreated(address indexed owner, bytes32 publicKey);
    event IdentityDeactivated(address indexed owner);
    event IdentityReactivated(address indexed owner);

    function createIdentity(bytes32 _publicKey) external {
        require(identities[msg.sender].owner == address(0), "Identity already exists");
        
        Identity memory newIdentity = Identity({
            owner: msg.sender,
            publicKey: _publicKey,
            isActive: true,
            createdAt: block.timestamp
        });
        
        identities[msg.sender] = newIdentity;
        registeredIdentities.push(msg.sender);
        
        emit IdentityCreated(msg.sender, _publicKey);
    }

    function deactivateIdentity() external {
        require(identities[msg.sender].owner != address(0), "Identity does not exist");
        require(identities[msg.sender].isActive, "Identity already deactivated");
        
        identities[msg.sender].isActive = false;
        emit IdentityDeactivated(msg.sender);
    }

    function reactivateIdentity() external {
        require(identities[msg.sender].owner != address(0), "Identity does not exist");
        require(!identities[msg.sender].isActive, "Identity already active");
        
        identities[msg.sender].isActive = true;
        emit IdentityReactivated(msg.sender);
    }

    function getIdentity(address _owner) external view returns (Identity memory) {
        return identities[_owner];
    }

    function getAllIdentities() external view returns (address[] memory) {
        return registeredIdentities;
    }
}
