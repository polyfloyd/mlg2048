'use strict';

window.performance = window.performance || {};

if (!performance.now) {
	var time = 0;
	performance.now = function() {
		return time;
	};
	setInterval(function() {
		time += 10;
	}, 10);
}

export function elementFromHtml(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div.childNodes[1] || div.childNodes[0];
}


export class Observable {
	constructor() {
		this.eventListeners = {};
	}

	on(eventName, handler) {
		let ll = this.eventListeners[eventName] = this.eventListeners[eventName] || [];
		ll.push(handler);
	}

	trigger(eventName, event={}) {
		(this.eventListeners[eventName] || []).forEach(function(handler) {
			handler(event);
		});
	}
}
