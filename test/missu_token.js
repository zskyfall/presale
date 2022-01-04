const MissuToken = artifacts.require("MissuToken");
const Presale = artifacts.require("Presale");
const {
    BN, // Big Number support
    constants, // Common constants, like the zero address and largest integers
    expectEvent, // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
    time
} = require('@openzeppelin/test-helpers');
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("MissuToken", function(accounts) {
    let missuToken = null;
    let preSale = null;
    let test_address = accounts[3];
    before(async() => {
        preSale = await Presale.deployed();
        missuToken = await MissuToken.deployed();
    });

    it("should transfer 10K MissuToken to Presale contract address", async function() {
        const amount = new BN('10000000000000000000000'); // equals 10k tokens
        const expected = '10000000000000000000000';

        await missuToken.transfer(preSale.address, amount);
        let balance = await missuToken.balanceOf.call(preSale.address);
        balance = balance.toString();

        assert.equal(balance, expected, "Not equal balance");

        //return assert.isTrue(true);
    });

});