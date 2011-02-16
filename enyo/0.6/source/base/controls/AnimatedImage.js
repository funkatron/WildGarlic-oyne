/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that animates based on its CSS background image.
The className property should refer to a valid CSS class that defines a background image.

The background image should be constructed so that it contains a series of animation
frames stacked vertically.
The imageHeight property should be set to the height of an animation frame, and 
imageCount should be set to the number of frames.

The tick property changes animation speed by controlling the number of
milliseconds between frames. Use the repeat property to set the number of times
the animation should repeat. The default value of 0 indicates that the animation
should repeat indefinitely.

Here's an example:

	{kind: "AnimatedImage", className: "snoopyAnimation", imageHeight: "200", imageCount: "10"}

Call the start method to start the animation and the stop method to stop it:

	startButtonClick: function() {
		this.$.animatedImage.start();
	},
	stopButtonClick: function() {
		this.$.animatedImage.stop();
	}
*/
enyo.kind({
	name: "enyo.AnimatedImage",
	kind: enyo.Control,
	published: {
		imageCount: 0,
		imageHeight: 32,
		tick: 50,
		repeat: 0,
		easingFunc: enyo.easing.cubicOut
	},
	//* @protected
	tick: 33,
	chrome: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimation"}
	],
	create: function() {
		this.inherited(arguments);
		this.imageCountChanged();
		this.tickChanged();
		this.repeatChanged();
		this.easingFuncChanged();
	},
	// NOTE: choosing to make duration a function of framerate (tick) and image count.
	imageCountChanged: function() {
		this.$.animator.setDuration(this.imageCount * this.tick);
	},
	tickChanged: function() {
		this.$.animator.setTick(this.tick);
	},
	repeatChanged: function() {
		this.$.animator.setRepeat(this.repeat);
	},
	easingFuncChanged: function() {
		this.$.animator.setEasingFunc(this.easingFunc);
	},
	stepAnimation: function(inSender, inValue) {
		this.positionBackgroundImage(inValue);
	},
	positionBackgroundImage: function(inValue) {
		var i = Math.round(inValue) % this.imageCount;
		//this.log(inValue, i);
		var ypos = -i * this.imageHeight;
		this.applyStyle("background-position", "0px " + ypos + "px");
	},
	//* @public
	start: function() {
		this.$.animator.play(0, this.imageCount);
	},
	stop: function() {
		this.$.animator.stop();
	}
});