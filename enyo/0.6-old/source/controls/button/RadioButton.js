/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
An <a href="#enyo.IconButton">IconButton</a> meant to go
inside a <a href="#enyo.RadioGroup">RadioGroup</a>. The value property
identifies the button in the group. If this property is not set, the index
of the button is used.

	{kind: "RadioButton", value: "foo"}
*/
enyo.kind({
	name: "enyo.RadioButton",
	kind: enyo.IconButton,
	flex: 1,
	className: "enyo-radiobutton",
	published: {
		value: "",
		depressed: false
	},
	events: {
		onmousedown: ""
	},
	//* @protected
	getValue: function() {
		return this.value || this.manager.indexOfControl(this);
	},
	clickHandler: function(inSender, e) {
		if (!this.disabled) {
			this.inherited(arguments);
			// if our manager is not our owner (i.e. if we are not RadioGroup chrome), he won't get this via normal dispatch
			// manager could also simply be watching mousedown himself, but it's more convenient for us to identify ourselves
			// as inSender
			this.dispatch(this.manager, "radioButtonClick");
		}
	}
});