//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract AnnaToken is ERC20, ERC20Burnable, ERC20Permit {
    address public owner; 

    constructor() ERC20("AnnaToken", "ANNA") ERC20Permit("AnnaToken") {
        owner = msg.sender;
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    function mint(address account, uint value) external onlyOwner {
        _mint(account, value);
    }
}