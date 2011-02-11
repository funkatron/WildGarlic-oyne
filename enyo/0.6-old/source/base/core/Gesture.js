/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// gesture feature

//* @protected
enyo.dispatcher.features.push(
	function(e) {
		if (enyo.gesture[e.type]) {
			enyo.gesture[e.type](e);
		}
	}
);

enyo.gesture = {
	hysteresis: 4,
	holdDelay: 150,
	send: function(inName, e, inProps) {
		var synth = {
			type: inName,
			pageX: e && e.pageX,
			pageY: e && e.pageY,
			target: this.target
		};
		enyo.mixin(synth, inProps);
		enyo.dispatch(synth);
		return synth;
	},
	// synthesize 'back' event from ESC key on all platforms
	keyup: function(e) {
		if (e.keyCode == 27) {
			enyo.dispatch({
				type: "back",
				target: null,
				preventDefault: function() {
					e.preventDefault();
				}
			});
		}
	},
	mousedown: function(e) {
		/*if (enyo.dispatcher.captureTarget) {
			return;
		}*/
		//console.log("gesture: mousedown");
		this.target = e.target;
		this.startTracking(e);
		this.startMouseHold(e);
	},
	startTracking: function(e) {
		// Note: 'tracking' flag indicates interest in mousemove, it's turned off
		// on mouseup, or if some control handles startDrag event.
		// We reset tracking data whenever hysteresis is satisfied: we only want
		// to send 'draggable' gestures as dragStart.
		this.tracking = true;
		this.px0 = e.pageX;
		this.py0 = e.pageY;
	},
	startMouseHold: function(e) {
		this.holdJob = setTimeout(enyo.hitch(this, "sendMousehold", e), this.holdDelay);
	},
	mousemove: function(e) {
		/*if (enyo.dispatcher.captureTarget) {
			return;
		}*/
		if (this.tracking) {
			this.dx = e.pageX - this.px0;
			this.dy = e.pageY - this.py0;
			if (Math.sqrt(this.dy*this.dy + this.dx*this.dx) >= this.hysteresis) {
				this.stopMouseHold();
				this.sendStartDrag(e);
			}
		}
	},
	sendStartDrag: function(e) {
		//console.log("gesture: startDrag");
		var synth = {
			type: "startDrag",
			dx: this.dx,
			dy: this.dy,
			pageX: e.pageX,
			pageY: e.pageY,
			target: this.target
		};
		enyo.dispatch(synth);
		//e = this.send("startDrag", e, {dx: this.dx, dy: this.dy});
		if (synth.handler) {
			this.stopTracking();
		} else {
			// nobody loves this move, reset the tracking data
			//console.log("reset tracking");
			this.startTracking(e);
		}
	},
	mouseup: function(e) {
		this.stopTracking();
		this.stopMouseHold();
		//console.log("gesture: mouseup releasing");
	},
	//
	sendMousehold: function(e) {
		//console.log("sending mouseHOLD");
		this.holdJob = 0;
		e = this.send("mousehold", e);
	},
	stopTracking: function() {
		this.tracking = false;
	},
	stopMouseHold: function(e) {
		if (this.holdJob) {
			clearTimeout(this.holdJob);
		} else {
			this.sendMouseRelease(e);
		}
		this.holdJob = 0;
	},
	sendMouseRelease: function(e) {
		//console.log("sending mouseRELEASE");
		this.send("mouserelease", e);
	}
};