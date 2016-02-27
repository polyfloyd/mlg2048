'use strict';

(function() {
if (!window.performance && !window.performance.now) {
	var time = 0;
	performance.now = function() {
		return time;
	};
	setInterval(function() {
		time += 10;
	}, 10);
}
})();
