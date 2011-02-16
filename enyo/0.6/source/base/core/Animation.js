/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.Animation",
	duration: 350,
	tick: 20,
	start: 0, 
	end: 100,
	repeat: 0,
	easingFunc: enyo.easing.cubicOut,
	constructed: function(inProps) {
		enyo.mixin(this, inProps);
	},
	play: function() {
		this._repeated = 0;
		this._progress = 1;
		this._steps = Math.ceil(this.duration / (this.tick || 1));
		this._value = this.start;
		if (this.animating) {
			this.stop();
		}
		this.callMethod("onBegin", [this.start, this.end]);
		//this._start = Date.now();
		this.animating = setInterval(enyo.hitch(this, "_animate"), this.tick);
		this._animate();
		return this;
	},
	stop: function() {
		clearInterval(this.animating);
		this.animating = null;
		//console.log("elapsed", Date.now() - this._start);
		this.callMethod("onStop", [this._value, this.start, this.end]);
		return this;
	},
	_animate: function() {
		if ((this.repeat < 0 ||this._repeated < this.repeat) && this._progress > this._steps) {
			this._progress = 1;
			this._repeated++;
		}
		var p = this._progress / this._steps;
		var x = this.easingFunc ? this.easingFunc(p) : p;
		var v = this._value = this.start + x * (this.end - this.start);
		if (this._progress <= this._steps) {
			this.callMethod("onAnimate", [v, p, this._steps]);
			this._progress++;
		} else {
			this.stop();
			this.callMethod("onEnd", [v]);
		}
	},
	callMethod: function(inMethod, inArgs) {
		var m = this[inMethod];
		if (m) {
			m.apply(this, inArgs);
		}
	}
});

//* @public
// This component just runs one animation at a time and exists
// mainly for the ease of setting events.
enyo.kind({
	name: "enyo.Animator",
	kind: enyo.Component,
	published: {
		duration: 350,
		tick: 20,
		repeat: 0,
		easingFunc: enyo.easing.cubicOut
	},
	events: {
		onBegin: "",
		onAnimate: "",
		onStop: "",
		onEnd: ""
	},
	//* @public
	play: function(inStart, inEnd) {
		this.stop();
		this._animation = new enyo.Animation({
			duration: this.duration,
			tick: this.tick,
			repeat: this.repeat,
			easingFunc: this.easingFunc,
			start: inStart,
			end: inEnd,
			onBegin: enyo.hitch(this, "doBegin"),
			onAnimate: enyo.hitch(this, "doAnimate"),
			onStop: enyo.hitch(this, "doStop"),
			onEnd: enyo.hitch(this, "doEnd")
		});
		this._animation.play();
	},
	stop: function() {
		if (this._animation) {
			this._animation.stop();
		}
	},
	isAnimating: function() {
		return this._animation && this._animation.animating;
	}
});