//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "contracts/AnnaToken.sol";

event Buy(address buyer, uint amount);
event Sell(address seller, uint amount);

contract Exchange {
    AnnaToken immutable token;
    address public owner;
    uint public divisor = 1;

    constructor(address _token) {
        token = AnnaToken(_token);
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    function setPriceDivisor(uint _divisor) external onlyOwner {
        require(_divisor != 0, "Incorrect number");
        divisor = _divisor;
    }

    function buy(uint _amount) public payable {
        require(_amount >= divisor, "Amount is too low");

        uint cost = _amount / divisor; 

        uint exchangeTokenBalance = token.balanceOf(address(this));
        require(exchangeTokenBalance >= _amount, "No product");

        require(msg.value == cost, "Incorrect value");

        token.transfer(msg.sender, _amount);

        emit Buy(msg.sender, _amount);
    }

    function sellWithPermit(
        address seller,
        address spender,
        uint amount, 
        uint deadline, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) public {
        require(amount >= divisor);

        uint remainder = amount % divisor;
        uint _amount = amount - remainder;
        
        uint exchangeEthBalance = address(this).balance;

        require(exchangeEthBalance * divisor >= _amount, "Exchange haven't funds"); 

        token.permit(seller, spender, amount, deadline, v, r, s);
        _transferFrom(seller, _amount); 

        emit Sell(seller, _amount);
    }

    function _transferFrom(address _msgSender, uint _amount) internal {

        token.transferFrom(_msgSender, address(this), _amount);
        
        uint value = _amount / divisor; 
        
        (bool result,) = msg.sender.call{value: value}("");
        require(result, "Can't send");
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds");
        
        (bool result,) = payable(msg.sender).call{value: address(this).balance}("");
        require(result, "Tx failed");
    }

    function topUp() public payable onlyOwner {}

    receive() external payable {
        topUp();
    }
}