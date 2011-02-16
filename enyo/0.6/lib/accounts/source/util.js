/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var AccountsUtil = (function () {
	
	var capabilityMetadata;
	
	function whereEquals(prop, val) {
		return {
			prop: prop,
			op: "=",
			val: val
		};
	}

	// Get the template that matches the given ID.  Template ID's should
	// be unique so the first match is returned.
	function getTemplateById(templates, id) {
		for (var i=0, l=templates.length; i<l; i++) {
			if (templates[i].templateId === id) {
				console.log("getTemplateById: found template with ID = " + id);
				return templates[i];
			}
		}
		console.log("getTemplateById: template " + id + " not found");
		return undefined;
	}

	function matchCapabilities(t) {
		// Automatically exclude hidden templates, or those without validators
		if (!t.validator || t.hidden) {
			console.log("matchCapabilities: excluding " + t.templateId + " because it is hidden or doesn't have a validator");
			return false;
		}
		
		// Should this template be excluded?
		if (this.exclude) {
			// Format the excludes consistently (in an array)
			var excludes;
			if (typeof this.exclude === "string") {
				excludes = [this.exclude];
			} else if (this.capability) {
				excludes = this.exclude;
			}
			for (var i=0, l=excludes.length; i<l; i++) {
				if (t.templateId === excludes[i]) {
					console.log("matchCapabilities: excluding " + t.templateId)
					return false;
				}
			}
		}

		// Format the sought capability consistently (in an array)
		var capabilities;
		if (typeof this.capability === "string") {
			capabilities = [this.capability];
		} else if (this.capability) {
			capabilities = this.capability;
		}

		// First find out which of the asked-for capabilities match.
		// reject if no matches are found.  not every capability has to be
		// supported.
		if (capabilities) {
			// Loop through the capabilities
			for (var i=0, l=capabilities.length; i<l; i++) {
				for (var j=0, ll=t.capabilityProviders.length; j<ll; j++) {
					if (t.capabilityProviders[j].capability === capabilities[i]) {
						console.log("matchCapabilities: " + t.templateId + " has capability " + capabilities[i]);
						return true;
					}
				}
			}
		}
		return false;
	}

	return {
		// Exported methods
		
		// Get the template that matches the given ID
		// Example: var tempate = AccountsUtil.getTemplateById(this.templates, "com.palm.yahoo");
		getTemplateById: getTemplateById,


		// Filter the templates by ID or capability
		// Templates marked hidden or those without a validator will automatically be filtered out
		// Examples:
		// var template = AccountsUtil.filterTemplates(this.templates, {templateId: 'com.palm.yahoo'}); (returns single template)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: 'MAIL'}); (returns array of templates)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: ['MAIL', 'CONTACTS']}); (returns array of templates)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: 'MAIL', exclude:'com.palm.yahoo'}); (returns array of templates, excluding Yahoo)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: 'MAIL'], exclude: ["com.palm.sim", "com.palm.palmprofile"]});
		filterTemplates: function (templates, filterBy) {
			var selectedTemplates = templates, tmpl;

			if (filterBy) {
				if (filterBy.templateId) {
					console.log("filterTemplates: filterBy.templateId");
					tmpl = getTemplateById(templates, filterBy.templateId);
					if (tmpl == undefined) {
						console.log("filterTemplates: Unable to find template with id=" + filterBy.templateId)
						return undefined;
					}
					return tmpl;
				}
				
				if (filterBy.capability) {
					// First match templates based on capabilities
					selectedTemplates = templates.filter(matchCapabilities, filterBy);
					for (var i=0, l=selectedTemplates.length; i<l; i++)
						console.log("filterBy.capability match =" + selectedTemplates[i].templateId);
					
					return selectedTemplates;
				}
				
				console.log("filterTemplates: Must specify 'templateId' or 'capability' - no filtering performed!")	
			}
			return selectedTemplates;
		},
		
		createWhere: function (filterBy) {
			var where = [];

			if (filterBy) {
				if (filterBy.templateId) {
					where.push(whereEquals("templateId", filterBy.templateId));
				} else if (filterBy.capability) {
					where.push(whereEquals("capabilityProviders.capability", filterBy.capability));
				}
			}
			if (!(filterBy && filterBy.showDeleted)) {
				where.push(whereEquals("beingDeleted", false));
			}

			return (where.length > 0) ? where : undefined;
		},
	
		annotateAccount: function (account, templates) {
			// net effect is totally stitched together acct+template obj,
			// where template props override acct props at both the top level
			// and per-capability
			// (but extra acct props are still present in case accounts need to store supplemental data)

			if (this.templates)
				templates = this.templates;
			var result,
				phoneNumber,
				usernameTemplate,
			    template = getTemplateById(templates, account.templateId);

			result = enyo.clone(account);

			if (!template) {
				console.warn("annotateAccount: template not found: " + account.templateId);
				return result;
			}

			enyo.mixin(result, template);

			// copy the capability providers from the template
			result.capabilityProviders = account.capabilityProviders.map(function (c) {
				var clone = enyo.clone(c), tmplCap;
				
				// Find the capability in the template
				for (var i=0, l=template.capabilityProviders.length; i<l; i++) {
					if (template.capabilityProviders[i].id === c.id) {
						tmplCap = template.capabilityProviders[i];
						break;
					}
				}    

				if (!tmplCap) {
					console.warn("annotateAccount: capability not found: " + c.id + " for template: " + template.templateId);
					return clone;
				}

				return enyo.mixin(clone, tmplCap);
			});
			
			if (account.templateId === "com.palm.sim" && result.username && result.username.indexOf("SIMREMOVED ") === 0) {
				phoneNumber = result.username.substring(11);
				if (phoneNumber) {
					usernameTemplate = new Globalization.Format.Template(RB.$L("#{phoneNumber} - SIM Removed"));
					result.username = usernameTemplate.evaluate({ phoneNumber: phoneNumber });
				}
			}

			return result;
		},
		
		getCapabilityText: function (rawName) {
			var c, json, text, i;
			
			console.log("getCapabilityText: not yet implemented");
			return rawName;
			
/*			if (!capabilityMetadata) {
				json = RB.getLocalizedResource("javascript/capabilities.json");
				if (json) {
					capabilityMetadata = JSON.parse(json);
				} else {
					console.warn("AccountsUtil.getCapabilityText: could not load capabilities.json");
					return "";	// why can't we find it?
				}
			}
			
			text = rawName;
			for (i = 0; i < capabilityMetadata.length; i += 1) {
				c = capabilityMetadata[i];
				if (c.capability === rawName) {
					text = c.loc_name;
				}
			}
			return text;*/
		},
		
		
		// Dedupe an array, based on the specifies property.  The array passed in is modified by this call.
		dedupeByProperty: function (items, idProp) {
			var hash = {};
			
			console.log("dedupeByProperty: BEFORE array items: " + items.length);
			for (var i=0, l=items.length; i<l; i++) {
//				console.log("dedupeByProperty: looking at id = : " + items[i][idProp]);
				if (hash[items[i][idProp]] === undefined) {
					hash[items[i][idProp]] = 1;
//					console.log("dedupeByProperty: " + items[i][idProp] + " is unique");
				}
				else {
					items.splice(i, 1);
					i--; l--;
				}
			}
			console.log("dedupeByProperty: AFTER array items: " + items.length);
		}
		
	};
}());

