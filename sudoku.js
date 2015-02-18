var input = '158 2  6 2   8  9  3  7 8 2 6 74      4 6 7      19 5 4 9 3  2  2  5   8 7  9 413';
var fn = require('./functions.js');
var squares = [];

function populateSquares ( i ) {

	var square = {};

	// determine whether the square is known
	if (input[i] === ' ') {
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
	squares.push(square);
	if (i < input.length - 1) {
		populateSquares (i + 1);
	}
}

populateSquares(0);

squares.map(narrowPossibilities);

function narrowPossibilities (square) {
	if (!square.known) {
	
		checkRow(square.row, function (rowLimit) {
			checkColumn(square.column, function (columnLimit) {
				checkBox(square.box, function (boxLimit) {
					square.possible = fn.intersect(rowLimit, fn.intersect(columnLimit, boxLimit));
					console.log('rowLimit for row ' + square.row + ' is ' + rowLimit);
					console.log('square.possible is ' + square.possible);
					return square;
				});
			});
		});
		
	} else {
		return square;
	}
		
}

//console.log(squares);

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
	callback([1, 2, 3, 4, 5, 6, 7, 8, 9]);
}
function checkBox (index, callback) {
	callback([1, 2, 3, 4, 5, 6, 7, 8, 9]);
}