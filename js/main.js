(function() {
'use strict';

var Board = function(grid) {
	this.grid = grid || [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	];
};

Board.prototype.count = function(value) {
	return this.grid.reduce(function(empty, row, y) {
		return row.reduce(function(empty, cell, x) {
			if (cell == value) {
				empty.push({x: x, y: y, cell: cell});
			}
			return empty;
		}, empty);
	}, []);
};

Board.prototype.clone = function() {
	var grid = this.grid.map(function(row) {
		return row.map(function(cell) {
			return cell;
		});
	});
	return new Board(grid);
};

Board.prototype.rotate = function(deg) {
	switch ((deg + 360) % 360) {
	case 0:
		return this.clone();
	case 90:
		return new Board([
			[this.grid[0][3], this.grid[1][3], this.grid[2][3], this.grid[3][3]],
			[this.grid[0][2], this.grid[1][2], this.grid[2][2], this.grid[3][2]],
			[this.grid[0][1], this.grid[1][1], this.grid[2][1], this.grid[3][1]],
			[this.grid[0][0], this.grid[1][0], this.grid[2][0], this.grid[3][0]],
		]);
	case 180:
		return new Board(this.grid.map(function(row) {
			return row.reverse();
		}).reverse());
	case 270:
		return this.rotate(90).rotate(180);
	default:
		throw new Error('Can not rotate board by '+deg+'deg');
	}
};

// Shifts the cells in the field to the left.
Board.prototype.shift = function() {
	return new Board(this.grid.map(function(row) {
		var newRow = row.filter(function(cell) {
			return cell != 0;
		}).reduce(function(newRow, cell) {
			if (!newRow.length) {
				return [cell];
			}
			if (newRow[newRow.length-1] == cell) {
				newRow[newRow.length-1] += cell;
				return newRow.concat([0]);
			}
			return newRow.concat([cell]);
		}, []);
		for (var i = newRow.length; i < 4; i++) {
			newRow.push(0);
		}
		return newRow;
	}));
};

Board.prototype.toString = function() {
	return this.grid.map(function(row) {
		return row.join(' ');
	}).join('\n');
};


var Game = function() {
	this.board = new Board();
	this.eventListeners = {};

	// Seed
	for (var i = 0; i < 2; i++) {
		var empty = this.board.count(0);
		var cell = empty[(Math.random() * empty.length) | 0];
		this.board.grid[cell.x][cell.y] = 1;
	}
};

Game.prototype.on = function(eventName, handler) {
	var ll = this.eventListeners[eventName] = this.eventListeners[eventName] || [];
	ll.push(handler);
};

Game.prototype.trigger = function(eventName, event) {
	event = event || {};
	(this.eventListeners[eventName] || []).forEach(function(handler) {
		handler(event);
	});
};

Game.prototype.move = function(dir) {
	var deg =
		dir == 'left'  ? 0 :
		dir == 'up'    ? 90 :
		dir == 'right' ? 180 :
		dir == 'down'  ? 270 :
		-1;
	var oldBoard = this.board.clone();
	this.board = this.board.rotate(deg).shift().rotate(-deg);

	var empty = this.board.count(0);
	var cell = empty[(Math.random() * empty.length) | 0];
	this.board.grid[cell.x][cell.y] = 1;

	this.trigger('move', {
		oldBoard: oldBoard,
		newBoard: this.board,
	});

	var empty = this.board.count();
	if (!empty.length) {
		this.trigger('lose');
	}
	var target = this.board.count(2048);
	if (target.length) {
		this.trigger('win', {
			cells: target,
		});
	}
};


var View = function(game, $el) {
	this.$el = $el;
	this.game = game;

	this.game.on('move', function(event) {
		console.log(event.oldBoard.toString());
		console.log(event.newBoard.toString());
	}.bind(this));
};


var game = new Game();
var view = new View(game, document.querySelector('.game'));

window.game = game;
window.view = view;

})()
