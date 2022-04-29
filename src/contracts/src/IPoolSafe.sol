//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Registry.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";

interface IPoolSafe is IAccessControlEnumerable {
    function registry() external view returns (Registry);

    function getAdmins() external view returns (address[] memory);

    function isAdmin(address addr) external view returns (bool);

    function balance(IERC20 token) external view returns (uint256);

    function relayCall(string memory addrNameInRegistry, bytes calldata data) external;
}
