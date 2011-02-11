/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/** @protected Manages contents of a standard dashboard window.*/
enyo.kind({
	name: "enyo.DashboardContent",
	kind: enyo.Control,
	className: "dashboard-notification-module",
	components: [
		
		{name: 'topSwipeable', kind:"enyo.SwipeableItem2", layoutKind: "HFlexLayout", confirmRequired:false, onConfirm: "dbSwiped", components: [ 
			{ className:'palm-dashboard-icon-container', onclick: "iconTapHandler", components: [
					{name:'icon', className: "dashboard-icon", kind:enyo.Image},
					{name: 'badge', className:'dashboard-count', components:[
						{name: 'count', nodeTag:'span', className:'dashboard-count-label'}]}
			]},
			{name: 'layer0', kind: "enyo.DashboardLayer", className: 'layer-0', onclick:"msgTapHandler", swipeable:false},
			{name: 'layer1', kind: "enyo.DashboardLayer", className: 'layer-1', onclick:"msgTapHandler", onSwipe:"layerSwiped"},
			{name: 'layer2', kind: "enyo.DashboardLayer", className: 'layer-2', leftOffset: 15, onclick:"msgTapHandler", onSwipe:"layerSwiped"},
			// Special drop shadow & edge highlights shown when dragging whole dashboard.
			// Mimics that drawn by sysmgr, until we can better coordinate who handles dashboard drags.
			{className:"swipe-shadow left"},
			{className:"swipe-shadow right"},
			{className:"swipe-highlight left"},
			{className:"swipe-highlight right"}
		]}
	],
	events: {
		onIconTap: "",
		onMessageTap: "",
		onTap: "",
		onUserClose: "",
		onLayerSwipe: ""
	},	
	clickHandler: function(inSender, event) {
		this.doTap(this.layers[this.layers.length-1], event);
	},
	iconTapHandler: function(inSender, event) {
		this.doIconTap(this.layers[this.layers.length-1], event);
	},
	msgTapHandler: function(inSender, event) {
		this.doMessageTap(this.layers[this.layers.length-1], event);
	},
	// Whole dashboard was swiped, close the window.
	dbSwiped: function() {
		this.doUserClose();
		window.close();
	},
	// Just top layer was swiped.
	layerSwiped: function() {
		var layer = this.layers.pop();
		this.updateContents();
		this.doLayerSwipe(layer);
	},
	create: function() {
		this.inherited(arguments);
		var params = enyo.windowParams;
		this.setOwner(params.owner);		
		// Copy event handlers in from launch params:
		for (var prop in this.events) {
			if (this.events.hasOwnProperty(prop)) {
				this[prop] = params[prop];
			}
		}
		// Save the path to index file, for use with document-relative icons.
		this.docPath = params.docPath;
		this.docPath = this.docPath.slice(0,this.docPath.lastIndexOf('/')+1);
		this.layers = params.layers;
		this.indicateNewContent(true);	
		// Configure layer clipping properly.
		// This lets upper layers clip out lower ones, which is needed since they're transparent.
		this.$.layer1.setClipControl(this.$.layer0);
		this.$.layer2.setClipControl(this.$.layer1);
		// This is how our owner tells us about layer updates:
		enyo.windowParamsChangeHandler = enyo.bind(this, "handleNewLayers");
		// Make sure we're destroyed on window close, so we're removed from our owner's child list.
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	destroy: function() {
		this.indicateNewContent(false);
		window.removeEventListener('unload', this.boundDestroy);
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.updateContents();
	},
	// Sets state of children to accurately reflect our layers array,
	// including closing the window if we have no layers left.
	updateContents: function() {
		var len = this.layers.length;
		if (!len) {
			this.indicateNewContent(false);
			window.close();
			return;
		}
		// Configure last 3 layers in our list:
		var layers = this.layers.slice(-3);
		this.$.layer2.setLayer(layers[2]);
		this.$.layer1.setLayer(layers[1]);
		this.$.layer0.setLayer(layers[0]);
		// Set icon to match top layer:
		this.setIcon(layers[layers.length-1].icon);
		this.$.layer1.setSwipeable(!layers[2]);
		this.$.topSwipeable.setSwipeable(!layers[1]);
		if (len > 1) {
			this.$.count.setContent(len);
			this.$.badge.show();
		} else {
			this.$.badge.hide();
		}
	},
	handleNewLayers: function(params) {
		var layers = params && params.layers;
		this.indicateNewContent(layers && layers.length && layers.length > this.layers.length);
		this.layers = layers || [];
		this.updateContents();
	},
	setIcon: function(path) {
		// If icon path is not absolute, prepend the app's document location, since the window's document is in enyo.
		if (path[0] !== '/') {
			path = this.docPath+path;
		}
		this.$.icon.setSrc(path);
	},
	/** @private Called to manage the new message throbber, displayed when device is off. */
	indicateNewContent: function(hasNew) {
		if (!this.window || !this.window.PalmSystem) {
			return;
		}
		if (this._throbId) {
			this.window.PalmSystem.removeNewContentIndicator(this._throbId);
			this._throbId = undefined;
		}
		if (hasNew) {
			this._throbId = this.window.PalmSystem.addNewContentIndicator();
		}		
	}
});
/** @private Text-label layer within dashboard window.*/
enyo.kind({
	name: "enyo.DashboardLayer",
	kind: "enyo.Control",
	className: "dashboard-layer",
	components:[
			{name:'swipeable', kind: "enyo.SwipeableItem2", onDrag: "configureClipping", onConfirm:"doSwipe", 
										className: "palm-dashboard-text-container", confirmRequired:false, components: [
				{name:'title', className:"dashboard-title"},
				{name:'text', className:"palm-dashboard-text"}
			]}
	],
	published: {
		layer: null,
		swipeable: true,
		clipControl: null,
		leftOffset: 0, // extra ammt to add for clipping to reveal a peek at underlying content
	},
	events: {
		onSwipe: ""
	},
	create: function() {
		this.inherited(arguments);
		this.swipeableChanged();
	},
	configureClipping: function(inSender, dx) {
		if (this.clipControl) {
			this.clipControl.setStyle("width:"+Math.max(0, dx + this.leftOffset)+"px;"); // clipping div should be 10 greater than drag position, but never < 4.
		}
	},
	layerChanged: function() {
		if (this.layer) {
			this.show();
			this.$.title.setContent(this.layer.title);
			this.$.text.setContent(this.layer.text);
			if(this.leftOffset) {
				this.$.swipeable.setStyle("width:"+(270-this.leftOffset)+"px;");
			}
			this.configureClipping(this, 0);
		} else {
			this.hide();
			this.configureClipping(this, 270);
		}
	},
	swipeableChanged: function() {
		this.$.swipeable.setSwipeable(this.swipeable);
	}
});

