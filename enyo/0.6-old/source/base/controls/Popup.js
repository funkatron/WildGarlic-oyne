/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A popup is just floating elements embedded directly within the page context.
It can popup/open at a specified position, and has support for modality and click to dismiss/close.

	{kind: "Popup", components: [
		{content: "Hello World!"},
		{kind: "ListSelector", value: "Foo", items: ["Foo", "Bar", "Bot"]}
	]}

To open the popup at the center:

	openPopup: function() {
		this.$.popup.openAtCenter();
	}

If dismissWithClick is set to true (default) and modal is false (default), then clicking anywhere not inside the popup will dismiss/close the popup.
Also, you can close the popup programmatically by doing this:

	closePopup: function() {
		this.$.popup.close();
	}
*/
enyo.kind({
	name: "enyo.Popup",
	kind: enyo.Control,
	showing: false,
	published: {
		modal: false,
		// only apply if modal is false
		dismissWithClick: true,
		dismissWithEscape: true,
		scrim: false
	},
	events: {
		onOpen: "",
		onClose: ""
	},
	className: "enyo-popup",
	//* @protected
	create: function() {
		this.inherited(arguments);
		// FIXME: global dispatcher may not be good enough
		this.dispatcher = enyo.dispatcher;
		// NOTE: parent all popups in root parent to avoid problem:
		// webkit-transforms defeat fixed positioning.
		this.setParent(this.findRootParent());
	},
	destroy: function() {
		this.close();
		this.inherited(arguments);
	},
	findRootParent: function() {
		var o = this;
		while (o = o.owner) {
			if (!(o.owner instanceof enyo.Control)) {
				return o;
			}
		}
	},
	show: function() {
		this.inherited(arguments);
		if (this.scrim) {
			// move scrim to just under the popup to obscure rest of screen
			this._scrimZ = this.findZIndex()-1;
			enyo.scrim.showAtZIndex(this._scrimZ);
		}
	},
	hide: function() {
		this.inherited(arguments);
		if (this.scrim) {
			enyo.scrim.hideAtZIndex(this._scrimZ);
		}
	},
	//* @public
	toggleOpen: function() {
		this[this.isOpen ? "close" : "open"]();
	},
	open: function() {
		if (!this.isOpen) {
			this.isOpen = true;
			this._open();
			this.dispatcher.capture(this, !this.modal);
			this.doOpen();
		}
	},
	//* @protected
	_open: function() {
		this._zIndex = ++enyo.Popup.count * 2 + this.findZIndex() + 1;
		// leave room for scrim
		this.applyStyle("z-index", this._zIndex);
		if (!this.generated) {
			this.render();
		}
		this.show();
	},
	//* @public
	openAt: function(inRect) {
		enyo.mixin(inRect, this.clampSize(inRect));
		this.applyMaxDimensions(inRect);
		this.open();
	},
	openAtEvent: function(inEvent, inOffset) {
		var p = {
			l: inEvent.centerX || inEvent.clientX || inEvent.pageX,
			t: inEvent.centerY || inEvent.clientY || inEvent.pageY
		}
		if (inOffset) {
			p.l += inOffset.left || 0;
			p.t += inOffset.top || 0;
		}
		p = this.clampPosition(enyo.mixin(p, this.calcSize()));
		this.openAt(p);
	},
	openNearNode: function(inNode, inOffset) {
		var o = enyo.mixin({w: 0, h: 0, t: 0, l: 0}, inOffset);
		o.w += inNode.offsetWidth;
		o.h += inNode.offsetHeight;
		// offsets account for scroller so use them.
		var n = enyo.dom.fetchNodeOffset(inNode);
		o.t += n.offsetTop;
		o.l += n.offsetLeft;
		this.openNear(o);
	},
	openAroundNode: function(inNode) {
		// we position to the bottom right of the node.
		var o = enyo.dom.fetchNodeOffset(inNode);
		var a = {};
		a.t = o.offsetTop + inNode.offsetHeight;
		var vp = this.calcViewport();
		a.r = vp.w - (o.offsetLeft + inNode.offsetWidth);
		this.openNear(a);
	},
	// inDimensions can have {t, l, r, b, w, h}
	// inSize can have {w, h}
	openNear: function(inDimensions, inSize) {
		var d = inDimensions;
		var o = {l: d.l, t: d.t, r: d.r, b: d.b};
		if (inSize) {
			o.w = inSize.w;
			o.h = inSize.h;
		}
		this.clearSize();
		var s = this.calcSize();
		var vp = this.calcViewport();
		if ((d.t + s.h > vp.h) && (d.t > vp.h/2)) {
			o.b = vp.h - d.t - (d.h || 0);
			delete o.t;
		}
		if ((d.l + s.w > vp.w) && (d.l > vp.w/2)) {
			o.r = vp.w - d.l - (d.w || 0);
			delete o.l;
		}
		this.openAt(o);
	},
	openAtCenter: function() {
		var s = this.calcSize();
		var vp = this.calcViewport();
		var o = {
			l: Math.max(0, (vp.w - s.w) / 2),
			t: Math.max(0, (vp.h - s.h) / 2)
		}
		this.openAt(o);
	},
	close: function(e) {
		this.isOpen = false;
		this.dispatcher.release(this, !this.modal);
		this._close();
		this.doClose(e);
	},
	//* @protected
	_close: function() {
		this.clearSizeCache();
		if (this.showing) {
			enyo.Popup.count--;
		}
		this._zIndex = null;
		this.applyStyle("z-index", null);
		this.hide();
	},
	mousedownHandler: function(inSender, e) {
		// mousedowns that are not inside this popup can dismiss us, if we are not modal and dismissWithClick is true
		if (!this.modal && this.dismissWithClick && e.dispatchTarget != this && !e.dispatchTarget.isDescendantOf(this)) {
			this.close(e);
		}
	},
	keydownHandler: function(inSender, e, inTarget) {
		switch (e.keyCode) {
			case 27: //dojo.keys.ESCAPE:
				if (this.dismissWithEscape && !this.modal) {
					this.close(e);
					enyo.stopEvent(e);
				}
				return true;
		}
	},
	// FIXME: can have {l, r, t, b, w, h}
	applyMaxDimensions: function(inRect) {
		this.applyMaxSize(inRect);
		this.applyPosition(inRect);
	},
	applyMaxSize: function(inRect) {
		this.applyStyle("max-width", inRect.w + "px");
		this.applyStyle("max-height", inRect.h + "px");
	},
	clearSize: function() {
		this.applyStyle("max-width", "none");
		this.applyStyle("max-height", "none");
	},
	applyPosition: function(inRect) {
		if (inRect.l !== undefined) {
			this.applyStyle("left", inRect.l + "px");
			this.applyStyle("right", "auto");
		} else if (inRect.r !== undefined) {
			this.applyStyle("right", inRect.r + "px");
			this.applyStyle("left", "auto");
		}
		if (inRect.t !== undefined) {
			this.applyStyle("top", inRect.t + "px");
			this.applyStyle("bottom", "auto");
		} else if (inRect.b !== undefined) {
			this.applyStyle("bottom", inRect.b + "px");
			this.applyStyle("top", "auto");
		}
	},
	// returns a position which ensures popup of inSize will not overflow viewport
	clampPosition: function(inRect) {
		var p = {};
		var vp = this.calcViewport();
		if (inRect.r) {
			p.r = Math.max(0, Math.min(vp.w - inRect.w, inRect.r));
		} else {
			p.l =  Math.max(0, Math.min(vp.w - inRect.w, inRect.l));
		}
		if (inRect.b) {
			p.b = Math.max(0, Math.min(vp.h - inRect.h, inRect.b));
		} else {
			p.t = Math.max(0, Math.min(vp.h - inRect.h, inRect.t));
		}
		return p;
	},
	// returns a size which ensures popup at inPosition will not overflow viewport
	clampSize: function(inDimensions) {
		var d = inDimensions || {};
		var vp = this.calcViewport();
		var size = {
			w: vp.w - (d.l || d.r || 0),
			h: vp.h - (d.t || d.b || 0)
		}
		if (d.w) {
			size.w = Math.min(d.w, size.w);
		}
		if (d.h) {
			size.h = Math.min(d.h, size.h);
		}
		return size;
	},
	// measure the size of the viewport.
	calcViewport: function() {
		// memoize
		if (this._viewport) {
			return this._viewport;
		} else {
			var op = this.parent && this.parent.hasNode() || document.body;
			return this._viewport = {
				w: op.offsetWidth,
				h: op.offsetHeight
			}
		}
	},
	// measure the size of the popup.
	calcSize: function() {
		if (!this.generated) {
			this.render();
		}
		// memoize
		if (this._size) {
			return this._size;
		} else if (this.hasNode()) {
			var s = {h: 0, w: 0};
			// briefly show node so we can measure it.
			var hidden = this.node.style.display == "none";
			if (hidden) {
				this.node.style.display = "block";
			}
			s.h = s.offsetHeight = this.node.offsetHeight;
			s.w = s.offsetWidth = this.node.offsetWidth;
			s.clientHeight = this.node.clientHeight;
			s.clientWidth = this.node.clientWidth;
			if (hidden) {
				this.node.style.display = "none";
			}
			return this._size = s;
		}
	},
	clearSizeCache: function() {
		this._viewport = null;
		this._size = null;
	},
	findZIndex: function() {
		if (this._zIndex) {
			return this._zIndex;
		} else if (this.hasNode()) {
			return this._zIndex = Number(enyo.dom.getComputedStyleValue(this.node, "z-index"));
		}
	}
});

enyo.Popup.count = 0;
