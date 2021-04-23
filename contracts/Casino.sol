pragma solidity 0.8.0;

// SPDX-License-Identifier: MIT

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeCast.sol";

/**
 * NOTE: `SafeMath` is no longer needed starting with Solidity 0.8. The compiler
 * now has built in overflow checking.
 */


contract Casino is Ownable {
	
	using SafeCast for uint256;
	
	// Minimum Bet in Wei
	uint256 public _minimumBet;
	// Total amount of bets in Wei
	uint256 public _totalBet;
	// Total number of bets.
	uint8 public _numberOfBets;
	// Max number of bets (255).
	uint8 public _maxAmountOfBets;
	address[] public _players;
	
	struct Player {
		// Bet amount in Wei
		uint256 amountBet;
		// Selected number (0 < x <= 10)
		uint8 selectedNum;
	}
	
	// Player's address => user info (Player)
	mapping(address => Player) public _playerInfo;
	
	constructor(uint256 minimumBet, uint8 maxAmountOfBets) {
		require(minimumBet > 0);
		_minimumBet = minimumBet;
		_maxAmountOfBets = maxAmountOfBets;
	}
	
	function kill() public onlyOwner {
		address payable owner = payable(owner());
		selfdestruct(owner);
	}
	
	function bet(uint8 selectedNum) public payable {
		require(!checkPlayerExists(msg.sender));
		require(selectedNum > 0 && selectedNum <= 10);
		require(msg.value >= _minimumBet);
		
		_playerInfo[msg.sender].amountBet = msg.value;
		_playerInfo[msg.sender].selectedNum = selectedNum;
		_numberOfBets++;
		_players.push(msg.sender);
		_totalBet += msg.value;
		
		if (_numberOfBets >= _maxAmountOfBets) {
			 uint8 winnerNumber = generateWinnerNumber();
			 distributePrizes(winnerNumber);
		}
	}
	
	function generateWinnerNumber() public view returns(uint8) {
		// TODO: make it more secure
		return (block.number % 10 + 1).toUint8();
	}
	
	function checkPlayerExists(address player) public view returns(bool) {
		// TODO: use map 
		for (uint8 i = 0; i < _players.length; i++) {
			if (_players[i] == player) {
				return true;
			}
		}
		
		return false;
	}
	
	function distributePrizes(uint8 winnerNumber) public {
		// temp in memory array 
		// it must have a fixed size
		address[255] memory winners;
		uint8 winnersCounter = 0;
		
		for (uint8 i = 0; i < _players.length; i++) {
			address playerAddress = _players[i];
			if (_playerInfo[playerAddress].selectedNum == winnerNumber) {
				winners[winnersCounter] = playerAddress;
				winnersCounter++;
			}
			
			// clean the map
			delete _playerInfo[playerAddress];
		}
		
		// TODO: make distribution lelative to the bet amount of the player
		uint256 winnerEtherAmount = _totalBet / winners.length;
		
		for (uint256 j = 0; j < winnersCounter; j++) {
			// double-check that the address is not empty
			if (winners[j] != address(0)) {
				address payable winnerAddress = payable(winners[j]);
				winnerAddress.transfer(winnerEtherAmount);
			}
		}
		
		resetData();
	}
	
	function resetData() public {
		delete _players;
		_totalBet = 0;
		_numberOfBets = 0;
	}
}