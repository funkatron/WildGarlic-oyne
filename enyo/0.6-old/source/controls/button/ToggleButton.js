/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that looks like a switch with labels for two states. Each time a ToggleButton is tapped,
it switches its state and fires an onChange event.

	{kind: "ToggleButton", onLabel: "foo", offLabel: "bar", onChange: "buttonToggle"}

	buttonToggle: function(inSender, inState) {
		this.log("Toggled to state" + inState);
	}

To find out the state of the button, use getState:

	queryToggleState: function() {
		return this.$.toggleButton.getState();
	}
*/
enyo.kind({
	name: "enyo.ToggleButton", 
	kind: enyo.Control,
	published: {
		state: false,
		onLabel: "On",
		offLabel: "Off"
	},
	events: {
		onChange: ""
	},
	className: "enyo-toggle-button",
	chrome: [
		{name: "labelOn", nodeTag: "span", className: "enyo-toggle-label-on", content: "On"},
		{name: "labelOff", nodeTag: "span", className: "enyo-toggle-label-off", content: "Off"},
		{name: "thumb", className: "enyo-toggle-thumb-off"}
	],
	//* @protected
	labels: {"true": "ON&nbsp;", "false": "OFF"},
	ready: function() {
		this.stateChanged();
		this.onLabelChanged();
		this.offLabelChanged();
	},
	onLabelChanged: function() {
		this.$.labelOn.setContent(this.onLabel);
	},
	offLabelChanged: function() {
		this.$.labelOff.setContent(this.offLabel);
	},
	stateChanged: function() {
		this.$.thumb.setClassName("enyo-toggle-thumb-" + (this.state ? "on" : "off"));
		this.$.labelOn.applyStyle("display", this.state ? "inline" : "none");
		this.$.labelOff.applyStyle("display", this.state ? "none" : "inline");
	},
	clickHandler: function() {
		this.setState(!this.getState());
		this.doChange(this.state);
	}
});
