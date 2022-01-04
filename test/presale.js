const Presale = artifacts.require("Presale");
const MissuToken = artifacts.require("MissuToken");
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

contract("Presale", function(accounts) {
    //let test_whitelist_address = 0xB24aBBb71f5A02c2eaE5e98f071530642246c239;
    let preSale = null;
    let test_whitelist_address = accounts[2];
    let test_not_whitelisted_address = accounts[3];

    before(async() => {
        preSale = await Presale.deployed();
        missuToken = await MissuToken.deployed();
    });

    it("should be whitelisted wallet address", async function() {
        await preSale.addToWhitelist(test_whitelist_address);
        const isWhitelisted = await preSale.hasWhitelisted(test_whitelist_address);
        assert.isTrue(isWhitelisted);
        //return assert.isTrue(true);
    });

    it("should be whitelisted wallet address 2", async function() {
        await preSale.addToWhitelist(accounts[0]);
        const isWhitelisted = await preSale.hasWhitelisted(accounts[0]);
        assert.isTrue(isWhitelisted);
        //return assert.isTrue(true);
    });

    it("should be same as about invester has bought", async function() {
        //await preSale.addToWhitelist(test_whitelist_address);
        const isWhitelisted = await preSale.hasWhitelisted(test_whitelist_address);
        const buyAmount = new BN('20000000000000000'); // = 20 tokens
        const expected = '20000000000000000000';

        assert.isTrue(isWhitelisted);

        let prebought_amount = await preSale.bought_amount.call(test_whitelist_address);

        //buy 20 tokens = 0.02 ETH with rate 1000 (1 ETH = 1000 tokens)
        await preSale.buyTokens(test_whitelist_address, { from: test_whitelist_address, value: buyAmount });
        let latest_bought_amount = await preSale.bought_amount.call(test_whitelist_address);

        assert.equal((latest_bought_amount - prebought_amount).toString(), expected);
        //return assert.isTrue(true);
    });

    it("should be revert cause invester wallet address is not whitelisted", async function() {
        //await preSale.addToWhitelist(test_whitelist_address);
        const isWhitelisted = await preSale.hasWhitelisted(test_not_whitelisted_address);
        const buyAmount = 50;

        assert.equal(isWhitelisted, false);

        await expectRevert(
            await preSale.buyTokens(test_not_whitelisted_address, { from: test_not_whitelisted_address, value: buyAmount }), "Address is not whitelisted"
        );
    });

    it("claim tokens should be reverted because the presale is not closed", async function() {
        //await preSale.addToWhitelist(test_whitelist_address);
        const isWhitelisted = await preSale.hasWhitelisted(test_whitelist_address);
        const timeDay = 60 * 60 * 24; //seconds in a day
        assert.isTrue(isWhitelisted);

        await expectRevert(
            await preSale.claim(test_whitelist_address, { from: test_whitelist_address }), "The presale is not closed!"
        );
    });

});