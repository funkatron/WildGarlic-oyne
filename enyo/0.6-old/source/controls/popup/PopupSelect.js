/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.PopupMenu">PopupMenu</a> with support for selection.

	{kind: "PopupSelect", onSelect: "popupSelect"}

The onSelect event is fired when a selection is made, like so:

	popupSelect: function(inSender, inSelected) {
		var value = inSelected.getValue();
	}
*/
enyo.kind({
	name: "enyo.PopupSelect",
	kind: enyo.PopupMenu,
	published: {
		selected: null
	},
	events: {
		onSelect: ""
	},
	//* @protected
	// NOTE: default PopupMenuItem.onclick
	menuItemClick: function(inSender) {
		this.setSelected(inSender);
	},
	selectedChanged: function(inOldValue) {
		this.doSelect(this.selected, inOldValue);
	}
});