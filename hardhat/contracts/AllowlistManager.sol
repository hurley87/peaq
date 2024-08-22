// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for interacting with the existing ERC-721 contract
interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract AllowlistManager {
    // The admin address that has permission to manage the allowlist and perform other admin actions
    address public admin;

    // Address of the existing ERC-721 contract that holds the NFTs
    address public nftContract;

    // Mapping to track which addresses are allowed to claim an NFT
    mapping(address => bool) public isAllowed;

    // Constructor function that initializes the admin and the address of the existing NFT contract
    constructor(address _nftContract) {
        admin = msg.sender; // Set the admin as the deployer of this contract
        nftContract = _nftContract; // Set the address of the existing ERC-721 contract
    }

    // Function to add an address to the allowlist
    // Only the admin can call this function
    function addToAllowlist(address _user) external {
        require(msg.sender == admin, "Only admin can add to the allowlist");
        isAllowed[_user] = true; // Mark the address as allowed to claim an NFT
    }

    // Function to remove an address from the allowlist
    // Only the admin can call this function
    function removeFromAllowlist(address _user) external {
        require(msg.sender == admin, "Only admin can remove from the allowlist");
        isAllowed[_user] = false; // Mark the address as not allowed to claim an NFT
    }

    // Function for a user to claim an NFT if they are on the allowlist
    function claimNFT(uint256 tokenId) external {
        // Check if the caller's address is on the allowlist
        require(isAllowed[msg.sender], "Not eligible to claim NFT");

        // Transfer the NFT from the admin (or contract) to the caller's address
        // This assumes the admin owns the NFT and has approved this contract to transfer it
        IERC721(nftContract).transferFrom(admin, msg.sender, tokenId);

        // Optionally, remove the user from the allowlist after they have claimed their NFT
        isAllowed[msg.sender] = false;
    }
}