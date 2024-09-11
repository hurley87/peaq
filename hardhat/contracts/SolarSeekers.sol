// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

contract SolarSeekers is ERC721Enumerable, ERC721URIStorage {
  struct SolarSeekerTraits {
    uint256[4] necessaryTraits;
    uint256[3] optionalTraits;
  }

  uint256 private _nextTokenId;
  address public immutable traitContract;
  mapping(uint256 => SolarSeekerTraits) private _solarSeekerTraits;

  constructor(address _traitContract) ERC721('Solar Seekers', 'SolarSeekers') {
    traitContract = _traitContract;
    _nextTokenId = 1;
  }

  function mintWithTraits(
    uint256[4] calldata necessaryTraits,
    string memory tokenUri
  ) external {
    _validateTraitOwnership(necessaryTraits);
    uint256 tokenId = _mintSolarSeeker(tokenUri);
    _equipNecessaryTraits(tokenId, necessaryTraits);
  }

  function updateTraits(
    uint256 tokenId,
    uint256[] calldata newTraitIds,
    uint8[] calldata traitSlots,
    string memory newTokenUri
  ) external {
    require(ownerOf(tokenId) == msg.sender, 'Not the owner of this NFT');
    require(
      newTraitIds.length == traitSlots.length,
      'Mismatched input lengths'
    );

    for (uint256 i = 0; i < newTraitIds.length; i++) {
      _updateTrait(tokenId, newTraitIds[i], traitSlots[i]);
    }

    _setTokenURI(tokenId, newTokenUri);
  }

  function getEquippedTraits(
    uint256 tokenId
  ) external view returns (uint256[7] memory) {
    require(_exists(tokenId), 'Token does not exist');
    SolarSeekerTraits storage traits = _solarSeekerTraits[tokenId];
    return [
      traits.necessaryTraits[0],
      traits.necessaryTraits[1],
      traits.necessaryTraits[2],
      traits.necessaryTraits[3],
      traits.optionalTraits[0],
      traits.optionalTraits[1],
      traits.optionalTraits[2]
    ];
  }

  // Internal functions
  function _validateTraitOwnership(uint256[4] calldata traits) internal view {
    for (uint256 i = 0; i < 4; i++) {
      require(
        IERC721(traitContract).ownerOf(traits[i]) == msg.sender,
        'You do not own the necessary trait NFTs'
      );
    }
  }

  function _mintSolarSeeker(string memory tokenUri) internal returns (uint256) {
    uint256 tokenId = _nextTokenId;
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, tokenUri);
    _nextTokenId++;
    return tokenId;
  }

  function _equipNecessaryTraits(
    uint256 tokenId,
    uint256[4] calldata traits
  ) internal {
    for (uint256 i = 0; i < 4; i++) {
      _solarSeekerTraits[tokenId].necessaryTraits[i] = traits[i];
    }
  }

  function _updateTrait(
    uint256 tokenId,
    uint256 newTraitId,
    uint8 slot
  ) internal {
    require(slot < 7, 'Invalid slot, must be between 0 and 6');
    require(
      IERC721(traitContract).ownerOf(newTraitId) == msg.sender,
      'You do not own the trait NFT'
    );

    if (slot < 4) {
      require(newTraitId != 0, 'Necessary traits cannot be unequipped');
      _solarSeekerTraits[tokenId].necessaryTraits[slot] = newTraitId;
    } else {
      _solarSeekerTraits[tokenId].optionalTraits[slot - 4] = newTraitId;
    }
  }

  // Override functions to resolve conflicts
  function _increaseBalance(
    address account,
    uint128 value
  ) internal virtual override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, value);
  }

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
    return super._update(to, tokenId, auth);
  }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    virtual
    override(ERC721Enumerable, ERC721URIStorage)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function _exists(uint256 tokenId) internal view returns (bool) {
    return _ownerOf(tokenId) != address(0);
  }
}
