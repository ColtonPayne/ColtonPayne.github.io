// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author: manifold.xyz

import "hardhat/console.sol";

import "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/IERC721CreatorCore.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/CreatorCore.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";



contract Token is AdminControl, ICreatorExtensionTokenURI{
    address private _core;
    string private _firstURI;

    mapping(uint256 => string) public URIMap;

    function initialize(address core) public adminRequired {
      _core = core;
      IERC721CreatorCore(_core).mintExtension(msg.sender);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AdminControl, IERC165) returns (bool) {
        return interfaceId == type(ICreatorExtensionTokenURI).interfaceId || AdminControl.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }

    function setURI(address core, uint256 tokenId, string memory jsonURL) public adminRequired {
        require(_core == core, "Not owner");
        URIMap[tokenId] = jsonURL;
        IERC721CreatorCore(_core).setTokenURIExtension(tokenId, jsonURL);
    }

    function tokenURI(address core, uint256 tokenId) external view override returns (string memory) {
       require(_core == core, "Not owner");
       return URIMap[tokenId];
    }
}
