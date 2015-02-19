var input = '158 2  6 2   8  9  3  7 8 2 6 74      4 6 7      19 5 4 9 3  2  2  5   8 7  9 413';
var fn = require('./functions.js');
var squares = [];
var check = 0;

function populateSquares ( i ) {

	var square = {};

	// determine whether the square is known
	if (input[i] === ' ') {
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
	}
}

populateSquares(0);

function solve () {
	var prevCheck = check;
	squares.map(narrowPossibilities);
	if (check !== prevCheck) {
		console.log(check);
		solve();
	}
}

solve();

function narrowPossibilities (square) {
	if (!square.known) {
	
		checkRow(square.row, function (rowLimit) {
			checkColumn(square.column, function (columnLimit) {
				checkBox(square.box, function (boxLimit) {
					square.possible = fn.intersect(rowLimit, fn.intersect(columnLimit, boxLimit));
					if (square.possible.length === 1) {
						square.known = true;
						check++;
					}
					return square;
				});
			});
		});
		
	} else {
		return square;
	}
}

function checkRow (index, callback) {

	var row = squares.reduce ( function (prev, current) {
		if (current.row === index && current.known) {
			return prev.concat(current.possible);
		} else {
			return prev;
		}
	}, []);
	
	callback(fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], row));
}
function checkColumn (index, callback) {

	var column = squares.reduce ( function (prev, current) {
		if (current.column === index && current.known) {
			return prev.concat(current.possible);
		} else {
			return prev;
		}
	}, []);
	
	callback(fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], column));
}
function checkBox (index, callback) {

	var box = squares.reduce ( function (prev, current) {
		if (current.box === index && current.known) {
			return prev.concat(current.possible);
		} else {
			return prev;
		}
	}, []);
	
	callback(fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], box));
}
