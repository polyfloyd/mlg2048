'use strict';

var Anim = {
	show: function(elem, duration) {
		var container = document.querySelector('.animations');
		container.appendChild(elem);
		setTimeout(function() {
			container.removeChild(elem);
		}, duration);
	},

	runTransition: function(cb) {
		requestAnimationFrame(function() {
			requestAnimationFrame(function() {
				cb();
			});
		});
	},

	shake: function(el, intensity) {
		if (intensity <= 0) {
			el.style.transform = '';
			return;
		}
		var start = performance.now();
		el.style.transform =
			'translate('+(Rand.uniform() * intensity * 2)+'vw, '+(Rand.uniform() * intensity * 2)+'vw) '+
			'rotate('+(Rand.uniform() * intensity * 4)+'deg)';
		requestAnimationFrame(function() {
			Anim.shake(el, intensity - 1 * (performance.now() - start)/1000);
		});
	},
};

var audio = [
	'airhorn',
	'hitmarker',
	'momgetthecamera',
	'ohbabyatriple',
	'sad',
	'sanic',
	'smokeweedeveryday',
	'wow',
].reduce(function(audio, file) {
	audio[file] = new Howl({
		urls: ['audio/'+file+'.mp3'],
	});
	return audio;
}, {});

var View = function(game) {
	this.game = game;
	this.scoreLerp = 0;

	this.update(game.board);
	this.game.on('move', function(event) {
		this.update(event.newBoard);

		var biggestNew = event.diff.add.reduce(function(biggest, cell) {
			return Math.max(biggest, cell.val);
		}, 0);
		if (biggestNew == 32) {
			this.barageAirhorns();
		} else if (biggestNew == 128) {
			this.barageSanic();
		} else if (biggestNew == 512) {
			audio.smokeweedeveryday.play();
		} else if (biggestNew > 4) {
			this.showGameText(Rand.pick([
				'LMAO',
				'I\'ll rekt u m8',
				'XD',
				'sweg',
				'DAYUM',
			]), 500);
		}

		event.diff.add.forEach(function(cell, i) {
			if (!cell.merged) {
				return;
			}
			var cellEl = document.getElementById('cell-'+cell.id);
			setTimeout(function() {
				var mark = elementFromHtml(document.querySelector('.tmpl-anim-hitmarker').innerHTML);
				var rect = cellEl.getBoundingClientRect();
				var hx = (rect.right - rect.left) / 2;
				var hy = (rect.bottom - rect.top) / 2;
				mark.style.left = (rect.left + hx + hx * 0.5 * Rand.uniform())+'px';
				mark.style.top  = (rect.top  + hy + hy * 0.5 * Rand.uniform())+'px';
				Anim.show(mark, 500);

				audio.hitmarker.play();
			}, 100 + 50 * i);
		});

		setTimeout(function() {
			Anim.shake(document.querySelector('.game-board'), event.diff.add.length / 6);
		}, 100);
	}.bind(this));
	this.game.on('lose', function(event) {
		audio.sad.play();
	}.bind(this));
	this.game.on('win', function(event) {
		Anim.shake(document.querySelector('.game-board'), 3);
	}.bind(this));

	var glView = new ShaderView(
		document.querySelector('.gl-background'),
		document.querySelector('.background-shader').innerHTML
	);
	glView.on('pre-render', function(event) {
		this.scoreLerp += Math.sqrt(Math.max(this.game.score() - this.scoreLerp, 0) / 80);
		var levelUniform = event.gl.getUniformLocation(glView.prog, 'level');
		event.gl.uniform1f(levelUniform, this.scoreLerp / 512);
		var randomUniform = event.gl.getUniformLocation(glView.prog, 'random');
		event.gl.uniform1f(randomUniform, Math.random());
	}.bind(this));
};

View.prototype.update = function(targetBoard) {
	var flatBoard = targetBoard.flat();
	flatBoard.forEach(function(cell, i) {
		if (cell.val == 0) {
			return;
		}
		var cellEl = document.getElementById('cell-'+cell.id);
		if (!cellEl) {
			var tmpl = document.querySelector('.tmpl-game-cell-'+(cell.val)).innerHTML;
			cellEl = elementFromHtml(tmpl);
			cellEl.id = 'cell-'+cell.id;
			document.querySelector('.game-board-cells').appendChild(cellEl);

			(cell.merged || []).forEach(function(id) {
				var oldCellEl = document.getElementById('cell-'+id);
				oldCellEl.style.left = (cell.x * 25)+'%';
				oldCellEl.style.top  = (cell.y * 25)+'%';
				oldCellEl.classList.add('fade-out');
				setTimeout(function() {
					oldCellEl.parentNode.removeChild(oldCellEl);
				}, 200);
			});
		}
		cellEl.style.left = (cell.x / 4 * 100)+'%';
		cellEl.style.top  = (cell.y / 4 * 100)+'%';
	});
	document.querySelector('.game-score').innerText = this.game.score();
};

View.prototype.barageAirhorns = function() {
	var anim = document.querySelector('.animations');
	for (var i = 0; i < 4; i++) {
		setTimeout(function() {
			audio.airhorn.play();

			var airhorn = elementFromHtml(document.querySelector('.tmpl-anim-airhorn').innerHTML);
			airhorn.style.top  = (Math.random() * 80 + 10)+'%';
			airhorn.style.left = (Math.random() * 80 + 10)+'%';
			var rotStart = Rand.uniform() * 60;
			var rotEl = airhorn.querySelector('.anim-image');
			rotEl.style.transform = 'rotate('+rotStart+'deg)';
			Anim.runTransition(function() {
				rotEl.style.transform = 'rotate('+(rotStart + Rand.inv() * (30 + 240 * Math.random()))+'deg)';
			});
			Anim.show(airhorn, 1500);
		}, 200 * i);
	}
};

View.prototype.barageSanic = function() {
	audio.sanic.play();

	['such speed', '2fast4me', 'sanic hegehog', 'gtg fast'].map(function(text, i) {
		setTimeout(function() {
			this.showGameText(text, 500);
		}.bind(this), 100 + i * 300);
	}.bind(this));

	var sanic = elementFromHtml(document.querySelector('.tmpl-anim-sanic').innerHTML);
	var a = Math.random() * 0.8 + 0.1;
	var b = Math.random() * 0.8 + 0.1;
	var cont = document.querySelector('.animations');
	var angrad = Math.atan2(cont.clientWidth, cont.clientHeight * (a - b)) - Math.PI/2;
	sanic.querySelector('.anim-image').style.transform = 'rotate('+angrad+'rad)';
	sanic.style.left = '-300px';
	sanic.style.top  = (a * 100)+'%';
	Anim.runTransition(function() {
		sanic.style.top  = (b * 100)+'%';
		sanic.style.left = 'calc(100% + 300px)';
	});
	Anim.show(sanic, 2000);
};

View.prototype.showGameText = function(text, duration) {
	var el = elementFromHtml('<span class="anim anim-text text-game"></span>');
	el.innerText = text;
	el.style.left = (Math.random() * 80 + 10)+'%';
	el.style.top  = (Math.random() * 80 + 10)+'%';
	el.style.transform = 'rotate('+(Rand.uniform()*45)+'deg)';
	Anim.show(el, duration);
};
