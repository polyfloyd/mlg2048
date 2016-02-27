'use strict';


function compileProgram(gl, shaderSources) {
	var shaders = Object.keys(shaderSources).map(function(type) {
		var shader = gl.createShader(gl[type]);
		gl.shaderSource(shader, shaderSources[type]);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			gl.deleteShader(shader);
			throw new Error(gl.getShaderInfoLog(shader));
		}
		return shader;
	});

	var prog = gl.createProgram();
	shaders.forEach(function(shader) {
		gl.attachShader(prog, shader);
	});
	gl.linkProgram(prog);
	shaders.forEach(function(shader) {
		gl.detachShader(prog, shader);
		gl.deleteShader(shader);
	});
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		gl.deleteProgram(prog);
		throw new Error(gl.getProgramInfoLog(prog));
	}
	return prog;
}

var ShaderView = function(canvas, glsl) {
	this.canvas = canvas;
	this.eventListeners = {};

	this.resize();
	window.addEventListener('resize', this.resize.bind(this));

	var gl = this.gl();
	if (!gl) {
		return;
	}

	this.prog = compileProgram(gl, {
		VERTEX_SHADER:
			'attribute vec3 vert;'+
			'void main(void) {'+
				'gl_Position = vec4(vert, 1.0);'+
			'}',
		FRAGMENT_SHADER: glsl,
	});
	gl.useProgram(this.prog);
	gl.enableVertexAttribArray(gl.getAttribLocation(this.prog, 'vert'));

	var vertices = [
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0,  1.0,  0.0,
		 1.0,  1.0,  0.0,
	];
	this.square = gl.createBuffer();
	this.square.itemSize = 3;
	this.square.numItems = 4;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.square);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	var self = this;
	(function loop() {
		requestAnimationFrame(function() {
			self.render();
			loop();
		});
	})();
};

ShaderView.prototype.resize = function() {
	var gl = this.gl();
	if (!gl) {
		return;
	}
	var w = this.canvas.clientWidth, h = this.canvas.clientHeight;
	this.canvas.width = w;
	this.canvas.height = h;
	gl.viewport(0, 0, w, h);
	this.trigger('resize', {width: w, height: h});
};

ShaderView.prototype.gl = function() {
	try {
		return this.canvas.getContext('webgl');
	} catch (err) {
		try {
			return this.canvas.getContext('experimental-webgl');
		} catch (err) {
			return null;
		}
	}
};

ShaderView.prototype.render = function() {
	var gl = this.gl();
	this.trigger('pre-render', {gl: gl});
	var resolutionUniform = gl.getUniformLocation(this.prog, 'resolution');
	gl.uniform2f(resolutionUniform, this.canvas.width, this.canvas.height);
	var timeUniform = gl.getUniformLocation(this.prog, 'time');
	gl.uniform1f(timeUniform, performance.now() / 1000);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.square);
	gl.vertexAttribPointer(gl.getAttribLocation(this.prog, 'vert'), this.square.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.square.numItems);
};

ShaderView.prototype.on = function(eventName, handler) {
	var ll = this.eventListeners[eventName] = this.eventListeners[eventName] || [];
	ll.push(handler);
};

ShaderView.prototype.trigger = function(eventName, event) {
	event = event || {};
	(this.eventListeners[eventName] || []).forEach(function(handler) {
		handler(event);
	});
};
