'use strict';

function elementFromHtml(html) {
	var $div = document.createElement('div');
	$div.innerHTML = html;
	return $div.childNodes[1];
}

var audio = [
	'hitmarker',
	'momgetthecamera',
	'ohbabyatriple',
	'sad',
	'wow',
].reduce(function(audio, file) {
	audio[file] = new Howl({
		urls: ['audio/'+file+'.mp3'],
	});
	return audio;
}, {});

var View = function(game, $el) {
	this.$el = $el;
	this.game = game;

	this.update(game.board);
	this.game.on('move', function(event) {
		this.update(event.newBoard);
		if (event.diff.add.length == 2) {
			audio.wow.play();
		} else if (event.diff.add.length == 3) {
			audio.ohbabyatriple.play();
		} else if (event.diff.add.length >= 4) {
			audio.momgetthecamera.play();
		}
	}.bind(this));
	this.game.on('lose', function(event) {
		audio.sad.play();
		console.log('You lost');
	}.bind(this));
	this.game.on('win', function(event) {
		console.log('You won');
	}.bind(this));
};

View.prototype.update = function(targetBoard) {
	var flatBoard = targetBoard.flat();
	flatBoard.forEach(function(cell, i) {
		if (cell.val == 0) {
			return;
		}
		var $cellEl = document.getElementById('cell-'+cell.id);
		if (!$cellEl) {
			var tmpl = document.querySelector('.tmpl-game-cell-'+(cell.val)).innerHTML;
			$cellEl = elementFromHtml(tmpl);
			$cellEl.id = 'cell-'+cell.id;
			document.querySelector('.game-board-cells').appendChild($cellEl);

			(cell.merged || []).forEach(function(id) {
				var $oldCellEl = document.getElementById('cell-'+id);
				$oldCellEl.style.left = (cell.x / 4 * 100)+'%';
				$oldCellEl.style.top  = (cell.y / 4 * 100)+'%';
				$oldCellEl.classList.add('fade-out');
				setTimeout(function() {
					audio.hitmarker.play();
				}, 100 + 10 * i);
				setTimeout(function() {
					$oldCellEl.parentNode.removeChild($oldCellEl);
				}, 200);
			});
		}
		$cellEl.style.left = (cell.x / 4 * 100)+'%';
		$cellEl.style.top  = (cell.y / 4 * 100)+'%';
	});
};
