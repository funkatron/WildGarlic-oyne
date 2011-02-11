/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AddressingPopup",
	kind: enyo.Control,
	published: {
		contacts: "",
		/* Address types as defined by the contacts schema that should be
		 * returned for each contact.
		 *
		 * Options are "emails", "phoneNumbers", and "ims"
		 */
		addressTypes: [],
		inputType: "email"
	},
	components: [
		{kind: "DbService", dbKind: "com.palm.person:1", components: [
			{name: "find", method: "find", onSuccess: "filter"},
			{name: "search", method: "search", onSuccess: "filter"},
			{name: "get", method: "get", onSuccess: "filter"}
		]},
		//
		{name: "input", kind: "AtomizingInput", onFilterStringChanged: "filterStringChanged", onAtomize: "hideList", onBlur: "inputBlur", onEditContact: "editContact", onShowAllContacts: "showAllContacts"},
		{kind: "Popup", layoutKind: "VFlexLayout", className: "addressing-popup", onOpen: "refreshList", components: [
			{name: "list", flex: 1, kind: "VirtualList", onSetupRow: "listSetupRow", domAttributes: {"enyo-pass-events": true}, onmousedown: "listMousedown", components: [
				{kind: "Divider", components: [
					{name: "favoriteStar", kind: "Divider", caption: "FAVE"}
				]},
				{name: "addressList", kind: "VirtualRepeater", onGetItem: "addressGetItem", components: [
					{kind: "Item", tapHighlight: true, onclick: "addContact"}
				]}
			]}
		]}
	],
	create: function() {
		this.data = [];
		this.inherited(arguments);
		this.contactsChanged();
		this.addressTypesChanged();
		this.inputTypeChanged();
	},
	/**
	 * @public
	 */
	focus: function() {
		this.$.input.focus();
	},
	addressTypesChanged: function() {
		this.querySelect =
			[
				"_id",
				"favorite",
				"name",
				"names",
				"nickname",
				"organization"
			].concat(this.addressTypes);
	},
	inputTypeChanged: function() {
		this.$.input.setInputType(this.inputType);
	},
	listMousedown: function(inSender, inEvent) {
		enyo.stopEvent(inEvent);
	},
	contactsChanged: function() {
		this.$.input.setContacts(this.contacts);
	},
	addContact: function(inSender, inEvent) {
		var record = this.data[this.$.list.fetchRowIndex()];
		this.$.input.atomizeInput(
			record.displayName,
			record.displayAddresses[inEvent.rowIndex].value,
			record._id);
	},
	showAllContacts: function() {
		this.$.find.call({
			query: {
				orderBy: "sortKey",
				desc: false,
				select: this.querySelect
			}
		});
	},
	editContact: function(inSender, inContact) {
		this.$.get.call({
			ids: [inContact.contactId]
		});
	},
	filterStringChanged: function(inSender, inFilterString) {
		if (inFilterString) {
			this.$.search.call({
				query: {
					orderBy: "sortKey",
					desc: false,
					limit: 200,
					select: this.querySelect,
					where: [{
						prop: "searchProperty",
						op: "?",
						val: inFilterString,
						collate: "primary"
					},
					{
						/* TODO: split into two queries so favorites can be filtered
						 * to the top of the list
						 */
						prop: "favorite",
						op: "=",
						val: [true, false]
					}]
				}
			});
		} else {
			// If the filter string is blank the list should hide
			this.hideList();
		}
	},
	inputBlur: function() {
		this.hideList();
	},
	hideList: function() {
		this.$.popup.close();
	},
	filter: function(inSender, inResponse, inRequest) {
		this.data = inResponse.results;

		if (this.$.popup.isOpen) {
			this.refreshList();
		} else {
			/* Popup fires onOpen, which will in turn call refreshList
			 *
			 * TODO: popup needs to clamp to the window minus the command menu
			 * if there is one and minus its top offset
			 */
			this.$.popup.openAroundNode(this.$.input.hasNode());
		}
	},
	refreshList: function() {
		this.$.list.refresh();
	},
	addressGetItem: function(inSender, inIndex) {
		var address = this.addresses[inIndex];

		if (address) {
			this.$.item.setContent(address.value);
			return true;
		}

		this.addresses = null;
	},
	listSetupRow: function(inSender, inIndex) {
		var record = this.data[inIndex];

		if (record) {
			record.displayAddresses = [];
			for (var i = 0; i < this.addressTypes.length; i++) {
				var addressType = this.addressTypes[i];
				if (record[addressType]) {
					record.displayAddresses =
						record.displayAddresses.concat(record[addressType]);
				}
			}
			this.addresses = record.displayAddresses;

			if (this.addresses.length) {
				var recordName = record.name;

				// TODO: this functionality lives in the contacts loadable library
				record.displayName = recordName.familyName ?
					recordName.givenName + " " + recordName.familyName :
					recordName.givenName;

				this.$.divider.show();
				this.$.divider.setCaption(record.displayName);

				this.$.favoriteStar.setShowing(record.favorite);
			} else {
				this.$.divider.hide();
			}

			return true;
		}
	}
});
