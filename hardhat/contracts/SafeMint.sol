// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// SafeMint contract: Implements a secure minting process for NFTs
contract SafeMint is ERC721 {
    using ECDSA for bytes32;

    address public admin;               
    address public trustedBackendSigner;
    uint256 public tokenIdCounter;

    // Constructor: Initializes the contract with a trusted backend signer
    constructor(address _trustedBackendSigner) ERC721("QuestNFT", "QNFT") {
        admin = msg.sender;
        trustedBackendSigner = _trustedBackendSigner;
        tokenIdCounter = 1;
    }

    // Mint function: Allows users to mint NFTs with a valid signature
    function mintNFT(bytes32 _messageHash, bytes memory _signature) external {
        // Verify the signature using ECDSA recovery
        address signer = ECDSA.recover(_messageHash, _signature);
        require(signer == trustedBackendSigner, "Invalid signature");

        // Proceed with minting the NFT
        _mint(msg.sender, tokenIdCounter);
        tokenIdCounter++;
    }

    // Admin function: Update the trusted backend signer
    function updateTrustedBackendSigner(address newSigner) external {
        require(msg.sender == admin, "Only admin can update the trusted backend signer");
        trustedBackendSigner = newSigner;
    }
}