pragma solidity 0.8.0;

// SPDX-License-Identifier: MIT
contract Casino {
	
	address payable public owner;
	uint256 public minimumBet;
	uint256 public totalBet;
	uint256 public numberOfBets;
	uint256 public maxAmountOfBets = 10;
	address payable[] public players;
	
	struct Player {
		uint256 amountBet;
		uint256 selectedNum;
	}
	
	// Player's address => user info (Player)
	mapping(address => Player) public playerInfo;
	
	constructor(uint256 _minimumBet) {
		owner = payable(msg.sender);
		if (_minimumBet != 0) {
			minimumBet = _minimumBet;
		}
	}
	
	function kill() public {
		if (msg.sender == owner) {
			selfdestruct(owner);
		}
	}
	
	// TODO: do we need a fallback function?
	
	function bet(uint256 selectedNum) public payable {
	    address payable senderAddress = payable(msg.sender);
		require(!checkPlayerExists(senderAddress));
		require(selectedNum > 0 && selectedNum <= 10);
		require(msg.value >= minimumBet);
		
		playerInfo[senderAddress].amountBet = msg.value;
		playerInfo[senderAddress].selectedNum = selectedNum;
		numberOfBets++;
		players.push(senderAddress);
		totalBet += msg.value;
		
		if (numberOfBets >= maxAmountOfBets) {
			generateWinnerNumber();
		}
	}
	
	function generateWinnerNumber() public {
		// TODO: make it more secure
		uint256 winnerNumber = block.number % 10 + 1;
		distributePrizes(winnerNumber);
	}
	
	function checkPlayerExists(address player) public view returns(bool) {
		for (uint256 i = 0; i < players.length; i++) {
			if (players[i] == player) {
				return true;
			}
		}
		
		return false;
	}
	
	function distributePrizes(uint256 winnerNumber) public {
		// temp in memory array 
		// it must have a fixed size
		// TODO: calculate winners size
		address payable[100] memory winners;
		uint256 winnersCounter = 0;
		
		for (uint256 i = 0; i < players.length; i++) {
			address payable playerAddress = players[i];
			if (playerInfo[playerAddress].selectedNum == winnerNumber) {
				winners[winnersCounter] = playerAddress;
				winnersCounter++;
			}
			
			// clean the map
			delete playerInfo[playerAddress];
		}
		
		// TODO: make distribution lelative to the bet amount of the player
		uint256 winnerEtherAmount = totalBet / winners.length;
		
		for (uint256 j = 0; j < winnersCounter; j++) {
			// double-check that the address is not empty
			if (winners[j] != address(0)) {
				winners[j].transfer(winnerEtherAmount);
			}
		}
		
		resetData();
	}
	
	function resetData() public {
		delete players;
		totalBet = 0;
		numberOfBets = 0;
	}
}