/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Add an account.  Show the list of accounts the user is able to add, based on the account templates
// Accounts that have templates marked hidden, or those without validators (as defined by the account template) are excluded
//
// Usage:
// ======
//
// Kind:
// {kind: "Accounts.addAccount"},
//

PAGE_TITLE = $L("Add An Account");

enyo.kind({
	name: "Accounts.addAccount",
	kind: "enyo.VFlexBox",
	components: [
		{name: "templates", kind: "Accounts.getTemplates", onTemplatesAvailable: "onTemplatesAvailable"},
		{name: "addAccountList", kind: "Scroller", flex: 1, components: [
			{name: "list", kind: "VirtualRepeater", onGetItem: "listGetItem", onclick: "templateSelected", components: [
				{kind: "Item", name: "Account", layoutKind: "HFlexLayout", components: [
					{name: "icon"},
					{name: "accountName"}
				]}
			]} 
		]}
	],
	create: function(options) {
		this.inherited(arguments);
		console.log("addAccount create");
		var request = this.$.templates.getAccountTemplates({});
	},
	onTemplatesAvailable: function(inSender, inResponse, inRequest) {
		this.templates = inResponse;
		console.log("onTemplatesAvailable: received templates.  num=" + this.templates.length);
		
		// Filter out hidden templates and those without validators
		for (var i=0, l=this.templates.length; i<l; i++) {
			if (!this.templates[i].validator || this.templates[i].hidden) {
				this.templates.splice(i, 1);
				i--; l--;
			}
		}  
		this.$.list.render();
	},

	listGetItem: function(inSender, inIndex) {
		console.log("listGetItem: index=" + inIndex);
		if (!this.templates || inIndex >= this.templates.length)
			return false;
		if (this.templates[inIndex].icon)
			this.$.icon.setContent("<image src='" + this.templates[inIndex].icon.loc_48x48 + "'></img>");
		this.$.accountName.setContent(this.templates[inIndex].alias || this.templates[inIndex].loc_name);
		if (inIndex == 0)
			this.$.Account.addClass("enyo-first");
		else if (inIndex == this.templates.length)
			this.$.Account.addClass("enyo-last");
		return true;
	},

	templateSelected: function(inSender, inEvent) {
		console.log("templateSelected:" + (this.templates[inEvent.rowIndex].alias || this.templates[inEvent.rowIndex].loc_name));
	}

});
