const Casino = artifacts.require("Casino");

const minimumBet = 100000000;
const maxAmountOfBets = 10;

contract("Casino Contract Test", async accounts => {
	
	beforeEach(async () => {
        instance = await Casino.new(minimumBet, maxAmountOfBets);
    });
	
	it("Should have number of Bets equal to 1", async() => {
		await instance.bet(5, {'from': accounts[1], value: web3.utils.toWei('0.1', 'ether')});
		
		numberOfBets = await instance._numberOfBets();
		assert.equal(numberOfBets, 1);
	})
})