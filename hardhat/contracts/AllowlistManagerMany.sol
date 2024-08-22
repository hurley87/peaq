// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract AllowlistManagerMany {
    // The admin address that has permission to manage the allowlist and perform other admin actions
    address public admin;

    // Mapping from NFT contract addresses to a boolean indicating if it's a supported collection
    mapping(address => bool) public supportedCollections;

    // Mapping to track which addresses are allowed to claim NFTs from which collections
    // For each user address, we map an NFT collection address to a boolean indicating allowlist status
    mapping(address => mapping(address => bool)) public isAllowed;

    // Constructor function that initializes the admin and adds an initial NFT contract as supported
    constructor(address initialNftContract) {
        admin = msg.sender; // Set the admin as the deployer of this contract
        supportedCollections[initialNftContract] = true; // Add the initial NFT contract to the supported collections
    }

    // Function to add a new NFT collection to the supported list
    // Only the admin can call this function
    function addCollection(address nftContract) external {
        require(msg.sender == admin, "Only admin can add collections");
        supportedCollections[nftContract] = true; // Mark the NFT collection as supported
    }

    // Function to remove an NFT collection from the supported list
    // Only the admin can call this function
    function removeCollection(address nftContract) external {
        require(msg.sender == admin, "Only admin can remove collections");
        supportedCollections[nftContract] = false; // Mark the NFT collection as no longer supported
    }

    // Function to add a user to the allowlist for a specific NFT collection
    // Only the admin can call this function
    function addToAllowlist(address user, address nftContract) external {
        require(msg.sender == admin, "Only admin can add to the allowlist");
        require(supportedCollections[nftContract], "NFT collection is not supported");
        isAllowed[user][nftContract] = true; // Mark the user as allowed to claim an NFT from this collection
    }

    // Function to remove a user from the allowlist for a specific NFT collection
    // Only the admin can call this function
    function removeFromAllowlist(address user, address nftContract) external {
        require(msg.sender == admin, "Only admin can remove from the allowlist");
        require(supportedCollections[nftContract], "NFT collection is not supported");
        isAllowed[user][nftContract] = false; // Mark the user as not allowed to claim an NFT from this collection
    }

    // Function for a user to claim an NFT from a specific collection if they are on the allowlist
    function claimNFT(address nftContract, uint256 tokenId) external {
        require(supportedCollections[nftContract], "NFT collection is not supported");
        require(isAllowed[msg.sender][nftContract], "Not eligible to claim NFT from this collection");

        // Transfer the NFT from the admin (or contract) to the caller's address
        // This assumes the admin owns the NFT and has approved this contract to transfer it
        IERC721(nftContract).transferFrom(admin, msg.sender, tokenId);

        // Optionally, remove the user from the allowlist after they have claimed their NFT
        isAllowed[msg.sender][nftContract] = false;
    }
}