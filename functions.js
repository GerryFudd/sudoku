module.exports.intersect = function (listA, listB) {
	var result = [];
	
	listA.forEach( function (elem) {
		if (listB.indexOf(elem) !== -1) {
			result.push(elem);
		}
	});
	
	return result;
};

module.exports.difference = function (listA, listB) {
	var result = [];
	listA.forEach( function (elem) {
		if (listB.indexOf(elem) === -1) {
			result.push(elem);
		}
	});
	
	return result;
};

module.exports.union = function (listA, listB) {
	var result = [];
	var result = result.concat(listB);
	listA.forEach( function (elem) {
		if (result.indexOf(elem) === -1) {
			result.push(elem);
		}
	});
	
	return result;
};