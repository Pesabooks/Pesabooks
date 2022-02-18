//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./IAccount.sol";
import "./IPool.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract BaseAccount is IAccount {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 public immutable token;
    IPool public immutable pool;
    bool internal _canDepositDiffToken;

    // Events
    event Deposited(address indexed from, uint256 amount);
    event Withdrawed(address indexed to, uint256 amount);
    event Transfered(address indexed from, address indexed to, uint256 amount);

    constructor(IPool _pool, IERC20 _token) {
        token = _token;
        pool = _pool;
    }

    modifier onlyAdmins() {
        require(pool.isAdmin(msg.sender), "Operation require admin privilige");
        _;
    }

    modifier sufficientFunds(uint256 amount) {
        require(balance() >= amount, "Transfer amount exceeds balance");
        _;
    }

    function canDepositDiffToken() external view returns (bool) {
        return _canDepositDiffToken;
    }

    function approve(address spender, uint256 amount) external onlyAdmins {
        token.approve(spender, amount);
    }

    function withdraw(address to, uint256 amount) external onlyAdmins sufficientFunds(amount) {
        uint256 allowance = token.allowance(address(this), to);
        if (allowance < amount) {
            token.safeIncreaseAllowance(to, amount);
        }

        token.safeTransfer(to, amount);
        emit Withdrawed(to, amount);
    }

    function deposit(uint256 amount) public virtual;

    function deposit2(IERC20 _token, uint256 amount) external virtual {
        require(_token == token, "Transfer from accounts with different tokens not supported");
        deposit(amount);
    }

    function transfer(IAccount to, uint256 amount) external onlyAdmins sufficientFunds(amount) {
        uint256 allowance = token.allowance(address(this), address(to));
        if (allowance < amount) {
            token.safeIncreaseAllowance(address(to), amount);
        }

        to.deposit2(token, amount);

        emit Transfered(msg.sender, address(to), amount);
    }

    function balance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
