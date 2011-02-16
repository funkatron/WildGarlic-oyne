/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control styled as a header fitting across the top of the application window.

Content for PageHeader can be specified either via the content property or by placing
components in the PageHeader. For example,

	{kind: "PageHeader", content: "Header"}

or

	{kind: "PageHeader", components: [
		{content: "Header", flex: 1},
		{kind: "Button", caption: "Right-aligned button"}
	]}
*/
enyo.kind({
	name: "enyo.PageHeader",
	kind: enyo.Control,
	layoutKind: "HFlexLayout", 
	className: "enyo-page-header",
	chrome: [
		{name: "client", flex: 1, align: "center", className: "enyo-page-header-inner"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.layout = new enyo.HFlexLayout();
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
