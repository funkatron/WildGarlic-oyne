/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// we may have been assigned an enyo instance by a window opener
enyo = window.enyo || {};

(function(){
	var thisScript = "enyo.js";

	var parseUrlArgs = function(inUrlArgs) {
		var args = inUrlArgs.split("&");
		for (var i=0, a, nv; a=args[i]; i++) {
			nv = args[i] = a.split("=");
			enyo.args[nv[0]] = nv.length > 1 ? nv[1] : true;
		}
	};

	var locateScript = function(inName) {
		var scripts = document.getElementsByTagName("script");
		for (var i=0, s, src, l=inName.length; s=scripts[i]; i++) {
			src = s.getAttribute("src") || "";
			if (src.slice(-l) == inName) {
				// grab arguments off the script element
				var launchArgs = s.getAttribute("launch")
				if (launchArgs) {
					parseUrlArgs(launchArgs);
				}
				//locateScript.element = s;
				return src.slice(0, -l -1);
			}
		}
	};

	var script = function(inSrc, inBody) {
		document.write('<script ' + (inSrc ? 'src="' + inSrc + '"' : "") + ' type="text/javascript">' + (inBody || "") + "</script>");
	}

	// launch arguments
	enyo.args = {};

	// process input arguments into an object
	// TODO: may need to acquire args from other sources too
	parseUrlArgs(location.search.slice(1));

	// infer the framework path from the document, unless the user has specified one
	// also, acquire args from framework boot script tag
	enyo.enyoPath = enyo.args.enyoPath || locateScript(thisScript);

	// for production, generally 'explicit debug mode' is probably correct
	// for development phase, non-device executions are almost always
	// better in debug mode, so we tweak the flags here
	/*
	if (!enyo.args.build && !window.enyoBuiltin) {
		enyo.args.debug = true;
	}
	*/

	// use debug mode only if explicitly indicated
	if (enyo.args.debug || enyo.args.manual) {
		// in debug mode, enyo maps to /source, where resources must reside
		enyo.enyoPath += "/source";
		// bootstrap loader
		script(enyo.enyoPath + "/dependency-loader.js");
		// auto-load dependency tree, unless explicitly prevented
		if (!enyo.args.manual) {
			script(null, 'enyo.depends("$enyo/enyo");');
		}
	} else {
		// in non-debug mode, enyo maps to /build, where resources must reside
		enyo.enyoPath += "/build";
		// use build mode if explicitly indicated, or if there is no builtin
		// TODO: we may have multiple versions of enyoBuiltin
		if (enyo.args.build || !window.enyoBuiltin) {
			enyo.isBuild = true;
			script(enyo.enyoPath + "/enyo-build.js");
		} 
		// otherwise, use builtin
		else {
			// copy our boot-time values into the builtin
			var b = window.enyoBuiltin;
			for (var n in enyo) {
				b[n] = enyo[n]
			}
			// use builtin enyo
			enyo = b;
			// initialize the builtin for this window context
			enyo.setupBuiltin(window);
			// perform startup tasks that have been deferred for builtin
			enyo.started();
		}
	}

	// boot the application
	script(enyo.args.app || "depends.js");
})();
