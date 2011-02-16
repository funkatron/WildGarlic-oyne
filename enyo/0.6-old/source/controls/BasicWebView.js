/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// FIXME: experimental, NOT currently used
// in case we need to do weighted average 
// for gestures like enyo1 does
enyo.weightedAverage = {
	data: {},
	count: 4,
	weights: [1, 2, 4, 8],
	compute: function(inValue, inKind) {
		if (!this.data[inKind]) {
			this.data[inKind] = [];
		}
		var cache = this.data[inKind];
		cache.push(inValue);
		if (cache.length > this.count) {
			cache.shift();
		}
		for (var i=0, d=0, o=0, c, w; (c=cache[i]) && (w=this.weights[i]); i++) {
			o += c * w;
			d += w
		}
		d = d || 1;
		o = o / d;
		return o;
	},
	clear: function(inKind) {
		this.data[inKind] = [];
	}
};

enyo.sizeableMixin = {
	zoom: 1,
	// note: we assume minZoom and maxZoom are defined
	centeredZoomStart: function(e) {
		// FIXME: this should be offset in the current scroller only.
		var n = enyo.dom.fetchNodeOffset(this.node);
		//var n = this.node;
		var s = this.fetchScrollPosition();
		this._zoomStart = {
			scale: e.scale,
			centerX: e.centerX,
			centerY: e.centerY,
			scrollX: s.l,
			scrollY: s.t,
			offsetTop: n.offsetTop,
			offsetLeft: n.offsetLeft,
			zoom: this.zoom
		}
	},
	centeredZoomChange: function(e) {
		var gs = this._zoomStart;
		// FIXME: fill in defaults in case we don't get a full event
		// for usage in smartZoom when only need scaling
		// what factoring does this suggest?
		e.scale = e.scale || gs.scale;
		e.centerX = e.centerX || gs.centerX;
		e.centerY = e.centerY || gs.centerY;

		// round to two decimal places to reduce jitter
		var ds = Math.round(e.scale * 100) / 100;
		// note: zoom by the initial gesture zoom multiplied by scale;
		// this ensures we zoom enough to not be annoying.
		var z = gs.zoom * ds;
		// if scales beyond max zoom, disallow scaling so we simply pan
		// and set scale to total amount we have scaled since start
		if (z > this.maxZoom) {
			ds = this.maxZoom / gs.zoom;
		}

		/*
		this.log("e", e.centerX, e.centerY, e.scale,
				"s", gs.centerX, gs.centerY, gs.scale,
				"scroll", gs.scrollX, gs.scrollY,
				"offset", gs.offsetLeft, gs.offsetTop);
		*/

		// this is the offset after scaling
		var x = (ds - 1) * gs.centerX;
		// add the scaled scroll offset
		x += ds * gs.scrollX;
		// now account for the moving center
		x += ds * (gs.centerX - e.centerX);
		// do the y direction
		var y = (ds - 1) * gs.centerY + ds * gs.scrollY
			+ ds * (gs.centerY - e.centerY);

		//this.log(ds, z, x, y);
		return {zoom: z, x: x, y: y};
	},
	resetZoom: function() {
		// reset zoom to its original value.
		// assume subclass has implemented setZoom
		this.setZoom(this.minZoom);
	},
	// FIXME: need to determine how to interact with scroller
	// NOTE: we could have a scroller with a client area and the webview below
	// but we might want controls above and below webview inside the scroller
	findScroller: function() {
		if (this._scroller) {
			return this._scroller;
		}
		var n = this.hasNode(), c;
		while (n) {
			c = enyo.$[n.id];
			if (c && c instanceof enyo.BasicScroller) {
				return this._scroller = c;
			}
			n = n.parentNode;
		}
	},
	fetchScrollPosition: function() {
		var p = {t: 0, l: 0};
		var s = this.findScroller();
		if (s) {
			p.l = s.getScrollLeft();
			p.t = s.getScrollTop();
		}
		return p;
	},
	setScrollPosition: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.setScrollTop(inY);
			s.setScrollLeft(inX);
		}
	},
	setScrollPositionDirect: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.scrollLeft = inX;
			s.scrollTop = inY;
			s.effectScroll();
		}
	}
}

