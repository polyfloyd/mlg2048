window.performance = window.performance || {};

if (!performance.now) {
	let time = 0;
	performance.now = () => time;
	setInterval(() => {
		time += 10;
	}, 10);
}

export function elementFromHtml(html) {
	let div = document.createElement('div');
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
