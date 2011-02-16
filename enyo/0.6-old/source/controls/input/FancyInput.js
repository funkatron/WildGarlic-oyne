/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
 A styled version of a text input control. When focused, FancyInput displays a shadowed effect.
 See <a href="#enyo.Input">enyo.Input</a> for more information.
 */
enyo.kind({
	name: "enyo.FancyInput", 
	kind: enyo.Input,
	chrome: [
		{kind: enyo.HFlexBox, wantsEvents: false, className: "enyo-group-inner enyo-fancy-input-inner", components: [
			// NOTE: on webkit, <input> (apparently) ignores box-flex, so we wrap the input in a div
			{kind: enyo.VFlexBox, wantsEvents: false, pack: "center", width: "100%", components: [
				{
					name: "input",
					className: "enyo-input enyo-fancy-input-input",
					kind: enyo.BasicInput,
					onfocus: "inputFocus",
					onblur: "inputBlur"
				}
			]},
			{name: "client", wantsEvents: false, layoutKind: "HFlexLayout", align: "center", className: "enyo-fancy-input-client"}
		]}
	],
	insetClass: "enyo-flat-shadow",
	wantsEvents: true,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.addClass('enyo-roundy enyo-fancy-input enyo-bbox');
	},
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	styleForIn: function() {
		this.addClass(this.insetClass);
	},
	styleForOut: function() {
		this.removeClass(this.insetClass);
	},
	inputBlur: function() {
		this.styleForOut();
	},
	inputFocus: function() {
		this.styleForIn();
		
	},
	mousedownHandler: function(inSender, e) {
		//this.forceFocus();
	}
});