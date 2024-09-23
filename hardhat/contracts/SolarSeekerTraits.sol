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
  uint256 private _nextTokenId = 1; // Changed from 0 to 1

  // Mapping to track the token URI each address is allowed to mint
  mapping(address => string) public allowance;

  constructor()
    ERC721('Solar Seeker Traits', 'SolarSeekerTraits')
    Ownable(msg.sender)
  {}

  // Allow minting for a single address with a specified token URI
  function allowMint(address receiver, string memory uri) public onlyOwner {
    allowance[receiver] = uri;
  }

  // Mint a new token to a specified address, using the token URI from the mint allowance
  function safeMint(address to) public {
    require(bytes(allowance[msg.sender]).length > 0, 'No mints allowed');
    string memory uri = allowance[msg.sender];
    delete allowance[msg.sender];
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
