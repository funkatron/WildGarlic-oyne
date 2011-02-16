/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A CustomButton is a button without any visual treatment. It should be used when a button primitive with unique appearance is desired.
Typically, a CSS class is specified via the className property. CustomButton implements mouse handling for a well-defined set of states.
Initialize a button as follows:

	{kind: "CustomButton", caption: "OK", className: "myButton", onclick: "buttonClick"}

Set the toggling property to true to create a button with toggling behavior of down when clicked and up when clicked again.
*/
enyo.kind({
	name: "enyo.CustomButton",
	kind: enyo.Stateful,
	cssNamespace: "enyo-button",
	className: "enyo-custom-button",
	published: {
		caption: "",
		disabled: false,
		isDefault: false,
		down: false,
		depressed: false,
		hot: false,
		toggling: false,
		allowDrag: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);

		// FIXME: transitional, allow label (this may replace caption)
		this.caption = this.caption || this.label || this.content;

		this.captionChanged();
		this.disabledChanged();
		this.isDefaultChanged();
		this.downChanged();
	},
	captionChanged: function() {
		this.setContent(this.caption);
	},
	disabledChanged: function() {
		this.stateChanged("disabled");
	},
	isDefaultChanged: function() {
		this.stateChanged("isDefault");
	},
	downChanged: function() {
		this.stateChanged("down");
	},
	hotChanged: function() {
		this.stateChanged("hot");
	},
	depressedChanged: function() {
		this.stateChanged("depressed");
	},
	//
	startDragHandler: function() {
		if (this.allowDrag) {
			this.setDown(false);
		} else {
			// prevent dragging because we want to track
			// button clicks with priority
			return true;
		}
	},
	mouseoverHandler: function(inSender, e, node) {
		this.setHot(true);
	},
	mouseoutHandler: function(inSender, e, node) {
		this.setHot(false);
		this.setDown(false);
	},
	mousedownHandler: function(inSender, e, node) {
		if (!this.disabled) {
			this.setDown(true);
			return this.doMousedown(e);
		}
	},
	mouseupHandler: function(inSender, e, node) {
		if (!this.disabled && this.down) {
			this.setDown(false);
			var r = this.doMouseup(e);
			this.performClick(this, e);
			return r;
		}
	},
	clickHandler: function() {
		/*
		NOTE: This function is implemented to prevent normal dispatching of onclick
		an event. Instead it's dispatched after a mousedown / up so that a click can
		traverse internal nodes.
		We stop bubbling based on the flag set in performClick, which is, luckily, called
		before clickHandler.
		*/
		return this._preventClick;
	},
	performClick: function(inSender, e) {
		if (!this.disabled) {
			if(this.toggling) {
				this.setDepressed(!this.depressed);
			}
			this._preventClick = this.doClick(e);
		}
	}
});
