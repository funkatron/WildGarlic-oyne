/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
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
	published: {
		identifier: "",
		url: "",
		minFontSize: 16,
		autoFit: true,
		fitRender: false,
		enableJavascript: true,
		blockPopups: true,
		acceptCookies: true,
		redirects: [],
		accelerated: true,
		frameworkClick: false
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
		onNewPage: "",
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
			onNewPage: "doNewPage",
			onError: "doError"
		}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.identifierChanged();
		this.urlChanged();
		this.minFontSizeChanged();
		this.autoFitChanged();
		this.fitRenderChanged();
		this.enableJavascriptChanged();
		this.blockPopupsChanged();
		this.acceptCookiesChanged();
		this.acceleratedChanged();
		this.frameworkClickChanged();
	},
	identifierChanged: function() {
		this.$.view.setIdentifier(this.identifier);
	},
	urlChanged: function(inOldUrl) {
		this.$.view.setUrl(this.url);
	},
	minFontSizeChanged: function() {
		this.$.view.setMinFontSize(this.minFontSize);
	},
	autoFitChanged: function() {
		this.$.view.setAutoFit(this.autoFit);
	},
	fitRenderChanged: function() {
		this.$.view.setFitRender(this.fitRender);
	},
	enableJavascriptChanged: function() {
		this.$.view.setEnableJavascript(this.enableJavascript);
	},
	blockPopupsChanged: function() {
		this.$.view.setBlockPopups(this.blockPopups);
	},
	acceptCookiesChanged: function() {
		this.$.view.setAcceptCookies(this.acceptCookies);
	},
	redirectsChanged: function(inOldRedirects) {
		this.$.view.setRedirects(this.redirects);
	},
	acceleratedChanged: function() {
		this.$.view.setAccelerated(this.accelerated);
	},
	frameworkClickChanged: function() {
		this.log(this.frameworkClick);
		this.$.view.setFrameworkClick(this.frameworkClick);
	},
	//* @public
	activate: function() {
		this.$.view.callBrowserAdapter("pageFocused", [true]);
	},
	deactivate: function() {
		this.$.view.callBrowserAdapter("pageFocused", [false]);
	},
	resize: function() {
		this.$.view.resize();
	},
	deferSetUrl: function(inUrl) {
		this.setUrl(inUrl);
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
	generateIconFromFile: function(inPath, inIconPath, inLeft, inTop, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("generateIconFromFile", [inPath, inIconPath, inLeft, inTop, inWidth, inHeight]);
	},
	resizeImage: function(inFromPath, inToPath, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("resizeImage", [inFromPath, inToPath, inWidth, inHeight]);
	},
	deleteImage: function(inPath) {
		this.$.view.callBrowserAdapter("deleteImage", [inPath]);
	},
	//* XXX removeme
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
