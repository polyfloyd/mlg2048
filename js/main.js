'use strict';

var game = new Game();
var view = new View(game);

game.on('lose', function(event) {
	_paq.push(['trackEvent', 'GameOver', 'score: '+event.score+', highest: '+event.highestCell]);
});

var transitioning = false;
document.onkeydown = function(event) {
	event = event || window.event;
	switch (event.keyCode) {
		case 87:
		case 38:
			if (!transitioning) game.move('up');
			event.preventDefault();
			break;
		case 83:
		case 40:
			if (!transitioning) game.move('down');
			event.preventDefault();
			break;
		case 65:
		case 37:
			if (!transitioning) game.move('left');
			event.preventDefault();
			break;
		case 68:
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

var hammertime = new Hammer(document.querySelector('.game-board'));
hammertime.get('swipe').set({direction: Hammer.DIRECTION_ALL});
hammertime.on('swipe', function(event) {
	var d = Math.round((event.angle + 360) % 360 / 90) % 4;
	game.move(['right', 'down', 'left', 'up'][d]);
});

document.querySelector('.epilepsy-warning').addEventListener('click', function(event) {
	event.target.classList.add('hide');
});
