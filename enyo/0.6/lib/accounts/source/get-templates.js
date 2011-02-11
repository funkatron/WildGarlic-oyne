/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Get the list of templates from the Accounts service
//
// Usage:
// ======
//
// Kind:
// {name: "templates", kind: "Accounts.getTemplates", onTemplatesAvailable: "onTemplatesAvailable"}
//
// Making the call:
// var request = this.$.templates.getAccountTemplates({
// 		capability: "MAIL",		// Specify a capability to filter the templates (optional)
// 		refreshCache: true		// Force the retrieval of templates, otherwise the results are returned from the cache (default is false)
// });
//
// The callback:
// onTemplatesAvailable: function(inSender, inResponse, inRequest) {
// 		this.templates = inResponse;		
// }


enyo.kind({
	name: "Accounts.getTemplates",
	kind: "Component",
	events: {
		onTemplatesAvailable: ""
	},
	components: [{
		kind: "PalmService",
		service: enyo.palmServices.accounts,
		method: "listAccountTemplates",
		name: "listAccountTemplates",
		onResponse: "gotAccountTemplates"
	}],
	
	// Cache the templates to improve performance
	accountTemplates: [],
	
	// Get the account templates.  If the templates are in the cache then return those instead
	// of making a service call.  Use {"refreshCache":true} to force the retrieval of the templates 
	getAccountTemplates: function (options) {
		this.log("getAccountTemplates: accountTemplates.length=" + this.accountTemplates.length + " options=" + enyo.json.to(options));
		// Used the cached templates unless they don't exist, or the call is forced
		if (this.accountTemplates.length == 0 || (options && options.refreshCache === true)) {
			if (options && options.refreshCache != undefined)
				delete options.refreshCache;
			this.$.listAccountTemplates.call(options);
		}
		else 
			this.doTemplatesAvailable(this.accountTemplates);
	},

	// Success and failure calls for template retrieval from the accounts service	
	gotAccountTemplates: function(inSender, inResponse, inRequest) {
		// Cache the service response
		this.accountTemplates = inResponse.results || [];
		this.log("gotAccountTemplates: accountTemplates.length=" + this.accountTemplates.length);
		this.doTemplatesAvailable(this.accountTemplates);
	},
	failedAccountTemplates: function(inSender, inResponse, inRequest){
		this.doTemplatesAvailable(this.accountTemplates);
	}
});

