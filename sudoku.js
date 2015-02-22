var ib = require('./imageBuilder.js');
var hf = require('./helperFunctions.js')
var squares = [];
var boardStates = [];
var guesses = {};
var timesStuck = 0;

console.log('=======================================================================');

// Make the initial state of the board
function populateSquares ( i, input, callback ) {

	var square = {};

	// determine whether the square is known
	if (input[i] === ' ' || input[i] === '.') {
		square.known = false;
		square.possible = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	} else {
		square.known = true;
		square.possible = [Number(input[i])];
	}
	
	// determine what row, column, and box the square belongs to
	square.row = Math.floor(i / 9);
	square.column = i % 9;
	square.box = Math.floor(square.row / 3) * 3 + Math.floor(square.column / 3);
	
	// put the square into the array of squares
	squares[i] = square;
	if (i < input.length - 1) {
		populateSquares (i + 1, input, callback);
	} else {
		var check = 0;
		squares.forEach( function (elem) {
			if (elem.known) {
				check++;
			}
		});

		ib(squares);
		console.log(check);
		boardStates = [squares];
		guesses = {};
		callback(squares);
	}
}


// Start solving
function solve (currentBoard, callback) {

	var prevCheck = 0;
	currentBoard.forEach( function (elem) {
		if (elem.known) {
			prevCheck++;
		}
	});

	// call one function for each technique
	currentBoard.map(hf.narrowPossibilities);
	hf.claimer(0, currentBoard);
	currentBoard.map(hf.doubleCheck);

	check = 0;
	currentBoard.forEach( function (elem) {
		if (elem.known) {
			check++;
		}
	});
	
	if (check !== prevCheck && check < 81) {
		solve(currentBoard, callback);
	} else if (check >= 81) {
		timesStuck = 0;
		ib(currentBoard);
		console.log(check);
		callback(currentBoard);
	} else if (timesStuck >= 300) {
		ib(currentBoard);
		console.log(check);
		console.log('too many guesses');
	} else {
		timesStuck++;
		guesser(currentBoard, callback);
	}
}

function guesser (previousGuess, callback) {
	var revert;
	checkIfPossible(previousGuess, function (possible) {
		if (possible) {
			modifyGuesses(previousGuess, function(number) {
				if (number === 99) {
					if (boardStates.length > 0) {
						revert = boardStates.pop();
						solve(revert, callback);
					} else {
						ib(previousGuess);
						console.log(guesses);
					}
				} else {
					applyGuess(previousGuess, number, function (newBoard) {
						solve(newBoard, callback);
					});
				}
			});
		} else {
			revert = boardStates.pop();
			solve(revert, callback);
		}
	});
}

function checkIfPossible (currentState, cb) {
	if ( currentState.some( function (elem) {
		return elem.possible.length === 0;
	}) ) {
		cb(false);
	} else {
		cb(true);
	}
}

function modifyGuesses (board, cb) {
	var first = true;
	var num;
	board.forEach( function (elem, index) {
		if (!elem.known && first) {
			first = false;
			num = index;
		}
	});

	if (guesses[num] >= 0) {
		guesses[num] += 1;
	} else {
		guesses[num] = 0;
	}


	if (guesses[num] === board[num].possible.length) {
		guesses[num] = -1;
		cb(99);
	} else {

		cb(num);
	}
}

function applyGuess (state, ind, cb) {
	boardStates.push(state);
	var clone = JSON.parse(JSON.stringify(state));
	clone[ind].known = true;
	clone[ind].possible = [state[ind].possible[guesses[ind]]];
	// console.log(guesses);
	// ib(clone);
	cb(clone);
}

module.exports = {
	'populateSquares': populateSquares,
	'solve': solve
}