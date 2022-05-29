var Gravity = artifacts.require("./Gravity.sol");
var fakeAsh = artifacts.require("./fakeAsh.sol");

module.exports = async function(deployer) {
  var initialSupply = 1000000000000
  var tokens = web3.utils.toWei(initialSupply.toString(), 'ether')
  await deployer.deploy(fakeAsh, tokens);
  await deployer.deploy(Gravity);
};
