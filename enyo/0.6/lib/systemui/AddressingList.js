/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	Todo:
	* Support db paging in unfiltered list.
	* Filter favorites to the top of the list.
	* Support global address lookup.
	* Integrate with atomizing input and popup

	Wish list:
	* Add persistent mru support
*/
enyo.kind({
	name: "enyo.AddressingList",
	kind: enyo.VFlexBox,
	published: {
		/* Address types as defined by the contacts schema that should be
		 * returned for each contact.
		 *
		 * Options are "emails", "phoneNumbers", and "ims"
		 */
		addressTypes: ["emails", "phoneNumbers", "ims"]
	},
	events: {
		/**
		Event fires when an address is selected; in addition to inSender, fires with:
		
		inDisplayAddress {Object} The selected address 

		inAddress {Object} The contact record for the selected address
		*/
		onSelect: ""
	},
	filterHighlightClassName: "enyo-text-filter-highlight",
	//* @protected
	components: [
		{kind: "DbService", dbKind: "com.palm.person:1", onSuccess: "querySuccess", onFailure: "queryFail", components: [
			{name: "find", method: "find"},
			{name: "search", method: "search"},
			{name: "get", method: "get"}
		]},
		//
		{name: "list", flex: 1, kind: "VirtualList", onSetupRow: "listSetupRow", components: [
			{kind: "Divider", components: [
				{name: "favoriteStar", kind: "Divider", caption: "FAVE"}
			]},
			{name: "addressList", kind: "VirtualRepeater", onGetItem: "addressGetItem", components: [
				{kind: "Item", tapHighlight: true, onclick: "selectItem"}
			]}
		]}
	],
	create: function() {
		this.data = [];
		this.inherited(arguments);
		this.addressTypesChanged();
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
	selectItem: function(inSender, inEvent) {
		var i = this.$.list.fetchRowIndex();
		var vi = inEvent.rowIndex;
		var r = this.data[i];
		var vr = r.displayAddresses[vi];
		if (r && vr) {
			this.doSelect(vr, r);
		}
	},
	search: function(inSearch) {
		this.searchString = inSearch;
		if (inSearch) {
			this.findFilter(inSearch);
		} else {
			this.findAll();
		}
	},
	findAll: function() {
		this.$.find.call({
			query: {
				orderBy: "sortKey",
				desc: false,
				select: this.querySelect
			}
		});
	},
	findFilter: function(inSearch) {
		if (inSearch) {
			this.$.search.call({
				query: {
					orderBy: "sortKey",
					desc: false,
					limit: 200,
					select: this.querySelect,
					where: [{
						prop: "searchProperty",
						op: "?",
						val: inSearch,
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
		}
	},
	editContact: function(inSender, inContact) {
		this.$.get.call({
			ids: [inContact.contactId]
		});
	},
	querySuccess: function(inSender, inResponse, inRequest) {
		this.data = inResponse.results;
		this.data = enyo.isString(this.data) ? enyo.json.from(this.data) : this.data;
		this.refreshList();
	},
	queryFail: function(inSender, inResponse) {
		console.log("Contact lookup failed: " + inResponse);
	},
	refreshList: function() {
		this.$.list.refresh();
	},
	listSetupRow: function(inSender, inIndex) {
		var d = this.data[inIndex];
		if (d) {
			d.displayAddresses = [];
			for (var i = 0; i < this.addressTypes.length; i++) {
				var addressType = this.addressTypes[i];
				if (d[addressType]) {
					d.displayAddresses =
						d.displayAddresses.concat(d[addressType]);
				}
			}
			this.rowAddresses = d.displayAddresses;
			// if there's more than one address, show a divider
			if (this.rowAddresses.length) {
				var recordName = d.name;

				// TODO: this functionality lives in the contacts loadable library
				d.displayName = recordName.familyName ?
					recordName.givenName + " " + recordName.familyName :
					recordName.givenName;

				this.$.divider.show();
				var dn = d.displayName;
				if (this.searchString) {
					dn = enyo.string.applyFilterHighlight(dn, this.searchString, this.filterHighlightClassName);
				}
				this.$.divider.setCaption(dn);

				this.$.favoriteStar.setShowing(d.favorite);
			} else {
				this.$.divider.hide();
			}

			return true;
		}
	},
		addressGetItem: function(inSender, inIndex) {
		var address = this.rowAddresses[inIndex];
		if (address) {
			var s = inIndex == 0 ? "border-top: 0;" : ""
			s += (inIndex == this.rowAddresses.length-1 ? "border-bottom: 0;" : "");
			this.$.item.setStyle(s);
			this.$.item.setContent(address.value);
			return true;
		}
		this.rowAddresses = null;
	}
});