//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControlEnumerable.sol";

interface IPoolSafe is IAccessControlEnumerable {
    function getAdmins() external view returns (address[] memory);

    function isAdmin(address addr) external view returns (bool);

    function balance(IERC20 token) external view returns (uint256);

    function relayCall(bytes calldata data) external;
}
