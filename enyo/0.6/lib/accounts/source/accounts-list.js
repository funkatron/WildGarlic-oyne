/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Show the list of accounts
// Accounts that have templates marked hidden, or those without validators (as defined by the account template) are excluded
//
// Usage:
// ======
//
// Kind:
// {kind: "Accounts.accountsList"},
//
// Add an "Add Account" button that calls:
// ...

PAGE_TITLE = $L("Accounts");

enyo.kind({
	name: "Accounts.accountsList",
	kind: "enyo.VFlexBox",
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onAccountsAvailable: "onAccountsAvailable"},
		{name: "accountsList", kind: "Scroller", flex: 1, components: [
			{name: "list", kind: "VirtualRepeater", onGetItem: "listGetItem", onclick: "accountSelected", components: [
				{kind: "Item", name: "Account", layoutKind: "HFlexLayout", components: [
					{name: "icon"},
					{components: [
						{name: "accountName"},
						{name: "emailAddress"}
					]},
				]}
			]} 
		]}
	],
	create: function(options) {
		this.inherited(arguments);
		console.log("accountsList create");
		var request = this.$.accounts.getAccounts(options);
	},
	onAccountsAvailable: function(inSender, inResponse, inRequest) {
		console.log("onAccountsAvailable: Received account templates!!!" + inResponse.length);
		this.accounts = inResponse;		
		this.$.list.render();
		console.log("onAccountsAvailable: templates length" + this.templates);
	},

	listGetItem: function(inSender, inIndex) {
		console.log("listGetItem: index=" + inIndex);
		if (!this.accounts || inIndex >= this.accounts.length)
			return false;
		this.$.icon.setContent("<image src='" + this.accounts[inIndex].icon.loc_48x48 + "'></img>");
		this.$.accountName.setContent(this.accounts[inIndex].alias || this.accounts[inIndex].loc_name);
		this.$.emailAddress.setContent(this.accounts[inIndex].username);
		if (inIndex == 0)
			this.$.Account.addClass("enyo-first");
		else if (inIndex == this.accounts.length)
			this.$.Account.addClass("enyo-last");
		return true;
	},

	accountSelected: function(inSender, inEvent) {
		console.log("accountSelected:" + (this.accounts[inEvent.rowIndex].alias || this.accounts[inEvent.rowIndex].loc_name));
	}

});
