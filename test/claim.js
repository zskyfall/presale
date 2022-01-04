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

contract("Presmale Claim", function(accounts) {

    let preSale = null;
    let test_whitelist_address = accounts[2];

    before(async() => {
        preSale = await Presale.deployed();
    });

    /** Use this command on Command Line/Terminal for passing time by 41 days for testing tokens claim
     curl -H "Content-Type: application/json" -X POST --data \
        '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params”:[3628800]}’ \
        http://localhost:8545

       -- Remember to change your host and port follow your configs 
     **/
    it("should be claimable", async function() {
        //await preSale.addToWhitelist(test_whitelist_address);
        const isWhitelisted = await preSale.hasWhitelisted(test_whitelist_address);
        //const timeDay = 60 * 60 * 24; //seconds in a day
        assert.isTrue(isWhitelisted);

        //pass time for 31 days
        //await time.increase(time.duration.days(31));
        let boughtAmount = await preSale.bought_amount.call(test_whitelist_address);

        //claim tokens
        await preSale.claim(test_whitelist_address, { from: test_whitelist_address });

        //balance after claim tokens
        let balance = await preSale.balance.call(test_whitelist_address);
        let claimableAmount = await preSale.getClaimableAmount(test_whitelist_address);
        claimableAmount = claimableAmount.toString();
        let expected_result = (boughtAmount - balance).toString();
        assert.equal(claimableAmount, expected_result);
        //return assert.isTrue(true);
    });

});