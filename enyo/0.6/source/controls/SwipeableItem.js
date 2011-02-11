/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
An item that can be swiped to show an inline confirmation prompt with confirm and cancel buttons.
It is typically used to support swipe-to-delete in lists.

The onConfirm event is fired when the user taps the confirm button, or when the user swipes the item while confirmRequired is false. The event provides the index of the item. For example:

	components: [
		{flex: 1, name: "list", kind: "VirtualList", onSetupRow: "listSetupRow", components: [
			{kind: "SwipeableItem", onConfirm: "deleteItem"}
		]}
	],
	deleteItem: function(inSender, inIndex) {
		// remove data
		this.someData.splice(inIndex, 1);
	}

*/
enyo.kind({
	name: "enyo.SwipeableItem",
	kind: enyo.Item,
	published: {
		/**
		Set to false to prevent swiping.
		*/
		swipeable: true,
		/**
		If false, no confirm prompt is displayed, and swipes immediately trigger an onConfirm event.
		*/
		confirmRequired: true,
		/**
		Caption shown for the confirm button in the confirm prompt.
		*/
		confirmCaption: "Confirm",
		/**
		Caption shown for the cancel button in the confirm prompt.
		*/
		cancelCaption: "Cancel",
		confirmShowing: false
	},
	className: "enyo-item enyo-swipeableitem",
	triggerDistance: 50,
	events: {
		/**
		Event fired when the user clicks the confirm button or, if confirmRequired is false, when the item is swiped.
		The event includes the index of the swiped item.
		*/
		onConfirm: "",
		/**
		Event fired when the user clicks the cancel button in the confirm prompt.
		The event includes the index of the swiped item.
		*/
		onCancel: "",
		/**
		Event fired when the user swipes the item.
		The event includes the index of the swiped item.
		*/
		onSwipe: "",
		/**
		Event fired when the confirm prompt is shown or hidden.
		*/
		onConfirmShowingChanged: "",
		/**
		Event fired repeatedly as the item is dragged.
		Includes the total x pixel delta from at-rest position.
		*/
		onDrag: ""
	},
	chrome: [
		{name: "drag", kind: "Drag"},
		{name: "confirm", showing: false, kind: "ScrimmedConfirmPrompt", className: "enyo-fit",
			onConfirm: "confirmSwipe",
			onCancel: "cancelSwipe"
		}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.confirmCaptionChanged();
		this.cancelCaptionChanged();
	},
	confirmCaptionChanged: function() {
		this.$.confirm.setConfirmCaption(this.confirmCaption);
	},
	cancelCaptionChanged: function() {
		this.$.confirm.setCancelCaption(this.cancelCaption);
	},
	// NOTE: we could simplify state processing by never rendering the confirm prompt
	// when we generate content
	getContent: function() {
		//this.setConfirmShowing(false);
		return this.inherited(arguments);
	},
	// when item clicks, it briefly shows its held state, we want to 
	// avoid this when we're confirming.
	clickHandler: function(inSender, inEvent) {
		if (!this.confirmShowing) {
			this.inherited(arguments);
		}
	},
	flickHandler: function(inSender, inEvent) {
		if (Math.abs(inEvent.xVel) > Math.abs(inEvent.yVel)) {
			this.handleSwipe();
			return true;
		}
	},
	startDragHandler: function(inSender, inEvent) {
		this.resetPosition();
		if (!this.confirmShowing && this.swipeable && Math.abs(inEvent.dx) > Math.abs(inEvent.dy)) {
			this.index = inEvent.rowIndex;
			this.$.drag.start(inEvent);
			return true;
		// NOTE: we could simplify state processing by always hiding the confirm prompt
		// when a drag starts.
		} else {
			//this.setConfirmShowing(false);
		}
	},
	drag: function(inSender) {
		if (this.hasNode()) {
			this.node.style.webkitTransform = "translate3d(" + inSender.dx + "px, 0, 0)";
			this.doDrag(inSender.dx);
		} else {
			console.log("drag with no node!");
		}
	},
	dragFinish: function(inSender, inEvent) {
		this.resetPosition();
		if (Math.abs(inSender.dx) > this.triggerDistance) {
			this.handleSwipe();
		}
	},
	handleSwipe: function() {
		this.doSwipe(this.index);
		if (this.confirmRequired) {
			this.setConfirmShowing(true);
		} else {
			this.doConfirm(this.index);
		}
	},
	resetPosition: function() {
		if (this.hasNode()) {
			this.node.style.webkitTransform = "";
			this.doDrag(0);
		}
	},
	confirmShowingChanged: function() {
		this.$.confirm.setShowing(this.confirmShowing);
		this.doConfirmShowingChanged(this.confirmShowing);
	},
	confirmSwipe: function(inSender) {
		this.setConfirmShowing(false);
		this.doConfirm(this.index);
		return true;
	},
	cancelSwipe: function(inSender) {
		this.setConfirmShowing(false);
		this.doCancel(this.index);
		return true;
	}
});
// A swipeable item that animates the item out (or back into place).
// Separate for now, so we can limit changes to dashboards only, until they're proven robust.
// May not play nicely with delete confirmation mode.
enyo.kind({
	name: "enyo.SwipeableItem2",
	kind: enyo.SwipeableItem,
	dragFinish: function(inSender, inEvent) {
		var dx = inSender.dx;
		this.setSwipeable(false);
		this.exitPos = dx;
		this.exitDirection = inSender.dx > 0 ? 1 : -1;
		// Were we dragged far enough to trigger a delete?
		if (Math.abs(dx) > this.triggerDistance) {
			this.exitTarget = this.node.offsetWidth; //  - (dx * this.exitDirection)
			this.exitIntervalId = window.setInterval(enyo.bind(this, "animateExit"), 33);
			this.exitSpeed = 40;
		} else {
			this.exitDirection *= -1; // invert direction, so we animate back into place.
			this.exitTarget = 0;
			this.exitSpeed = 10;
			this.exitIntervalId = window.setInterval(enyo.bind(this, "animateReset"), 33);
		}
	},
	startDragHandler: function() {
		if(!this.exitIntervalId) {
			return this.inherited(arguments);
		}
	},
	drag: function() {
		if(!this.exitIntervalId) {
			return this.inherited(arguments);
		}
	},
	animateReset: function() {
		this.animateFrame();
		if(this.exitDirection < 0 === this.exitPos < 0) {
			this.animationComplete();
		}
	},
	animateExit: function() {
		this.animateFrame();
		if(Math.abs(this.exitPos) > this.exitTarget) {
			this.animationComplete();
			this.handleSwipe();
		}
	},
	animateFrame: function() {
		this.exitPos += this.exitSpeed * this.exitDirection;
		this.node.style.webkitTransform = "translate3d(" + this.exitPos + "px, 0, 0)";
		this.doDrag(this.exitPos);		
	},
	animationComplete: function() {
		window.clearInterval(this.exitIntervalId);
		this.exitIntervalId = undefined;
		this.resetPosition();
		this.setSwipeable(true);
	}
});
