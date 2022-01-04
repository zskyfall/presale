var ContractMissu = artifacts.require("MissuToken");
var ContractPresale = artifacts.require("Presale");
const {
    BN,
    time
} = require('@openzeppelin/test-helpers');

module.exports = async function(deployer, network, accounts, context) {
    if (network == "live") {
        return;
    } else {
        //deployer.deploy(ContractMissu);
        const rate = new BN('1000');
        const minCap = new BN('10000000000000000000'); // min buy 10 Tokens
        const maxCap = new BN('10000000000000000000000'); //max buy 10,000 tokens
        const timeDay = 60 * 60 * 24;

        let currentTimestamp = 1641269028; //fetch the current timestamp on https://www.epochconverter.com/
        let openingTime = currentTimestamp + timeDay;
        let closingTime = openingTime + timeDay * 10;

        deployer.deploy(ContractMissu).then(function() {
            return deployer.deploy(ContractPresale, ContractMissu.address, rate, openingTime, closingTime, minCap, maxCap);
        });
    }

}