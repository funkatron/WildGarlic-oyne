/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A prompt with confirm and cancel buttons. The onConfirm and onCancel events fire when the user
clicks the confirm and cancel buttons, respectively.
*/
enyo.kind({
	name: "enyo.ConfirmPrompt",
	kind: enyo.HFlexBox,
	published: {
		confirmCaption: "Confirm",
		cancelCaption: "Cancel"
	},
	className: "enyo-confirmprompt",
	events: {
		onConfirm: "confirmAction",
		onCancel: "cancelAction"
	},
	//* @protected
	defaultKind: "Button",
	align: "center",
	pack: "center",
	chrome: [
		{name: "confirm", onclick: "doConfirm"},
		{kind: "Control", width: "24px"},
		{name: "cancel", onclick: "doCancel"}
	],
	create: function() {
		this.inherited(arguments);
		this.confirmCaptionChanged();
		this.cancelCaptionChanged();
	},
	confirmCaptionChanged: function() {
		this.$.confirm.setCaption(this.confirmCaption);
	},
	cancelCaptionChanged: function() {
		this.$.cancel.setCaption(this.cancelCaption);
	}
});


/**
A prompt with confirm and cancel buttons that scrims the rest of the application when shown.
*/
enyo.kind({
	name: "enyo.ScrimmedConfirmPrompt",
	kind: enyo.Control,
	forward: {
		confirmCaption: "confirm",
		cancelCaption: "confirm"
	},
	events: {
		onConfirm: "",
		onCancel: ""
	},
	chrome: [
		{name: "scrim", className: "enyo-fit enyo-confirmprompt-scrim", domStyles: {"z-index": 1}},
		{name: "confirm", kind: "ConfirmPrompt", className: "enyo-fit", domStyles: {"z-index": 2}, onConfirm: "doConfirm", onCancel: "doCancel"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.setConfirmCaption(this.confirmCaption);
		this.setCancelCaption(this.cancelCaption);
	}
});
