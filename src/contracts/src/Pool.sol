//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./IAccount.sol";
import "./IPool.sol";
import "./Account.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Pool is IPool, AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;

    IAccount public immutable defaultAccount;
    EnumerableSet.AddressSet internal _admins;

    constructor(IERC20 _token) {
        defaultAccount = new Account(this, _token);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _admins.add(msg.sender);
    }

    modifier onlyAdmins() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Operation require admin privilige");
        _;
    }

    function addAdmin(address recipient) external onlyAdmins {
        require(!hasRole(DEFAULT_ADMIN_ROLE, recipient));
        _grantRole(DEFAULT_ADMIN_ROLE, recipient);
        _admins.add(recipient);
    }

    function removeAdmin(address recipient) external onlyAdmins {
        //To make sure there is always at least one admin
        require(msg.sender != recipient, "Cannot self revoke right");
        require(hasRole(DEFAULT_ADMIN_ROLE, recipient));
        _revokeRole(DEFAULT_ADMIN_ROLE, recipient);
        _admins.remove(recipient);
    }

    function getAdmins() external view returns (address[] memory) {
        return _admins.values();
    }

    function isAdmin(address addr) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, addr);
    }
}
