'use strict';

var game = new Game();
var view = new View(game);

var transitioning = false;
document.onkeydown = function(event) {
	event = event || window.event;
	switch (event.keyCode) {
		case 38:
			if (!transitioning) game.move('up');
			event.preventDefault();
			break;
		case 40:
			if (!transitioning) game.move('down');
			event.preventDefault();
			break;
		case 37:
			if (!transitioning) game.move('left');
			event.preventDefault();
			break;
		case 39:
			if (!transitioning) game.move('right');
			event.preventDefault();
			break;
	}
	transitioning = true;
	setTimeout(function() {
		transitioning = false;
	}, 100);
};

var dragStart = null;
document.addEventListener('mousedown', function(event) {
	dragStart = {
		x: event.clientX,
		y: event.clientY,
	};
});
document.addEventListener('mouseup', function(event) {
	var dx = dragStart.x - event.clientX;
	var dy = dragStart.y - event.clientY;
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx < -10) {
			game.move('right');
		} else if (dx > 10) {
			game.move('left');
		}
	} else {
		if (dy < -10) {
			game.move('down');
		} else if (dy > 10) {
			game.move('up');
		}
	}
});
