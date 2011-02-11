/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected

/*
if (!window.enyo) {
	enyo = {};
};
*/

//* @public

/**
	Populates a string template with data values.

	Returns a copy of _inText_, with macros defined by _inPattern_ replaced by
	named values in _inMap_.

	_inPattern_ may be omitted, in which case the default macro pattern is used. 
	The default pattern matches macros of the form

		{$name}

	Example:

		// returns "My name is Barney."
		enyo.macroize("My name is {$name}.", {name: "Barney"});

	Dot notation is supported, like so:

		var info = {
			product_0: {
				name: "Gizmo"
				weight: 3
			}
		}
		// returns "Each Gizmo weighs 3 pounds."
		enyo.macroize("Each {$product_0.name} weighs {$product_0.weight} pounds.", info);
*/
enyo.macroize = function(inText, inMap, inPattern) {
	var v, working, result = inText, pattern = inPattern || enyo.macroize.pattern;
	var fn = function(macro, name) {
		working = true;
		v = enyo.getObject(name, false, inMap);
		//v = inMap[name];
		return (v === undefined || v === null) ? "{$" + name + "}" : v;
	};
	var prevent = 0;
	do {
		working = false;
		result = result.replace(pattern, fn);
	// if iterating more than 100 times, we assume a recursion (we should throw probably)
	} while (working && (prevent++ < 100));
	return result;
};

//* @protected

// matches macros of form {$name}
enyo.macroize.pattern = /{\$([^{}]*)}/g;

enyo.easing = {
	cubicIn: function(n) {
		return Math.pow(n, 3);
	},
	cubicOut: function(n) {
		return Math.pow(n - 1, 3) + 1;
	},
	expoOut: function(n) {
		return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
	},
	quadInOut: function(n){
		n = n * 2;
		if(n < 1){ return Math.pow(n, 2) / 2; }
		return -1 * ((--n) * (n - 2) - 1) / 2;
	},
	linear: function(n) {
		return n;
	}
};

enyo.easedLerp = function(inT0, inDuration, inEasing) {
	var lerp = (new Date().getTime() - inT0) / inDuration;
	return lerp >= 1 ? 1 : inEasing(lerp);
};

//* @public

