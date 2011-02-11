/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
enyo.DragScroller is a base kind that integrates the scrolling simulation provided
by <a href="#enyo.ScrollMath">enyo.ScrollMath</a>
with the drag management of <a href="#enyo.Drag">enyo.Drag</a>.

enyo.ScrollMath is not typically created in application code.
*/
enyo.kind({
	name: "enyo.DragScroller",
	kind: enyo.Control,
	published: {
		/**
		Set to false to prevent horizontal scrolling.
		*/
		horizontal: true,
		/**
		Set to false to prevent vertical scrolling.
		*/
		vertical: true
	},
	//* @protected
	tools: [
		{name: "drag", kind: "Drag"},
		{name: "scroll", kind: "ScrollMath"}
	],
	create: function() {
		this.inherited(arguments);
		this.horizontalChanged();
		this.verticalChanged();
	},
	initComponents: function() {
		this.createComponents(this.tools);
		this.inherited(arguments);
	},
	horizontalChanged: function() {
		this.$.scroll.setHorizontal(this.horizontal);
	},
	verticalChanged: function() {
		this.$.scroll.setVertical(this.vertical);
	},
	//
	// FIXME: seems like a lot of work to route these events
	//
	flickHandler: function(inSender, e) {
		this.$.scroll.flick(e);
		return true;
	},
	shouldDrag: function(e) {
		var requestV = Math.abs(e.dx) < Math.abs(e.dy);
		// FIXME: auto* are not part of this class
		// FIXME: whether an autoHorizontal scroller will actually 
		// require horizontal scrolling is not known at this point
		// which can be repaired with some refactoring.
		// FIXME: there is a larger issue involved with having
		// drag logic be lower level, so that 'drag' objects need
		// not require this decision to be made a-priori.
		// Because of this overarching issue, we are leaving
		// this simpler fix here now, until we can revisit
		// the entire drag stack properly.
		var canH = this.horizontal || this.autoHorizontal;
		var canV = this.vertical || this.autoVertical;
		return requestV && canV || !requestV && canH;
	},
	// special synthetic DOM event served up by the Gesture system
	startDragHandler: function(inSender, e) {
		// shouldDrag differentiates between different scroller axes so that we don't
		// absorb drag events that are off-axis for this scroller (which makes it
		// possible for a containing object to handle those events)
		if (this.shouldDrag(e)) {
			this.$.drag.start(e);
			this.$.scroll.startDrag(e);
			// we have to indicate we have handled this event or the drag will not
			// be processed properly by the Gesture system
			return true;
		}
	},
	// event handlers for the drag component we own
	drag: function(inSender, e) {
		this.$.scroll.drag(e);
	},
	dragDrop: function(inSender, e) {
		this.$.scroll.dragDrop(e);
	},
	dragFinish: function(inSender) {
		this.$.scroll.dragFinish();
	}
});
