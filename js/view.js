'use strict';

function elementFromHtml(html) {
	var $div = document.createElement('div');
	$div.innerHTML = html;
	return $div.childNodes[1];
}

var View = function(game, $el) {
	this.$el = $el;
	this.game = game;

	this.update(game.board);
	this.game.on('move', function(event) {
		this.update(event.newBoard);
	}.bind(this));
	this.game.on('lose', function(event) {
		console.log('You lost');
	}.bind(this));
	this.game.on('win', function(event) {
		console.log('You won');
	}.bind(this));
};

View.prototype.update = function(targetBoard) {
	var flatBoard = targetBoard.flat();
	flatBoard.forEach(function(cell) {
		if (cell.val == 0) {
			return;
		}
		var $cellEl = document.getElementById('cell-'+cell.id);
		if (!$cellEl) {
			var tmpl = document.querySelector('.tmpl-game-cell-'+(2 << cell.val-1)).innerHTML;
			$cellEl = elementFromHtml(tmpl);
			$cellEl.id = 'cell-'+cell.id;
			document.querySelector('.game-board').appendChild($cellEl);

			(cell.merged || []).forEach(function(id) {
				var $oldCellEl = document.getElementById('cell-'+id);
				$oldCellEl.style.left = (cell.x / 4 * 100)+'%';
				$oldCellEl.style.top  = (cell.y / 4 * 100)+'%';
				$oldCellEl.classList.add('fade-out');
				setTimeout(function() {
					$oldCellEl.parentNode.removeChild($oldCellEl);
				}, 400);
			});
		}
		$cellEl.style.left = (cell.x / 4 * 100)+'%';
		$cellEl.style.top  = (cell.y / 4 * 100)+'%';
	});
};

