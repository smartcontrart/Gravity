// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract fakeASH is ERC20{
  constructor(uint256 initialSupply) ERC20("FakeASH", "FA"){
  }

  function mint(uint256 amount) external{
    _mint(msg.sender, amount);
  }
  
}