'use strict';

var View = function(game, $el) {
	this.$el = $el;
	this.game = game;

	console.log(game.board.toString());
	this.game.on('move', function(event) {
		console.log(game.board.toString());
	}.bind(this));
	this.game.on('lose', function(event) {
		console.log('You lost');
	}.bind(this));
	this.game.on('win', function(event) {
		console.log('You won');
	}.bind(this));
};


