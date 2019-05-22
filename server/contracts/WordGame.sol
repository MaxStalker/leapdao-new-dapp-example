pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract WordGame {
	bytes32 constant ROUND_ID = 0x1337133713371337133713371337133713371337133713371337133713371337;
	bytes32 constant ANSWER = 0x1234123412341234123412341234123412341234123412341234123412341234;
	address constant TOKEN_ADDR = 0x1222222222222222222222222222222222222222;
	address constant PLAYER = 0x1333333333333333333333333333333333333333;
	address constant HOUSE = 0x1444444444444444444444444444444444444444;

	function roundResult(bytes32 _playerAnswer, bytes32 _roundId) public {
		require(_roundId == ROUND_ID, "wrong round ID");
		IERC20 token = IERC20(TOKEN_ADDR);
		uint balance = token.balanceOf(address(this));

		if (_playerAnswer == ANSWER) {
			token.transfer(PLAYER, balance);
		} else {
			token.transfer(HOUSE, balance);
		}
	}

	function cancel() public {
		IERC20 token = IERC20(TOKEN_ADDR);
		uint balance = token.balanceOf(address(this));
		token.transfer(HOUSE, balance);
	}
}
