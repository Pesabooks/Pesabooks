//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockTether is ERC20 {
    uint256 public constant initialSupply = 1000e6;

    constructor() ERC20("Mock Tether", "MUSDT") {
        _mint(msg.sender, initialSupply);
    }

     function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
