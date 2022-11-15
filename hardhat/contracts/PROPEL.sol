//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

contract PROPEL {
    string public name = "Propel Ventures";
    string public symbol = "PRPL";
    string private contractType = "Investment";

    address public owner;

    struct token_contents {
        string unique_id;
        uint256 value;
        string typeOfAddr;
    }

    mapping (address => token_contents) tokenContents;

    event TransferToken(address indexed from, address indexed to, uint256 amount);
    event TransferValue(address indexed from, uint256 amount, address indexed to);

    constructor(uint256 totalFunds) {
        token_contents memory ownerToken = token_contents("OWNER", totalFunds, "OWNER");

        tokenContents[msg.sender] = ownerToken;
        owner = msg.sender;
    }

    function generateToken(address to, uint256 value, string memory typeStr) external {
        // Only owner can transfer tokens to different addresses
        require(msg.sender == owner);

        transferFromOwnerToken(value);
        token_contents memory new_holder = token_contents(getUniqueID(), value, typeStr);

        tokenContents[to] = new_holder;

        emit TransferToken(owner, to, value);
    }

    function transferFromOwnerToken(uint256 value) internal {
        tokenContents[owner].value -= value;
    }

    function transferValueBetween(address addr2, uint256 value) external {
        string memory investor = string("INVESTOR");
        string memory investee = string("INVESTEE");

        string memory test1 = string(tokenContents[msg.sender].typeOfAddr); 
        string memory test2 = string(tokenContents[addr2].typeOfAddr); 

        require(keccak256(abi.encodePacked(test1)) == keccak256(abi.encodePacked(investor)), "Investor can only give value");
        require(keccak256(abi.encodePacked(test2)) == keccak256(abi.encodePacked(investee)), "Investee can only receive value");

        require(tokenContents[msg.sender].value >= value, "Investor does not have enough value");

        tokenContents[msg.sender].value -= value;
        tokenContents[addr2].value += value;

        emit TransferValue(msg.sender, value, addr2);
    }

    function getUniqueID() internal pure returns (string memory uniqueID) {
        string memory id = "test_unique_id";
        // Needs to be code to generate a random 5 character string
        return id;
    }

    function getContractType() external view returns (string memory typeStr) {
        return(contractType);
    }

    function getID (address addr) external view returns (string memory typeStr){
        return tokenContents[addr].unique_id;
    }

    function getTokenValue(address addr) external view returns (uint256 value) {
        return tokenContents[addr].value;
    }

    function getTypeOfAddr (address addr) external view returns (string memory typeStr){
        return tokenContents[addr].typeOfAddr;
    }
}