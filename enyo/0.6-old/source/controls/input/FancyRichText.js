/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	A styled rich text control.
	
	See <a href="#enyo.RichText">enyo.RichText</a> for more information.
*/
enyo.kind({
	name: "enyo.FancyRichText", 
	kind: enyo.FancyInput,
	published: {
		richContent: true
	},
	chrome: [
		{kind: enyo.HFlexBox, wantsEvents: false, className: "enyo-group-inner enyo-fancy-input-inner", components: [
			// NOTE: on webkit, <input> (apparently) ignores box-flex, so we wrap the input in a div
			{kind: enyo.VFlexBox, wantsEvents: false, pack: "center", width: "100%", components: [
				{
					name: "input",
					className: "enyo-input enyo-fancy-input-input",
					kind: enyo.RichText,
					onfocus: "inputFocus",
					onblur: "inputBlur",
					// onchange is non-dom so it doesn't bubble and we hook it up directly
					onchange: "inputChange"
				}
			]},
			{name: "client", wantsEvents: false, className: "enyo-fancy-input-client"}
		]}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.richContentChanged();
	},
	richContentChanged: function() {
		this.$.input.setRichContent(this.richContent);
	},
	getHtml: function() {
		return this.$.input.getHtml();
	},
	inputChange: function(inSender, inEvent) {
		if (this.changeOnKeypress) {
			return true;
		} else {
			this.value = inSender.getValue();
			this.doChange(inEvent, this.value);
		}
	}
});