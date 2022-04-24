//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Registry is Ownable {
    mapping(string => address) public addresses;

    constructor(string memory name, address initAddr) {
        addresses[name] = initAddr;
    }

    function update(string memory name, address newAddress) external onlyOwner {
        addresses[name] = newAddress;
    }

    function getAddress(string memory name) public view returns (address) {
        return addresses[name];
    }
}
