/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	enyo.Control is a Component descendent that can be represented visually and can receive UI events.

	Typically, a Control's visual representation corresponds to a node (and all its children) in DOM,
	but you are highly encouraged to consider only the higher level Control and Component hierarchies when
	designing Enyo applications, since these representations are much simpler than the actual DOM.

	Control inherits from DomBuilder the ability to maintain its state, whether it's been rendered (represented 
	in DOM) or not. This virtualization lets Enyo optimize actual DOM access and, in most cases, frees the 
	coder from having to worry about DOM state.
*/
enyo.kind({
	name: "enyo.Control",
	kind: enyo.ManagedDomBuilder,
	published: {
		// FIXME: performance concerns
		// - defaulting to VFlexLayout means by default all Control instances create a layout object at create-time
		// - using string-form kind requires a hash-lookup
		// - invokes layout flow at every render, even if it's semantically a no-op
		// layoutKind: "VFlexLayout"
		// FIXME: defaulting to VFlexLayout had unintended consequences (excessive styles, interactions with other containers)
		layoutKind: ""
	},
	// events
	// NOTE: DOM events that are attached to Dispatcher are automatically
	// forwarded as events. Any event of "type" will look for 
	// an "ontype" property and treat it as an event.
	// Other handlers won't have any do<Type> to call unless an event for
	// that type is registered, but can use 'fire' instead.
	events: {
		onclick: "",
		onmousedown: "",
		onmouseup: ""
	},
	//* @protected
	controlParentName: "client",
	defaultKind: "Control",
	constructor: function() {
		this.controls = [];
		this.children = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.layoutKindChanged();
	},
	initComponents: function() {
		this.createChrome(this.chrome);
		this.inherited(arguments);
	},
	discoverControlParent: function() {
		this.controlParent = this.$[this.controlParentName] || this.controlParent;
	},
	createComponents: function() {
		this.inherited(arguments);
		this.discoverControlParent();
	},
	createChrome: function(inInfos) {
		this.createComponents(inInfos, {isChrome: true});
	},
	adjustComponentProps: function(inProps) {
		this.inherited(arguments);
		inProps.manager = inProps.manager || this;
		//inProps.parent = inProps.parent || this;
	},
	addControl: function(inControl) {
		inControl.parent = inControl.parent || this;
		this.controls.push(inControl);
	},
	//* @protected
	removeControl: function(inControl) {
		return enyo.remove(inControl, this.controls);
	},
	//* @public
	/**
		Returns the index of a given managed control in a component's list of controls.
		@param inControl {Component} A managed control.
		@errata Current implementation returns index in this.controls, but index in this.getControls() makes more sense.
	*/
	indexOfControl: function(inControl) {
		return enyo.indexOf(inControl, this.controls);
	},
	/**
		Returns the 'non-private managed controls', which is not actually
		the same as the 'controls' array (note: this is a problem of taxonomy).
	*/
	getControls: function() {
		var results = [];
		for (var i=0, cs=this.controls, c; c=cs[i]; i++) {
			if (!c.isChrome) {
				results.push(c);
			}
		}
		return results;
	},
	/**
		Destroys managed controls, the same set of controls returned by getControls.
	*/
	destroyControls: function() {
		var c$ = this.getControls();
		for (var i=0, c; c=c$[i]; i++) {
			c.destroy();
		}
	},
	//* @protected
	addChild: function(inChild) {
		// Re-parenting must be done in addChild so that recursive
		// re-parenting can occur.
		// My controlParent might have a controlParent ad nauseum.
		if (this.controlParent && !inChild.isChrome) {
			this.appendControlParentChild(inChild);
		} else {
			this.appendChild(inChild);
		}
	},
	appendControlParentChild: function(inChild) {
		// The parent property must be set to reflect the new parent, but calling setParent
		// will call removeChild which is a lot of busy work.
		// addChild will automagically reset inChild.parent for us, as discussed below.
		this.controlParent.addChild(inChild);
	},
	appendChild: function(inChild) {
		inChild.parent = this;
		this.children.push(inChild);
		// FIXME: hacky, allows us to reparent a rendered control; we need full API for dynamic reparenting
		this.appendChildNode(inChild.hasNode());
	},
	indexOfChild: function(inChild) {
		return enyo.indexOf(inChild, this.children);
	},
	removeChild: function(inChild) {
		return enyo.remove(inChild, this.children);
	},
	layoutKindChanged: function() {
		this.destroyObject("layout");
		this.createLayoutFromKind(this.layoutKind);
	},
	createLayoutFromKind: function(inKind) {
		var ctor = inKind && enyo.constructorForKind(inKind);
		if (ctor) {
			this.layout = new ctor(this);
		}
	},
	getContent: function() {
		this.flow();
		return this.getChildContent() || this.content;
	},
	// FIXME: non-ideal
	// Our non-private controls can end up parented by some sub-control.
	// Iow, our controlParent may have a controlParent, etc. 
	// For now, it's easier to ask a control "who is parenting you" than to calculate
	// who the parent would be in the abstract.
	getEmpiricalChildParent: function() {
		var c = this.getControls()[0];
		return (c && c.parent) || this.controlParent || this;
	},
	flow: function() {
		if (this.layout) {
			this.layout.flow(this);
		}
	},
	flowControls: function() {
		if (this.controlParent) {
			this.controlParent.flowControls();
		} else {
			this.flow();
		}
	},
	getChildContent: function() {
		var results = '';
		for (var i=0, c; c=this.children[i]; i++) {
			results += c.generateHtml(); 
		}
		return results;
	},
	rendered: function() {
		this.inherited(arguments);
		this.childrenRendered();
	},
	childrenRendered: function() {
		for (var i=0, c; c=this.children[i]; i++) {
			c.rendered(); 
		}
	}
});

//* @protected

// enyo.create will default to this constructor (NOTE: this is NOT a default for enyo.kind() [because 'null' is a valid base kind])
enyo.defaultKind = enyo.defaultCtor = enyo.Control;
