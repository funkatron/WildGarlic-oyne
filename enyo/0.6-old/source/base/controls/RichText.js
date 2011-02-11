/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
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
	focusHandler: function() {
		if (this.hasNode()) {
			this.node.focus();
			//getSelection().collapseToEnd();
			this.doFocus();
		}
	},
	blurHandler: function(inSender, inEvent) {
		this.doChange(inEvent, this.getValue());
		this.doBlur();
	},
	getText: function() {
		return (this.hasNode() && this.node.innerText) || "";
	},
	//* @public
	getHtml: function() {
		return (this.hasNode() && this.node.innerHTML) || "";
	},
	//* @protected
	setDomValue: function(inValue) {
		if (!this.richContent) {
			inValue = inValue.replace(/\n/g, "<br>");
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
		var focused = this.hasFocus();
		this.inherited(arguments);
		if (focused && this.hasNode()) {
			// FIXME: blur required or first focus fails
			this.node.blur();
			this.forceFocus();
		}
	},
	readonlyChanged: function() {
		this.addRemoveClass("enyo-richtext-readonly", this.readonly);
	},
	richContentChanged: function() {
		this.addRemoveClass("enyo-richtext-plaintext", !this.richContent);
		if (!this.richContent) {
			this.setValue(this.hasNode() ? this.getText() : this.value);
		}
	}
});
