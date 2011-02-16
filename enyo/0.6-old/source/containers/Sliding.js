/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A panel that slides back and forth and is designed to be a part of a
<a href="#enyo.SlidingGroup">SlidingGroup</a>.

Sliding objects have a "dragAnywhere" property, whose default value is true. This allows
the user to drag the panel from any point inside the panel that is not already a
draggable region (e.g., a Scroller). If dragAnywhere is set to false, then the Sliding
can still be dragged via any control inside it whose "slidingHandler" property is set to true.

The "peekWidth" property specifies the amount the panel should be offset from the left
when it is selected. This allows controls on the underlying Sliding object to the left
of the selected one to be partially revealed.

Sliding has some other published properties that are less frequently used. A "slidingState"
property exists, although you should generally call the SlidingGroup.setSelected method
instead of directly manipulating slidingState. In addition, "minWidth" specifies a 
minimum width for panel content and "edgeDragging" lets the user drag a panel from its
left edge.  (The default value of edgeDragging is false.)

The animation of the sliding panel is implemented via the webkit-transform translate
CSS property. This enables animation to be hardware-accelerated, but it should be noted
that any DOM manipulation will defeat the acceleration. Because translate is used, panels
are not resized naturally via the flex property. Instead, the far right panel is resized
to appear flexed. There is an onResize event that is fired when this occurs.
*/
enyo.kind({
	name: "enyo.Sliding",
	kind: enyo.Control,
	className: "enyo-sliding enyo-bg",
	layoutKind: "VFlexLayout",
	events: {
		onResize: ""
	},
	published: {
		/**
			hidden: off the screen to the right,
			showing: visible,
			selected: leftmost visible,
			covered: covered by leftmost visible
		*/
		slideState: "showing",
		/** Can drag panel from anywhere (note: does not work if there's another drag surface (e.g. scroller)). */
		dragAnywhere: true,
		/** Can drag/toggle by dragging on left edge of sliding panel. */
		edgeDragging: false,
		/** Whether content width should or should not be adjusted based on size changes. */
		fixedWidth: false,
		/** Minimum content width. */
		minWidth: 0,
		/** Amount we should be shifted right to reveal panel underneath us when selected. */
		peekWidth: 0
	},
	//* @protected
	chrome: [
		// rounded corners
		// {className: "enyo-sliding-tl-nub"},
		// {className: "enyo-sliding-bl-nub"},
		{className: "enyo-sliding-shadow"},
		{name: "client", className: "enyo-bg", kind: enyo.Control, flex: 1},
		// NOTE: used only as a hidden surface to move sliding from the left edge
		{name: "edgeDragger", slidingHandler: true, kind: enyo.Control, className: "enyo-sliding-nub"}
	],
	create: function() {
		this.inherited(arguments);
		/*
		enyo.mixin(this.domAttributes, {
			onWebkitTransitionEnd: enyo.bubbler
		});
		*/
		this.layout = new enyo.VFlexLayout();
		this.addClass("enyo-sliding-animate");
		this.contentChanged();
		this.slideStateChanged();
		this.edgeDraggingChanged();
		this.minWidthChanged();
	},
	destroy: function() {
		this.unlistenTransitionEnd();
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.listenTransitionEnd();
	},
	// FIXME: have to listen specifically to this event, onWebkitTransitionEnd, 
	// is ok on safari but doesn't appear to work on chrome
	listenTransitionEnd: function() {
		if (this.hasNode()) {
			this.transitionEndListener = enyo.bind(this, "webkitTransitionEndHandler");
			this.node.addEventListener("webkitTransitionEnd", this.transitionEndListener, false);
		}
	},
	unlistenTransitionEnd: function() {
		this.node.addEventListener("webkitTransitionEnd", this.transitionEndListener, false);
	},
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	edgeDraggingChanged: function() {
		this.$.edgeDragger.setShowing(this.edgeDragging);
	},
	slideStateChanged: function(inOldSlideState) {
		this["_slideTo" + enyo.cap(this.slideState)]();
	},
	findSiblings: function() {
		return this.manager.slidings;
	},
	getPreviousSibling: function() {
		var slidings = this.findSiblings();
		var i = enyo.indexOf(this, slidings);
		return slidings[i-1];
	},
	getNextSibling: function() {
		var slidings = this.findSiblings();
		var i = enyo.indexOf(this, slidings);
		return slidings[i+1];
	},
	_slideToHidden: function() {
		this.hide();
	},
	_slideToShowing: function() {
		// previous one should be selected
		var p = this.getPreviousSibling();
		if (p && p.slideState == "covered") {
			p.slideState = "selected";
		}
		// ensure all previous are not hidden
		while (p) {
			if (p.slideState == "hidden") {
				p.slideState = "showing";
			}
			p = p.getPreviousSibling();
		}
		this.validateAll();
	},
	_slideToSelected: function() {
		// previous should be covered
		var p = this.getPreviousSibling();
		if (p) {
			p.slideState = "covered";
		}
		// ensure all next are revealed
		var n = this;
		while (n = n.getNextSibling()) {
			if (n.slideState != "hidden") {
				n.slideState = "showing";
			}
		}
		this.validateAll();
		this.resizeLastSibling();
	},
	_slideToCovered: function() {
		// all previous should be covered
		var c = this;
		while (c = c.getPreviousSibling()) {
			c.slideState = "covered";
		}
		this.validateAll();
		this.resizeLastSibling();
	},
	validateAll: function() {
		// kick off vlidation from first sliding sibling...
		// all subsequent siblings will validate
		var s = this.findSiblings();
		var m = s[0] || this;
		m.validateSlide();
	},
	// makes sure we are in the correct slide position
	validateSlide: function() {
		this._move(this.calcSlide());
	},
	calcSlide: function() {
		return this["calcSlide" + enyo.cap(this.slideState)]();
	},
	calcSlideHidden: function() {
		var l = parseInt(this.domStyles.left);
		var w = this.manager.hasNode().offsetWidth;
		return w-l;
	},
	calcSlideShowing: function() {
		var c = this.getPreviousSibling();
		return (c && c._slide) || 0;
	},
	calcSlideSelected: function() {
		return this.peekWidth + this.calcSlideCovered();
	},
	calcSlideCovered: function() {
		return this.hasNode() ? -this.node.offsetLeft : 0;
	},
	_move: function(inSlide) {
		if (inSlide != this._slide) {
			this._slide = inSlide;
			if (this.hasNode()) {
				if (this.domStyles.display != "none") {
					this.node.style.webkitTransform = "translate3d(" + inSlide + "px,0,0)";
				} else if (this.slideState != "hidden") {
					this._moveFromHidden(inSlide);
				}
			}
		}
		// validate next sibling...
		var c = this.getNextSibling();
		if (c) {
			c.validateSlide();
		}
	},
	_moveFromHidden: function(inSlide) {
		this.removeClass("enyo-sliding-animate");
		this.show();
		this._move(this.calcSlideHidden());
		//
		enyo.asyncMethod(this, function() {
			this.addClass("enyo-sliding-animate");
			this._move(inSlide || 0);
		});
	},
	webkitTransitionEndHandler: function() {
		this.slideComplete();
	},
	slideComplete: function() {
		if (this.hasAdjustableWidth() && !this.manager.dragging) {
			enyo.asyncMethod(this, "adjustWidth", this.calcSlide());
		}
	},
	deAnimate: function() {
		this.removeClass("enyo-sliding-animate");
	},
	reAnimate: function() { 
		this.addClass("enyo-sliding-animate");
	},
	hasAdjustableWidth: function() {
		return (!this.getNextSibling() && !this.fixedWidth);
	},
	// don't auto-adjust width if fixedWidth is true
	fixedWidthChanged: function() {
		if (this.fixedWidth) {
			this.$.client.applyStyle("width", null);
		}
	},
	minWidthChanged: function() {
		this.$.client.applyStyle("min-width", this.minWidth || null);
	},
	adjustWidth: function(inDelta) {
		// FIXME: attempting to make this smooth based on ipad performance
		// adjusting client as opposed to this node lessens artifacts 
		// generated when resizing our node. This appears to be due to 
		// our node being transformed.
		if (this.hasNode() && this.$.client.hasNode()) {
			var ow = this.node.offsetWidth;
			var w = Math.max(ow, ow - inDelta);
			if (w) {
				this.$.client.node.style.width = w + "px";
				this.doResize();
			}
		}
	},
	findLastSibling: function() {
		var s = this.findSiblings();
		return s[s.length-1];
	},
	// FIXME: refactor, pretty ugly way to force last sibling to resize
	resizeLastSibling: function() {
		if (!this.manager.dragging) {
			var f = this.findLastSibling();
			if (f && !f.fixedWidth) {
				var t = f.calcSlide();
				f.adjustWidth(t);
			}
		}
	},
	startDragHandler: function(inSender, e) {
		e.sliding = this;
	},
	isDraggableEvent: function(inEvent) {
		var c = inEvent.dispatchTarget;
		return c && c.slidingHandler || this.dragAnywhere;
	},
	//* @public
	canDrag: function(inDelta) {
		this.dragMin = this.calcSlideSelected();
		this.dragMax = this.calcSlideShowing();
		if (this.slideState == "selected" || this.slideState == "showing") {
			var c = this.dragMax != this.dragMin && ((inDelta > 0 && this._slide <= this.dragMax) ||
				(inDelta < 0 && this._slide >= this.dragMax));
			//this.log(this.id, inDelta, at, c);
			return c;
		}
	},
	isAtDragMax: function() {
		return this._slide == this.dragMax;
	},
	isAtDragMin: function() {
		return this._slide == this.dragMin;
	},
	isAtDragBoundary: function() {
		return this.isAtDragMax() || this.isAtDragMin();
	},
	//* @protected
	beginDrag: function(e, inDx) {
		this.dragStart = this._slide - inDx;
		// FIXME: avoid resizing before dragging; causes too much of a hitch
		//this.resizeLastSibling();
		this.manager.dragging = this;
	},
	drag: function(inSender, e) {
		var x0 = inSender.dx + this.dragStart;
		//this.log(this.id, x0);
		x = Math.max(this.dragMin, Math.min(x0, this.dragMax));
		// handle edge case
		this.dragSelect = x0 < this._slide;
		this._move(x);
		// if we dragged to max or min, our drag is done
		if ((this.isAtDragMin() && this.dragSelect) || (this.isAtDragMax() && !this.dragSelect)) {
			this.applyDragSlideState();
			enyo.call(this.manager, "slidingDragComplete", [this, e]);
		}
	},
	dragFinish: function() {
		// FIXME: if dragged to min/max then no move occurs and we fail to resize
		// because resize happens at the end of a move.
		var needsResize = this.isAtDragBoundary();
		this.applyDragSlideState();
		this.manager.dragging = null;
		if (needsResize) {
			this.resizeLastSibling();
		}
		enyo.call(this.manager, "processSlideEvent");
	},
	applyDragSlideState: function() {
		if (this.dragSelect) {
			this.setSlideState("selected");
		} else {
			this.setSlideState("showing");
		}
	},
	clickHandler: function(inSender, inEvent) {
		if (inEvent.dispatchTarget.slidingHandler) {
			this.toggleSelected();
			enyo.call(this.manager, "processSlideEvent");
		}
		this.doClick(inEvent);
	},
	toggleSelected: function() {
		var r = this.slideState == "hidden" || this.slideState == "selected";
		this.setSlideState(r ? "showing" : "selected");
	}
});