//* @public
enyo.kind({
	name: "enyo.BasicWebView",
	kind: enyo.Control,
	//* @protected
	mixins: [
		enyo.sizeableMixin
	],
	//* @public
	published: {
		// NOTE: WebView does not appear to load relative url's.
		url: "",
		minFontSize: 16,
		autoFit: false,
		fitRender: false,
		zoom: 1,
		enableJavascript: true,
		blockPopups: true,
		acceptCookies: true
	},
	domAttributes: {
		"enyo-pass-events": true
	},
	minZoom: 1,
	maxZoom: 4,
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
	//* @protected
	lastUrl: "",
	//style: "border: 2px solid red;",
	nodeTag: "object",
	chrome: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimation", onEnd: "endAnimation"},
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.history = [];
		this.callQueue = [];
		this.gestureEvent = {};

		this.domAttributes.type = "application/x-palm-browser";

		// set the viewport dimensions
		var w = enyo.fetchControlSize(this).w;
		var h = enyo.fetchControlSize(this).h;
		this.setAttribute("viewportwidth", w);
		this.setAttribute("viewportheight", h);
	},
	destroy: function() {
		this.callQueue = null;
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.node.eventListener = this;
			// FIXME: determine how best to interact with scroller;
			// here we just find the scroller containing us.
			this.history = [];
			this.callQueue = [];
			this.lastUrl = "";
			this._viewInited = false;
			// NOTE: this will fail if node is hidden; in which case
			// we rely on the adapterInitialized adapter callback
			this.initView();
		}
	},
	// FIXME: we cannot rely on adapterInitialized 
	// so this is another potential check to see if the adapter is ready
	hasView: function() {
		return this.hasNode() && this.node.openURL;
	},
	// (browser adapter callback) we only get this if the view is initially hidden
	adapterInitialized: function() {
		this.log("adapterInitialized");
		this.initView();
		this.flushCallQueue();
	},
	initView: function() {
		if (this.hasView() && !this._viewInited) {
			this.cacheBoxSize();
			this.node.setPageIdentifier(this.id);
			this.node.interrogateClicks(false);
			this.node.setShowClickedLink(true);
			this.activate();
			this.blockPopupsChanged();
			this.acceptCookiesChanged();
			this.enableJavascriptChanged();
			this.updateViewportSize();
			this.fitRenderChanged();
			this.urlChanged();
			this.minFontSizeChanged();
			this._viewInited = true;
			
		}
	},
	//* @public
	// NOTE: to be called manually when browser should be resized.
	resize: function() {
		var s = enyo.fetchControlSize(this);
		if (this._boxSize && (this._boxSize.w != s.w)) {
			// adjust the zoom level based on sizing change
			var zd = s.w / this._boxSize.w;
			this.cacheBoxSize();
			this.minZoom = this.calcMinZoom();
			this.setZoom(zd * this.zoom);
			// since all the zooms are wrong, just clear history
			this.clearHistory();
			if (!this.fitRender) {
				// maintain the scroll position
				var p = this.fetchScrollPosition();
				this.setScrollPositionDirect(zd * p.l, zd * p.t);
				// FIXME sync up the scroll position with the scroller
				this.setScrollPosition(zd * p.l, zd * p.t);
			}
			this.fitRenderChanged();
			this.updateViewportSize();
		}
	},
	//* @protected
	// save our current containing box size;
	// we use this to determine if we need to resize
	cacheBoxSize: function() {
		this._boxSize = enyo.fetchControlSize(this);
	},
	// FIXME: apparently only one webview can be connected to the browser server at a time.
	// so this should be called when the webview should be active; for example
	// when a card comes into focus
	// should we automate this?
	//* @public
	activate: function() {
		this.callBrowserAdapter("connectBrowserServer");
		this.callBrowserAdapter("pageFocused", [true]);
	},
	//* @protected
	// this tells the adapter how big the plugin is.
	updateViewportSize: function() {
		var b = this._boxSize;
		b.h = Math.min(window.innerHeight, b.h);
		this.callBrowserAdapter("setViewportSize", [b.w, b.h]);
	},
	urlChanged: function() {
		if (this.url) {
			this.callBrowserAdapter("openURL", [this.url]);
			this.log(this.url);
		}
	},
	minFontSizeChanged: function() {
		this.callBrowserAdapter("setMinFontSize", [Number(this.minFontSize)]);
	},
	// fits the rendering width to the control width
	fitRenderChanged: function() {
		if (this.fitRender) {
			var w = enyo.fetchControlSize(this).w;
			this.callBrowserAdapter("setDefaultLayoutWidth", [w]);
		} else {
			this.callBrowserAdapter("setDefaultLayoutWidth", [960]);
		}
	},
	gesturestartHandler: function(inSender, inEvent) {
		// capture events so we get all the gesture events even if the
		// WebView moved away
		enyo.dispatcher.capture(this);
		this.callBrowserAdapter("enableFastScaling", [true]);
		this.centeredZoomStart(inEvent);
	},
	gesturechangeHandler: function(inSender, inEvent) {
		// stop event to prevent scrolling
		enyo.stopEvent(inEvent);
		var gi = this.centeredZoomChange(inEvent);
		this.setZoom(gi.zoom);

		// FIXME: this special function sets the scroll position directly
		if (gi.zoom == this.getZoom()) {
			this.setScrollPositionDirect(gi.x, gi.y);
		}
	},
	gestureendHandler: function(inSender, inEvent) {
		enyo.dispatcher.release(this);

		// FIXME: allow the scroller to fix up the scroll position
		var p = this.fetchScrollPosition();
		this.setScrollPosition(p.l, p.t);
		this.callBrowserAdapter("enableFastScaling", [false]);
	},
	zoomChanged: function(inOldZoom) {
		if (!(this._pageWidth && this._pageHeight)) {
			return;
		}
		this.zoom = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));
		var w = Math.round(this.zoom * this._pageWidth);
		var h = Math.round(this.zoom * this._pageHeight);
		this.applyStyle("width", w + "px");
		this.applyStyle("height", h + "px");

		// FIXME: notify scroller of the size change
		var s = this.findScroller();
		if (s) {
			s.calcBoundaries();
		}
	},
	fetchDefaultZoom: function() {
		return this.autoFit ? this.minZoom : 1;
	},
	calcMinZoom: function() {
		return this._boxSize.w / this._pageWidth;
	},
	// NOTE: double click causes browser to animate zooming in to a specific page location or 
	// back out to default
	// browser adapter tells us a rect into which to zoom, but the animated zooming is handled here.
	dblclickHandler: function(inSender, e) {
		var o = enyo.dom.fetchNodeOffset(this.node);
		// FIXME: remove comments pending testing... changed based on update to fetchNodeOffset
		// to accomodate acceleration.
		//var s = this.fetchScrollPosition();
		//var x = e.clientX - o.left - s.l;
		//var y = e.clientY - o.top - s.t;
		var x = e.clientX - o.offsetLeft;
		var y = e.clientY - o.offsetTop;
		this.callBrowserAdapter("smartZoom", [x, y]);
	},
	// (browser adapter callback) after smartZoom is called
	// FIXME smart zoom doesn't look good because we're animating the scale,
	// while what we really want is to animate zooming from a box to a
	// different box
	smartZoomAreaFound: function(left, top, right, bottom, centerX, centerY, spotlightHandle) {
		this.log(left, top, right, bottom, centerX, centerY, spotlightHandle);
		var scale = this._boxSize.w / (right - left);
		if (scale == this.zoom) {
			// zoom back to default
			scale = this.fetchDefaultZoom();
			// restore x position to 0
			this.smartZoomRespLeft = 0;
		} else {
			this.smartZoomRespLeft = left;
		}
		this.smartZoomRespCenterY = centerY;

		this.callBrowserAdapter("enableFastScaling", [true]);
		this.$.animator.play(this.zoom, scale);
	},
	stepAnimation: function(inSender, inValue) {
		this.setZoom(inValue);
		// scroll x to left that is scaled smart zoom left
		var x = Math.floor(this.smartZoomRespLeft * inValue);
		// scroll y to center of click minus half our viewport size center
		// the clicked spot
		var y = Math.floor(this.smartZoomRespCenterY * inValue - this._boxSize.h / 2);
		// do not allow overscroll
		x = Math.max(0, x);
		y = Math.max(0, y);

		this.setScrollPositionDirect(x, y);
	},
	endAnimation: function() {
		this.callBrowserAdapter("enableFastScaling", [false]);
	},
	enableJavascriptChanged: function() {
		this.callBrowserAdapter("setEnableJavaScript", [this.enableJavascript]);
	},
	blockPopupsChanged: function() {
		this.callBrowserAdapter("setBlockPopups", [this.blockPopups]);
	},
	acceptCookiesChanged: function() {
		this.callBrowserAdapter("setAcceptCookies", [this.acceptCookies]);
	},
	//* @public
	clearHistory: function() {
		this.callBrowserAdapter("clearHistory");
		this.history = {};
	},
	//* @protected
	cutHandler: function() {
		this.callBrowserAdapter("cut");
	},
	copyHandler: function() {
		this.callBrowserAdapter("copy");
	},
	pasteHandler: function() {
		this.callBrowserAdapter("paste");
	},
	selectAllHandler: function() {
		this.callBrowserAdapter("selectAll");
	},
	// stores zoom, scroll info in a history cache for a page being unloaded 
	storeToHistory: function() {
		var url = this.lastUrl;
		//this.log(url, this.zoom);
		if (url) {
			var history = this.fetchScrollPosition();
			history.zoom = this.zoom;
			this.history[url] = history;
			//this.log(enyo.json.to(this.history[url]));
		}
	},
	// restores zoom, scroll info from the history cache for a page
	// currently being loaded
	restoreFromHistory: function() {
		var history = this.fetchScrollPosition();
		history.zoom = this.fetchDefaultZoom();
		history = enyo.mixin(history, this.history[this.url]);
		//this.log(this.url, h.zoom);
		this.setZoom(history.zoom);
		if (this._scroller) {
			this._scroller.setScrollTop(history.t);
		}
	},
	// user chooses an item from a list
	listSelect: function(inSender, inSelected, inOldItem) {
		var resp = inSender.getItems().indexOf(inSelected.value);
		this.callBrowserAdapter("selectPopupMenuItem", [this.listId, resp]);
	},
	// attempt to call a method on the browser adapter; if the adapter is not
	// ready the call will be added to the callQueue, and start polling for
	// adapter ready.
	//* @public
	callBrowserAdapter: function(inFuncName, inArgs) {
		if (this.hasNode() && this.node[inFuncName]) {
			this.log(inFuncName);
			this.node[inFuncName].apply(this.node, inArgs);
		} else {
			this.log("queued!", inFuncName);
			this.callQueue.push({name: inFuncName, args: inArgs})
		}
	},
	//* @protected
	flushCallQueue: function() {
		this.log(this.callQueue.length, "view?", this.hasView());
		if (this.callQueue.length > 0) {
			if (this.hasView()) {
				var l = this.callQueue.length;
				for (var i=0, q; i<l; i++) {
					q = this.callQueue.shift();
					this.callBrowserAdapter(q.name, q.args);
				}
			} else {
				setTimeout(enyo.hitch(this, "flushCallQueue"), 100);
			}
		}
	},
	// (browser adapter callback): tells the page dimensions in pixels:
	// * pages with explicit dimensions or a view meta tag report size
	// based on that
	// * pages without explicit dimensions render at either 960px width or 
	// the width specified in the virtualPageWidth attribute *when* the
	// adapter node is rendered.
	pageDimensionsChanged: function(width, height) {
		// FIXME: we get a spurious call with 0, 0 which we can just ignore
		if (width == 0 && height == 0) {
			return;
		}
		this.log(width, height);
		// NOTE: setting node width/height to values other than those
		// reported scales the view display (smaller than actual makes the
		// display smaller, larger than actual makes it larger)
		this._pageWidth = width;
		this._pageHeight = height;
		//
		this.minZoom = this.calcMinZoom();
		this.setZoom(this.fetchDefaultZoom());
	},
	// (browser adapter callback) called to scroll the page
	scrollPositionChanged: function(inLeft, inTop) {
		this.setScrollPosition(inLeft, inTop);
	},
	// (browser adapter callback) reports page url, title and if it's possible
	// to go back/forward
	urlTitleChanged: function(inUrl, inTitle, inCanGoBack, inCanGoForward) {
		this.lastUrl = this.url;
		this.url = inUrl;
		this.doPageTitleChanged(inTitle, inUrl, inCanGoBack, inCanGoForward);
	},
	// (browser adapter callback) used to store history and generate event
	loadStarted: function() {
		this.log();
		this.storeToHistory();
		this.doLoadStarted();
	},
	// (browser adapter callback) generates event that can be used to show
	// load progress
	loadProgressChanged: function(inProgress) {
		this.doLoadProgress(inProgress);
	},
	// (browser adapter callback) used to restore history and generate event
	loadStopped: function() {
		this.log();
		this.restoreFromHistory();
		this.doLoadStopped();
	},
	// (browser adapter callback) generates event
	documentLoadFinished: function() {
		this.doLoadComplete();
		this.log();
	},
	// (browser adapter callback) generates event
	mainDocumentLoadFailed: function(domain, errorCode, failingURL, localizedMessage) {
		this.doError(errorCode, localizedMessage + ": " + failingURL);
	},
	// (browser adapter callback) ?
	linkClicked : function(url) {
		//this.log(url);
	},
	// (browser adapter callback) called when loading a URL that should
	// be redirected
	urlRedirected: function(inUrl, inCookie) {
		this.doUrlRedirected(inUrl, inCookie);
	},
	// working
	updateGlobalHistory: function(url, reload) {
		//this.log(url);
	},
	// working
	firstPaintCompleted: function() {
		//this.log();
	},
	// working 
	// note: appears to exist solely so that an event can be simulated on
	// the webview for the user to respond to
	editorFocused: function(inFocused) {
		//this.log();
	},
	// (browser adapter callback) called to open a list selector
	// Only one can be open at a time.
	showListSelector: function(inId, inItemsJson) {
		this.listId = inId;

		if (this.listPopup == null) {
			var popup = this.createComponent({
					kind: "PopupSelect",
					onSelect: "listSelect"});

			// popup will render in our manager
			if (this.owner instanceof enyo.Control) {
				popup.setParent(this.owner);
			}

			this.listPopup = popup;
		}

		// populate the popup with items
		this.listItems = [];
		var items = enyo.json.from(inItemsJson);
		for (var i = 0, c; c = items.items[i]; i++) {
			if (c.isEnabled) {
				this.listItems.push(c.text)
			}
		}
		this.listPopup.setItems(this.listItems);
		this.listPopup.render();
		this.listPopup.openAtCenter();
	},
	// (browser adapter callback) called to close a list selector
	// gets called after we send a response, so no need to do anything
	// hideListSelector: function(inId) {
	// },
	// (browser adapter callback) called to open an alert dialog
	dialogAlert: function(inMsg) {
		this.doAlertDialog(inMsg);
	},
	// (browser adapter callback) called to open a confirm dialog
	dialogConfirm: function(inMsg) {
		this.doConfirmDialog(inMsg);
	},
	// (browser adapter callback) called to open a prompt dialog
	dialogPrompt: function(inMsg, inDefaultValue) {
		this.doPromptDialog(inMsg, inDefaultValue);
	},
	// (browser adapter callback) called to open a SSL confirm dialog
	dialogSSLConfirm: function(inHost, inCode) {
		this.doSSLConfirmDialog(inHost, inCode);
	},
	// (browser adapter callback) called to open a user/password dialog
	dialogUserPassword: function(inMsg) {
		this.doUserPasswordDialog(inMsg);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeNotSupported: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeHandoffUrl: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	eventFired: function(inEvent, inTapInfo) {
		this.log(inEvent.pageX, inEvent.pageY, inTapInfo.element);
		var s = this.fetchScrollPosition();
		var p = {
			l: this.getZoom() * inEvent.pageX - s.l,
			t: this.getZoom() * inEvent.pageY - s.t
		};
		return this.doSingleTap(p, inEvent, inTapInfo);
	},
	// renamed browser adapter callbacks:
	// (browser adapter callback) renamed to showListSelector
	showPopupMenu: function(inId, inItemsJson) {
		this.showListSelector(inId, inItemsJson);
	},
	// (browser adapter callback) renamed to documentLoadFinished
	didFinishDocumentLoad: function() {
		this.documentLoadFinished();
	},
	// (browser adapter callback) renamed to loadFailed
	failedLoad: function(domain, errorCode, failingURL, localizedMessage) {
	},
	// (browser adapter callback) renamed to mainDocumentLoadFailed
	setMainDocumentError: function(domain, errorCode, failingURL, localizedMessage) {
		this.mainDocumentLoadFailed(domain, errorCode, failingURL, localizedMessage);
	},
	// (browser adapter callback) renamed to firstPaintCompleted
	firstPaintComplete: function() {
		this.firstPaintCompleted();
	},
	// (browser adapter callback) renamed to loadProgressChanged
	loadProgress: function(inProgress) {
		this.loadProgressChanged(inProgress);
	},
	// (browser adapter callback) renamed to pageDimensionsChanged
	pageDimensions: function(width, height) {
		this.pageDimensionsChanged(width, height);
	},
	// (browser adapter callback) renamed to smartZoomAreaFound
	smartZoomCalculateResponseSimple: function(left, top, right, bottom, centerX, centerY, spotlightHandle) {
		this.smartZoomAreaFound(left, top, right, bottom, centerX, centerY, spotlightHandle);
	},
	// (browser adapter callback) renamed to urlTitleChanged
	titleURLChange: function(inTitle, inUrl, inCanGoBack, inCanGoForward) {
		this.urlTitleChanged(inUrl, inTitle, inCanGoBack, inCanGoForward);
	},
	// unused browser adapter callbacks:
	// (browser adapter callback) not working
	urlChange: function(inUrl, inCanGoBack, inCanGoForward) {
		this.url = inUrl;
		//this.log(inUrl);
	},
});
