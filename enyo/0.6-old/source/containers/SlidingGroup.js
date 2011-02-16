/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to present a horizontal layout of
<a href="#enyo.Sliding">Sliding</a> controls,
which are panel controls that can slide one on top of another. The user can 
drag the panels left and right and they'll stay connected. If a panel is moved 
to the far left, it will cover any panels that are to the left of it.

Sliding panels can have explicit width or be flexed. In either case, they are displayed
in SlidingGroup's client region, which is an HFlexBox. The sliding panel on the far 
right is special--it will always behave as flexed unless its fixedWidth property is set to true.

SlidingGroup publishes a "selected" property. The selected sliding panel is the one 
displayed at the far left of the group. There is also an onSelect event, 
which is fired only when the selected panel is changed via user interaction 
(i.e., by clicking or dragging).

SlidingGroup can process the back event. Sliding.back will select the sliding panel 
that's covered by the currently selected one.

SlidingGroup also has two layout modes--the normal layout, in which a series of panels 
are placed left-to-right, and a narrow layout, in which one panel is displayed at a time,
taking up the entire width of the SlidingGroup. A SlidingGroup can automatically
toggle between these layouts if its resize method is hooked up to respond to window 
resizing. The "wideWidth" property has a default value of 500 and is the pivot point
between the two layouts.

Here's an example:

	{kind: "SlidingGroup", flex: 1, onSelect: "slidingSelected", components: [
		{name: "left", width: "320px"},
		{name: "middle", width: "320px", peekWidth: 68},
		{name: "right", flex: 1, onResize: "slidingResize"}
	]}

