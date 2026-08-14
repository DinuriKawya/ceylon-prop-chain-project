const ApartmentToken = artifacts.require("ApartmentToken");

module.exports = function (deployer) {
    deployer.deploy(ApartmentToken);
};