/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that displays a set of items in a popup.

	{kind: "PopupMenu"}
	
Items can be specified as child components of the PopupMenu:

	{kind: "PopupMenu", components: [
		{caption: "Palm"},
		{caption: "Yahoo"},
		{caption: "Facebook"}
	]}

Items can also be set with <code>setItems</code>, like this:

	this.$.popupMenu.setItems(["Palm", "Yahoo", "Facebook"]);

By default, items are instances of <a href="#enyo.PopupMenuItem">PopupMenuItem</a>.  But you can change this to use different kinds for items.
Here is an example using <a href="#enyo.PopupMenuCheckItem">PopupMenuCheckItem</a>:

	{kind: "PopupMenu", defaultKind: "PopupMenuCheckItem"}

To open the popup menu at the center, do the following:

	openPopup: function() {
		this.$.popupMenu.openAtCenter();
	}
*/
enyo.kind({
	name: "enyo.PopupMenu",
	kind: enyo.Popup,
	published: {
		// an array of config objects or strings representing items
		items: []
	},
	// FIXME: scroller height is wrong.
	chrome: [
		{name: "client", className: "enyo-popup-inner", kind: "BasicScroller", layoutKind: "OrderedLayout"}
	],
	scrim: true,
	defaultKind: "enyo.PopupMenuItem",
	//* @protected
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (inControl == this._lastItem) {
			this._lastItem = null;
		}
	},
	itemsChanged: function() {
		this._lastItem = null;
		this.destroyControls();
		for (var i=0, item, c; item=this.items[i]; i++) {
			item = enyo.isString(item) ? {caption: item} : item;
			// we want these controls to be owned by us so we get events
			this.createComponent(item);
		}
		this.render();
	},
	fetchItemByValue: function(inValue) {
		var items = this.getControls();
		for (var i=0, c; c=items[i]; i++) {
			if (c.getValue() == inValue) {
				return c;
			}
		}
	},
	scrollIntoView: function(inY, inX) {
		this.$.client.scrollIntoView(inY, inX);
	},
	clampSize: function(inPosition) {
		var s = this.inherited(arguments);
		// FIXME: we are applying size to client, so adjust by the popup's pad/border
		// probably does NOT go here...
		var ns = this.calcSize();
		var pbh = ns.offsetHeight - ns.clientHeight;
		var pbw = ns.offsetWidth - ns.clientWidth;
		s.h = s.h - pbh;
		s.w = s.w - pbw;
		return s;
	},
	applyMaxSize: function(inRect) {
		/*
			NOTE: In order for scroller to actually scroll, it must have an explicit height
			We are setting max-height to accomplish this.
		*/
		this.$.client.applyStyle("max-width", inRect.w + "px");
		this.$.client.applyStyle("max-height", inRect.h + "px");
	},
	clearSize: function() {
		this.$.client.applyStyle("max-width", "none");
		this.$.client.applyStyle("max-height", "none");
	},
	flow: function() {
		this.inherited(arguments);
		this.styleLastItem();
	},
	_locateLastItem: function(inControl) {
		if (inControl.collapsed) {
			return inControl;
		} else {
			var controls = inControl.getControls();
			var c = controls.length;
			return c ? this._locateLastItem(controls[c-1]) : inControl;
		}
	},
	locateLastItem: function() {
		return this._locateLastItem(this);
	},
	// NOTE: dynamically style the very bottom visible menu item
	// this is so that we can make sure to hide any bottom border.
	styleLastItem: function() {
		if (this._lastItem) {
			this._lastItem.addRemoveMenuLastStyle(false);
		}
		var b = this.locateLastItem();
		if (b && b.addRemoveMenuLastStyle) {
			b.addRemoveMenuLastStyle(true);
			this._lastItem = b;
		}
	}
});
