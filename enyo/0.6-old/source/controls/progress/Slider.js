/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that presents a range of selection options in the form of a horizontal
slider with a control knob that can be tapped and dragged to the desired
location.

	{kind: "Slider", onChanging: "sliderChanging", onChange: "sliderChange"}

The onChanging event is fired when dragging the control knob. The onChange
event is fired when the position is set, either by finishing a drag or by
tapping the bar.
*/
enyo.kind({
	name: "enyo.Slider",
	kind: enyo.ProgressBar,
	className: "enyo-slider",
	published: {
		/** Controls whether position may be set by tapping
		an arbitrary position on the bar.  If false, position may only be set by dragging the knob. */
		tapPosition: true
	},
	events: {
		onChange: "",
		onChanging: ""
	},
	chrome: [
		{name: "drag", kind: enyo.Drag, onDrag: "dragButton", onFinish: "dragButtonFinish"},
		{name: "animator", kind: enyo.Animator, onBegin: "beginAnimation", onAnimate: "stepAnimation", onEnd: "endAnimation", onStop: "stopAnimation"},
		// FIXME: this node exists so our entire height can encompass the margin used for centering this div
		{className: "enyo-slider-progress", components: [
			{name: "bar", className: "enyo-slider-inner", components: [
				// NOTE: using a toggle so that mouseout doesn't abort down state
				// manually setting down/up when dragging and on mouseup.
				{name: "button", kind: "CustomButton", caption: " ", toggle: true, allowDrag: true, className: "enyo-slider-button"}
			]}
		]},
		{name: "client"}
	],
	//* @protected
	renderPosition: function(inPercent) {
		this.$.button.applyStyle("left",  inPercent + "%");
	},
	renderPositionDirect: function(inDomStyle, inPercent) {
		inDomStyle.left = inPercent + "%";
	},
	canAnimate: function() {
		return this.$.button.hasNode();
	},
	beginAnimation: function(inSender, inStart, inEnd) {
		this.$.button.domStyles.left = inEnd + "%";
		if (this.$.button.hasNode()) {
			inSender.style = this.$.button.node.style;
		}
		this.doBeginAnimation();
	},
	stepAnimation: function(inSender, inValue) {
		//this.renderPosition(inValue);
		this.renderPositionDirect(inSender.style, inValue);
	},
	startDragHandler: function(inSender, e) {
		this._width = this.calcWidth();
		this.$.drag.start(e);
		this.$.button.setDown(true);
		return true;
	},
	calcWidth: function() {
		var n = this.$.bar.hasNode();
		return n.offsetWidth;
	},
	calcEventPosition: function(inX) {
		var o = enyo.dom.fetchNodeOffset(this.$.bar.hasNode());
		var x = inX - o.offsetLeft;
		return (x / this.calcWidth()) * this.maximum;
	},
	dragButton: function(inSender) {
		var p = this.calcEventPosition(inSender.px);
		this.setPositionImmediate(p);
		this.doChanging(this.position);
	},
	dragButtonFinish: function() {
		this.toggleButtonUp();
		this.doChange(this.position);
	},
	completeAnimation: function(inSender, inValue) {
		this.inherited(arguments);
		if (this._clicked) {
			this._clicked = false;
			this.doChange(this.position);
		}
	},
	clickHandler: function(inSender, e) {
		if (this.tapPosition && (e.dispatchTarget != this.$.button)) {
			this.$.animator.stop();
			var p = this.calcEventPosition(e.pageX);
			this._clicked = true;
			this.setPosition(p);
		}
	},
	mouseupHandler: function() {
		this.toggleButtonUp();
	},
	toggleButtonUp: function() {
		this.$.button.setDown(false);
	}
});
