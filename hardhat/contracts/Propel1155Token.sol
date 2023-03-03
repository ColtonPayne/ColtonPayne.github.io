// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author: manifold.xyz

import "hardhat/console.sol";

import "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/IERC721CreatorCore.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/IERC1155CreatorCore.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";
import "@manifoldxyz/creator-core-solidity/contracts/core/CreatorCore.sol";

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


contract Propel1155Token is AdminControl, ICreatorExtensionTokenURI{
    address private _core;
    uint private numTokens = 1;

    address[] addressesToMintFor;
    string [] urisToMint;
    

    /*

    struct transaction{
        string dateTime;
        address sender;
        uint amount;

    }

    */

    // Set up mappings of wallet addresses to roles, "admin" and "user"
    // Set up token type to correlate tokenId to token type "Donator" and "Recipient"


    mapping(address => uint256) public tokenIndexes; // Keep track of number of tokens for each address
    //mapping(address => string[]) public URIMap; // Map address to array of URIs
    mapping(uint => string) tokenMap;  // Map Token ID to URI
    //mapping(uint => transaction[]) transactionMap; // Map Token ID to Transaction History
    mapping(address => string) public typeMap; // Maps roles to specific addresses

    // Keep track of indicies of type donor and recipient for easy traversal of a specific type
    uint [] donorTokenIndices;
    uint [] recipientTokenIndices;


    function supportsInterface(bytes4 interfaceId) public view virtual override(AdminControl, IERC165) returns (bool) {
        return interfaceId == type(ICreatorExtensionTokenURI).interfaceId || AdminControl.supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }


    // Set core address
    function setCore(address core) public adminRequired {
        _core = core;
    }

    // Mint tokens
    function initialize() public adminRequired {
      typeMap[msg.sender] = "Admin";
    }

    // Note, single token here refers to one distinct token (there can be as many minted as provided by the ONE value in 'amount')

 function mintSingleAddressSingleToken(address mintFor, string memory tokenType, uint256[] memory amount, string memory uri) public adminRequired {

        address storeAddress;

        if (mintFor == address(0)) {
            addressesToMintFor = [address(msg.sender)];
            storeAddress = msg.sender;
            if (bytes(tokenType).length == bytes(string("Donator")).length) {
                    typeMap[mintFor] = "Donator";
                    donorTokenIndices.push(numTokens);
                } else {
                    typeMap[mintFor] = "Recipient";
                    recipientTokenIndices.push(numTokens);
                }
        }
        else {
            addressesToMintFor= [address(mintFor)];
            // Check if address to mint token for has been added to "database" of users, if not, give address a role depending on the token given to it
            if (bytes(typeMap[mintFor]).length == 0 || bytes(typeMap[mintFor]).length != bytes(string("Admin")).length) {
                if (bytes(tokenType).length == bytes(string("Donator")).length) {
                    typeMap[mintFor] = "Donator";
                    donorTokenIndices.push(numTokens);
                } else {
                    typeMap[mintFor] = "Recipient";
                    recipientTokenIndices.push(numTokens);
                }
            } else {
                require(bytes(typeMap[mintFor]).length == bytes(tokenType).length, "Minting the wrong token type for the specified address");
                if (bytes(tokenType).length == bytes(string("Donator")).length) {
                    typeMap[mintFor] = "Donator";
                    donorTokenIndices.push(numTokens);
                } else {
                    typeMap[mintFor] = "Recipient";
                    recipientTokenIndices.push(numTokens);
                }
            }
            storeAddress = mintFor;
        }

        tokenIndexes[storeAddress] += 1; // Increment TID index of specified address
        //URIMap[storeAddress].push(uri); // Add new uri to the end of specified address's list of URIs

        tokenMap[numTokens] = uri; // Map URI to Toke ID

        urisToMint = [string(uri)]; // Single token will always have one URI, so when implemented, this function should be only called with one tokenURI string

        // Mint token for Given TID
        IERC1155CreatorCore(_core).mintExtensionNew(addressesToMintFor, amount, urisToMint);

        numTokens++;
    }
    
    // This function will only be called FOR administrators because normal users will be allowed only one token type
    function mintSingleAddressMultipleTokens(address mintFor, uint256[] memory amounts, string[] memory uris) public adminRequired {
        
        address storeAddress;
        
        if (mintFor != address(0)) {
            require(bytes(typeMap[mintFor]).length == bytes("Admin").length, "Multiple tokens are only allowed for administrators");
            addressesToMintFor = [address(mintFor)];
            storeAddress = mintFor;
        } else {
            addressesToMintFor = [address(msg.sender)];
            storeAddress = msg.sender;
        }
        require(amounts.length == uris.length, "Each token MUST have a tokenURI");

        for (uint j = 0; j < amounts.length; j += 1) {
            // Increment the number of tokens for this address
            tokenIndexes[storeAddress] += 1;

            // Map the URI to the token map
            tokenMap[numTokens] = uris[j];

            if(j == 0){
                // First token is the donator token, add token this to donor list
                donorTokenIndices.push(numTokens);
            }else if(j == 1){
                // Second token is the recipient token
                recipientTokenIndices.push(numTokens);
            }
            numTokens++;
        }

        IERC1155CreatorCore(_core).mintExtensionNew(addressesToMintFor, amounts, uris);
    } 
    

    function setURI(address core, uint256[] memory tokenIdArray, string[] memory jsonURLArray) public adminRequired {
        require(_core == core, "Not owner");
        require(tokenIdArray.length == jsonURLArray.length, "Each token ID must have a token URI");

        // Update each TID with its new value from jsonURLArray
        for(uint j = 0; j < tokenIdArray.length; j += 1){
            tokenMap[tokenIdArray[j]] = jsonURLArray[j];
        }
    
        IERC1155CreatorCore(_core).setTokenURIExtension(tokenIdArray, jsonURLArray);
    }


    function tokenURIRetrieve(address core, uint256 tokenId) external view returns (string memory) {
       require(_core == core, "Not owner");
       return tokenMap[tokenId];
    }

    function tokenURI(address core, uint256 tokenId) external view override returns (string memory) {
       require(_core == core, "Not owner");
       return "Test Function";
    }

    function addAdmin(address addr) public {
        require(bytes(typeMap[msg.sender]).length == bytes("Admin").length, "Only an administrator can add more administrators");

        typeMap[addr] = "Admin";
    }

    function getUserType(address addr) external view returns(string memory) {
        return typeMap[addr];
    }

    function getNumTokens() external view returns (uint256){
        return numTokens - 1;
    }

    function getDonorIndices() external view returns (uint256[] memory){
        return donorTokenIndices;
    }

    function getRecipientIndices() external view returns (uint256[] memory){
        return recipientTokenIndices;
    }



}

