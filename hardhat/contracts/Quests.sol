// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Quests is Ownable {
    IERC721Enumerable public traits;

    // Mapping to track which users are allowed and which tokenId they can claim
    mapping(address => uint256) public allowedUsers;

    // Mapping to ensure that a tokenId can only be claimed once
    mapping(uint256 => bool) public traitClaimed;

    constructor(IERC721Enumerable _nftContract) Ownable(msg.sender) {
        traits = _nftContract;
    }

    // Function to add a user to the allowlist with a specific tokenId
    function addToAllowlist(address user, uint256 tokenId) external onlyOwner {
        require(!traitClaimed[tokenId], "NFT already claimed or assigned");

        allowedUsers[user] = tokenId; // Assign the specific tokenId to the user
        traitClaimed[tokenId] = true;   // Mark the tokenId as assigned to prevent multiple claims
    }

    // Function to remove a user from the allowlist and burn the assigned NFT
    function removeFromAllowlist(address user) external onlyOwner {
        uint256 tokenId = allowedUsers[user];
        require(tokenId != 0, "User has no assigned NFT");

        // Remove the user from the allowlist
        delete allowedUsers[user];

        // Unmark the tokenId as claimed
        traitClaimed[tokenId] = false;
    }

    // Change from external to public
    function canClaim(address user) public view returns (bool) {
        return allowedUsers[user] != 0;
    }

    // Function for a user to claim their assigned NFT
    function claimNFT() external {
        uint256 tokenId = allowedUsers[msg.sender];
        require(tokenId != 0, "Not eligible to claim NFT");

        // Transfer the assigned NFT from the contract to the caller
        traits.safeTransferFrom(owner(), msg.sender, tokenId);

        // Clear the allowlist entry for the user after they claim their NFT
        delete allowedUsers[msg.sender];

        // Unmark the tokenId as claimed
        traitClaimed[tokenId] = false;
    }

}