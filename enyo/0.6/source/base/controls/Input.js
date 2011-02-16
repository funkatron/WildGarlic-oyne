/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A text input control that supports auto-correction and hint text, and has default visual styling. To create an Input:

	{kind: "Input", hint: "type something here", onchange: "inputChange"}

The value property specifies the text displayed in the input.
By default, the onchange event fires only when the input blurs (loses focus).
To cause the change event to fire as the user types,
set the changeOnKeypress property to true.

It is common to use getValue and setValue to get and set the value of an input;
for example, to set the value of one input to that of another:

	buttonClick: function() {
		var x = this.$.input1.getValue();
		this.$.input2.setValue(x);
	}
*/
enyo.kind({
	name: "enyo.Input", 
	kind: enyo.Control,
	published: {
		hint: "Tap Here To Type",
		value: "",
		// HTML5 'spellcheck' attribute
		spellcheck: true,
		// maps to Mobile Safari 'autocorrect' attribute
		autocorrect: true,
		//* Possible settings: "num-lock", "caps-lock", "shift-lock", "shift-single", "num-single",
		autoKeyModifier: "",
		//* Possible settings: "sentence", "title", "lowercase" (actual attribute is cap +)
		autoCapitalize: "sentence",
		autoEmoticons: false,
		autoLinking: false,
		inputType: "",
		inputClassName: "",
		/**
		The selection property is an object describing selected text. The start and end properties
		specify the zero-based starting and ending indexes of the selection.
		For example, if an input value is "Value"
		and getSelection returns {start: 1, end: 3} then "al" is selected. To select "alu," call:

			this.$.input.setSelection({start: 1, end: 4});
		*/
		selection: null,
		disabled: false,
		/**
		Set to true to fire the onchange event whenever a key is pressed.
		*/
		changeOnKeypress: false,
		/**
		Set to the number of milliseconds to delay the change event when a key is pressed.
		If another key is pressed within the delay interval, the change will be postponed
		and fired once only after the delay has elapsed without a key being pressed.
		*/
		keypressChangeDelay: 0
	},
	events: {
		onfocus: "",
		onblur: "",
		onchange: "",
		/** The onkeypress event can be used to filter out disallowed characters.

		*/
		onkeypress: ""
	},
	//* @protected
	chrome: [
		{name: "input", kind: enyo.BasicInput, className: "enyo-input"}
	],
	filterDelay: 200,
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
		this.inputTypeChanged();
		this.valueChanged();
		this.hintChanged();
		this.inputClassNameChanged();
		this.applySmartTextOptions();
	},
	destroy: function() {
		this.stopChangeDelayJob();
		this.inherited(arguments);
	},
	selectAllHandler: function() {
		document.execCommand("selectAll");
	},
	cutHandler: function() {
		document.execCommand("cut");
	},
	copyHandler: function() {
		document.execCommand("copy");
	},
	pasteHandler: function() {
		if (PalmSystem && PalmSystem.paste) {
			PalmSystem.paste();
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.selectionChanged();
	},
	inputClassNameChanged: function() {
		this.$.input.addClass(this.inputClassName);
	},
	inputTypeChanged: function() {
		this.$.input.domAttributes.type = this.inputType;
		if (this.hasNode()) {
			this.$.input.render();
		}
	},
	valueChanged: function() {
		this.$.input.setValue(this.value);
	},
	getDomValue: function() {
		return this.$.input.getDomValue();
	},
	getValue: function() {
		return this.$.input.getValue();
	},
	// dom event handler
	changeHandler: function(inSender, e) {
		// abort change, bubbling included, if it's been processed via changeOnKeypress
		if (this.changeOnKeypress) {
			return true;
		} else {
			this.value = inSender.getValue();
			this.doChange(e, this.value);
		}
	},
	// NOTE: use keyup instead of keypress because dom value is not updated in keypress
	// but is in keyup
	keyupHandler: function(inSender, e) {
		if (this.changeOnKeypress) {
			this.value = inSender.getValue();
			// FIXME: change event will not bubble; this doesn't seem like a problem but we
			// could dispatch the event to allow it to bubble.
			if (this.keypressChangeDelay) {
				enyo.job(this.id + "-changeDelay", enyo.bind(this, "doChange", e, this.value), Number(this.keypressChangeDelay));
			} else {
				this.doChange(e, this.value);
			}
		}
	},
	keypressChangeDelayChanged: function() {
		this.stopChangeDelayJob();
	},
	stopChangeDelayJob: function() {
		enyo.job.stop(this.id + "-changeDelay");
	},
	keypressHandler: function(inSender, e) {
		return this.doKeypress(e);
	},
	selectionChanged: function() {
		var n = this.$.input.hasNode();
		if (n && this.selection) {
			n.selectionStart = this.selection.start;
			n.selectionEnd = this.selection.end;
		}
	},
	getSelection: function() {
		var n = this.$.input.hasNode();
		return n ? {start: n.selectionStart, end: n.selectionEnd} : {start: 0, end: 0};
	},
	disabledChanged: function() {
		this.$.input.setDisabled(this.disabled);
	},
	hintChanged: function() {
		this.$.input.setPlaceholder(this.hint);
	},
	// FIXME: Smart text replace options (could be factored out)
	autoKeyModifierChanged: function() {
		this.$.input.setAttribute("x-palm-text-entry", this.autoKeyModifier ? this.autoKeyModifier : null);
	},
	autoCapitalizeChanged: function() {
		if (this.autoCapitalize === "lowercase") {
			this.$.input.setAttribute("x-palm-disable-auto-cap", "true");
			this.$.input.setAttribute("x-palm-title-cap", null);
		} else {
			this.$.input.setAttribute("x-palm-disable-auto-cap", null);
			this.$.input.setAttribute("x-palm-title-cap", (this.autoCapitalize === "title") ? true : null);
		}
	},
	autocorrectChanged: function() {
		// FIXME: our WebKit implementation of 'autocorrect' and 'spellcheck' doesn't work for all 4 possible values
		this.$.input.setAttribute("autocorrect", this.autocorrect ? "on" : "off");
	},
	spellcheckChanged: function() {
		// FIXME: our WebKit implementation of 'autocorrect' and 'spellcheck' doesn't work for all 4 possible values
		this.$.input.setAttribute("spellcheck", !!this.spellcheck);
	},

	autoLinkingChanged: function() {
		this.$.input.setAttribute("x-palm-enable-linker", this.autoLinking ? this.autoLinking : null);
	},
	autoEmoticonsChanged: function() {
		this.$.input.setAttribute("x-palm-enable-emoticons", this.autoEmoticons ? this.autoEmoticons : null);
	},
	applySmartTextOptions: function() {
		this.spellcheckChanged();
		this.autocorrectChanged();
		this.autoLinkingChanged();
		this.autoEmoticonsChanged();
		this.autoCapitalizeChanged();
		this.autoKeyModifierChanged();
	},
	//* @public
	/**
		Forces this input to be focused.
	*/
	forceFocus: function() {
		this.$.input.forceFocus();
	},
	/**
		Forces this input to be blurred (lose focus).
	*/
	forceBlur: function() {
		this.$.input.forceBlur();
	},
	/**
		Force select all text in this input.
	*/
	forceSelect: function() {
		this.$.input.forceSelect();
	},
	/**
		Returns true if the input has keyboard focus.
	*/
	hasFocus: function() {
		return this.$.input.hasFocus();
	}
});
