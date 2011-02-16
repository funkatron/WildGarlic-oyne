/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AtomizingInput",
	kind: enyo.Control,
	className: "atomizing-input-container",
	focusedClassName: "enyo-flat-shadow",
	events: {
		onFilterStringChanged: "",
		onAtomize: "",
		onBlur: "",
		onEditContact: "",
		onShowAllContacts: ""
	},
	published: {
		contacts: "",
		expandButtonCaption: "TO",
		inputPlaceholder: "Name or email address",
		inputType: "",
		/* On keydown an atomizing key turns the value of the input into
		 * a new atom and empties the input's value. Atomizing keyCodes do
		 * not print any characters in the input.
		 *
		 * Defaults are enter, comma, and semicolon.
		 */
		atomizingKeyCodes: [
			0,		// Semicolon **webOS NON-STANDARD**
			13,		// Enter
			188		// Comma
		]
	},
	components: [
		{name: "wrapper", className: "atomizing-input-wrapper", components: [
			{name: "expandButton", kind: "ContactAtom", onmousedown: "preventBlur", className: "addressing-expand-button contact-atom-flat"},
			{name: "showallButton", kind: "CustomButton", className: "addressing-showall-button", onmousedown: "preventBlur", onclick: "doShowAllContacts"},
			{
				name: "input",
				kind: "RichText",
				className: "atomizing-input",
				spellcheck: false,
				autoCapitalize: false,
				richContent: false,
				onfocus: "buttonize",
				onblur: "unbuttonize"
			}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.contactsChanged();
		this.expandButtonCaptionChanged();
		this.inputPlaceholderChanged();
		this.inputTypeChanged();

		if (!window.PalmSystem) {
			this.setAtomizingKeyCodes([
				13,		// Enter
				186,	// Semicolon
				188		// Comma
			]);
		}
	},
	expandButtonCaptionChanged: function() {
		this.$.expandButton.setContent(this.expandButtonCaption);
	},
	inputPlaceholderChanged: function() {
		this.$.input.setPlaceholder(this.inputPlaceholder);
	},
	inputTypeChanged: function() {
		this.$.input.domAttributes.type = this.inputType;
		if (this.hasNode()) {
			this.$.input.render();
		}
	},
	/**
	 * @public
	 */
	focus: function() {
		this.$.input.hasNode().focus();
	},
	contactsChanged: function() {
		this.atoms = [];
		//
		for (var i = 0; i < this.contacts.length; i++) {
			this.addContact(this.contacts[i].name, this.contacts[i].address);
		}
	},
	addContact: function(inName, inAddress, inContactId, inIsButtony) {
		var atom = enyo.Component.create({
			kind: "ContactAtom",
			content: inName,
			address: inAddress,
			isButtony: !!inIsButtony,
			onclick: "editAtom",
			onmousedown: "preventBlur",
			contactId: inContactId,
			owner: this
		});

		this.atoms.push(atom);

		// New atom should be inserted before the input element
		this.$.wrapper.children.splice(this.$.wrapper.children.length - 1, 0, atom);
		this.$.wrapper.render();
	},
	atomizeInput: function(inValue, inAddress, inContactId) {
		var val = inValue || this.$.input.getValue();
		var address = inAddress || val;
		if (this.activeAtom) {
			if (val) {
				if (val !== this.activeAtom.address) {
					this.activeAtom.setAddress(address);
					this.activeAtom.setContent(val);
					this.activeAtom.setContactId(null);
				}
				this.$.input.setValue("");
				this.activeAtom.show();
			} else {
				this.activeAtom.destroy();
			}
			this.activeAtom = null;
		} else {
			if (val) {
				this.addContact(val, address, inContactId, true);
				this.$.input.setValue("");

				// TODO: the input should NOT blur when adding a new atom
				this.$.input.hasNode().focus();
			}
		}

		this.doAtomize();
	},
	buttonize: function(inSender, inEvent) {
		for (var i = 0; i < this.atoms.length; i++) {
			this.atoms[i].setIsButtony(true);
		}
		this.$.showallButton.addClass("buttony");
		this.$.expandButton.setIsButtony(true);
	},
	unbuttonize: function(inSender, inEvent) {
		for (var i = 0; i < this.atoms.length; i++) {
			this.atoms[i].setIsButtony(false);
		}
		this.$.showallButton.removeClass("buttony");
		this.$.expandButton.setIsButtony(false);

		this.doBlur();
	},
	preventBlur: function(inSender, inEvent) {
		/* Tapping an atom should not blur the input.
		 * Allowing blur would cause input to blur/focus
		 * on every atom tap, which would flash the background
		 * of the input.
		 */
		inEvent.preventDefault();
	},
	editAtom: function(inSender, inEvent) {
		this.atomizeInput();

		this.$.input.setValue(inSender.address);
		inSender.hide();
		this.activeAtom = inSender;

		this.$.input.hasNode().focus();
		document.execCommand("selectAll");

		this.doEditContact(inSender);
	},
	clickHandler: function() {
		this.$.input.hasNode().focus();
	},
	focusHandler: function() {
		this.addClass(this.focusedClassName);
	},
	blurHandler: function() {
		this.removeClass(this.focusedClassName);
	},
	keydownHandler: function(inSender, inEvent) {
		var keyCode = inEvent.keyCode;

		for (var i = 0; i < this.atomizingKeyCodes.length; i++) {
			if (this.atomizingKeyCodes[i] === keyCode) {
				this.atomizeInput();

				// Atomizing keys shouldn't print their characters
				enyo.stopEvent(inEvent);
				inEvent.preventDefault();
				return;
			}
		}

		var val = this.$.input.getValue();
		if (keyCode === 8) {
			/* 8 is keyCode for delete
			 * Deleting when input is empty should destroy the last atom.
			 */
			if (val === "" && this.atoms.length) {
				var atom = this.atoms.pop();
				atom.destroy();
				this.$.wrapper.removeChild(atom);
				this.$.input.hasNode().focus();
			}

			/* Deleting characters changes the filter string and should
			 * kick off a new filter
			 */
			this.setFilterJob();
		} else if (keyCode === 32) {
			if (val === "") {
				/* 32 is keyCode for spacebar
				 * Leading spaces are not allowed.
				 */
				inEvent.preventDefault();
			}
		}
	},
	keypressHandler: function() {
		this.setFilterJob();
	},
	setFilterJob: function() {
		if (this.filterJob) {
			clearTimeout(this.filterJob);
			this.filterJob = null;
		}

		this.filterJob = setTimeout(enyo.bind(this, "filterStringChanged"), 200);
	},
	filterStringChanged: function() {
		this.doFilterStringChanged(this.$.input.getValue());
	}
});

enyo.kind({
	name: "enyo.ContactAtom",
	kind: "CustomButton",
	layoutKind: "HFlexLayout",
	align: "center",
	className: "contact-atom",
	published: {
		isButtony: false,
		address: "",
		contactId: ""
	},
	chrome: [
		{name: "content", className: "contact-atom-content", flex: 1},
		{kind: "Spinner", className: "contact-atom-spinner", showing: false}
	],
	create: function() {
		this.inherited(arguments);
		this.isButtonyChanged();
	},
	isButtonyChanged: function() {
		this.addRemoveClass("contact-atom-buttony", this.isButtony);
	},
	contentChanged: function() {
		this.$.content.setContent(this.content);
	}
});