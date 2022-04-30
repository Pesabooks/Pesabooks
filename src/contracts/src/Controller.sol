//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./Constants.sol";
import "./IController.sol";
import "./IPoolSafe.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Controller is IController {
    using SafeERC20 for IERC20;

    // Events
    event Deposited(address indexed from, address indexed to, uint256 amount);
    event Withdrawed(address indexed to, address indexed from, uint256 amount);

    modifier onlyAdmins(IPoolSafe poolSafe) {
        require(poolSafe.isAdmin(msg.sender), "Operation require admin privilige");
        _;
    }

    modifier sufficientFunds(
        IPoolSafe poolSafe,
        IERC20 token,
        uint256 amount
    ) {
        require(poolSafe.balance(token) >= amount, "Insufficient funds");
        _;
    }

    function deposit(
        IPoolSafe poolSafe,
        IERC20 token,
        uint256 amount
    ) external {
        bytes memory data = abi.encodeWithSelector(
            Controller.executeDeposit.selector,
            token,
            msg.sender,
            address(poolSafe),
            amount
        );
        poolSafe.relayCall(Constants.CONTROLLER_ADDRESS, data);
    }

    function executeDeposit(
        IERC20 token,
        address from,
        address to,
        uint256 amount
    ) external {
        token.safeTransferFrom(from, to, amount);

        emit Deposited(from, to, amount);
    }

    function withdraw(
        IPoolSafe poolSafe,
        IERC20 token,
        address to,
        uint256 amount
    ) external onlyAdmins(poolSafe) sufficientFunds(poolSafe, token, amount) {
        bytes memory data = abi.encodeWithSelector(
            Controller.executeWithdraw.selector,
            token,
            address(poolSafe),
            to,
            amount
        );
        poolSafe.relayCall(Constants.CONTROLLER_ADDRESS, data);
    }

    function executeWithdraw(
        IERC20 token,
        address from,
        address to,
        uint256 amount
    ) external {
        uint256 allowance = token.allowance(from, to);
        if (allowance < amount) {
            token.safeIncreaseAllowance(to, amount);
        }

        token.safeTransfer(to, amount);
        emit Withdrawed(to, from, amount);
    }

    function increaseTokenAllowance(
        IPoolSafe poolSafe,
        IERC20 token,
        address spender,
        uint256 amount
    ) external onlyAdmins(poolSafe) sufficientFunds(poolSafe, token, amount) {
        bytes memory data = abi.encodeWithSelector(
            Controller._increaseTokenAllowance.selector,
            token,
            address(poolSafe),
            spender,
            amount
        );
        poolSafe.relayCall(Constants.CONTROLLER_ADDRESS, data);
    }

    function _increaseTokenAllowance(
        IERC20 token,
        address from,
        address to,
        uint256 amount
    ) external {
        uint256 allowance = token.allowance(from, to);
        if (allowance < amount) {
            token.safeIncreaseAllowance(to, amount);
        }

        token.safeTransfer(to, amount);
    }
}
