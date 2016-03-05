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

var hammertime = new Hammer(document, {});
hammertime.get('swipe').set({direction: Hammer.DIRECTION_ALL});
hammertime.on('swipe', function(event) {
	var d = Math.min(Math.round((event.angle + 360*2) % 360 / 90), 3);
	game.move(['right', 'down', 'left', 'up'][d]);
});
