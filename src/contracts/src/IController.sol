//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./IPoolSafe.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IController {
    function deposit(
        IPoolSafe poolSafe,
        IERC20 token,
        uint256 amount
    ) external;

    function withdraw(
        IPoolSafe poolSafe,
        IERC20 token,
        address to,
        uint256 amount
    ) external;

    function increaseTokenAllowance(
        IPoolSafe poolSafe,
        IERC20 token,
        address spender,
        uint256 amount
    ) external;
}
