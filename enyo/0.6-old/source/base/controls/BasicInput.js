/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A text input primitive with default visual treatment. For example:

	{kind: "BasicInput", value: "hello", onchange: "inputChange", onfocus: "inputFocus"}

The value property specifies the text displayed in the input. Note: the value property does not update as a user types.
Instead, when the input blurs (loses focus), the value property updates and the onchange event is fired.

It is common to use getValue and setValue to get and set the value of an input;
for example, to set the value of one input to that of another:

	buttonClick: function() {
		var x = this.$.input1.getValue();
		this.$.input2.setValue(x);
	}
*/
enyo.kind({
	name: "enyo.BasicInput",
	kind: enyo.Control,
	published: {
		value: "",
		disabled: false,
		readonly: false,
		placeholder: ""
	},
	events: {
		onfocus: "",
		onblur: "",
		onchange: "",
		onkeypress: ""
	},
	//* @protected
	nodeTag: "input",
	create: function() {
		this.inherited(arguments);
		enyo.mixin(this.domAttributes, {
			onfocus: enyo.bubbler,
			onblur: enyo.bubbler
		});
		this.disabledChanged();
		this.readonlyChanged();
		this.valueChanged();
		this.placeholderChanged();
	},
	getDomValue: function() {
		if (this.hasNode()) {
			return this.node.value;
		}
	},
	setDomValue: function(inValue) {
		this.setAttribute("value", inValue);
		// FIXME: it's not clear when we need to set .value vs. using setAttribute above
		if (this.hasNode()) {
			this.node.value = inValue;
		}
	},
	changeHandler: function(inSender, inEvent) {
		// if we are re-rendered we won't show the proper value unless we capture it in domAttributes
		// we don't call setAttribute (or setDomValue) because of potential side-effects of altering the DOM
		this.domAttributes.value = this.getValue();
		// we have the option/responsibility to propagate this event to owner
		this.doChange(inEvent);
	},
	getValue: function() {
		var v = this.getDomValue();
		if (enyo.isString(v)) {
			this.value = v;
		}
		return this.value;
	},
	valueChanged: function() {
		this.setDomValue(this.value);
	},
	disabledChanged: function() {
		this.setAttribute("disabled", this.disabled ? "disabled" : null);
	},
	readonlyChanged: function() {
		this.setAttribute("readonly", this.readonly ? "readonly" : null);
	},
	placeholderChanged: function() {
		this.setAttribute("placeholder", this.placeholder);
	},
	//* @public
	/**
	Force the input to receive keyboard focus.
	*/
	forceFocus: function() {
		if (this.hasNode()) {
			// has to be async in many cases (when responding to dom events, in particular) or it just fails
			enyo.asyncMethod(this, function() {
				this.hasNode().focus();
				//this.node.select();
			});
		}
	},
	/**
		Forces this input to be blurred (lose focus).
	*/
	forceBlur: function() {
		if (this.hasNode()) {
			enyo.asyncMethod(this, function() {
				this.hasNode().blur();
			});
		}
	},
	/**
		Returns true if the input has keyboard focus.
	*/
	hasFocus: function() {
		if (this.hasNode()) {
			return Boolean(this.node.parentNode.querySelector(this.nodeTag +":focus"));
		}
	}
});