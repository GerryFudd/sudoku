var input = '.94...13..............76..2.8..1.....32.........2...6.....5.4.......8..7..63.4..8';
var fn = require('./functions.js');
var ib = require('./imageBuilder.js');
var squares = [];
var check = 0;
var savedCheck = 0;
var guesses = 0;

console.log('=======================================================================');

// Make the initial state of the board
function populateSquares ( i ) {

	var square = {};

	// determine whether the square is known
	if (input[i] === ' ' || input[i] === '.') {
		square.known = false;
		square.possible = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	} else {
		square.known = true;
		square.possible = [Number(input[i])];
		check++;
	}
	
	// determine what row, column, and box the square belongs to
	square.row = Math.floor(i / 9);
	square.column = i % 9;
	square.box = Math.floor(square.row / 3) * 3 + Math.floor(square.column / 3);
	
	// put the square into the array of squares
	squares.push(square);
	if (i < input.length - 1) {
		populateSquares (i + 1);
	} else {
		ib(squares);
	}
  //console.log(squares);
}

populateSquares(0);

// Start solving
function solve (currentBoard) {

	var prevCheck = check;
	// call one function for each technique
	currentBoard.map(narrowPossibilities);
	claimer(0, currentBoard);
	currentBoard.map(doubleCheck);
	
	if (check !== prevCheck && check < 81) {
		ib(currentBoard);
		console.log(check);
		solve(currentBoard);
	} else if (check >= 81) {
		ib(currentBoard);
		console.log(check);
	} else {
		ib(currentBoard);
		console.log(check);
		findErrors(currentBoard, function (result) {
			guesser(result);
		});
	}
}

solve(squares);

function guesser (previousGuess) {
	var clone_of_guess = JSON.parse( JSON.stringify( previousGuess ) );
	var first = true;
	clone_of_guess.forEach( function(elem, index) {
		if (!elem.known && first) {
			console.log('we hit');
			console.log(elem);
			elem.known = true;
			elem.possible = [elem.possible[guesses]];
			guesses++;
			check++;
			first = false;
		}
	});
	solve(clone_of_guess);
}

function findErrors (boardState, callback) {
	console.log(boardState);
	if (boardState.some( function (elem) {
		return elem.possible.length === 0;
	})) {
		console.log("there's a weird board state");
		check = savedCheck;
		callback(squares);
	} else {
		console.log("no weird board state");
		savedCheck = check;
		callback(boardState);
	}
}

// this function "pencils in" the possible values for each square.  It also sets a value
// if there is only one possibility.
function narrowPossibilities (square, index, currentBoard) {
	if (!square.known) {
	
		checker([square.row, square.column, square.box], currentBoard, function (limit) {
			square.possible = limit;
			if (square.possible.length === 1) {
				square.known = true;
				check++;
			}
			return square;
		});
		
	} else {
		return square;
	}
}

function checker (depList, board, callback) {
	var dependencies = ['row', 'column', 'box'];
	var limits = [];
	depList.forEach( function (elem, index) {
		limits[index] = board.reduce ( function (prev, current) {
			if (current[dependencies[index]] === elem && current.known) {
				return prev.concat(current.possible);
			} else {
				return prev;
			}
		}, []);
		limits[index] = fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], limits[index]);
	});
	
	callback(fn.intersect(limits[0], fn.intersect(limits[1], limits[2])));
}

// This function looks at the row, column, and box that each square belongs to
// If a square is the only one that can hold a given value, assign that value to the box
function doubleCheck (square, index, currentBoard) {
	if (!square.known) {
		doubleChecker(square, currentBoard, function (limit) {
			square.possible = limit;
			if (square.possible.length === 1) {
				square.known = true;
				check++;
			}
			return square;
		});
	} else {
		return square;
	}
}


function doubleChecker (square, board, callback) {
	var dependencies = ['row', 'column', 'box'];
	var near = {};
	
	// this loop populates the near object with row, column, and box keys
	// each key will point to an array that contains the possible values for the
	// other squares in the given row, column, or box
	dependencies.forEach( function (elem, index) {
		near[elem] = board.reduce ( function (prev, current) {
			if (current.row !== square.row || current.column !== square.column) {
				if (current[elem] === square[elem]) {
					prev.push(current.possible);
					return prev;
				} else {
					return prev;
				}
			} else {
				return prev;
			}
		}, []);
	});
	
	// This function checks each possible value of the current square against the other
	// squares in its row.  If a possible value belongs only to the present square,
	// then that value is assigned to the square.  If none of the values are unique to the
	// present square, move on to the other squares in the column.  Then do the same with
	// the box.
	function crossHatch ( index ) {
		var result = square.possible;
		square.possible.forEach( function (elem, i) {
			if (result === square.possible) {
				var unique = true;
				near[dependencies[index]].forEach( function (depElem) {
					if (depElem.indexOf(elem) !== -1) {
						unique = false;
					}
				});
				if (unique) {
// 					console.log(square);
// 					console.log('was compared with its ' + dependencies[index]);
// 					console.log(near[dependencies[index]]);
// 					console.log('It was determined that ' + elem + ' is the only possible value');
					result = [elem];
				}
			}
		});
		if (result.length === 1) {
			square.possible = result;
			callback(square.possible);
		} else if (index < dependencies.length - 1) {
			crossHatch( index + 1 );
		} else {
			callback(square.possible);
		}
	}
	
	crossHatch( 0 );
}

function claimer (index, board) {
	var box = [];
	// Make an array containing the squares in the given box.
	board.forEach( function (elem) {
		if (elem.box === index) {
			box.push(elem);
		}
	});
	
	// determine the starting row and starting column
	var boxRow = Math.floor(index / 3) * 3;
	var boxColumn = (index % 3) * 3;

	
	findClaimed(boxRow, box, index, 'row', board);
	findClaimed(boxColumn, box, index, 'column', board);
	
	if (index < 8) {
		claimer(index + 1, board);
	}
}
	
// Make an array where each element is the list of possible values for a square
// in one of the two rows other than i
function findClaimed ( subIndex , box, boxIndex, dependency, board ) {
	var union = box.reduce( function ( prev, current ) {
		if (current[dependency] !== subIndex) {
			return fn.union(prev, current.possible);
		} else {
			return prev;
		}
	}, []);
	var claimed = fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], union);
	board.forEach( function (square) {
		if ( square.box !== boxIndex && square[dependency] === subIndex && !square.known) {
			var oldPossible = [].concat(square.possible);
			square.possible = fn.difference(square.possible, claimed);
// 			if (square.possible.length !== oldPossible.length) {
// 				console.log('square.possible was');
// 				console.log(oldPossible);
// 				console.log('square is');
// 				console.log(square);
// 			}
			
			if (square.possible.length === 1) {
				square.known = true;
				check++;
			}
		}
	});
	
	if (subIndex < Math.floor(boxIndex / 3) * 3 + 2) {
		findClaimed( subIndex + 1, box, boxIndex, dependency, board );
	}
}
