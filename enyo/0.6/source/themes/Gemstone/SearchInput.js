/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.gemstone.SearchInput",
	kind: enyo.gemstone.RoundedInput,
	events: {
		onSearch: ""
	},
	components: [
		{kind: "Image", src: "$enyo/themes/Gemstone/images/search-icon.png", style: "display: block", onclick: "fireSearch"}
	],
	keypressHandler: function(inSender, inEvent) {
		if (inEvent.keyCode == "13") {
			this.fireSearch();
		} else {
			return this.inherited(arguments);
		}
	},
	fireSearch: function() {
		this.doSearch(this.getValue());
		//this.forceBlur();
	}
});