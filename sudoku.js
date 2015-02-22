var ib = require('./imageBuilder.js');
var hf = require('./helperFunctions.js')
var squares = [];
var boardStates = [];
var currentGuess = 0;
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
		callback(squares);
	}
  //console.log(squares);
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
		// ib(currentBoard);
		// console.log(check);
		solve(currentBoard, callback);
	} else if (check >= 81) {
		timesStuck = 0;
		ib(currentBoard);
		console.log(check);
		callback(currentBoard);
	} else if (timesStuck >= 3) {
		ib(currentBoard);
		console.log(check);
		console.log('too many guesses');
	} else {
		// ib(currentBoard);
		// console.log(check);
		console.log('---------------------------------------------------------------------');
		timesStuck++;
		console.log('times stuck: ' + timesStuck);
		console.log('stuck on:');
		ib(currentBoard);
		guesser(currentBoard, callback);
	}
}

function guesser (previousGuess, callback) {
	checkIfPossible(previousGuess, modifyGuesses);
}

function checkIfPossible (possibleState, callback) {
	if ( possibleState.some( function (elem) {
		return elem.possible.length === 0;
	}) ) {
		console.log('bad board state');
		possibleState = boardStates.pop();
		console.log('reverted to');
		ib(possibleState);
		callback(possibleState, function (ind) {
			applyGuess(possibleState, ind, callback);
		});
	} else {
		callback(possibleState, function (ind) {
			applyGuess(possibleState, ind, callback);
		});
	}
}

function modifyGuesses (state, callback) {
	var first = true;
	var num;
	console.log('guesses was');
	console.log(guesses)
	state.forEach( function (elem, index) {
		if (!elem.known && first) {
			console.log('looks like ' + index + ' is the first unkown index')
			first = false;
			num = index;
		}
	});

	if (guesses[num] >= 0) {
		guesses[num] += 1;
	} else {
		guesses[num] = 0;
	}

	console.log('guesses is now');
	console.log(guesses);
	callback(num);
}

function applyGuess (state, ind, callback) {
	boardStates.push(state);
	console.log('board states stored: ' + boardStates.length)
	var clone = JSON.parse(JSON.stringify(state));
	clone[ind].known = true;
	clone[ind].possible = [state[ind].possible[guesses[ind]]];
	console.log('state is now');
	ib(clone);
	solve(clone, callback)
}

module.exports = {
	'populateSquares': populateSquares,
	'solve': solve
}