/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A scrim is used to temporarily disable an application's user interface.
It covers the screen with a translucent layer.

It's possible to create a scrim in a components block, but this usage is not common. Typically, a scrim is
shown using enyo.scrim.show().

To show a scrim for 5 seconds:

	buttonClick: function() {
		enyo.scrim.show();
		setTimeout(enyo.scrim.hide, 5000);
	}
	
To show a scrim while a service is in flight:

	components: [
		{kind: "PalmService", onResponse: "serviceResponse"},
		{kind: "Button", caption: "Call Service", onclick: "buttonClick"}
	],
	buttonClick: function() {
		this.$.service.call();
		enyo.scrim.show();
	},
	serviceResponse: function() {
		enyo.scrim.hide();
	}

To show a scrim and then hide it when the user clicks on it:

	components: [
		{kind: "Button", caption: "Show scrim", onclick: "buttonClick"},
		{kind: "Scrim", onclick: "scrimClick"}
	],
	buttonClick: function() {
		this.$.scrim.show();
	},
	scrimClick: function() {
		this.$.scrim.hide();
	}
*/
enyo.kind({
	name: "enyo.Scrim",
	kind: enyo.Control,
	showing: false,
	className: "enyo-scrim",
	create: function() {
		this.inherited(arguments);
		this.zStack = [];
	},
	addZIndex: function(inZIndex) {
		if (enyo.indexOf(inZIndex, this.zStack) < 0) {
			this.zStack.push(inZIndex);
		}
	},
	removeZIndex: function(inControl) {
		enyo.remove(inControl, this.zStack);
	},
	showAtZIndex: function(inZIndex) {
		this.addZIndex(inZIndex);
		if (inZIndex != undefined) {
			this.setZIndex(inZIndex);
		}
		this.show();
	},
	hideAtZIndex: function(inZIndex) {
		this.removeZIndex(inZIndex);
		if (!this.zStack.length) {
			this.hide();
		} else {
			var z = this.zStack[this.zStack.length-1];
			this.setZIndex(z);
		}
	},
	setZIndex: function(inZIndex) {
		this.zIndex = inZIndex;
		this.applyStyle("z-index", inZIndex);
	}
});

//* @protected
// singleton for displaying a scrim.
enyo.scrim = {
	make: function() {
		// FIXME: enyo.master.getComponents()[0] is not good enough
		// assumes this component is a control.
		var s = enyo.create({kind: "Scrim", manager: enyo.master.getComponents()[0]});
		s.renderNode();
		return s;
	},
	show: function() {
		enyo.scrim = enyo.scrim.make();
		enyo.scrim.show();
	},
	showAtZIndex: function(inZIndex) {
		enyo.scrim = enyo.scrim.make();
		enyo.scrim.showAtZIndex(inZIndex);
	},
	hideAtZIndex: enyo.nop,
	// in case somebody does this out of order
	hide: enyo.nop,
	destroy: enyo.nop
}