var utilities = (function() {
	var ut = {};

	ut.roll = function(sides) {
		if (sides === 0) 
			return 0;
		return Math.floor(Math.random() * sides + 1);
	};

	ut.displayMatrix = function(matrix) {
		for (var i = 0; i < matrix.length; i++) {
			var str = '';
			for (var j = 0; j < matrix.length; j++) {
				str += '   ' + matrix[i][j];
			}
			console.log(str);
		}
	};

	ut.getRandElement = function(arr) {
		var roll = ut.roll(arr.length) - 1;
		return arr[roll];
	}

	return ut;
})();