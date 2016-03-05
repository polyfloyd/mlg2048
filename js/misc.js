'use strict';

window.performance = window.performance || {};

if (!performance.now) {
	var time = 0;
	performance.now = function() {
		return time;
	};
	setInterval(function() {
		time += 10;
	}, 10);
}

var Rand = {
	uniform: function() {
		return Math.random() * 2 - 1;
	},

	inv: function() {
		return Math.random() > 0.5 ? 1 : -1;
	},

	pick: function(array) {
		return array[Math.round(Math.random() * array.length - 0.5)];
	},
};
