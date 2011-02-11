/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.WebOsPalmServiceBridge",
	kind: enyo.Component,
	events: {
		onData: ""
	},
	statics: {
		// device id to connect to (null == default)
		deviceId: null,
		// application id sent to luna-send for determining permissions
		spoofId: "com.palm.configurator"
	},
	create: function() {
		this.inherited(arguments);
		this.createCallbacks();
	},
	destroy: function() {
		if (this.connection) {
			this.connection.disconnect();
		}
		this.destroyCallbacks();
		delete this.connection;
	},
	cancel: function() {
		this.destroy();
	},
	createCallbacks: function() {
		this.gotDataFnName = this.id + "_gotData";
		window[this.gotDataFnName] = enyo.bind(this, "gotData");
		this.disconnectFnName = this.id + "_gotDisconnect";
		window[this.disconnectFnName] = enyo.bind(this, "gotDisconnect");
	},
	destroyCallbacks: function() {
		delete window[this.gotDataFnName];
		delete window[this.disconnectFnName];
	},
	webOsConnect: function() {
		// FIXME: singleton pattern should be implemented in webosConnect
		return enyo.WebOsPalmServiceBridge.webosConnect || (enyo.WebOsPalmServiceBridge.webosConnect = enyo.create({kind: "WebosConnect"}));
	},
	call: function(inUrl, inJson) {
		var command = "/usr/bin/luna-send";
		command += " -a " + enyo.WebOsPalmServiceBridge.spoofId;
		command += " -i";
		command += " " + inUrl + " " + inJson;
		this.log(command);
		this.execute(command);
	},
	execute: function(inCommand) {
		this.data = '';
		this.connection = this.webOsConnect().execute(enyo.WebOsPalmServiceBridge.deviceId, inCommand, this.gotDataFnName, this.disconnectFnName);
	},
	gotData: function(inResponse) {
		this.data += inResponse;
		if (inResponse.charCodeAt(inResponse.length-1) == 10) {
			this.doData(this.data);
			this.data = '';
		}
	},
	gotDisconnect: function() {
	}
});

enyo.kind({
	name: "enyo.PalmService.WebosRequest",
	kind: enyo.PalmService.Request,
	createBridge: function() {
		this.bridge = new enyo.WebOsPalmServiceBridge({owner: this, onData: "webosData"});
	},
	webosData: function(inSender, inResponse) {
		this.receive(inResponse);
	}
});

if (!window.PalmSystem) {
	enyo.PalmService.prototype.requestKind = "PalmService.WebosRequest";
	enyo.DbService.prototype.requestKind = "PalmService.WebosRequest";
}