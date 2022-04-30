//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Registry.sol";
import "./Constants.sol";
import "./IPoolSafe.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PoolSafe is IPoolSafe, AccessControlEnumerable {
    using EnumerableSet for EnumerableSet.AddressSet;

    IERC20 public immutable token;
    Registry public immutable registry;

    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    constructor(IERC20 _token, Registry _registry) {
        token = _token;
        registry = _registry;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmins() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Operation require admin privilige");
        _;
    }

    modifier onlyController() {
        require(registry.getAddress(Constants.CONTROLLER_ADDRESS) == msg.sender, "Unauthorized sender");
        _;
    }

    modifier onlyValidAddress(string memory addrNameInRegistry) {
        address callee = registry.getAddress(addrNameInRegistry);
        require(callee != address(0x0), "Invalid address");
        _;
    }

    function balance(IERC20 _token) public view returns (uint256) {
        return _token.balanceOf(address(this));
    }

    function isAdmin(address addr) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, addr);
    }

    function addAdmin(address recipient) external onlyAdmins {
        require(!hasRole(DEFAULT_ADMIN_ROLE, recipient));
        _grantRole(DEFAULT_ADMIN_ROLE, recipient);
    }

    function removeAdmin(address recipient) external onlyAdmins {
        //To make sure there is always at least one admin
        require(msg.sender != recipient, "Cannot self revoke right");
        require(hasRole(DEFAULT_ADMIN_ROLE, recipient));
        _revokeRole(DEFAULT_ADMIN_ROLE, recipient);
    }

    function getAdmins() external view returns (address[] memory) {
        uint256 count = getRoleMemberCount(DEFAULT_ADMIN_ROLE);
        address[] memory admins = new address[](count);

        for (uint256 i = 0; i < count; i++) {
            admins[i] = getRoleMember(DEFAULT_ADMIN_ROLE, i);
        }

        return admins;
    }

    function relayCall(string memory addrNameInRegistry, bytes calldata data)
        external
        onlyController
        onlyValidAddress(addrNameInRegistry)
    {
        (bool success, ) = registry.getAddress(addrNameInRegistry).delegatecall(data);
        require(success);
    }
}
