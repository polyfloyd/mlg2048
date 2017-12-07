'use strict';

import { Howl } from 'howler';
import * as Misc from './misc.js';
import * as Random from './random.js';
import { ShaderView } from './shaderview.js';

import AudioAirhorn from '../audio/airhorn.mp3';
import AudioDamnson from '../audio/damnson.mp3';
import AudioHitmarker from '../audio/hitmarker.mp3';
import AudioMomgetthecamera from '../audio/momgetthecamera.mp3';
import AudioOhbabyatriple from '../audio/ohbabyatriple.mp3';
import AudioSad from '../audio/sad.mp3';
import AudioSanic from '../audio/sanic.mp3';
import AudioSmokeweedeveryday from '../audio/smokeweedeveryday.mp3';
import AudioWow from '../audio/wow.mp3';

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
			'translate('+(Random.uniform() * intensity * 2)+'vw, '+(Random.uniform() * intensity * 2)+'vw) '+
			'rotate('+(Random.uniform() * intensity * 4)+'deg)';
		requestAnimationFrame(function() {
			Anim.shake(el, intensity - 1 * (performance.now() - start)/1000);
		});
	},
};

var Audio = [
	[ 'airhorn', AudioAirhorn ],
	[ 'damnson', AudioDamnson ],
	[ 'hitmarker', AudioHitmarker ],
	[ 'momgetthecamera', AudioMomgetthecamera ],
	[ 'ohbabyatriple', AudioOhbabyatriple ],
	[ 'sad', AudioSad ],
	[ 'sanic', AudioSanic ],
	[ 'smokeweeeveryday', AudioSmokeweedeveryday ],
	[ 'wow', AudioWow ],
].reduce(function(audio, p) {
	audio[p[0]] = new Howl({
		src: [ p[1] ],
	});
	return audio;
}, {});

export var View = function(game) {
	this.game = game;
	this.scoreLerp = 1;
	this.timeLevel = 0;

	this.update(game.board);
	this.game.on('move', function(event) {
		document.querySelector('.game').classList.remove('game-state-begin');
		this.update(event.newBoard);

		var biggestNew = event.diff.add.reduce(function(biggest, cell) {
			return Math.max(biggest, cell.val);
		}, 0);
		if (biggestNew == 32) {
			this.barageAirhorns();
		} else if (biggestNew == 128) {
			this.barageSanic();
		} else if (biggestNew == 512) {
			Audio.smokeweedeveryday.play();
		} else if (biggestNew > 4) {
			this.barageDefault();
		}

		event.diff.add.forEach(function(cell, i) {
			if (!cell.merged) {
				return;
			}
			var cellEl = document.getElementById('cell-'+cell.id);
			setTimeout(function() {
				var mark = Misc.elementFromHtml(document.querySelector('.tmpl-anim-hitmarker').innerHTML);
				var rect = cellEl.getBoundingClientRect();
				var hx = (rect.right - rect.left) / 2;
				var hy = (rect.bottom - rect.top) / 2;
				mark.style.left = (rect.left + hx + hx * 0.5 * Random.uniform())+'px';
				mark.style.top  = (rect.top  + hy + hy * 0.5 * Random.uniform())+'px';
				Anim.show(mark, 500);

				Audio.hitmarker.play();
			}, 100 + 50 * i);
		});

		setTimeout(function() {
			Anim.shake(document.querySelector('.game-board'), event.diff.add.length / 6);
		}, 100);
	}.bind(this));
	this.game.on('lose', function(event) {
		Audio.sad.play();
		document.querySelector('.game').classList.add('game-state-lose');
	}.bind(this));
	this.game.on('win', function(event) {
		Anim.shake(document.querySelector('.game-board'), 3);
	}.bind(this));

	try {
		var glView = new ShaderView(
			document.querySelector('.gl-background'),
			document.querySelector('.background-shader').innerHTML
		);
		glView.on('pre-render', function(event) {
			this.scoreLerp += Math.sqrt(Math.max(this.game.score() - this.scoreLerp, 0) / 80);
			this.timeLevel += this.scoreLerp / 1000;
			glView.gl.uniform1f(glView.uniform('level'), this.scoreLerp / 512);
			glView.gl.uniform1f(glView.uniform('time_level'), this.timeLevel);
		}.bind(this));
	} catch (err) {
		console.error(err);
	}
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
			cellEl = Misc.elementFromHtml(tmpl);
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
	Array.prototype.forEach.call(document.querySelectorAll('.game-score'), function($el) {
		$el.innerHTML = this.game.score();
	}, this);
};

View.prototype.barageDefault = function() {
	Random.bool(0.1) && Audio[Random.pick([
		'damnson',
		'momgetthecamera',
		'ohbabyatriple',
		'wow',
	])].play();
	this.showGameText(Random.pick([
		'DAYUM',
		'I\'ll rekt u m8',
		'LMAO',
		'XD',
		'sweg',
		'ur whalecum',
		'h8tr',
	]), 500);
};

View.prototype.barageAirhorns = function() {
	var anim = document.querySelector('.animations');
	for (var i = 0; i < 4; i++) {
		setTimeout(function() {
			Audio.airhorn.play();

			var airhorn = Misc.elementFromHtml(document.querySelector('.tmpl-anim-airhorn').innerHTML);
			airhorn.style.top  = (Math.random() * 80 + 10)+'%';
			airhorn.style.left = (Math.random() * 80 + 10)+'%';
			var rotStart = Random.uniform() * 60;
			var rotEl = airhorn.querySelector('.anim-image');
			rotEl.style.transform = 'rotate('+rotStart+'deg)';
			Anim.runTransition(function() {
				rotEl.style.transform = 'rotate('+(rotStart + Random.inv() * (30 + 240 * Math.random()))+'deg)';
			});
			Anim.show(airhorn, 1500);
		}, 200 * i);
	}
};

View.prototype.barageSanic = function() {
	Audio.sanic.play();

	['such speed', '2fast4me', 'sanic hegehog', 'gtg fast'].map(function(text, i) {
		setTimeout(function() {
			this.showGameText(text, 500);
		}.bind(this), 100 + i * 300);
	}.bind(this));

	var sanic = Misc.elementFromHtml(document.querySelector('.tmpl-anim-sanic').innerHTML);
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
	var el = Misc.elementFromHtml('<span class="anim anim-text text-game"></span>');
	el.innerHTML = text;
	el.style.left = (Math.random() * 80 + 10)+'%';
	el.style.top  = (Math.random() * 80 + 10)+'%';
	el.style.transform = 'rotate('+(Random.uniform()*45)+'deg)';
	Anim.show(el, duration);
};
