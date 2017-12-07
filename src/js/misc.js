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

export function elementFromHtml(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.childNodes[1] || div.childNodes[0];
}
