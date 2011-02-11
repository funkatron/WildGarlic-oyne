/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A button with menu styling, meant to contain other components within.

	{kind: "MenuButtonHeader", components: [
		{content: "This text goes inside the button"}
	]}
*/
enyo.kind({
	name: "enyo.MenuButtonHeader", 
	kind: enyo.Button,
	style: "display: block",
	className: "enyo-button enyo-menu-button-shape",
	chrome: [
		{name: "client", className: "enyo-menu-button-header-client"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.contentChanged();
	},
	// FIXME: do we want a more general system for promoting layoutKind and content to client?
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	contentChanged: function() {
		this.$.client.setContent(this.content);
	}
});

/**
A button styled to go in a
<a href="#enyo.CommandMenu">CommandMenu</a> with an icon in the center.

	{kind: "MenuButton", icon: "images/foo.png"}
*/
enyo.kind({
	name: "enyo.MenuButton", 
	kind: enyo.IconButton,
	className: "enyo-button enyo-menu-button-shape"
});
