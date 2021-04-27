var Casino = artifacts.require("./Casino.sol");

module.exports = function(deployer) {
  deployer.deploy(Casino, 10000000, 50);
};