/**
	Gets a named value from the document cookie.
*/
enyo.getCookie = function(inName) {
	var matches = document.cookie.match(new RegExp("(?:^|; )" + inName + "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

/**
	Sets a named value into the document cookie, with properties.

	Properties in the optional inProps argument are attached to the cookie.
	inProps may have an expires property, which can be a number of days, a Date object,
	or a UTC time string.
*/
enyo.setCookie = function(inName, inValue, inProps) {
	var cookie = inName + "=" + encodeURIComponent(inValue);
	var p = inProps || {};
	//
	// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
	var exp = p.expires;
	if (typeof exp == "number") {
		var d = new Date();
		d.setTime(d.getTime() + exp*24*60*60*1000);
		exp = d;
	}
	if (exp && exp.toUTCString) {
		p.expires = exp.toUTCString();
	}
	//
	var name, value;
	for (name in p){
		cookie += "; " + name;
		value = p[name];
		if (value !== true) {
			cookie += "=" + value;
		}
	}
	//
	//console.log(cookie);
	document.cookie = cookie;
};

/**
	Takes a name/value mapping object and returns a string representing
	a URL-encoded version of that object.
	
	Example:

		{
			username: "foo",
			password: "bar"
		}
		
		"username=foo&password=bar"
*/
enyo.objectToQuery = function(/*Object*/ map) {
	var enc = encodeURIComponent;
	var pairs = [];
	var backstop = {};
	for (var name in map){
		var value = map[name];
		if (value != backstop[name]) {
			var assign = enc(name) + "=";
			if (enyo.isArray(value)) {
				for (var i=0; i < value.length; i++) {
					pairs.push(assign + enc(value[i]));
				}
			} else {
				pairs.push(assign + enc(value));
			}
		}
	}
	return pairs.join("&");
};

//* Generates a random integer greater than or equal to zero, but less than _inRange_.
enyo.irand = function(inRange) {
	return Math.floor(Math.random() * inRange);
};

/**
	Calls named method _inMethod_ (String) on _inObject_ with optional arguments _inArguments_ (Array), if the object and method exist.

		enyo.call(window.Worker, "doWork", [3, "foo"]);
*/
enyo.call = function(inObject, inMethod, inArguments) {
	if (inObject && inMethod) {
		var fn = inObject[inMethod];
		if (fn && fn.apply) {
			return fn.apply(inObject, inArguments || []);
		}
	}
}

/**
	Calls method _inMethod_ on _inScope_ asynchronously (on a 1ms timeout).

	Additional arguments are passed directly to _inMethod_.
*/
enyo.asyncMethod = function(inScope, inMethod/*, inArgs*/) {
	return setTimeout(enyo.hitch.apply(enyo, arguments), 1);
};

/**
	Invokes function _inJob_ after _inWait_ milliseconds have elapsed since the
	last time _inJobName_ was referenced.

	Jobs can be used to throttle behaviors. If some event can occur once or multiple
	times, but we want a response to occur only once every so many seconds, we can use a job.

		onscroll: function() {
			// updateThumb will be called but only when 1s has elapsed since the 
			// last onscroll
			enyo.job("updateThumb", enyo.bind(this, "updateThumb"), 1000);
		}
*/
enyo.job = function(inJobName, inJob, inWait) {
	enyo.job.stop(inJobName);
	enyo.job._jobs[inJobName] = setTimeout(function() {
		enyo.job.stop(inJobName);
		inJob();
	}, inWait);
};

/**
	Cancels the named job, if it has not already fired.
*/
enyo.job.stop = function(inJobName) {
	if (enyo.job._jobs[inJobName]) {
		clearTimeout(enyo.job._jobs[inJobName]);
		delete enyo.job._jobs[inJobName];
	}
};

//* @protected
enyo.job._jobs = {};

//* @public
/**
	Start a timer with the given name
*/
enyo.time = function(inName) {
	enyo.time.timers[inName] = new Date().getTime();
	enyo.time.lastTimer = inName;
};

/**
	Ends a timer with the given name and returns the number of milliseconds elapsed.
*/
enyo.timeEnd = function(inName) {
	var n = inName || enyo.time.lastTimer;
	var dt = enyo.time.timers[n] ? new Date().getTime() - enyo.time.timers[n] : 0;
	return enyo.time.timed[n] =  dt;
};

//* @protected
enyo.time.timers = {};
enyo.time.timed = {};

//* @public
// dom utils (needed so far)
enyo.dom = {
	fetchBorderExtents: function(inNode) {
		var s = this.getComputedStyle(inNode,null);
		return {
			t: parseInt(this.getComputedStyleValue(inNode, "border-top-width", s)),
			r: parseInt(this.getComputedStyleValue(inNode, "border-right-width", s)),
			b: parseInt(this.getComputedStyleValue(inNode, "border-bottom-width", s)),
			l: parseInt(this.getComputedStyleValue(inNode, "border-left-width", s))
		}
	},
	getComputedStyle: function(inNode) {
		return window.getComputedStyle(inNode, null);
	},
	getComputedStyleValue: function(inNode, inProperty, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		return s.getPropertyValue(inProperty);
	},
	fetchNodeOffset: function(inNode) {
		var p = inNode;
		var o = {top: 0, left: 0, offsetTop: 0, offsetLeft: 0, scrollX: 0, scrollY: 0};
		while (p) {
			o.offsetTop += p.offsetTop || 0;
			o.offsetLeft += p.offsetLeft || 0;
			p = p.offsetParent;
			if (p) {
				var b = enyo.dom.fetchBorderExtents(p);
				o.offsetTop += b.t;
				o.offsetLeft += b.l;
			}
		}
		p = inNode;
		while (p) {
			var c = enyo.$[p.id];
			if (c) {
				if (c instanceof enyo.BasicScroller) {
					// FIXME: non-accelerated scroller puts scroll position into offset
					// remove it here; use top/left for scroll corrected position
					if (!c.accelerated) {
						o.offsetTop += c.getScrollTop();
						o.offsetLeft += c.getScrollLeft();
					}
					o.scrollY += c.getScrollTop() || 0;
					o.scrollX += c.getScrollLeft() || 0;
				// FIXME: brittle
				} else if (c instanceof enyo.Sliding) {
					o.offsetLeft += c._slide || 0;
				}
			}
			p = p.parentNode;
		}
		o.offsetTop = o.offsetTop - o.scrollY;
		o.offsetLeft = o.offsetLeft - o.scrollX;
		return o;
	}
}

// string utils (needed so far)
enyo.string = {
	trim: function(inString) {
		return inString.replace(/^\s+|\s+$/g,"");
	},
	stripQuotes: function(inString) {
		var c0 = inString.charAt(0);
		if (c0 == '"' || c0 == "'") {
			inString = inString.substring(1);
		}
		var l = inString.length - 1, cl = inString.charAt(l);
		if (cl == '"' || cl == "'") {
			inString = inString.substr(0, l);
		}
		return inString;
	}
};

//* @protected

enyo.makeElement = function(inTag, inAttrs) {
	var n = document.createElement(inTag);
	for (var i in inAttrs) {
		n[i] = inAttrs[i];
	}
	return n;
};

enyo.loadSheet = function(inUrl) {
	document.head.appendChild(enyo.makeElement("link", {rel: "stylesheet", type: "text/css", href: inUrl}));
};

enyo.loadScript = function(inUrl) {
	document.head.appendChild(enyo.makeElement("script", {type: "text/javascript", src: inUrl}));
};
