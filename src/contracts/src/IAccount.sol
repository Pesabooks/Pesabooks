//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAccount {
    function approve(address spender, uint256 amount) external;

    function canDepositDiffToken() external view returns (bool);

    function balance() external view returns (uint256);

    function withdraw(address to, uint256 amount) external;

    function deposit(uint256 amount) external;

    function deposit2(IERC20 token, uint256 amount) external;

    function transfer(IAccount to, uint256 amount) external;
}
