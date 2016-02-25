'use strict';

var Board = function(grid) {
	this.grid = grid || [
		[{val: 0}, {val: 0}, {val: 0}, {val: 0}],
		[{val: 0}, {val: 0}, {val: 0}, {val: 0}],
		[{val: 0}, {val: 0}, {val: 0}, {val: 0}],
		[{val: 0}, {val: 0}, {val: 0}, {val: 0}],
	];
};

Board._idEnum = 0;

Board.prototype.count = function(value) {
	return this.grid.reduce(function(result, row, y) {
		return row.reduce(function(result, cell, x) {
			if (cell.val == value) {
				result.push({x: x, y: y, cell: cell});
			}
			return result;
		}, result);
	}, []);
};

Board.prototype.equals = function(other) {
	return this.grid.every(function(row, y) {
		return row.every(function(cell, x) {
			return other.grid[y][x].val == cell.val;
		});
	});
}

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
			return cell.val != 0;
		}).reduce(function(tuple, cell, x) {
			var newRow = tuple[0];
			if (!newRow.length) {
				return [[cell], false];
			}
			if (newRow[newRow.length-1].val == cell.val && !tuple[1]) {
				return [newRow.slice(0, newRow.length-1).concat([{
					val: cell.val + 1,
					id:  ++Board._idEnum,
				}]), true];
			}
			return [newRow.concat([cell]), false];
		}, [[], false])[0];
		for (var i = newRow.length; i < 4; i++) {
			newRow.push({val: 0});
		}
		return newRow;
	}));
};

Board.prototype.toString = function() {
	return this.grid.map(function(row) {
		return row.map(function(cell) {
			return cell.val;
		}).join(' ');
	}).join('\n');
};


var Game = function() {
	this.board = new Board();
	this.eventListeners = {};

	// Seed
	for (var i = 0; i < 2; i++) {
		var empty = this.board.count(0);
		var cell = empty[(Math.random() * empty.length) | 0];
		this.board.grid[cell.y][cell.x] = {val: 1, id: ++Board._idEnum};
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
	if (deg == -1) {
		throw new Error('Unknown direction "'+dir+'"');
	}
	var oldBoard = this.board.clone();
	this.board = this.board.rotate(deg).shift().rotate(-deg);

	if (oldBoard.equals(this.board)) {
		return;
	}

	var empty = this.board.count(0);
	var cell = empty[(Math.random() * empty.length) | 0];
	this.board.grid[cell.y][cell.x] = {val: 1, id: ++Board._idEnum};

	this.trigger('move', {
		oldBoard: oldBoard,
		newBoard: this.board,
	});

	if (this.board.count(0).length == 0) {
		var movePossible = [0, 90, 180, 270].some(function(deg) {
			return this.board.rotate(deg).shift().rotate(-deg).count(0).length > 0;
		}.bind(this));
		if (!movePossible) {
			this.trigger('lose');
		}
	}
	var target = this.board.count(11);
	if (target.length) {
		this.trigger('win', {
			cells: target,
		});
	}
};
