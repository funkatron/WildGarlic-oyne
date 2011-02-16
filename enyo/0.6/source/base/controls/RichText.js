/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A multi-line text input that supports rich formatting such as bold, italics, and underlining.
Note that rich formatting can be disabled by setting the richContent property to false.

Use the value property to get or set the displayed text. The onchange event fires when the control blurs (loses focus).

Create a RichText as follows:

	{kind: "RichText", value: "To <b>boldly</b> go..", onchange: "richTextChange"}

*/
enyo.kind({
	name: "enyo.RichText",
	kind: enyo.BasicInput,
	className: "enyo-richtext",
	placeholderClassName: "enyo-richtext-hint",
	published: {
		richContent: true
	},
	//* @protected
	nodeTag: "div",
	domAttributes: {
		tabIndex: 0,
		contenteditable: true
	},
	create: function() {
		this.inherited(arguments);
		this.richContentChanged();
	},
	blurHandler: function(inSender, inEvent) {
		this.inherited(arguments);
		this.doChange(inEvent, this.getValue());
	},
	isEmpty: function() {
		// FIXME: argh, checking for getValue resets this.value which we need when 
		// we're initializing so check if we're generated yet.
		return this.generated ? !this.getValue() : !this.value && !enyo.string.trim(this.content);
	},
	placeholderChanged: function(inOldValue) {
		this.inherited(arguments);
		if (this.isEmpty()) {
			this.updatePlaceholder(!this.hasFocus());
		}
	},
	updatePlaceholder: function(inApplyPlaceholder) {
		var c = inApplyPlaceholder ? this.placeholder : "";
		this.setDomValue(c);
		this.inherited(arguments);
	},
	getText: function() {
		var t = (this.hasNode() && this.node.innerText) || "";
		return t == this.placeholder ? "" : t;
	},
	//* @public
	getHtml: function() {
		var t = (this.hasNode() && this.node.innerHTML) || "";
		//t = t.replace(/<div contenteditable="true"/gi, "");
		return t == this.placeholder ? "" : t;
	},
	//* @protected
	setDomValue: function(inValue) {
		if (!this.richContent) {
			inValue = (inValue || "").replace(/\n/g, "<br>");
		}
		this.setContent(inValue);
	},
	getDomValue: function() {
		return enyo.string.trim(this.richContent ? this.getHtml() : this.getText());
	},
	valueChanged: function() {
		this.setDomValue(this.value);
	},
	contentChanged: function() {
		// NOTE: set content via innerHTML to avoid loss of focus.
		// setting innerHTML to minimum of 1 space miraculously avoids loss of focus.
		var c = this.content;
		//
		this.content = this.content || " ";
		//
		/*
		// FIXME: (experimental) note, the first node establishes the "root" node if content is empty;
		// surrounding each node in as contenteditable ensures it can be focused.
		this.content = this.content.replace(/<div/gi, "<div contenteditable=true");
		this.content = this.content || '<div contenteditable=true><br></div>';
		*/
		//
		//
		this.inherited(arguments);
		if ((c != this.placeholder) && !this.isEmpty()) {
			this.addRemovePlaceholderClassName(false);
		}
	},
	readonlyChanged: function() {
		this.addRemoveClass("enyo-richtext-readonly", this.readonly);
	},
	richContentChanged: function() {
		this.addRemoveClass("enyo-richtext-plaintext", !this.richContent);
		if (!this.richContent) {
			this.setDomValue(this.hasNode() ? this.getText() : this.value || this.placeholder);
		}
	}
});
