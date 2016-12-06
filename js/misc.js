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

function elementFromHtml(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.childNodes[1] || div.childNodes[0];
}

var Rand = {
	uniform: function() {
		return Math.random() * 2 - 1;
	},

	bool: function(bias) {
		bias = bias || 0.5;
		return Math.random() > bias;
	},

	inv: function() {
		return this.bool() ? 1 : -1;
	},

	pick: function(array) {
		return array[Math.round(Math.random() * array.length - 0.5)];
	},
};
