/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.Popup">Popup</a> that displays a set of controls over other content.
A dialog attaches to the bottom of the screen and, when shown, 
animates up from the bottom of the screen.

To show a dialog asking the user to confirm a choice, try the following:

	components: [
		{kind: "Button", caption: "Confirm choice", onclick: "showDialog"},
		{kind: "Dialog", components: [
			{content: "Are you sure?"},
			{layoutKind: "HFlexLayout", pack: center, components: [
				{kind: "Button", caption: "OK", onclick: "confirmClick"},
				{kind: "Button", caption: "Cancel", onclick: "cancelClick"}
			]}
		]}
	],
	showDialog: function() {
		this.$.dialog.open();
	},
	confirmClick: function() {
		// process confirmation
		this.doConfirm();
		// then close dialog
		this.$.dialog.close();
	},
	cancelClick: function() {
		this.$.dialog.close();
	}
*/
enyo.kind({
	name: "enyo.Dialog",
	kind: enyo.Popup,
	className: "enyo-dialog",
	//* @protected
	chrome: [
		{name: "animator", kind: enyo.Animator, onAnimate: "animate", onEnd: "finishAnimate"},
		{name: "client", className: "enyo-dialog-inner"}
	],
	_open: function() {
		this.inherited(arguments);
		this.startAnimate(100, 0);
	},
	_close: function() {
		this.startAnimate(0, 100);
	},
	// NOTE: this could be made simpler by using -webkit-transition
	startAnimate: function(inStart, inEnd) {
		this.$.animator.play(inStart, inEnd);
	},
	animate: function(inSender, inY) {
		this.applyStyle("-webkit-transform", "translateY(" + inY + "%)");
	},
	finishAnimate: function(inSender, inY) {
		if (!this.isOpen) {
			this.hide();
		}
	}
});
