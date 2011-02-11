/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/**
 Scroller used by enyo.ViewImage. This scroller provides:
 1) option to disable overscroll.
 2) expose drag event.
*/
enyo.kind({
	name: "enyo.ViewImageScroller",
	kind: enyo.BasicScroller,
	//* @protected
	mixins: [
		enyo.NestedScrollerMixin
	],
	//* @public
	published: {
		overscrollH: true,
		overscrollV: true
	},
	events: {
		onDrag: ""
	},
	chrome: [
		{name: "client", align: "center"}
	],
	//* @protected
	start: function() {
		if (this.$.scroll) {
			this.inherited(arguments);
		}
	},
	drag: function(inSender, e) {
		this.inherited(arguments);
		this.doDrag(inSender, e);
	},
	scroll: function(inSender) {
		var bs = this.getBoundaries(), lb = bs.left-1, rb = bs.right+1, tb = bs.top-1, bb = bs.bottom+1;
		var x = -inSender.x, y = -inSender.y;
		// disable overscroll if overscrollH/V is false
		if (this.overscrollH || x >= lb && x <= rb) {
			this.scrollLeft = x;
		} else {
			this.scrollLeft = x < 0 ? lb : rb;
		}
		if (this.overscrollV || y >= tb && y <= bb) {
			this.scrollTop = y;
		} else {
			this.scrollTop = y < 0 ? tb : bb;
		}
		this.effectScroll();
		this.doScroll();
	}
});

//* @public
/**
A <a href="#enyo.ScrollingImage">ScrollingImage</a> that is specially designed to work in a <a href="#enyo.Carousel">Carousel</a>.

	{kind: "Carousel", flex: 1, components: [
		{kind: "ViewImage", src: "images/01.png"},
		{kind: "ViewImage", src: "images/02.png"},
		{kind: "ViewImage", src: "images/03.png"}
	]}
*/
enyo.kind({
	name: "enyo.ViewImage",
	kind: enyo.ScrollingImage,
	autoSize: true,
	forward: {
		overscrollH: "scroller",
		overscrollV: "scroller"
	},
	events: {
		onImageLoaded: "imageLoaded"
	},
	chrome: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{name: "scroller", kind: "ViewImageScroller", layoutKind: "HFlexLayout", className: "enyo-fit", autoVertical: true, onDrag: "imageDrag", components: [
			{name: "image", kind: "Image", className: "enyo-viewimage-image"}
		]}
	],
	//* @protected
	imageDrag: function(inSender, inDrag, e) {
		var pos = this.outerScroller.scrollH ? inSender.getScrollLeft() : inSender.getScrollTop();
		var bs = inSender.getBoundaries();
		var m = this.outerScroller.scrollH ? inSender.horizontal : inSender.vertical;
		var lowerPos = this.outerScroller.scrollH ? bs.left : bs.top;
		var upperPos = this.outerScroller.scrollH ? bs.right : bs.bottom;
		if (m && pos >= lowerPos && pos <= upperPos) {
			if (this.outerScroller.$.drag.dragging) {
				this.outerScroller.$.drag.finish();
			}
		} else {
			if (!this.outerScroller.$.drag.dragging) {
				this.outerScroller.startDragHandler(inSender, e);
			}
		}
	},
	setOuterScroller: function(inScroller) {
		this.outerScroller = inScroller;
		this.setOverscrollH(!inScroller.scrollH);
		this.setOverscrollV(inScroller.scrollH);
	},
	reset: function() {
		this.adjustSize();
		this.resetZoom();
		var s = this.$.scroller;
		s.scrollLeft = 0;
		s.scrollTop = 0;
		s.effectScroll();
		s.setScrollTop(0);
		s.setScrollLeft(0);
	}
});