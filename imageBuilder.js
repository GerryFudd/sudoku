function imageBuilder (array) {
	var i;
	var image = '+---------+---------+---------+';
	var border = '\n+---------+---------+---------+';
	for (i = 0; i < 3; i++) {
		image = buildRow(array, image, i);
	}
	image += border;
	console.log(image);
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