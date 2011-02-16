/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that shows web content.

	{kind: "WebView"}

The URL to load can be specified when declaring the instance, or by calling setUrl.

	{kind: "WebView", url: "http://www.google.com"}

	goToUrl: function(inUrl) {
		this.$.webview.setUrl(inUrl);
	}
*/
enyo.kind({
	name: "enyo.WebView",
	kind: enyo.Control,
	forward: {
		url: "view",
		minFontSize: "view",
		autoFit: "view",
		fitRender: "view",
		zoom: "view",
		enableJavascript: "view",
		blockPopups: "view",
		acceptCookies: "view"
	},
	events: {
		onPageTitleChanged: "",
		onUrlRedirected: "",
		onSingleTap: "",
		onLoadStarted: "",
		onLoadProgress: "",
		onLoadStopped: "",
		onLoadComplete: "",
		onFileLoad: "",
		onAlertDialog: "",
		onConfirmDialog: "",
		onPromptDialog: "",
		onSSLConfirmDialog: "",
		onUserPasswordDialog: "",
		onError: ""
	},
	chrome: [
		{name: "view", kind: enyo.BasicWebView,
			onPageTitleChanged: "doPageTitleChanged",
			onUrlRedirected: "doUrlRedirected",
			onSingleTap: "doSingleTap",
			onLoadStarted: "doLoadStarted",
			onLoadProgress: "doLoadProgress",
			onLoadStopped: "doLoadStopped",
			onLoadComplete: "doLoadComplete",
			onFileLoad: "doFileLoad",
			onAlertDialog: "doAlertDialog",
			onConfirmDialog: "doConfirmDialog",
			onPromptDialog: "doPromptDialog",
			onSSLConfirmDialog: "doSSLConfirmDialog",
			onUserPasswordDialog: "doUserPasswordDialog",
			onError: "doError"
		}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.$.view.setUrl(this.url);
		this.$.view.setMinFontSize(this.minFontSize);
		this.$.view.setAutoFit(this.autoFit);
		this.$.view.setFitRender(this.fitRender);
		this.$.view.setZoom(this.zoom);
		this.$.view.setEnableJavascript(this.enableJavascript);
		this.$.view.setBlockPopups(this.blockPopups);
		this.$.view.setAcceptCookies(this.acceptCookies);
	},
	//* @public
	activate: function() {
		this.$.view.activate();
	},
	resize: function() {
		this.$.view.resize();
	},
	deferSetUrl: function(inUrl) {
		this.log(inUrl);
		this.$.view.setUrl(inUrl);
	},
	getHistoryState: function(inCallback) {
		this.$.view.getHistoryState(inCallback);
	},
	goBack: function() {
		this.$.view.callBrowserAdapter("goBack");
	},
	goForward: function() {
		this.$.view.callBrowserAdapter("goForward");
	},
	reloadPage: function() {
		this.$.view.callBrowserAdapter("reloadPage");
	},
	stopLoad: function() {
		this.$.view.callBrowserAdapter("stopLoad");
	},
	clearHistory: function() {
		this.$.view.clearHistory();
	},
	clearCookies: function() {
		this.$.view.callBrowserAdapter("clearCookies");
	},
	clearCache: function() {
		this.$.view.callBrowserAdapter("clearCache");
	},
	acceptDialog: function() {
		var args = [].slice.call(arguments);
		args.unshift("1");
		this.$.view.callBrowserAdapter("sendDialogResponse", args);
	},
	cancelDialog: function() {
		this.$.view.callBrowserAdapter("sendDialogResponse", ["0"]);
	},
	sendDialogResponse: function(inResponse) {
		this.$.view.callBrowserAdapter("sendDialogResponse", [inResponse]);
	},
	saveImageAtPoint: function(inLeft, inTop, inDirectory, inCallback) {
		this.$.view.callBrowserAdapter("saveImageAtPoint", [inLeft, inTop, inDirectory, inCallback]);
	},
	saveViewToFile: function(inPath, inLeft, inTop, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("saveViewToFile", [inPath, inLeft, inTop, inWidth, inHeight]);
	},
	generateIconFromFile: function(inPath, inIconPath, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("generateIconFromFile", [inPath, inIconPath, inWidth, inHeight]);
	},
	resizeImage: function(inFromPath, inToPath, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("resizeImage", [inFromPath, inToPath, inWidth, inHeight]);
	},
	deleteImage: function(inPath) {
		this.$.view.callBrowserAdapter("deleteImage", [inPath]);
	},
	redirectUrl: function(inRegex, inCookie, inEnable) {
		this.$.view.callBrowserAdapter("addUrlRedirect", [inRegex, inEnable, inCookie, 0]);
	},
	setHTML: function(inUrl, inBody) {
		this.$.view.callBrowserAdapter("setHTML", [inUrl, inBody]);
	},
	//* @protected
	callBrowserAdapter: function(inFuncName, inArgs) {
		this.$.view.callBrowserAdapter(inFuncName, inArgs);
	}
});

/*
On non-PalmSystem platforms, revert WebView to be an Iframe.
This allows basic use of WebView in a desktop browser.
*/
if (!window.PalmSystem) {
	enyo.WebView = enyo.Iframe;
}