*/
enyo.kind({
	name: "enyo.SlidingGroup",
	kind: enyo.Control,
	published: {
		autoLayout: true,
		wideLayout: true,
		wideWidth: 500,
		selected: null
	},
	events: {
		onSelect: ""
	},
	defaultKind: "Sliding",
	//* @protected
	chrome: [
		{name: "drag", kind: enyo.Drag},
		{name: "client", kind: enyo.Control, className: "enyo-view enyo-sliding-group-client", layoutKind: "HFlexLayout"}
	],
	constructor: function() {
		this.inherited(arguments);
		this.slidingCache = [];
		this.slidings = [];
	},
	create: function() {
		this.inherited(arguments);
		var s = this.slidings[0];
		if (s) {
			this.setSelected(s);
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.resize();
	},
	// maintain an explicit list of Sliding controls to manipulate
	addControl: function(inControl) {
		this.inherited(arguments);
		if (inControl instanceof enyo.Sliding) {
			this.slidings.push(inControl);
		}
	},
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (inControl instanceof enyo.Sliding) {
			enyo.remove(inControl, this.slidings);
		}
	},
	//* @public
	
	// event handler for resize; if we're the root component, we'll automatically resize
	resizeHandler: function() {
		this.resize();
	},
	//* @public
	// if we're not the root component, this method can be hooked to a resizeHandler
	resize: function() {
		// if no layout change, make sure to validate to ensure proper sizing
		// otherwise apply layout change
		var wideLayout = (window.innerWidth > this.wideWidth);
		if ((wideLayout == this.wideLayout) || !this.autoLayout) {
			this.validate();
		} else {
			this.setWideLayout(wideLayout);
		}
	},
	//* @protected
	selectedChanged: function() {
		this.selected.setSlideState("selected");
	},
	getSelected: function() {
		for (var i=0, s$=this.slidings, s; s=s$[i]; i++) {
			if (s.slideState == "selected") {
				return s;
			}
		}
	},
	processSlideEvent: function(inSliding) {
		var s = this.getSelected();
		if (s != this.lastSelected) {
			this.slidingSelected(s, this.lastSelected);
			this.lastSelected = this.getSelected();
		}
	},
	slidingSelected: function(inSliding, inLastSliding) {
		this.doSelect(inSliding, inLastSliding);
	},
	wideLayoutChanged: function(inOldWideLayout) {
		this[this.wideLayout ? "applyWideLayout" : "applyNarrowLayout"]();
	},
	// FIXME: we should have layoutKinds for these layouts.
	applyWideLayout: function() {
		for (var i=0, s$=this.slidings, s; s=s$[i]; i++) {
			this.uncacheSliding(s, i);
		}
		this.$.client.applyStyle("width", null);
		this.reflow();
	},
	applyNarrowLayout: function() {
		for (var i=0, s$=this.slidings, s; s=s$[i]; i++) {
			this.cacheSliding(s, i);
			s.setFixedWidth(true);
			s.peekWidth = 0;
			s.domStyles.width = 0;
			s.flex = 1;
		}
		this.$.client.applyStyle("width", (100 * this.slidings.length) + "%");
		this.reflow();
	},
	cacheSliding: function(inSliding, inIndex) {
		this.slidingCache[inIndex] = {
			flex: inSliding.flex,
			width: inSliding.domStyles.width,
			peekWidth: inSliding.peekWidth,
			fixedWidth: inSliding.fixedWidth
		}
	},
	uncacheSliding: function(inSliding, inIndex) {
		var s = this.slidingCache[inIndex];
		if (s) {
			inSliding.flex = s.flex;
			inSliding.domStyles.width = s.width;
			inSliding.peekWidth = s.peekWidth;
			inSliding.setFixedWidth(s.fixedWidth);
		}
	},
	// re-apply styling after changes
	reflow: function() {
		this.$.client.flow();
		for (var i=0, s$=this.slidings, s; s=s$[i]; i++) {
			s.applyStyle();
		}
		// FIXME: too much async stuff here, figure it out.
		// This causes scrollTop in VirtualScroller to reset to 0.
		this.correctifyWidth();
		enyo.asyncMethod(this, "validate");
	},
	// FIXME: this seems like a webkit-box bug
	correctifyWidth: function() {
		this.$.client.applyStyle("display", "block");
		enyo.asyncMethod(this.$.client, "applyStyle", "display", null);
	},
	validate: function() {
		this.deAnimate();
		var s$ = this.slidings;
		enyo.call(s$[0], "validateAll");
		// FIXME: why do we need to completeSlide on the last sliding?
		enyo.call(s$[s$.length-1], "slideComplete");
		//
		enyo.asyncMethod(this, "reAnimate");
	},
	//* @protected
	// set while dragging: make slidings not animate transform changes
	deAnimate: function() {
		for (var i=0, s$=this.slidings, s; s=s$[i]; i++) {
			s.deAnimate();
		}
	},
	// set when done dragging: make slidings animate transform changes
	reAnimate: function() {
		for (var i=0, s$=this.slidings, s; s=s$[i]; i++) {
			s.reAnimate();
		}
	},
	findDraggable: function(inDx) {
		for (var i=0, s$=this.slidings, s; s=s$[i]; i++) {
			if (s.canDrag(inDx)) {
				return s;
			// don't allow dragging past the one we started with
			} else if (this.dragStartSliding == s) {
				break;
			}
		}
	},
	startDragHandler: function(inSender, inEvent) {
		var s = this.dragStartSliding = inEvent.sliding;
		var d = s && s.isDraggableEvent(inEvent) && this.findDraggable(inEvent.dx);
		if (d) {
			this.deAnimate();
			this.dragSliding = d;
			this.$.drag.start(inEvent);
			this.dragSliding.beginDrag(inEvent, 0);
			return true;
		}
	},
	drag: function(inSender,inEvent) {
		this.dragSliding.drag(inSender, inEvent);
	},
	dragFinish: function(inSender, inEvent) {
		this.reAnimate();
		this.dragSliding.dragFinish(inEvent);
	},
	slidingDragComplete: function(inSliding, inEvent) {
		// FIXME: need better way to determine next draggable
		var dx = inSliding.isAtDragMax() ? 1 : -1;
		var n = this.findDraggable(dx);
		if (n) {
			this.dragSliding = n;
			n.beginDrag(inEvent, this.$.drag.dx);
		}
	},
	backHandler: function(inSender, inEvent) {
		this.back(inEvent);
	},
	//* @public
	back: function(inEvent) {
		var o = this.getSelected();
		if (o) {
			o.setSlideState("showing");
			inEvent.preventDefault();
		}
	}
});