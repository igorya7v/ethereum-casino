var Casino = artifacts.require("./Casino.sol");

module.exports = function(deployer) {
  deployer.deploy(web3.toWei(0.1, 'ether'), {gas: 3000000});
};
