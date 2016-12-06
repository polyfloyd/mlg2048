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
	this.uniforms = {};
	this.scale = 1;
	this.gl = this.getGL();

	this.resize();
	window.addEventListener('resize', this.resize.bind(this));

	this.prog = compileProgram(this.gl, {
		VERTEX_SHADER:
			'attribute vec3 vert;'+
			'void main(void) {'+
				'gl_Position = vec4(vert, 1.0);'+
			'}',
		FRAGMENT_SHADER: glsl,
	});
	this.gl.useProgram(this.prog);
	this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.prog, 'vert'));

	var vertices = [
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0,  1.0,  0.0,
		 1.0,  1.0,  0.0,
	];
	this.square = this.gl.createBuffer();
	this.square.itemSize = 3;
	this.square.numItems = 4;
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.square);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
	this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.prog, 'vert'), this.square.itemSize, this.gl.FLOAT, false, 0, 0);

	var prevRenderStart = performance.now() / 1000;
	var self = this;
	(function loop() {
		requestAnimationFrame(function() {
			var curRenderStart = performance.now() / 1000;
			var fps = 1 / (curRenderStart - prevRenderStart);
			if (fps < 10) {
				self.scale = Math.max(self.scale / 2, 0.03);
				self.resize();
			}
			prevRenderStart = curRenderStart;

			self.render();
			loop();
		});
	})();
};

ShaderView.prototype.resize = function() {
	var w = this.canvas.clientWidth, h = this.canvas.clientHeight;
	this.canvas.width = w * this.scale;
	this.canvas.height = h * this.scale;
	this.gl.viewport(0, 0, w, h);
	this.trigger('resize', { width: w, height: h });
};

ShaderView.prototype.uniform = function(name) {
	return this.uniforms[name] || (this.uniforms[name] = this.gl.getUniformLocation(this.prog, name));
};

ShaderView.prototype.getGL = function() {
	var gl;
	try {
		gl = this.canvas.getContext('webgl');
	} catch (err) {
		gl = this.canvas.getContext('experimental-webgl');
	}
	if (!gl) {
		throw new Error('Unable to get WebGL context');
	}
	return gl;
};

ShaderView.prototype.render = function() {
	this.trigger('pre-render');
	this.gl.uniform1f(this.uniform('time'), performance.now() / 1000);
	this.gl.uniform1f(this.uniform('scale'), this.scale);
	this.gl.uniform2f(this.uniform('resolution'), this.canvas.width, this.canvas.height);
	this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.square.numItems);
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
