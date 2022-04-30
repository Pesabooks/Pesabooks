//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Registry is Ownable {
    mapping(string => address) public authorizedAddresses;

    constructor(string memory name, address initAddr) {
        authorizedAddresses[name] = initAddr;
    }

    function addOrUpdate(string memory name, address newAddress) external onlyOwner {
        authorizedAddresses[name] = newAddress;
    }

    function getAddress(string memory name) public view returns (address) {
        return authorizedAddresses[name];
    }
}
