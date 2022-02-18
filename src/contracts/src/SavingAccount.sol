//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./BaseAccount.sol";

contract SavingAccount is BaseAccount {
    using SafeERC20 for IERC20;

    constructor(IPool pool, IERC20 _token) BaseAccount(pool, _token) {
        _canDepositDiffToken = true;
    }

    function deposit(uint256 amount) public override {
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount);
    }

    function deposit2(IERC20 _token, uint256 amount) external override {
        // unsupported
        if (_token == token) {
            //swap then deposit
        } else {
            //deposit
        }
    }
}
