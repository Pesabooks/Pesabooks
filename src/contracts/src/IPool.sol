//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IPool {
    function getAdmins() external view returns (address[] memory);

    function isAdmin(address addr) external view returns (bool );
}
