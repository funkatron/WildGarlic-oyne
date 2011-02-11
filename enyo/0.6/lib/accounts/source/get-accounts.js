/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Get the list of accounts from mojoDB
// Accounts that are hidden templates, or those without validators (as defined by the account template) are excluded
//
// Usage:
// ======
//
// Kind:
// {name: "accounts", kind: "Accounts.getAccounts", onAccountsAvailable: "onAccountsAvailable"}
//
// Making the call:
// var request = this.$.accounts.getAccounts({
// 		filterBy:{capability: 'MAIL'},		// Specify a capability to filter the templates (optional)
//		showDeleted: true,					// Show accounts being deleted (optional, default is false)
//		subscribe:true						// Subscribe to changes to the account list (optional; default is false)
// });
// You can also specify multiple capabilities:    filterBy:{capability: ['MAIL', 'CONTACTS'}
// You can filter by templateId:                  filterBy:{templateId: 'com.palm.eas'}
//
// The callback:
// onAccountsAvailable: function(inSender, inResponse) {
// 		this.accounts = inResponse;		
// }

var ACCOUNT_KIND = "com.palm.account:1";

enyo.kind({
	name: "Accounts.getAccounts",
	kind: "Component",
	events: {
		onAccountsAvailable: ""
	},
	components: [
		{name: "templates", kind: "Accounts.getTemplates", onTemplatesAvailable: "onTemplatesAvailable"},
		{name: "listAccounts", kind: "PalmService", service: enyo.palmServices.database, method: "find", onResponse: "gotAccounts"},
	],
	
	// Start off by getting the account templates.  Once those have been retrieved then get the accounts
	getAccounts: function(options) {
		this.options = options || {};
		// Get the account templates
		var request = this.$.templates.getAccountTemplates(this.options.filterBy);
	},
	
	onTemplatesAvailable: function(inSender, inResponse, inRequest) {
		this.templates = inResponse;
		console.log("onTemplatesAvailable: received templates.  num=" + this.templates.length);
		
		// The templates have been retrieved.  Now get the list of accounts
		var filterBy = (this.options && this.options.filterBy) || undefined;
		var subscribe = (this.options && this.options.subscribe) || undefined;
		var params = {
			query: {
				from: ACCOUNT_KIND,
				where: AccountsUtil.createWhere(filterBy)
			},
			watch: subscribe
		};
		
		// Make the database call to get the accounts
		var request = this.$.listAccounts.call(params);
	},
	
	gotAccounts: function(inSender, inResponse, inRequest) {
		var accounts = [];
		if (inResponse && inResponse.returnValue == true) {
			var accounts = inResponse.results;
			var dedupe = this.options.filterBy && this.options.filterBy.capability && enyo.isArray(this.options.filterBy.capability);
			if (accounts) {
				if (dedupe)
					AccountsUtil.dedupeByProperty(accounts, "_id");
				accounts = accounts.map(AccountsUtil.annotateAccount, {templates: this.templates});
			}
		}
		this.doAccountsAvailable(accounts);
	}

});


