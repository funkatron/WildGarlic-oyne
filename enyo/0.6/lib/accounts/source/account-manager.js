/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Show the list of accounts
// Accounts that are hidden templates, or those without validators (as defined by the account template) are excluded
//
// Usage:
// ======
//
// Kind:
// {kind: "Accounts.accountManager"},
//
// Add an "Add Account" button that calls:
// ...

PAGE_TITLE = $L("Accounts");
ADD_ACCOUNT = $L("Add Account");
HELP_MENU = $L("Help");

enyo.kind({
	name: "Accounts.accountManager",
	kind: enyo.VFlexBox, flex:1,
	components: [
		{name: "pane", kind: "Pane", flex: 1, components: [
//			{name: "accountsList", kind: "Accounts.accountsList"},
			{name: "addAccount", kind: "Accounts.addAccount"},
		]}
	],
	create: function() {
		this.inherited(arguments);
		console.log("accountManager create");
	},


});
