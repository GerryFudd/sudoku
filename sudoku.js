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
	} else if (timesStuck >= 100) {
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
		findErrors(currentBoard, function (result) {
			guesser(result, callback);
		});
	}
}

function guesser (previousGuess, callback) {
	var clone_of_guess = JSON.parse( JSON.stringify( previousGuess ) );
	var first = true;
	clone_of_guess.forEach( function(elem, index, array) {
		if (!elem.known && first) {

			elem.known = true;
			// if this index is already a key and it is the last key,
			console.log('highest index is:  ' + Number(Object.keys(guesses)[Object.keys(guesses).length - 1]));
			console.log('index is: ' + index);
			console.log('last guess:');
			console.log(guesses);
			if (guesses[index] >= 0 && Number(Object.keys(guesses)[Object.keys(guesses).length - 1]) === index) {
				// Change the way that we will guess next time
				console.log('smart guss ran')
				smartChange(guesses, elem, index, function (result) {
					guesses = result;
				});
			} else if ( guesses[index] >= 0 ) {
				// if the key exists and isn't the last, do nothing
			} else {
				// otherwise, create the key and set it to 0
				guesses[index] = 0;
			}
			console.log('new guess:');
			console.log(guesses);
			currentGuess = guesses[index];
			elem.possible = [elem.possible[currentGuess]];
			console.log('after guessing:');
			ib(array);

			first = false;

		}
	});
	solve(clone_of_guess, callback);
}

function smartChange (obj, square, key, callback) {
	// move to the next possible guess for the last cell
	// if all of the options have been exhausted, increment the previous key value
	obj[key] = (obj[key] + 1) % square.possible.length;
	if ( obj[key] !== 0 ) {
		callback( obj );
	} else {
		var newKey = Object.keys(obj)[Object.keys(obj).indexOf(key.toString()) - 1];
		smartChange (obj, square, newKey, callback);
	}
}

function findErrors (boardState, callback) {
	if (boardState.some( function (elem) {
		return elem.possible.length === 0;
	})) {
		console.log("starting over");
		callback(boardStates.pop());
	} else {
		// console.log("no weird board state");
		boardStates.push(boardState);
		callback(boardState);
	}
}

module.exports = {
	'populateSquares': populateSquares,
	'solve': solve
}