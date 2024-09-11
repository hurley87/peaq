// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Quests.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract QuestsFactory is Ownable {
    address[] public questContracts;

    constructor() Ownable(msg.sender) {}

    // Function to create a new Quest contract for a specific NFT collection
    function createQuest(address nftContract) external onlyOwner returns (address) {
        // Deploy a new Quests contract
        Quests quest = new Quests(IERC721Enumerable(nftContract));

        // Transfer ownership of the newly created Quests contract to the factory owner
        quest.transferOwnership(owner());

        // Store the new contract's address
        questContracts.push(address(quest));

        return address(quest);
    }

    // Function to get all allowlist contracts deployed by the factory
    function getQuests() external view returns (address[] memory) {
        return questContracts;
    }
}