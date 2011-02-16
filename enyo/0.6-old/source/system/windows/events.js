/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/**
	events: 
	* windowActivated
	* windowDeactivated
	* windowParamsChange
	* applicationRelaunch
*/
enyo.windows.events = {
	dispatchEvent: function(inWindow, inParams) {
		//console.log("enyo.windows.dispatchEvent: " + inWindow.name + ", " + inParams.type);
		inWindow.enyo.dispatch(inParams);
	},
	handleAppMenu: function(inWindowParams) {
		var w = enyo.windows.getActiveWindow();
		if (w && inWindowParams["palm-command"] == "open-app-menu") {
			if (w.enyo) {
				w.enyo.appMenu.toggle();
				return true;
			}
		}
	},
	handleActivated: function() {
		enyo.windows.manager.recordActiveWindow(window.name);
		this.dispatchEvent(window, {type: "windowActivated"});
	},
	handleDeactivated: function() {
		// make sure app menu is closed when window is deactivated.
		enyo.appMenu.close();
		enyo.windows.manager.recordActiveWindow(null);
		this.dispatchEvent(window, {type: "windowDeactivated"});
	},
	handleRelaunch: function() {
		var root = enyo.windows.getRootWindow();
		var lp = PalmSystem.launchParams;
		lp = lp && enyo.json.from(lp);
		if (!this.handleAppMenu(lp)) {
			enyo.windows.setWindowParams(root, lp);
			// FIXME: sysmgr is not focusing the app on relaunch so force it
			return this.dispatchApplicationRelaunch(root);
		}
	},
	dispatchWindowParamsChange: function(inWindow) {
		var params = inWindow.enyo.windowParams;
		var m = "windowParamsChange";
		var fn = m + "Handler";
		this.dispatchEvent(inWindow, {type: m, params: params});
		enyo.call(inWindow.enyo, fn, [params]);
	},
	dispatchApplicationRelaunch: function(inWindow) {
		var params = inWindow.enyo.windowParams;
		var m = "applicationRelaunch";
		var fn = m + "Handler";
		var a = this.dispatchEvent(inWindow, {type: m, params: params});
		var b = enyo.call(inWindow.enyo, fn, [params]);
		var c = enyo.call(enyo.application, fn, [params]);
		return a || b || c;
	}
};

//* @protected
// LunaSysMgr calls use Mojo namespace atm
Mojo = window.Mojo || {};

// LunaSysMgr calls this when the windows is maximized or opened.
Mojo.stageActivated = function() {
	enyo.windows.events.handleActivated();
};

// LunaSysMgr calls this when the windows is minimized or closed.
Mojo.stageDeactivated = function() {
	enyo.windows.events.handleDeactivated();
};

// LunaSysMgr calls this whenever an app is "launched;" 
Mojo.relaunch = function() {
	// need to return true to tell sysmgr the relaunch succeeded.
	// otherwise, it'll try to focus the app, which will focus the first
	// opened window of an app with multiple windows.
	return enyo.windows.events.handleRelaunch();
};
