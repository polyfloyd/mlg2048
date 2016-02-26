'use strict';

var game = new Game();
var view = new View(game, document.querySelector('.game'));

var transitioning = false;

document.onkeydown = function(event) {
	if (transitioning) {
		return;
	}
	event = event || window.event;
	switch (event.keyCode) {
		case 38:
			game.move('up');
			break;
		case 40:
			game.move('down');
			break;
		case 37:
			game.move('left');
			break;
		case 39:
			game.move('right');
			break;
	}
	transitioning = true;
	setTimeout(function() {
		transitioning = false;
	}, 100);
};
