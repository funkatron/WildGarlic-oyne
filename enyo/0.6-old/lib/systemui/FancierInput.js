/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.FancierInput", 
	kind: enyo.FancyInput,
	chrome: [
		{kind: enyo.HFlexBox, wantsEvents: false, className: "enyo-group-inner enyo-fancy-input-inner", components: [
			{name: "clientLeft", wantsEvents: false, className: "enyo-fancier-input-client"},
			{kind: enyo.VFlexBox, wantsEvents: false, pack: "center", width: "100%", components: [
				{
					name: "input",
					className: "enyo-input enyo-fancy-input-input",
					kind: enyo.BasicInput,
					onfocus: "inputFocus",
					onblur: "inputBlur",
					onchange: "inputChange",
					onkeyup: "inputKeyup",
					onkeypress: "inputKeypress"
				}
			]},
			{name: "client", wantsEvents: false, className: "enyo-fancy-input-client"}
		]}
	],
	addChild: function(inChild) {
		if (inChild.managerPosition == "left") {
			this.$.clientLeft.addChild(inChild);
		} else {
			this.inherited(arguments);
		}
	}
});