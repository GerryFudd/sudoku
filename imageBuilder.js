function imageBuilder (array) {
	var i;
	var image = '+---------+---------+---------+';
	for (i = 0; i < 3; i++) {
		image = buildBoxes(array, image, i);
	}
	console.log(image);
}

function buildBoxes (array, image, boxRow) {
	var l;
	for (l = boxRow * 3; l < (boxRow + 1) * 3; l++) {
		image = buildRow(array, image, l);
	}
	image += '\n+---------+---------+---------+';
	return image;
}

function buildRow (array, image, rowNum) {
	image += '\n|';
	var k;
	for (k = rowNum * 3; k < 3 * (rowNum + 1); k++) {
		image = buildRowPart(array, image, k);
	}
	return image;
}

function buildRowPart (array, image, num) {
	var j;
	for (j = num * 3; j < 3 * (num + 1); j++) {
		if (array[j].known) {
			image += ' ' + array[j].possible[0] + ' ';
		} else {
			image += '   ';
		}
	}
	image += '|';
	return image;
}

module.exports = imageBuilder;