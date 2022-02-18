//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./BaseAccount.sol";
import "./IPool.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Account is BaseAccount {
    using SafeERC20 for IERC20;

    constructor(IPool pool, IERC20 _token) BaseAccount(pool, _token) {
         _canDepositDiffToken = false;
    }

    function deposit(uint256 amount) public override {
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount);
    }
}
