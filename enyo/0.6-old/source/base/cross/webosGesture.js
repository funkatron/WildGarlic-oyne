/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected

if (window.PalmSystem) {
	// add webOS-specific gesture features
	enyo.dispatcher.features.push(
		function(e) {
			if (enyo.webosGesture[e.type]) {
				enyo.webosGesture[e.type](e);
			}
		}
	);

	enyo.webosGesture = {
		mousedown: function(e) {
			this.lastDownTarget = e.target;
		}
		// NOTE: 'back' event is synthesized from ESC key on all platforms in core/Gesture.js
	};

	// FIXME: LunaSysMgr callbacks still use Mojo namespace.
	Mojo = window.Mojo || {};

	Mojo.handleGesture = function(type, properties) {
		var synth = enyo.mixin({type: type, target: enyo.webosGesture.lastDownTarget}, properties);
		enyo.dispatch(synth);
	};

	Mojo.screenOrientationChanged = function(orientation) {
		enyo.dispatch({type: "windowRotated", orientation: orientation});
	};

	// NOTE: special performance tweak to short-circuit cycle-stealing event handling triggered by mousedown
	// when the -webkit-user-select:none style is set.
	// We've forwarded this issue to webkit team to address.
	enyo.webosGesture.preventMousedown = function(e) {
		var t = e.target;
		var pass = t.getAttribute && (t.getAttribute("contenteditable") || enyo.webosGesture.passEvent(t));
		if (t.tagName == "INPUT" || pass) {
			// mousedown is ok.
		} else {
			// prevent mousedown to speedup processing when webkit-user-select: none.
			e.preventDefault();
			// FIXME: preventDefault stops normal blur/focus from occuring so make that happen
			if (document.activeElement != e.target) {
				document.activeElement.blur();
				e.target.focus();
			}
		}
	}

	// FIXME: ug, search through parents for attribute to allow event.
	// prompted by google maps.
	enyo.webosGesture.passEvent = function(inNode) {
		var n = inNode;
		while (n) {
			if (n.getAttribute && n.getAttribute("enyo-pass-events")) {
				return true;
			}
			n = n.parentNode;
		}
	}
	
	enyo.webosGesture.connect = function() {
		// add gesture event suppport
		document.addEventListener("gesturestart", enyo.dispatch);
		document.addEventListener("gesturechange", enyo.dispatch);
		document.addEventListener("gestureend", enyo.dispatch);

		document.addEventListener(
			"mousedown",
			enyo.webosGesture.preventMousedown,
			true
		);
	}
	enyo.webosGesture.connect();
}