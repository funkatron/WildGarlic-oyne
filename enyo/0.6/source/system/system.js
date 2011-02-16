/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.fittingClassName = "enyo-fit";

enyo.logTimers = function(inMessage) {
	var m = inMessage ? " (" + inMessage + ")" : "";
	console.log("*** Timers " + m + " ***");
	var timed = enyo.time.timed;
	for (var i in timed) {
		console.log(i + ": " + timed[i] + "ms");
	}
	//console.log("chartData:" + enyo.json.to(enyo.time.timed));
	console.log("***************");
}

//* @public
/**
	Sets the allowed orientation.
	
	inOrientation is one of 'up', 'down', 'left', 'right', or 'free'
*/
enyo.setAllowedOrientation = function(inOrientation) {
	enyo._allowedOrientation = inOrientation;
	if (window.PalmSystem) {
		PalmSystem.setWindowOrientation(inOrientation);
	}
}

/**
	Returns the actual orientation of the window.  One of 'up', 'down', 'left' or 'right'.
*/
enyo.getWindowOrientation = function() {
	if (window.PalmSystem) {
		return PalmSystem.windowOrientation;
	}
}

enyo.ready = function() {
	if (window.PalmSystem) {
		// FIXME: calling stageReady on a slight delay appears to
		// fix apps starting with a blank screen. Hypothesis: we need to 
		// yield the thread between dom changes and stageReady.
		// Need to ask webkit team what's up with this.
		setTimeout(function() {
			PalmSystem.stageReady();
		}, 1);
		//
		enyo.setAllowedOrientation(enyo._allowedOrientation ? enyo._allowedOrientation : "free");
	}
}

// onStart is when a 'window' context is available
enyo.addOnStart(function(){
	// trigger platform ready on load
	window.addEventListener("load", enyo.ready, false);
});

enyo.fetchAppId = function() {
	if (window.PalmSystem) {
		// PalmSystem.identifier: <appid> <processid>
		return PalmSystem.identifier.split(" ")[0];
	}
}

enyo.fetchAppInfo = function() {
	var root = enyo.windows.getRootWindow();
	if (root.enyo) {
		var r = root.enyo.xhr.request({url: "appinfo.json", sync: true}).responseText;
		try {
			r = enyo.json.from(r);
			return r;
		} catch(e) {
			console.warn("Could not parse appInfo: " + e);
		}
	}
}