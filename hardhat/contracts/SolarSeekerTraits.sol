// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract SolarSeekerTraits is
  ERC721,
  ERC721Enumerable,
  ERC721URIStorage,
  Ownable
{
  uint256 private _nextTokenId;

  // Mapping to track the number of SolarSeekers each address is allowed to mint
  mapping(address => uint256) public mintAllowance;

  constructor()
    ERC721('Solar Seeker Traits', 'SolarSeekerTraits')
    Ownable(msg.sender)
  {}

  // Increase mint allowance for a single address by 1
  function allowMint(address receiver) public onlyOwner {
    mintAllowance[receiver]++;
  }

  // Increase mint allowance for a single address by a specified amount
  function allowMint(address receiver, uint256 amt) public onlyOwner {
    mintAllowance[receiver] += amt;
  }

  // Increase mint allowance for multiple addresses by a specified amount
  function allowMint(
    address[] calldata receivers,
    uint256 amt
  ) public onlyOwner {
    for (uint256 i; i < receivers.length; i++) {
      mintAllowance[receivers[i]] += amt;
    }
  }

  // Mint a new token to a specified address with a given URI, respecting mint allowance
  function safeMint(address to, string memory uri) public {
    require(mintAllowance[msg.sender] > 0, 'No mints allowed');
    mintAllowance[msg.sender]--;
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
  }

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal override(ERC721, ERC721Enumerable) returns (address) {
    return super._update(to, tokenId, auth);
  }

  function _increaseBalance(
    address account,
    uint128 value
  ) internal override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, value);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    override(ERC721, ERC721Enumerable, ERC721URIStorage)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
