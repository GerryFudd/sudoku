var ib = require('./imageBuilder.js');
var hf = require('./helperFunctions.js')
var squares = [];
var currentGuess = 0;
var guesses = {};

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
		ib(currentBoard);
		console.log(check);
		callback(currentBoard);
	} else {
		// ib(currentBoard);
		// console.log(check);
		findErrors(currentBoard, function (result) {
			guesser(result, callback);
		});
	}
}

function guesser (previousGuess, callback) {
	var clone_of_guess = JSON.parse( JSON.stringify( previousGuess ) );
	var first = true;
	clone_of_guess.forEach( function(elem, index) {
		if (!elem.known && first) {

			// console.log('we hit');
			// console.log(elem);

			elem.known = true;
			if (guesses[index] >= 0) {
				// console.log('guessing differently for index ' + index)
				guesses[index] = (guesses[index] + 1) % elem.possible.length;
			} else {
				// console.log('first guess on index ' + index)
				guesses[index] = 0;
			}
			// console.log(guesses);
			currentGuess = guesses[index];
			elem.possible = [elem.possible[currentGuess]];

			// console.log('it has been reset to');
			// console.log(elem);

			first = false;
		}
	});
	solve(clone_of_guess, callback);
}

function findErrors (boardState, callback) {
	if (boardState.some( function (elem) {
		return elem.possible.length === 0;
	})) {
		// console.log("there's a weird board state");
		callback(squares);
	} else {
		// console.log("no weird board state");
		callback(boardState);
	}
}

module.exports = {
	'populateSquares': populateSquares,
	'solve': solve
}