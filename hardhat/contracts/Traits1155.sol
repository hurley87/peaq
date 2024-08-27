// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Traits1155 is ERC1155, Ownable {
    uint256 public constant TOKEN_1 = 1;
    uint256 public constant TOKEN_2 = 2;
    uint256 public constant TOKEN_3 = 3;

    constructor() ERC1155("https://myapi.com/metadata/{id}.json") Ownable(_msgSender()) {
        // Optionally mint some initial tokens for the owner
        _mint(_msgSender(), TOKEN_1, 1000, ""); // Mint 1000 units of TOKEN_1
        _mint(_msgSender(), TOKEN_2, 500, "");  // Mint 500 units of TOKEN_2
        _mint(_msgSender(), TOKEN_3, 200, "");  // Mint 200 units of TOKEN_3
    }

    // Function to mint new tokens
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(to, id, amount, data);
    }

    // Function to mint multiple types of tokens in a batch
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    // Function to burn tokens
    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) public {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Caller is not owner nor approved"
        );
        _burn(from, id, amount);
    }

    // Function to burn multiple types of tokens in a batch
    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Caller is not owner nor approved"
        );
        _burnBatch(from, ids, amounts);
    }
}