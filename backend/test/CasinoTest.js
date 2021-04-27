const Casino = artifacts.require("Casino");

const minimumBet = 100000000;
const maxAmountOfBets = 10;

// TODO: add more tests
contract("Casino Contract Test", async accounts => {
	
	beforeEach(async () => {
        instance = await Casino.new(minimumBet, maxAmountOfBets);
    });
	
	it("A fresh contract instance should have a correct minimum bet", async() => {
		
		instance_minimumBet = await instance._minimumBet();
		assert.equal(instance_minimumBet, minimumBet);
	})
	
	it("A fresh contract instance should have a correct maxAmountOfBets", async() => {
		
		instance_maxAmountOfBets = await instance._maxAmountOfBets();
		assert.equal(instance_maxAmountOfBets, maxAmountOfBets);
	})
	
	it("Should have number of Bets equal to 1", async() => {
		await instance.bet(5, {'from': accounts[1], value: web3.utils.toWei('0.1', 'ether')});
		
		numberOfBets = await instance._numberOfBets();
		assert.equal(numberOfBets, 1);
	})
	
	it("Should have total amount of bets equal to 0.1 eth", async() => {
		await instance.bet(5, {'from': accounts[1], value: web3.utils.toWei('0.1', 'ether')});
		
		totalBets = await instance._totalBet();
		assert.equal(totalBets, web3.utils.toWei('0.1', 'ether'));
	})
	
	it("Correct Player info should be found in the map", async() => {
		await instance.bet(5, {'from': accounts[1], value: web3.utils.toWei('0.1', 'ether')});
		
		playerInfo = await instance.getPlayerInfo(accounts[1]);
		
		assert.equal(playerInfo[0], web3.utils.toWei('0.1', 'ether'));
		assert.equal(playerInfo[1], 5);
	})
	
	it("Should generate a number [0 < x <= 10]", async() => {
		num = await instance.generateWinnerNumber();
		assert.isOk(num > 0 && num <= 10);
	})
	
	it("Correct NewBet event should be emitted", async() => {
		tx = await instance.bet(5, {'from': accounts[1], value: web3.utils.toWei('0.1', 'ether')});
		
		assert.isOk(Array.isArray(tx.logs));
		log = tx.logs[0];
		assert.equal(log.event, "NewBet");
		assert.equal(log.args.participant, accounts[1]);
		assert.equal(log.args.selectedNum, 5);
		assert.equal(log.args.betAmount, web3.utils.toWei('0.1', 'ether'));
	})
	
	it("Transaction should fail if bet number is not in range", async() => {
		
		try {
			tx = await instance.bet(20, {'from': accounts[1], value: web3.utils.toWei('0.1', 'ether')});
		} catch (ex) {
			error = ex;
		}
		
		assert.isOk(error);
	})
})

