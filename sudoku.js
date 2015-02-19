var input = '.94...13..............76..2.8..1.....32.........2...6.....5.4.......8..7..63.4..8';
var fn = require('./functions.js');
var ib = require('./imageBuilder.js');
var squares = [];
var check = 0;

console.log('=======================================================================');


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
}

populateSquares(0);

function solve () {

	var prevCheck = check;
	squares.map(narrowPossibilities);
	squares.map(doubleCheck);
	
	if (check !== prevCheck) {
		console.log(check);
		ib(squares);
		solve();
	} else if (check === 81) {
		ib(squares);
	} else {
		console.log(check);
		ib(squares);
	}
}

solve();

function narrowPossibilities (square) {
	if (!square.known) {
	
		checker([square.row, square.column, square.box], function (limit) {
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

function checker (depList, callback) {
	var dependencies = ['row', 'column', 'box'];
	var limits = [];
	depList.forEach( function (elem, index) {
		limits[index] = squares.reduce ( function (prev, current) {
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

function doubleCheck (square) {
	if (!square.known) {
		doubleChecker(square, function (limit) {
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

function doubleChecker (square, callback) {
	var dependencies = ['row', 'column', 'box'];
	var near = {};
	dependencies.forEach( function (elem, index) {
		near[elem] = squares.reduce ( function (prev, current) {
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