var input = '.94...13..............76..2.8..1.....32.........2...6.....5.4.......8..7..63.4..8';
var fn = require('./functions.js');
var ib = require('./imageBuilder.js');
var squares = [];
var check = 0;

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
	if (check !== prevCheck) {
		console.log(check);
		solve();
	} else if (check === 81) {
		ib(squares);
	} else {
		console.log(squares);
	}
}

solve();

function narrowPossibilities (square) {
	if (!square.known) {
	
		checker(square.row, square.column, square.box, function (limit) {
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

function checker (rowNum, columnNum, boxNum, callback) {

	var row = squares.reduce ( function (prev, current) {
		if (current.row === rowNum && current.known) {
			return prev.concat(current.possible);
		} else {
			return prev;
		}
	}, []);
	var rowLimit = fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], row);

	var column = squares.reduce ( function (prev, current) {
		if (current.column === columnNum && current.known) {
			return prev.concat(current.possible);
		} else {
			return prev;
		}
	}, []);
	var columnLimit = fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], column);

	var box = squares.reduce ( function (prev, current) {
		if (current.box === boxNum && current.known) {
			return prev.concat(current.possible);
		} else {
			return prev;
		}
	}, []);
	var boxLimit = fn.difference([1, 2, 3, 4, 5, 6, 7, 8, 9], box);
	
	callback(fn.intersect(rowLimit, fn.intersect(columnLimit, boxLimit)));
}