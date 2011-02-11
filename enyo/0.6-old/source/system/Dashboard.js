/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A component that manages a standard dashboard window in order to properly display a list of notification "layers".
Public methods exist for adding and removing layers, which are objects of the following form:

	{
		icon: String, path to icon image for this layer.
		title: First line of text, bold by default.  HTML is automatically escaped.
		text: Second line of text, HTML is automatically escaped.
	}

If the layers stack is empty, the dashboard window is closed.
When the stack is not empty, the data from the topmost layer will be displayed.
If the stack size is greater than 1, the size will be displayed in a little blue badge over the icon.

Applications can create instances of this component for the various types of dashboards they require.
For example, email uses one per email account, and one for the unified "all inboxes".
Then apps can push/pop notification layers as appropriate.  
The component handles all logic for window creation, destruction, and UI display.
*/
/*
	Notes:
	Mojo supported some extra layer properties we may need to add if required by apps: 
		rightHTML, rightIcon, rightTemplate, dashboardCount.
	Mojo also alowed HTML in the 'title' property. 
		We escape it for consistency & safety, but we may need to support an alternative titleHTML property instead.
*/
enyo.kind({
	name: "enyo.Dashboard",
	kind: enyo.Component,
	published: {
		/** Array of layer objects specifying contents of dashboard.*/
		layers: null
	},
	events: {
		/** Fired when user taps the icon portion of a dashboard. Event includes the top layer object, and mouse event.*/
		onIconTap: "",
		/** Fired when user taps the message portion of a dashboard. Event includes the top layer object, and mouse event.*/
		onMessageTap: "",
		/** Fired when user taps anywhere in a dashboard. Event includes the top layer object, and mouse event.*/
		onTap: "",
		/** Fired when user swipes a dashboard away (not when it is programmatically closed).*/
		onUserClose: "",
		/** Fired when user swipes a dashboard layer away, unless it's the last one (that's onUserClose instead). Event includes the top layer object.*/
		onLayerSwipe: ""
	},
	create: function() {
		this.inherited(arguments);
		this.layers = [];
	},	
	destroy: function() {
		// Close window if there is one.
		this.layers.length = 0;
		this.updateWindow();		
		this.inherited(arguments);
	},
	/** @public Add a notification layer to the top of the stack. */
	push: function(layer) {
		if(layer) {
			this.layers.push(layer);
			this.updateWindow();
		}
	},
	/** @public Remove the topmost notification layer from the stack. */
	pop: function() {
		var layer = this.layers.pop();
		this.updateWindow();
		return layer;
	},
	/** @public Set current stack of notification layers to a copy of the given array. */
	setLayers: function(layers) {
		this.layers = layers.slice(0);
		this.updateWindow();
	},	
	/** @private
		Manages window creation & destruction when needed,
		and updates window contents when the layers change.
	*/
	updateWindow: function() {
		// If we have items to display, then create the window if we don't already have one.
		if(this.layers.length) {
			// Sometimes it seems like window objects get their JS contexts snipped or something,
			// so they will remain truthy, but have no properties.
			if(!this.window || this.window.closed || this.window.addEventListener === undefined) {
				this.window = enyo.windows.openDashboard(enyo.path.rewrite("$enyo-system/dashboard.html"), this.name, 
											{layers:this.layers, docPath:document.location.pathname, owner:this, 
												onTap:"dbTapped", onIconTap:"iconTapped", onMessageTap:"msgTapped", 
												onUserClose:"userClosed", onLayerSwipe:"layerSwiped"},
											{webosDragMode:"manual"}
											);
			} else {
				enyo.windows.activate(this.name, undefined, {layers:this.layers});
			}
		} else if(this.window) {
			this.window.close();
			this.window = undefined;
		}
	},
	dbTapped: function(inSender, topLayer, event) {
		this.doTap(topLayer, event);
	},
	msgTapped: function(inSender, topLayer, event) {
		this.doMessageTap(topLayer, event);
	},
	iconTapped: function(inSender, topLayer, event) {
		this.doIconTap(topLayer, event);
	},
	layerSwiped: function(inSender, topLayer) {
		this.doLayerSwipe(topLayer);
	},
	userClosed: function(inSender) {
		this.doUserClose();
	}
});
