/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/**
	Implements interacting with windows
*/
enyo.windows.agent = {
	open: function(inOpener, inUrl, inName, inAttributes, inWindowInfo) {
		var url = this.makeAbsoluteUrl(window, inUrl);
		var a = inAttributes && enyo.isString(inAttributes) ? inAttributes : enyo.json.stringify(inAttributes);
		var a = "attributes=" + a;
		var i = inWindowInfo ? inWindowInfo + ", " : ""; 
		return inOpener.open(inUrl, inName, i + a);
	},
	activate: function(inWindow) {
		if (inWindow.PalmSystem) {
			inWindow.PalmSystem.activate();
		}
	},
	deactivate: function(inWindow) {
		inWindow.PalmSystem && inWindow.PalmSystem.deactivate();
	},
	addBannerMessage: function() {
		PalmSystem.addBannerMessage.apply(PalmSystem, arguments);
	},
	removeBannerMessage: function(inId) {
		PalmSystem.removeBannerMessage.apply(removeBannerMessage, arguments);
	},
	// NOTE: If inUrl does not begin with '/' or 'file://', it's assumed to be a path relative to location of inWindow.
	makeAbsoluteUrl: function(inWindow, inUrl) {
		if (inUrl.slice(0, 7) == 'file://') {
			return inUrl; // already absolute.
		} else if (inUrl[0] === '/') {
			return "file://"+inUrl; // already absolute path, just add local file protocol.
		} else {
			var parts = inWindow.location.href.split("/");
			parts.pop();
			parts.push(inUrl);
			return parts.join("/");
		}
	}
}
