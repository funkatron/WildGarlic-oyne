/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
enyo.ScrollMath implements scrolling dynamics simulation. It is a helper kind used
by other scroller kinds.

enyo.ScrollMath is not typically created in application code.
*/
enyo.kind({
	name: "enyo.ScrollMath",
	kind: enyo.Component,
	published: {
		vertical: true,
		horizontal: true
	},
	events: {
		onScrollStart: "scrollStart",
		onScroll: "scroll",
		onScrollStop: "scrollStop"
	},
	//* 'spring' damping returns the scroll position to a value inside the boundaries (lower provides FASTER snapback)
	kSpringDamping: 0.93,
	//* 'drag' damping resists dragging the scroll position beyond the boundaries (lower provides MORE resistance)
	kDragDamping: 0.5,
	//* 'friction' damping reduces momentum over time (lower provides MORE friction)
	kFrictionDamping: 0.98,
	//* Additional 'friction' damping applied when momentum carries the viewport into overscroll (lower provides MORE friction)
	kSnapFriction: 0.9,
	//* Scalar applied to 'flick' event velocity
	kFlickScalar: 0.02,
	//* top snap boundary, generally 0
	topBoundary: 0,
	//* right snap boundary, generally (viewport width - content width)
	rightBoundary: 0,
	//* bottom snap boundary, generally (viewport height - content height)
	bottomBoundary: 0,
	//* left snap boundary, generally 0
	leftBoundary: 0,
	//* @protected
	// simulation state
	x0: 0,
	x: 0,
	y0: 0,
	y: 0,
	/**
		Simple Verlet integrator for simulating Newtonian motion.
	*/
	verlet: function(p) {
		var x = this.x;
		this.x += x - this.x0;
		this.x0 = x;
		//
		var y = this.y;
		this.y += y - this.y0;
		this.y0 = y;
	},
	/**
		Boundary damping function.
		Return damped 'value' based on 'coeff' on one side of 'origin'.
	*/
	damping: function(value, origin, coeff, sign) {
		var kEpsilon = 0.5;
		//
		// this is basically just value *= coeff (generally, coeff < 1)
		//
		// 'sign' and the conditional is to force the damping to only occur 
		// on one side of the origin.
		//
		// Force close to zero to be zero
		if (Math.abs(value-origin) < kEpsilon) {
			return origin;
		}
		return value*sign > origin*sign ? coeff * (value-origin) + origin : value;
	},
	/**
		Dual-boundary damping function.
		Return damped 'value' based on 'coeff' when exceeding either boundary.
	*/
	boundaryDamping: function(value, aBoundary, bBoundary, coeff) {
		return this.damping(this.damping(value, aBoundary, coeff, 1), bBoundary, coeff, -1);
	},
	/**
		Simulation constraints (spring damping occurs here)
	*/
	constrain: function() {
		var y = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
		if (y != this.y) {
			// ensure snapping introduces no velocity, add additional friction
			this.y0 = y - (this.y - this.y0) * this.kSnapFriction;
			this.y = y;
		}
		var x = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
		if (x != this.x) {
			this.x0 = x - (this.x - this.x0) * this.kSnapFriction;
			this.x = x;
		}
	},
	/**
		The friction function
	*/
	friction: function(inEx, inEx0, inCoeff) {
		// Smaller than epsilon is considered zero
		var kEpsilon = 1e-2;
		// implicit velocity
		var dp = this[inEx] - this[inEx0];
		// let close to zero collapse to zero
		var c = Math.abs(dp) > kEpsilon ? inCoeff : 0;
		// reposition using damped velocity
		this[inEx] = this[inEx0] + c * dp;
	},
	//
	frame: 10,
	simulate: function(t) {
		while (t >= this.frame) {
			t -= this.frame;
			if (!this.dragging) {
				this.constrain();
			}
			this.verlet();
			this.friction('y', 'y0', this.kFrictionDamping);
			this.friction('x', 'x0', this.kFrictionDamping);
		}
		return t;
	},
	interval: 20,
	animate: function() {
		this.stop();
		// time tracking
		var t0 = new Date().getTime(), t = 0;
		// only for fps tracking
		var fs = 0, ft = 0, dtf = [], dt;
		// delta tracking
		var x0, y0;
		// animation handler
		var fn = enyo.hitch(this, function() {
			if (this.dragging) {
				this.y0 = this.y = this.uy;
				this.x0 = this.x = this.ux;
			}
			//
			var t1 = new Date().getTime();
			t += t1 - t0;
			//
			// for fps tracking only
			dt = t1- t0;
			ft += dt;
			// keep a moving average
			dtf.push(dt);
			if (++fs == 20) {
				fs--;
				ft -= dtf.shift();
			}
			this.fps = (fs * 1000 / ft).toFixed(1) + " fps";
			//this.fps = dt + ', ' + Math.floor(t / this.frame);
			//
			t0 = t1;
			t = this.simulate(t);
			//
			/*
			if (isNaN(this.y)) {
				debugger;
				this.stop();
				this.fps = "bugged";
				this.scroll();
			}
			*/
			//
			if (y0 != this.y || x0 != this.x) {
				this.scroll();
			} else if (!this.dragging) {
				this.stop(true);
				this.fps = "stopped";
				this.scroll();
			}
			y0 = this.y;
			x0 = this.x;
		});
		// animation cadence
		this.job = window.setInterval(fn, this.interval);
	},
	//* @public
	start: function() {
		if (!this.job) {
			this.animate();
			this.doScrollStart();
		}
	},
	//* @protected
	stop: function(inFireEvent) {
		window.clearInterval(this.job);
		this.job = null;
		inFireEvent && this.doScrollStop();
	},
	//
	startDrag: function(e) {
		//e.preventDefault();
		//
		this.dragging = true;
		//
		this.my = e.pageY;
		this.py = this.uy = this.y;
		//
		this.mx = e.pageX;
		this.px = this.ux = this.x;
		//
		/*
		if (this.py === undefined) {
			debugger;
		}
		*/
		//return true;
	},
	drag: function(e) {
		if (this.dragging) {
			var dy = this.vertical ? e.pageY - this.my : 0;
			this.uy = dy + this.py;
			// provides resistance against dragging into overscroll
			this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
			//
			var dx = this.horizontal ? e.pageX - this.mx : 0;
			this.ux = dx + this.px;
			// provides resistance against dragging into overscroll
			this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping);
			//
			/*
			if (isNaN(this.uy)) {
				console.log("ScrollManager.mousemove: uy is NaN");
				console.log(e);
				console.log(e.pageY);
				debugger;
			}
			*/
			//
			this.start();
			return true;
		}
	},
	dragDrop: function(e) {
		if (this.dragging && !window.PalmSystem) {
			this.y = this.uy;
			this.y0 = this.y - (this.y - this.y0) * 1.0;
			this.x = this.ux;
			this.x0 = this.x - (this.x - this.x0) * 1.0;
		}
		this.dragging = false;
		// FIXME: unwanted clicks can occur after scrolling; 
		// squelching next click fixes the problem, but is ad hoc
		if (this.job) {
			enyo.dispatcher.squelchNextClick();
		}
		//return true;
	},
	dragFinish: function() {
		this.dragging = false;
	},
	flick: function(e) {
		if (this.vertical) {
			this.y = this.y0 + e.yVel * this.kFlickScalar;
		}
		if (this.horizontal) {
			this.x = this.x0 + e.xVel * this.kFlickScalar;
		}
		this.start();
	},
	scroll: function() {
		this.doScroll();
	}
});