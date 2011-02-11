/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A submenu with items to perform select all, cut, copy,
and paste commands. It is meant to go inside an <a href="#enyo.AppMenu">AppMenu</a>.

	{kind: "AppMenu", components: [
		{kind: "EditMenu"},
		{caption: "Some other item"}
	]}
*/
enyo.kind({
	name: "enyo.EditMenu",
	kind: enyo.PopupMenuItem,
	caption: "Edit",
	published: {
		selectAllDisabled: false,
		cutDisabled: false,
		copyDisabled: false,
		pasteDisabled: false
	},
	//* @protected
	domAttributes: {
		"enyo-pass-events": true
	},
	components: [
		{name: "selectAll", caption: "Select All", command: "selectAll", onclick: "send"},
		{name: "cut", caption: "Cut", command: "cut", onclick: "send"},
		{name: "copy", caption: "Copy", command: "copy", onclick: "send"},
		{name: "paste", caption: "Paste", command: "paste", onclick: "send"}
	],
	create: function() {
		this.inherited(arguments);
		this.selectAllDisabledChanged();
		this.cutDisabledChanged();
		this.copyDisabledChanged();
		this.pasteDisabledChanged();
	},
	mousedownHandler: function(inSender, e) {
		// need to prevent default so the focus doesn't change
		e.preventDefault();
	},
	send: function(inSender) {
		enyo.dispatch({type: inSender.command, target: document.activeElement});
	},
	selectAllDisabledChanged: function() {
		this.$.selectAll.setDisabled(this.selectAllDisabled);
	},
	cutDisabledChanged: function() {
		this.$.cut.setDisabled(this.cutDisabled);
	},
	copyDisabledChanged: function() {
		this.$.copy.setDisabled(this.copyDisabled);
	},
	pasteDisabledChanged: function() {
		this.$.paste.setDisabled(this.pasteDisabled);
	}
});
