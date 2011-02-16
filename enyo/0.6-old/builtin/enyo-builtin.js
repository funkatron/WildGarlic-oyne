/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// builtin-preamble.js

Array = global.Array, String = global.String, Boolean = global.Boolean, Number = global.Number, undefined = global.undefined, Math = global.Math, Date = global.Date, SyntaxError = global.SyntaxError, Image = global.Image, isNaN = global.isNaN, window = this, nop = function() {}, document = {
addEventListener: nop,
querySelector: nop,
write: nop
}, window.enyo = enyo = {}, global.enyoBuiltin = enyo, enyo.isBuiltin = true, enyo.args = {}, enyo.depends = function() {}, window.PalmSystem = PalmSystem = global.PalmSystem || !0, windowMap = {
properties: [ "document", "location", "eval", "PalmSystem", "PalmServiceBridge", "console", "PhoneGap", "XMLHttpRequest", "encodeURIComponent", "Image" ],
methods: [ "setTimeout", "clearTimeout", "setInterval", "clearInterval", "parseInt" ]
}, mapToWindow = function(a) {
window = a;
for (var b = 0, c; c = windowMap.properties[b]; b++) this[c] = a[c];
for (var b = 0, c; c = windowMap.methods[b]; b++) this[c] = enyo.hitch(a, c);
}, enyo.setupBuiltin = function(a) {
mapToWindow(a), enyo.global = a, enyo.path.paths.enyo = enyo.enyoPath, enyo.sheet(enyo.path.rewrite("$enyo/enyo-build.css")), enyo.webosGesture.connect(), enyo.date.loadLocale();
}, enyo.setPrototype = function(a, b) {
%FunctionSetPrototype(a, b);
};
// dependency-loader.js

(function() {
enyo.sheet = function(a) {
document.write('<link href="' + a + '" media="screen" rel="stylesheet" type="text/css" />');
}, enyo.script = function(a) {
document.write('<script src="' + a + '" type="text/javascript"></script>');
}, enyo.path = {
pattern: /\$([^\/\\]*)(\/)?/g,
rewrite: function(a) {
var b, c = a, d = function(a, c) {
b = !0;
var d = enyo.path.paths[c];
return d ? d.charAt(d.length - 1) == "/" ? d : d + "/" : "";
};
do b = !1, c = c.replace(this.pattern, d); while (b);
return c;
},
paths: {
enyo: enyo.enyoPath,
"enyo-lib": enyo.enyoPath + "/../lib"
}
}, enyo.paths = function(a) {
if (a) for (var b in a) enyo.path.paths[b] = a[b];
};
var a = enyo.modules = [], b = enyo.sheets = [], c = [], d = "", e = "";
enyo.depends = function(a) {
f({
index: 0,
depends: arguments || []
});
};
var f = function(a) {
if (a) {
var b;
while (b = a.depends[a.index++]) if (typeof b == "string") {
if (g(b, a)) return;
} else "paths" in b && enyo.paths(b.paths);
}
var d = c.pop();
d && (e = d.folder, f(d));
}, g = function(c, f) {
var g = enyo.path.rewrite(c), i = c.slice(0, 1);
e && i != "/" && i != "\\" && i != "$" && c.slice(0, 5) != "http:" && (g = e + g);
if (g.slice(-3) == "css") b.push(g), enyo.sheet(g); else if (g.slice(-2) == "js") a.push({
"package": d,
rawPath: c,
path: g
}), enyo.script(g); else {
h(g, f);
return !0;
}
}, h = function(a, b) {
var f = a.split("/"), g = f.pop(), h = f.join("/") + (f.length ? "/" : ""), i = g ? "-" : "/", j = a + i + "depends.js";
b.folder = e, e = enyo.path.paths[g] = h, b.package = d = g, c.push(b), enyo.script(j);
};
})();

// base/core/startup.js

enyo.addOnStart = function(a) {
enyo.isBuiltin ? enyo.startTimeTasks.push(a) : a();
}, enyo.startTimeTasks = [], enyo.started = function() {
for (var a = 0, b; b = enyo.startTimeTasks[a]; a++) b();
};

// this sheet load command specially inserted by builder tool:
if(!enyo.isBuiltin){enyo.sheet(enyo.path.rewrite("$enyo/enyo-build.css"));}

// base/core/i18n.js

$L = function(a) {
var b = $L.map[a];
b === undefined && (b = $L.map[a] = a);
return b;
}, $L.map = {}, enyo.getLocale = function(a) {
var b, c;
if (window.PalmSystem) c = PalmSystem.locale; else {
var b = document.querySelector('meta[http-equiv="content-language"]');
c = b && b.content || enyo.args.locale;
}
c || (c = a || "en_us"), c = c.toLowerCase(), b || document.write('<meta http-equiv="content-language" content="' + c + '" />');
var d = c.slice(0, 2), e = c.length == 5 ? c.slice(-2) : null;
enyo.locale = {
name: c,
lang: d,
region: e
};
return enyo.locale;
};

// base/core/xhr.js

enyo.xhr = {
request: function(a) {
var b = this.getXMLHttpRequest(), c = a.method || "GET", d = "sync" in a ? !a.sync : !0;
b.open(c, enyo.path.rewrite(a.url), d), this.makeReadyStateHandler(b, a.callback);
if (a.headers) for (var e in a.headers) b.setRequestHeader(e, a.headers[e]);
b.send(a.body || null), d || b.onreadystatechange(b);
return b;
},
getXMLHttpRequest: function() {
try {
return new XMLHttpRequest;
} catch (a) {}
try {
return new ActiveXObject("Msxml2.XMLHTTP");
} catch (a) {}
try {
return new ActiveXObject("Microsoft.XMLHTTP");
} catch (a) {}
return null;
},
makeReadyStateHandler: function(a, b) {
a.onreadystatechange = function() {
a.readyState == 4 && (b && b.apply(null, [ a.responseText, a ]));
};
}
};

// base/core/date.js

enyo.date = {
getDayMs: function() {
var a = new Date;
a.setHours(0), a.setMinutes(0), a.setSeconds(0);
return a.getTime();
},
formatDayOffset: function(a) {
var b = (new Date(a)).getTime(), c = this.getDayMs();
return b > c ? "today" : b > c - 864e5 ? "yesterday" : "older";
},
format: function() {
var a = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, b = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, c = /[^-+\dA-Z]/g, d = function(a, b) {
a = String(a), b = b || 2;
while (a.length < b) a = "0" + a;
return a;
};
return function(e, f, g) {
var h = enyo.date;
arguments.length == 1 && Object.prototype.toString.call(e) == "[object String]" && !/\d/.test(e) && (f = e, e = undefined), e = e ? new Date(e) : new Date;
if (isNaN(e)) throw SyntaxError("invalid date");
f = String(h.masks[f] || f || h.masks["default"]), f.slice(0, 4) == "UTC:" && (f = f.slice(4), g = !0);
var i = g ? "getUTC" : "get", j = e[i + "Date"](), k = e[i + "Day"](), l = e[i + "Month"](), m = e[i + "FullYear"](), n = e[i + "Hours"](), o = e[i + "Minutes"](), p = e[i + "Seconds"](), q = e[i + "Milliseconds"](), r = g ? 0 : e.getTimezoneOffset(), s = {
d: j,
dd: d(j),
ddd: h.i18n.dayNames[k],
dddd: h.i18n.dayNames[k + 7],
m: l + 1,
mm: d(l + 1),
mmm: h.i18n.monthNames[l],
mmmm: h.i18n.monthNames[l + 12],
yy: String(m).slice(2),
yyyy: m,
h: n % 12 || 12,
hh: d(n % 12 || 12),
H: n,
HH: d(n),
M: o,
MM: d(o),
s: p,
ss: d(p),
l: d(q, 3),
L: d(q > 99 ? Math.round(q / 10) : q),
t: n < 12 ? h.i18n.am[0] : h.i18n.pm[0],
tt: n < 12 ? h.i18n.am[1] : h.i18n.pm[1],
T: n < 12 ? h.i18n.am[2] : h.i18n.pm[2],
TT: n < 12 ? h.i18n.am[3] : h.i18n.pm[3],
Z: g ? "UTC" : (String(e).match(b) || [ "" ]).pop().replace(c, ""),
o: (r > 0 ? "-" : "+") + d(Math.floor(Math.abs(r) / 60) * 100 + Math.abs(r) % 60, 4),
S: [ "th", "st", "nd", "rd" ][j % 10 > 3 ? 0 : (j % 100 - j % 10 != 10) * j % 10]
};
return f.replace(a, function(a) {
return a in s ? s[a] : a.slice(1, a.length - 1);
});
};
}(),
masks: {
"default": "ddd mmm dd yyyy HH:MM:ss",
shortDate: "m/d/yy",
mediumDate: "mmm d, yyyy",
longDate: "mmmm d, yyyy",
fullDate: "dddd, mmmm d, yyyy",
shortTime: "h:MM TT",
mediumTime: "h:MM:ss TT",
longTime: "h:MM:ss TT Z",
isoDate: "yyyy-mm-dd",
isoTime: "HH:MM:ss",
isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
},
i18n: {},
loadLocale: function() {
var a = enyo.locale || enyo.getLocale() || {};
enyo.script(enyo.path.rewrite("$base-core/resources/" + (a.lang || "en") + "/datetime.js"));
}
};

// base/core/kit.js

(function() {
enyo.global = this, enyo._getProp = function(a, b, c) {
var d = c || enyo.global;
for (var e = 0, f; d && (f = a[e]); e++) d = f in d ? d[f] : b ? d[f] = {} : undefined;
return d;
}, enyo.setObject = function(a, b, c) {
var d = a.split("."), e = d.pop(), f = enyo._getProp(d, !0, c);
return f && e ? f[e] = b : undefined;
}, enyo.getObject = function(a, b, c) {
return enyo._getProp(a.split("."), b, c);
}, enyo.cap = function(a) {
return a.slice(0, 1).toUpperCase() + a.slice(1);
}, enyo.isString = function(a) {
return typeof a == "string" || a instanceof String;
}, enyo.isFunction = function(a) {
return typeof a == "function";
}, enyo.isArray = function(a) {
return a instanceof Array || typeof a == "array";
}, enyo.indexOf = function(a, b) {
for (var c = 0, d; d = b[c]; c++) if (d == a) return c;
return -1;
}, enyo.remove = function(a, b) {
var c = enyo.indexOf(a, b);
c >= 0 && b.splice(c, 1);
}, enyo.forEach = function(a, b, c) {
var d = [];
if (a) {
var e = c || this;
for (var f = 0, g = a.length; f < g; f++) d.push(b.call(e, a[f], f, a));
}
return d;
}, enyo.map = enyo.forEach, enyo.cloneArray = function(a, b, c) {
var d = c || [];
for (var e = b || 0, f = a.length; e < f; e++) d.push(a[e]);
return d;
}, enyo._toArray = enyo.cloneArray, enyo.clone = function(a) {
return enyo.isArray(a) ? enyo.cloneArray(a) : enyo.mixin({}, a);
};
var a = {};
enyo.mixin = function(b, c) {
b = b || {};
if (c) {
var d, e, f;
for (d in c) e = c[d], a[d] !== e && (b[d] = e);
}
return b;
}, enyo._hitchArgs = function(a, b) {
var c = enyo._toArray(arguments, 2), d = enyo.isString(b);
return function() {
var e = enyo._toArray(arguments), f = d ? (a || enyo.global)[b] : b;
return f && f.apply(a || this, c.concat(e));
};
}, enyo.bind = enyo.hitch = function(a, b) {
if (arguments.length > 2) return enyo._hitchArgs.apply(enyo, arguments);
b || (b = a, a = null);
if (enyo.isString(b)) {
a = a || enyo.global;
if (!a[b]) throw [ 'dojo.hitch: scope["', b, '"] is null (scope="', a, '")' ].join("");
return function() {
return a[b].apply(a, arguments || []);
};
}
return a ? function() {
return b.apply(a, arguments || []);
} : b;
}, enyo.nop = function() {}, enyo.nob = {}, enyo.setPrototype || (enyo.setPrototype = function(a, b) {
a.prototype = b;
}), enyo.delegate = function(a) {
enyo.setPrototype(enyo.nop, a);
var a = new enyo.nop;
enyo.setPrototype(enyo.nop, null);
return a;
}, enyo.$ = enyo.byId = function(a, b) {
return typeof a == "string" ? (b || document).getElementById(a) : a;
}, enyo.fixEvent = function(a) {
var b = a || window.event;
b.target || (b.target = b.srcElement), b.handled = enyo._stopEvent;
return b;
}, enyo._stopEvent = function() {
enyo.stopEvent(this);
}, enyo.stopEvent = function(a) {
a.stopPropagation ? (a.stopPropagation(), a.preventDefault()) : (a.cancelBubble = !0, a.keyCode = 0, a.returnValue = !1);
}, enyo.xhrGet = function(a) {
a.callback = a.load, enyo.xhr.request(a);
}, enyo.xhrPost = function(a) {
a.callback = a.load, a.method = "POST", enyo.xhr.request(a);
};
})();

// base/core/util.js

enyo.macroize = function(a, b, c) {
var d, e, f = a, g = c || enyo.macroize.pattern, h = function(a, c) {
e = !0, d = enyo.getObject(c, !1, b);
return d === undefined || d === null ? "{$" + c + "}" : d;
}, i = 0;
do e = !1, f = f.replace(g, h); while (e && i++ < 100);
return f;
}, enyo.macroize.pattern = /{\$([^{}]*)}/g, enyo.easing = {
cubicIn: function(a) {
return Math.pow(a, 3);
},
cubicOut: function(a) {
return Math.pow(a - 1, 3) + 1;
},
expoOut: function(a) {
return a == 1 ? 1 : -1 * Math.pow(2, -10 * a) + 1;
},
quadInOut: function(a) {
a = a * 2;
if (a < 1) return Math.pow(a, 2) / 2;
return -1 * (--a * (a - 2) - 1) / 2;
},
linear: function(a) {
return a;
}
}, enyo.easedLerp = function(a, b, c) {
var d = ((new Date).getTime() - a) / b;
return d >= 1 ? 1 : c(d);
}, enyo.getCookie = function(a) {
var b = document.cookie.match(new RegExp("(?:^|; )" + a + "=([^;]*)"));
return b ? decodeURIComponent(b[1]) : undefined;
}, enyo.setCookie = function(a, b, c) {
var d = a + "=" + encodeURIComponent(b), e = c || {}, f = e.expires;
if (typeof f == "number") {
var g = new Date;
g.setTime(g.getTime() + f * 24 * 60 * 60 * 1e3), f = g;
}
f && f.toUTCString && (e.expires = f.toUTCString());
var h, i;
for (h in e) d += "; " + h, i = e[h], i !== !0 && (d += "=" + i);
document.cookie = d;
}, enyo.objectToQuery = function(a) {
var b = encodeURIComponent, c = [], d = {};
for (var e in a) {
var f = a[e];
if (f != d[e]) {
var g = b(e) + "=";
if (enyo.isArray(f)) for (var h = 0; h < f.length; h++) c.push(g + b(f[h])); else c.push(g + b(f));
}
}
return c.join("&");
}, enyo.irand = function(a) {
return Math.floor(Math.random() * a);
}, enyo.call = function(a, b, c) {
if (a && b) {
var d = a[b];
if (d && d.apply) return d.apply(a, c || []);
}
}, enyo.asyncMethod = function(a, b) {
return setTimeout(enyo.hitch.apply(enyo, arguments), 1);
}, enyo.job = function(a, b, c) {
enyo.job.stop(a), enyo.job._jobs[a] = setTimeout(function() {
enyo.job.stop(a), b();
}, c);
}, enyo.job.stop = function(a) {
enyo.job._jobs[a] && (clearTimeout(enyo.job._jobs[a]), delete enyo.job._jobs[a]);
}, enyo.job._jobs = {}, enyo.dom = {
fetchBorderExtents: function(a) {
var b = this.getComputedStyle(a, null);
return {
t: parseInt(this.getComputedStyleValue(a, "border-top-width", b)),
r: parseInt(this.getComputedStyleValue(a, "border-right-width", b)),
b: parseInt(this.getComputedStyleValue(a, "border-bottom-width", b)),
l: parseInt(this.getComputedStyleValue(a, "border-left-width", b))
};
},
getComputedStyle: function(a) {
return window.getComputedStyle(a, null);
},
getComputedStyleValue: function(a, b, c) {
var d = c || this.getComputedStyle(a);
return d.getPropertyValue(b);
},
fetchNodeOffset: function(a) {
var b = a, c = {
top: 0,
left: 0,
offsetTop: 0,
offsetLeft: 0,
scrollX: 0,
scrollY: 0
};
while (b) {
c.offsetTop += b.offsetTop || 0, c.offsetLeft += b.offsetLeft || 0, b = b.offsetParent;
if (b) {
var d = enyo.dom.fetchBorderExtents(b);
c.offsetTop += d.t, c.offsetLeft += d.l;
}
}
b = a;
while (b) {
var e = enyo.$[b.id];
e && (e instanceof enyo.BasicScroller ? (e.accelerated || (c.offsetTop += e.getScrollTop(), c.offsetLeft += e.getScrollLeft()), c.scrollY += e.getScrollTop() || 0, c.scrollX += e.getScrollLeft() || 0) : e instanceof enyo.Sliding && (c.offsetLeft += e._slide || 0)), b = b.parentNode;
}
c.offsetTop = c.offsetTop - c.scrollY, c.offsetLeft = c.offsetLeft - c.scrollX;
return c;
}
}, enyo.string = {
trim: function(a) {
return a.replace(/^\s+|\s+$/g, "");
},
stripQuotes: function(a) {
var b = a.charAt(0);
if (b == '"' || b == "'") a = a.substring(1);
var c = a.length - 1, d = a.charAt(c);
if (d == '"' || d == "'") a = a.substr(0, c);
return a;
}
}, enyo.makeElement = function(a, b) {
var c = document.createElement(a);
for (var d in b) c[d] = b[d];
return c;
}, enyo.loadSheet = function(a) {
document.head.appendChild(enyo.makeElement("link", {
rel: "stylesheet",
type: "text/css",
href: a
}));
}, enyo.loadScript = function(a) {
document.head.appendChild(enyo.makeElement("script", {
type: "text/javascript",
src: a
}));
};

// base/core/json.js

enyo.json = {
tab: "  ",
_block: function(a, b) {
a = a.join(",\n");
var c = a ? "\n" + a + "\n" + b : "";
return c;
},
obj: function(a, b) {
var c = [], d, e;
for (var f in a) e = a[f], f == "isa" && e.prototype ? e = e.prototype.kindName : e = this.value(e, b + this.tab), d = b + this.tab + '"' + f + '": ' + e, c.push(d);
return "{" + this._block(c, b) + "}";
},
array: function(a, b) {
var c = [], d;
for (var e = 0, f = a.length; e < f; e++) d = b + this.tab + this.value(a[e], b + this.tab), c.push(d);
return "[" + this._block(c, b) + "]";
},
value: function(a, b) {
var c = a === null || a === undefined ? "" : typeof a;
switch (c) {
case "string":
a = a.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\"/g, '\\"');
return '"' + a + '"';
case "function":
var d = a + "";
d = d.replace(/\n*\r/g, "\n"), d = d.replace(/(^\.\.\.\.)|[\.\t]+(\.\.\.\.)/g, "\t"), d = d.split("\n");
return d.join("\n" + b);
case "object":
return a.constructor == Array ? this.array(a, b) : this.obj(a, b);
default:
return a;
}
},
to: function(a) {
return this.value(a, "");
},
from: function(inJson) {
return eval("(" + inJson + ")");
},
stringify: function(a) {},
parse: function(a) {}
}, window.JSON && (enyo.json.stringify = window.JSON ? JSON.stringify : enyo.json.to, enyo.json.parse = window.JSON ? JSON.parse : enyo.json.from);

// base/core/Oop.js

enyo.kind = function(a) {
enyo._kindCtors = {};
var b = a.name || "", c = a.isa || a.kind;
if (c === undefined && "kind" in a) throw "enyo.kind: Attempt to subclass an 'undefined' kind. Check dependencies for [" + b + "].";
var d = c && enyo.constructorForKind(c), e = d && d.prototype || null, f = enyo.kind.makeCtor();
delete a.name, a.hasOwnProperty("constructor") && (a._constructor = a.constructor, delete a.constructor), enyo.setPrototype(f, e ? enyo.delegate(e) : {}), enyo.mixin(f.prototype, a), f.prototype.kindName = b, f.prototype.base = d, f.prototype.ctor = f, enyo.forEach(enyo.kind.features, function(b) {
b(f, a);
}), enyo.setObject(b, f);
return f;
}, enyo.kind.makeCtor = function() {
return function() {
this._constructor && this._constructor.apply(this, arguments), this.constructed && this.constructed.apply(this, arguments);
};
}, enyo.kind.defaultNamespace = "enyo", enyo.kind.features = [], enyo.kind.features.push(function(a, b) {
var c = a.prototype;
c.inherited || (c.inherited = enyo.kind.inherited);
if (c.base) for (var d in b) {
var e = b[d];
typeof e == "function" && (e._inherited = c.base.prototype[d], e.nom = c.kindName + "." + d + "()");
}
}), enyo.kind.inherited = function(a, b) {
return a.callee._inherited.apply(this, b || a);
}, enyo.kind.features.push(function(a, b) {
enyo.mixin(a, enyo.kind.statics), b.statics && (enyo.mixin(a, b.statics), delete a.prototype.statics);
var c = a.prototype.base;
while (c) c.subclass(a, b), c = c.prototype.base;
}), enyo.kind.statics = {
subclass: function(a, b) {},
extend: function(a) {
enyo.mixin(this.prototype, a);
}
}, enyo.kind.features.push(function(a, b) {
if (b.mixins) {
var c = a.prototype;
for (var d = 0, e; e = b.mixins[d]; d++) {
var f = e;
for (var g in f) if (f.hasOwnProperty(g) && !b.hasOwnProperty(g)) {
var h = f[g];
enyo.isFunction(h) && (h + "").indexOf("inherited") >= 0 ? c[g] = enyo.kind._wrapFn(h, c, g) : c[g] = h;
}
}
}
}), enyo.kind._wrapFn = function(a, b, c) {
var d = function(a) {
return b.base.prototype[c].apply(this, a);
};
return function() {
this.inherited = d, a.apply(this, arguments), this.inherited = enyo.kind.inherited;
};
}, enyo._kindCtors = {}, enyo.constructorForKind = function(a) {
if (typeof a == "function") var b = a; else a && (b = enyo._kindCtors[a], b || (enyo._kindCtors[a] = b = enyo.Theme[a] || enyo[a] || enyo.getObject(a, !1, enyo) || window[a] || enyo.getObject(a)));
if (!b) throw "Oop.js: Failed to find a constructor for kind [" + a + "]";
return b;
}, enyo.Theme = {}, enyo.registerTheme = function(a) {
enyo.mixin(enyo.Theme, a);
};

// base/core/Object.js

enyo.kind({
name: "enyo.Object",
constructor: function() {
enyo._objectCount++;
},
destroyObject: function(a) {
this[a] && this[a].destroy && this[a].destroy(), this[a] = null;
},
getProperty: function(a) {
return this[a];
},
setProperty: function(a, b) {
var c = this.getProperty(a);
this[a] = b, this.propertyChanged && this.propertyChanged(a, b, c), a += "Changed", this[a] && this[a](c);
},
__console: function(a, b) {
window.console && (console.firebug ? console[a].apply(console, b) : console.log(b.join(" ")));
},
_console: function(a, b) {
var c = [];
for (var d = 0, e = b.length, f; (f = b[d]) || d < e; d++) String(f) == "[object Object]" && (f = enyo.json.stringify(f)), c.push(f);
this.__console(a, [ b.callee.caller.nom + ": " ].concat(c));
},
log: function() {
this._console("log", arguments);
},
warn: function() {
this._console("warn", arguments);
},
error: function() {
this._console("error", arguments);
}
}), enyo._objectCount = 0, enyo.Object.subclass = function(a, b) {
this.publish(a, b);
}, enyo.Object.publish = function(a, b) {
var c = b.published;
if (c) {
var d = a.prototype;
for (var e in c) enyo.Object.addGetterSetter(e, c[e], d);
}
}, enyo.Object.addGetterSetter = function(a, b, c) {
var d = a;
c[d] = b;
var e = a.slice(0, 1).toUpperCase() + a.slice(1), f = "get" + e;
c[f] || (c[f] = function() {
return this.getProperty(d);
});
var g = "set" + e;
c[g] || (c[g] = function(a) {
this.setProperty(d, a);
});
};

// base/core/Component.js

enyo.kind({
name: "enyo.Component",
kind: enyo.Object,
published: {
owner: null,
name: ""
},
defaultKind: "Component",
wantsEvents: !0,
toString: function() {
return this.kindName;
},
constructor: function() {
this._componentNameMap = {}, this.inherited(arguments), this.$ = {};
},
constructed: function(a) {
this.create(a), this.ready();
},
create: function(a) {
this.importProps(a), this.ownerChanged(), this.registerEvents(), this.initComponents();
},
initComponents: function() {
this.createComponents(this.kindComponents), this.createManagedComponents(this.components);
},
ready: function() {},
destroy: function() {
this.unregisterEvents(), this.destroyComponents(), this.setOwner(null), this.destroyed = !0;
},
destroyComponents: function() {
enyo.forEach(this.getComponents(), function(a) {
a.destroy();
});
},
importProps: function(a) {
if (a) for (var b in a) this[b] = a[b];
this.owner || (this.owner = enyo.master);
},
getId: function() {
return this.id;
},
makeId: function() {
var a = "_", b = this.owner && this.owner.getId();
return this.name ? (b ? b + a : "") + this.name : "";
},
registerEvents: function() {
this.wantsEvents && (enyo.$[this.id] = this);
},
unregisterEvents: function() {
delete enyo.$[this.id];
},
ownerChanged: function(a) {
a && a.removeComponent(this), this.owner && this.owner.addComponent(this), this.id = this.makeId();
},
nameComponent: function(a) {
var b = a.kindName || "object", c = b.lastIndexOf(".");
c >= 0 && (b = b.slice(c + 1)), b = b.charAt(0).toLowerCase() + b.slice(1);
var d = this._componentNameMap[b] || 1;
for (var e; Boolean(this.$[e = b + (d > 1 ? String(d) : "")]); d++) {}
this._componentNameMap[b] = Number(d) + 1;
return a.name = e;
},
addComponent: function(a) {
var b = a.getName();
b || (b = this.nameComponent(a)), this.$[b] && this.warn('Duplicate component name "' + b + '" violates unique-name-under-owner rule, replacing existing component in the hash and continuing, but this is an error condition and should be fixed.'), this.$[b] = a;
},
removeComponent: function(a) {
delete this.$[a.getName()];
},
getComponents: function() {
var a = [];
for (var b in this.$) a.push(this.$[b]);
return a;
},
adjustComponentProps: function(a) {
this.defaultProps && enyo.mixin(a, this.defaultProps), a.kind = a.kind || a.isa || this.defaultKind, a.owner = a.owner || this;
},
getInstanceOwner: function() {
return this.owner != enyo.master ? this.owner : this;
},
createManagedComponent: function(a) {
return this.createComponent(a, {
owner: this.getInstanceOwner()
});
},
createManagedComponents: function(a) {
this.createComponents(a, {
owner: this.getInstanceOwner()
});
},
createComponent: function(a, b) {
var c = enyo.mixin(enyo.clone(b), a);
this.adjustComponentProps(c);
return enyo.Component.create(c);
},
createComponents: function(a, b) {
if (a) for (var c = 0, d; d = a[c]; c++) this.createComponent(d, b);
},
dispatch: function(a, b, c) {
var d = a && b && a[b];
if (d) {
var e = c;
d._dispatcher || (e = e ? enyo.cloneArray(e, 0, [ this ]) : [ this ]);
return d.apply(a, e || []);
}
},
dispatchIndirectly: function(a, b) {
var c = this.owner && this.owner[this[a]];
if (c) {
var d = b;
c._dispatcher || (d = d ? enyo.cloneArray(d, 0, [ this ]) : [ this ]);
return c.apply(this.owner, d || []);
}
},
dispatchDomEvent: function(a) {
var b = a.type + "Handler";
return this[b] ? this[b](a.dispatchTarget, a) : this.dispatchIndirectly("on" + a.type, arguments);
},
fire: function(a) {
var b = enyo.cloneArray(arguments, 1);
return this.dispatch(this.owner, this[a], b);
},
propertyChanged: function(a, b, c) {
if (this.owner && this.owner.forward) {
var d = this.owner.forward[a];
if (d) {
var e = (d.forward || a) + "Changed";
this.owner[e] && this.owner[e](c);
}
}
}
}), enyo.defaultCtor = enyo.Component, enyo.create = enyo.Component.create = function(a) {
if (!a.kind && "kind" in a) throw "enyo.create: Attempt to create a null kind. Check dependencies.";
var b = a.kind || a.isa || enyo.defaultCtor, c = enyo.constructorForKind(b);
c || (console.warn('no constructor found for kind "' + b + '"'), c = enyo.Component);
return new c(a);
}, enyo.Component.subclass = function(a, b) {
b.components && (a.prototype.kindComponents = b.components, delete a.prototype.components), b.events && this.publishEvents(a, b), b.forward && this.forwardProperties(a, b);
}, enyo.Component.publishEvents = function(a, b) {
var c = b.events;
if (c) {
var d = a.prototype;
for (var e in c) this.addEvent(e, c[e], d);
}
}, enyo.Component.addEvent = function(a, b, c) {
var d, e;
enyo.isString(b) ? (a.slice(0, 2) != "on" && (console.warn("enyo.Component.addEvent: event names must start with 'on'. " + c.kindName + " event '" + a + "' was auto-corrected to 'on" + a + "'."), a = "on" + a), d = b, e = "do" + enyo.cap(a.slice(2))) : (d = b.value, e = b.caller), c[a] = d, c[e] || (c[e] = function() {
return this.dispatchIndirectly(a, arguments);
}, c[e]._dispatcher = !0);
}, enyo.Component.forwardProperties = function(a, b) {
var c = b.forward;
if (c) {
var d = a.prototype;
for (var e in c) this.addForward(e, c[e], d);
}
}, enyo.Component.addForward = function(a, b, c) {
var d = a, e, f;
enyo.isString(b) ? (e = b, f = d) : (e = b.from, f = b.as || d);
var g = f.slice(0, 1).toUpperCase() + f.slice(1), h = "get" + g;
c[h] || (c[h] = function() {
return this.$[e].getProperty(d);
});
var i = "set" + g;
c[i] || (c[i] = function(a) {
this.$[e].setProperty(d, a);
});
}, enyo.$ = {}, enyo.master = new enyo.Component;

// base/core/Animation.js

enyo.kind({
name: "enyo.Animation",
duration: 350,
tick: 20,
start: 0,
end: 100,
repeat: 0,
easingFunc: enyo.easing.cubicOut,
constructed: function(a) {
enyo.mixin(this, a);
},
play: function() {
this._repeated = 0, this._progress = 1, this._steps = Math.ceil(this.duration / (this.tick || 1)), this._value = this.start, this.animating && this.stop(), this.callMethod("onBegin", [ this.start, this.end ]), this.animating = setInterval(enyo.hitch(this, "_animate"), this.tick), this._animate();
return this;
},
stop: function() {
clearInterval(this.animating), this.animating = null, this.callMethod("onStop", [ this._value, this.start, this.end ]);
return this;
},
_animate: function() {
(this.repeat < 0 || this._repeated < this.repeat) && this._progress > this._steps && (this._progress = 1, this._repeated++);
var a = this._progress / this._steps, b = this.easingFunc ? this.easingFunc(a) : a, c = this._value = this.start + b * (this.end - this.start);
this._progress > this._steps ? (this.stop(), this.callMethod("onEnd", [ c ])) : (this.callMethod("onAnimate", [ c, a, this._steps ]), this._progress++);
},
callMethod: function(a, b) {
var c = this[a];
c && c.apply(this, b);
}
}), enyo.kind({
name: "enyo.Animator",
kind: enyo.Component,
published: {
duration: 350,
tick: 20,
repeat: 0,
easingFunc: enyo.easing.cubicOut
},
events: {
onBegin: "",
onAnimate: "",
onStop: "",
onEnd: ""
},
play: function(a, b) {
this.stop(), this._animation = new enyo.Animation({
duration: this.duration,
tick: this.tick,
repeat: this.repeat,
easingFunc: this.easingFunc,
start: a,
end: b,
onBegin: enyo.hitch(this, "doBegin"),
onAnimate: enyo.hitch(this, "doAnimate"),
onStop: enyo.hitch(this, "doStop"),
onEnd: enyo.hitch(this, "doEnd")
}), this._animation.play();
},
stop: function() {
this._animation && this._animation.stop();
},
isAnimating: function() {
return this._animation && this._animation.animating;
}
});

// base/core/Dispatcher.js

enyo.$ = {}, enyo.dispatcher = {
handlerName: "dispatchDomEvent",
captureHandlerName: "captureDomEvent",
mouseOverOutEvents: {
mouseover: 1,
mouseout: 1
},
events: [ "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "click", "dblclick", "change", "keydown", "keyup", "keypress" ],
windowEvents: [ "resize", "load", "unload" ],
connect: function() {
var a = enyo.dispatcher;
for (var b = 0, c; c = a.events[b]; b++) document.addEventListener(c, enyo.dispatch, !1);
for (b = 0, c; c = a.windowEvents[b]; b++) window.addEventListener(c, enyo.dispatch, !1);
},
findDispatchTarget: function(a) {
var b, c = a;
try {
while (c) {
if (b = enyo.$[c.id]) {
b.eventNode = c;
break;
}
c = c.parentNode;
}
} catch (d) {
console.log(d, c);
}
return b;
},
findDefaultTarget: function(a) {
return enyo.master.getComponents()[0];
},
dispatch: function(a) {
var b = this.findDispatchTarget(a.target) || this.findDefaultTarget(a);
a.dispatchTarget = b;
for (var c = 0, d; fn = this.features[c]; c++) if (fn.call(this, a)) return !0;
b = a.filterTarget || b;
if (b) {
a.filterTarget || this.dispatchCapture(a, b);
var e = this.dispatchBubble(a, b);
a.forward && (e = this.forward(a));
}
},
forward: function(a) {
var b = a.dispatchTarget;
return b && this.dispatchBubble(a, b);
},
dispatchCapture: function(a, b) {
var c = this.buildAncestorList(a.target);
for (var d = c.length - 1, e; e = c[d]; d--) if (this.dispatchToCaptureTarget(a, e) === !0) return !0;
},
buildAncestorList: function(a) {
var b = [], c = a, d;
while (c) d = enyo.$[c.id], d && b.push(d), c = c.parentNode;
return b;
},
dispatchToCaptureTarget: function(a, b) {
var c = this.captureHandlerName;
if (b[c]) {
if (b[c](a) !== !0) return !1;
return !0;
}
},
dispatchBubble: function(a, b) {
while (b) {
a.type == "click" && a.ctrlKey && a.altKey && console.log(a.type + ": " + b.name + " [" + b.kindName + "]");
if (this.dispatchToTarget(a, b) === !0) return !0;
b = b.parent || b.manager || b.owner;
}
return !1;
},
dispatchToTarget: function(a, b) {
if (this.handleMouseOverOut(a, b)) return !0;
var c = this.handlerName;
if (b[c]) {
if (b[c](a) !== !0) return !1;
a.handler = b;
return !0;
}
},
handleMouseOverOut: function(a, b) {
var c = this.mouseOverOutEvents[a.type];
if (c) {
if (this.isInternalMouseOverOut(a, b)) return !0;
var d = {
type: "child" + a.type,
dispatchTarget: a.dispatchTarget
};
this.dispatchBubble(d, b.parent);
}
},
isInternalMouseOverOut: function(a, b) {
var c = b.eventNode, d = this.findDispatchTarget(a.relatedTarget);
if (b == d && c != b.eventNode) {
b.eventNode = c;
return !1;
}
return d && d.isDescendantOf(b);
}
}, enyo.dispatch = function(a) {
return enyo.dispatcher.dispatch(enyo.fixEvent(a));
}, enyo.bubble = function(a) {
a && enyo.dispatch(a);
}, enyo.bubbler = "enyo.bubble(arguments[0])", enyo.addOnStart(enyo.dispatcher.connect), enyo.dispatcher.features = [], enyo.mixin(enyo.dispatcher, {
_squelch: [],
squelchPeriod: 150,
squelchNextType: function(a) {
this._squelch[a] = (new Date).getTime() + this.squelchPeriod;
},
squelchNextClick: function() {
this.squelchNextType("click");
}
}), enyo.dispatcher.features.push(function(a) {
var b = this._squelch[a.type];
if (b) {
this._squelch[a.type] = 0;
if ((new Date).getTime() < b) return !0;
}
}), enyo.dispatcher.captureFeature = {
noCaptureEvents: {
load: 1,
error: 1
},
autoForwardEvents: {
mouseout: 1
},
captures: [],
capture: function(a, b) {
this.captureTarget && this.captures.push(this.captureTarget), this.captureTarget = a, this.forwardEvents = b;
},
release: function() {
this.captureTarget = this.captures.pop();
}
}, enyo.mixin(enyo.dispatcher, enyo.dispatcher.captureFeature), enyo.dispatcher.features.push(function(a) {
var b = a.dispatchTarget;
if (this.captureTarget && !this.noCaptureEvents[a.type]) if (!b || !b.isDescendantOf(this.captureTarget)) a.filterTarget = this.captureTarget, a.forward = this.autoForwardEvents[a.type] || this.forwardEvents;
}), enyo.dispatcher.keyEvents = {
keydown: 1,
keyup: 1,
keypress: 1
}, enyo.dispatcher.features.push(function(a) {
this.keyWatcher && this.keyEvents[a.type] && this.dispatchToTarget(a, this.keyWatcher);
});

// base/core/Gesture.js

enyo.dispatcher.features.push(function(a) {
enyo.gesture[a.type] && enyo.gesture[a.type](a);
}), enyo.gesture = {
hysteresis: 4,
holdDelay: 150,
send: function(a, b, c) {
var d = {
type: a,
pageX: b && b.pageX,
pageY: b && b.pageY,
target: this.target
};
enyo.mixin(d, c), enyo.dispatch(d);
return d;
},
keyup: function(a) {
a.keyCode == 27 && enyo.dispatch({
type: "back",
target: null,
preventDefault: function() {
a.preventDefault();
}
});
},
mousedown: function(a) {
this.target = a.target, this.startTracking(a), this.startMouseHold(a);
},
startTracking: function(a) {
this.tracking = !0, this.px0 = a.pageX, this.py0 = a.pageY;
},
startMouseHold: function(a) {
this.holdJob = setTimeout(enyo.hitch(this, "sendMousehold", a), this.holdDelay);
},
mousemove: function(a) {
this.tracking && (this.dx = a.pageX - this.px0, this.dy = a.pageY - this.py0, Math.sqrt(this.dy * this.dy + this.dx * this.dx) >= this.hysteresis && (this.stopMouseHold(), this.sendStartDrag(a)));
},
sendStartDrag: function(a) {
var b = {
type: "startDrag",
dx: this.dx,
dy: this.dy,
pageX: a.pageX,
pageY: a.pageY,
target: this.target
};
enyo.dispatch(b), b.handler ? this.stopTracking() : this.startTracking(a);
},
mouseup: function(a) {
this.stopTracking(), this.stopMouseHold();
},
sendMousehold: function(a) {
this.holdJob = 0, a = this.send("mousehold", a);
},
stopTracking: function() {
this.tracking = !1;
},
stopMouseHold: function(a) {
this.holdJob ? clearTimeout(this.holdJob) : this.sendMouseRelease(a), this.holdJob = 0;
},
sendMouseRelease: function(a) {
this.send("mouserelease", a);
}
};

// base/core/Drag.js

enyo.kind({
name: "enyo.Drag",
kind: enyo.Component,
events: {
onDrag: "drag",
onDrop: "dragDrop",
onFinish: "dragFinish"
},
mode: 0,
constructor: function() {
this.dispatcher = enyo.dispatcher;
},
start: function(a) {
this.dispatcher.capture(this), this.dragging = !0, a && (this.starting = !0, this.track(a));
},
track: function(a) {
this.px = a.pageX, this.py = a.pageY, this.starting && (this.px0 = this.px, this.py0 = this.py, this.starting = !1), this.dx = this.dpx = this.px - this.px0, this.dy = this.dpy = this.py - this.py0;
},
mousemoveHandler: function(a, b) {
this.track(b), this.drag(b);
return !0;
},
mouseupHandler: function(a, b) {
this.drop(b), this.finish();
return !0;
},
drag: function(a) {
this.doDrag(a);
},
drop: function(a) {
this.doDrop(a);
},
finish: function() {
this.dragging = !1, this.dispatcher.release(this), this.dispatcher.squelchNextClick(), this.doFinish();
}
}), enyo.Drag.mode = {
FREE: 0,
HORIZONTAL: 1,
VERTICAL: 2
};

// base/core/DomNode.js

enyo.kind({
name: "enyo.DomNode",
kind: enyo.Component,
published: {
showing: !0
},
node: null,
create: function() {
this.inherited(arguments), this.showingChanged();
},
destroy: function() {
this._remove(), this.inherited(arguments);
},
_append: function() {
if (this.node) {
var a = this.getParentNode();
a && a.appendChild(this.node);
}
},
_remove: function() {
this.hasNode() && this.node.parentNode && this.node.parentNode.removeChild(this.node);
},
setNode: function(a) {
this.node = a;
},
createNode: function() {
this.node = document.createElement(this.nodeTag), this._append();
},
findNodeById: function() {
return this.id && (this.node = enyo.byId(this.id));
},
hasNode: function() {
return this.node || this.id && this.findNodeById();
},
getParentNode: function() {
return enyo.byId(this.parentNode);
},
setParentNode: function(a) {
a || this._remove(), this.parentNode = a, this._append();
},
appendChildNode: function(a) {
a && this.hasNode() && this.node.appendChild(a);
},
insertNodeAt: function(a, b) {
var c = this.node.childNodes[b];
this.node.insertBefore(a, c);
},
getBounds: function() {
var a = this.node || this.hasNode() || 0;
return {
left: a.offsetLeft,
top: a.offsetTop,
width: a.offsetWidth,
height: a.offsetHeight
};
},
addCssText: function(a) {
var b = a.split(";");
for (var c = 0, d; d = b[c]; c++) d = d.split(":"), this.domStyles[d[0]] = d[1];
},
addStyles: function(a) {
this.addCssText(a), this.hasNode() && this.stylesToNode(this.domStyles);
},
applyStyle: function(a, b) {
this.domStyles[a] = b, this.hasNode() && this.stylesToNode(this.domStyles);
},
setStyle: function(a) {
this.domStyles = {}, this.addStyles(a);
},
show: function() {
this.setShowing(!0);
},
hide: function() {
this.setShowing(!1);
},
showingChanged: function() {
var a = this.domStyles;
this.showing ? a.display == "none" && (a.display = this._displayStyle || "") : (this._displayStyle = a.display == "none" ? "" : a.display, a.display = "none"), this.hasNode() && (this.node.style.display = a.display);
},
setClassName: function(a) {
this.setAttribute("className", a);
},
getClassName: function() {
return this.domAttributes.className || "";
},
hasClass: function(a) {
return a && (" " + this.getClassName() + " ").indexOf(" " + a + " ") >= 0;
},
addClass: function(a) {
if (a && !this.hasClass(a)) {
var b = this.getClassName();
this.setClassName(b + (b ? " " : "") + a);
}
},
removeClass: function(a) {
if (a && this.hasClass(a)) {
var b = this.getClassName();
b = (" " + b + " ").replace(" " + a + " ", " ").slice(1, -1), this.setClassName(b);
}
},
addRemoveClass: function(a, b) {
this[b ? "addClass" : "removeClass"](a);
},
setAttribute: function(a, b) {
this.domAttributes[a] = b, this.hasNode() && this.attributeToNode(a, b);
},
attributeToNode: function(a, b) {
a == "className" && (a = "class"), b === null ? this.node.removeAttribute(a) : this.node.setAttribute(a, b);
},
attributesToNode: function(a) {
for (var b in a) this.attributeToNode(b, a[b]);
},
stylesToNode: function(a) {
this.node.style.cssText = enyo.stylesToHtml(a);
},
setBox: function(a, b) {
var c = this.domStyles, d = b || "px";
"w" in a && a.w >= 0 && (c.width = a.w + d), "h" in a && a.h >= 0 && (c.height = a.h + d), a.l !== undefined && (c.left = a.l + d), a.t !== undefined && (c.top = a.t + d), a.r !== undefined && (c.right = a.r + d), a.b !== undefined && (c.bottom = a.b + d);
},
boxToNode: function(a) {
var b = this.node.style, c = "px";
"w" in a && a.w >= 0 && (b.width = a.w + c), "h" in a && a.h >= 0 && (b.height = a.h + c), a.l !== undefined && (b.left = a.l + c), a.t !== undefined && (b.top = a.t + c);
}
});

// base/core/DomNodeBuilder.js

enyo.kind({
name: "enyo.AbstractDomNodeBuilder",
kind: enyo.DomNode,
content: "",
generated: !1,
nodeTag: "div",
hasNode: function() {
return this.generated ? this.node || this.findNodeById() : null;
},
getContent: function() {
return this.content;
},
generateHtml: function() {
this.generated = !0;
if (this.canGenerate === !1) return "";
var a = this.getContent(), b = "<" + this.nodeTag + enyo.attributesToHtml(this.getDomAttributes()), c = (this.style ? this.style + ";" : "") + enyo.stylesToHtml(this.getDomStyles());
c && (b += ' style="' + c + '"'), this.nodeTag == "img" ? b += "/>" : b += ">" + a + "</" + this.nodeTag + ">";
return b;
},
renderDomAttributes: function() {
this.attributesToNode(this.getDomAttributes());
},
renderDomStyles: function() {
this.stylesToNode(this.getDomStyles());
},
renderDomContent: function() {
this.node.innerHTML = this.getContent();
},
renderDom: function() {
this.renderDomAttributes(), this.renderDomStyles(), this.renderDomContent();
},
renderNode: function() {
this.generated = !0, this.createNode(), this.renderDom(), this.rendered();
},
render: function() {
this.hasNode() ? (this.renderDom(), this.rendered()) : this.renderNode();
},
renderContent: function() {
this.hasNode() && (this.renderDomContent(), this.rendered());
},
renderInto: function(a) {
var b = enyo.byId(a), c = window.getComputedStyle(b, null);
c.height !== "auto" && c.height !== "0px" ? this.addClass(enyo.fittingClassName) : b == document.body && this.addClass(enyo.fittingClassName), b.innerHTML = this.generateHtml(), this.rendered();
return this;
},
rendered: function() {}
}), enyo.fittingClassName = "enyo-fit", enyo.kind({
name: "enyo.DomNodeBuilder",
kind: enyo.AbstractDomNodeBuilder,
constructor: function() {
this.inherited(arguments), this.domStyles = enyo.clone(this.domStyles || {}), this.domAttributes = enyo.clone(this.domAttributes || {});
},
getDomStyles: function() {
return this.domStyles;
},
getDomAttributes: function() {
return this.domAttributes;
}
}), enyo.stylesToHtml = function(a) {
var b, c, d = "";
for (b in a) {
c = a[b], b = b.replace(/_/g, "");
if (c !== null && c !== undefined && c !== "") {
if (enyo.isIE && b == "opacity") {
if (c >= .99) continue;
b = "filter", c = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + Math.floor(c * 100) + ")";
}
d += b + ":" + c + ";";
}
}
return d;
}, enyo.attributesToHtml = function(a) {
var b, c, d = "";
for (b in a) c = a[b], b == "className" && (b = "class"), c !== null && c !== "" && (d += " " + b + '="' + c + '"');
return d;
};

// base/core/ManagedDomBuilder.js

enyo.kind({
name: "enyo.ManagedDomBuilder",
kind: enyo.DomNodeBuilder,
published: {
content: "",
className: "",
manager: null,
parent: null
},
style: "",
create: function(a) {
this.inherited(arguments), this.addClass(this.className), this.addCssText(this.style), this.domAttributes.id = this.id, this.width && (this.domStyles.width = this.width), this.height && (this.domStyles.height = this.height), this.managerChanged(), this.parentChanged();
},
destroy: function() {
this.setParent(null), this.setManager(null), this.inherited(arguments);
},
importProps: function(a) {
a && (a.style && (this.addCssText(a.style), delete a.style), a.domStyles && (enyo.mixin(this.domStyles, a.domStyles), delete a.domStyles), a.domAttributes && (enyo.mixin(this.domAttributes, a.domAttributes), delete a.domAttributes), a.className && this.className && (this.className += " " + a.className, delete a.className)), this.inherited(arguments);
},
managerChanged: function(a) {
a && a.removeControl(this), this.manager && this.manager.addControl(this);
},
parentChanged: function(a) {
a != this.parent && (a && a.removeChild(this), this.parent && this.parent.addChild(this));
},
isDescendantOf: function(a) {
var b = this;
while (b && b != a) b = b.parent;
return a && b == a;
},
getParentNode: function() {
return this.parent && this.parent.hasNode();
},
rendered: function() {
this.node = null;
},
contentChanged: function() {
this.renderContent();
},
addContent: function(a, b) {
this.setContent((this.content ? this.content + (b || "") : "") + a);
}
});

// base/core/Control.js

enyo.kind({
name: "enyo.Control",
kind: enyo.ManagedDomBuilder,
published: {
layoutKind: ""
},
events: {
onclick: "",
onmousedown: "",
onmouseup: ""
},
controlParentName: "client",
defaultKind: "Control",
constructor: function() {
this.controls = [], this.children = [], this.inherited(arguments);
},
create: function() {
this.inherited(arguments), this.layoutKindChanged();
},
initComponents: function() {
this.createChrome(this.chrome), this.inherited(arguments);
},
discoverControlParent: function() {
this.controlParent = this.$[this.controlParentName] || this.controlParent;
},
createComponents: function() {
this.inherited(arguments), this.discoverControlParent();
},
createChrome: function(a) {
this.createComponents(a, {
isChrome: !0
});
},
adjustComponentProps: function(a) {
this.inherited(arguments), a.manager = a.manager || this;
},
addControl: function(a) {
a.parent = a.parent || this, this.controls.push(a);
},
removeControl: function(a) {
return enyo.remove(a, this.controls);
},
indexOfControl: function(a) {
return enyo.indexOf(a, this.controls);
},
getControls: function() {
var a = [];
for (var b = 0, c = this.controls, d; d = c[b]; b++) d.isChrome || a.push(d);
return a;
},
destroyControls: function() {
var a = this.getControls();
for (var b = 0, c; c = a[b]; b++) c.destroy();
},
addChild: function(a) {
this.controlParent && !a.isChrome ? this.appendControlParentChild(a) : this.appendChild(a);
},
appendControlParentChild: function(a) {
this.controlParent.addChild(a);
},
appendChild: function(a) {
a.parent = this, this.children.push(a), this.appendChildNode(a.hasNode());
},
indexOfChild: function(a) {
return enyo.indexOf(a, this.children);
},
removeChild: function(a) {
return enyo.remove(a, this.children);
},
layoutKindChanged: function() {
this.destroyObject("layout"), this.createLayoutFromKind(this.layoutKind);
},
createLayoutFromKind: function(a) {
var b = a && enyo.constructorForKind(a);
b && (this.layout = new b(this));
},
getContent: function() {
this.flow();
return this.getChildContent() || this.content;
},
getEmpiricalChildParent: function() {
var a = this.getControls()[0];
return a && a.parent || this.controlParent || this;
},
flow: function() {
this.layout && this.layout.flow(this);
},
flowControls: function() {
this.controlParent ? this.controlParent.flowControls() : this.flow();
},
getChildContent: function() {
var a = "";
for (var b = 0, c; c = this.children[b]; b++) a += c.generateHtml();
return a;
},
rendered: function() {
this.inherited(arguments), this.childrenRendered();
},
childrenRendered: function() {
for (var a = 0, b; b = this.children[a]; a++) b.rendered();
}
}), enyo.defaultKind = enyo.defaultCtor = enyo.Control;

// base/cross/webkitGesture.js

enyo.dispatcher.features.push(function(a) {
enyo.iphoneGesture[a.type] && enyo.iphoneGesture[a.type](a);
}), enyo.iphoneGesture = {
_send: function(a, b) {
var c = {
type: a,
preventDefault: enyo.nop
};
enyo.mixin(c, b), enyo.dispatch(c);
},
touchstart: function(a) {
this._send("mousedown", a.changedTouches[0]), a.preventDefault();
},
touchmove: function(a) {
this._send("mousemove", a.changedTouches[0]);
},
touchend: function(a) {
this._send("mouseup", a.changedTouches[0]), this._send("click", a.changedTouches[0]);
},
connect: function() {
document.ontouchstart = enyo.dispatch, document.ontouchmove = enyo.dispatch, document.ontouchend = enyo.dispatch;
}
}, enyo.iphoneGesture.connect();

// base/cross/webosGesture.js

window.PalmSystem && (enyo.dispatcher.features.push(function(a) {
enyo.webosGesture[a.type] && enyo.webosGesture[a.type](a);
}), enyo.webosGesture = {
mousedown: function(a) {
this.lastDownTarget = a.target;
}
}, Mojo = window.Mojo || {}, Mojo.handleGesture = function(a, b) {
var c = enyo.mixin({
type: a,
target: enyo.webosGesture.lastDownTarget
}, b);
enyo.dispatch(c);
}, Mojo.screenOrientationChanged = function(a) {
enyo.dispatch({
type: "windowRotated",
orientation: a
});
}, enyo.webosGesture.preventMousedown = function(a) {
var b = a.target, c = b.getAttribute && (b.getAttribute("contenteditable") || enyo.webosGesture.passEvent(b));
b.tagName != "INPUT" && !c && (a.preventDefault(), document.activeElement != a.target && (document.activeElement.blur(), a.target.focus()));
}, enyo.webosGesture.passEvent = function(a) {
var b = a;
while (b) {
if (b.getAttribute && b.getAttribute("enyo-pass-events")) return !0;
b = b.parentNode;
}
}, enyo.webosGesture.connect = function() {
document.addEventListener("gesturestart", enyo.dispatch), document.addEventListener("gesturechange", enyo.dispatch), document.addEventListener("gestureend", enyo.dispatch), document.addEventListener("mousedown", enyo.webosGesture.preventMousedown, !0);
}, enyo.webosGesture.connect());

// base/layout/Grid.js

enyo.kind({
name: "enyo.Grid",
kind: enyo.Control,
cellClass: "",
create: function() {
this.inherited(arguments), this.addClass("enyo-grid");
},
addControl: function(a) {
this.inherited(arguments), a.addClass("enyo-grid-div " + this.cellClass);
}
});

// base/layout/FlexLayout.js

enyo.kind({
name: "enyo.FlexLayout",
pack: "start",
align: "stretch",
constructor: function(a) {
this.prefix = enyo.isMoz ? "-moz" : "-webkit", a && (this.pack = a.pack || this.pack, this.align = a.align || this.align), this.container = a;
},
destroy: function() {
this.container && delete this.container.setFlex;
},
calcControlFlex: function(a, b, c) {
var d = a.domStyles;
if (a.flex) return a.flex;
if (d[b] == "100%" || a[c] == "fill") {
delete d[b];
return a.flex = 1;
}
return null;
},
flowExtent: function(a, b, c) {
for (var d = 0, e, f, g; e = a[d]; d++) g = this.calcControlFlex(e, b, c), f = e.domStyles, f[this.prefix + "-box-flex"] = g, g && (f[b] || (f[b] = "0px"), enyo.isMoz && b == "height" && this.align == "stretch" && (f.width = "100%"));
},
flow: function(a) {
var b = a.domStyles;
b[this.prefix + "-box-pack"] = a.pack || this.pack, b[this.prefix + "-box-align"] = a.align || this.align, a.addClass(this.flexClass), this._flow(a.children);
}
}), enyo.kind({
name: "enyo.HFlexLayout",
kind: enyo.FlexLayout,
flexClass: "enyo-hflexbox",
_flow: function(a) {
this.flowExtent(a, "width", "w");
}
}), enyo.kind({
name: "enyo.VFlexLayout",
kind: enyo.FlexLayout,
flexClass: "enyo-vflexbox",
_flow: function(a) {
this.flowExtent(a, "height", "h");
}
}), enyo.kind({
name: "enyo.HFlexBox",
kind: enyo.Control,
layoutKind: enyo.HFlexLayout
}), enyo.kind({
name: "enyo.VFlexBox",
kind: enyo.Control,
layoutKind: enyo.VFlexLayout
});

// base/scroller/ScrollMath.js

enyo.kind({
name: "enyo.ScrollMath",
kind: enyo.Component,
published: {
vertical: !0,
horizontal: !0
},
events: {
onScrollStart: "scrollStart",
onScroll: "scroll",
onScrollStop: "scrollStop"
},
kSpringDamping: .93,
kDragDamping: .5,
kFrictionDamping: .98,
kSnapFriction: .9,
kFlickScalar: .02,
topBoundary: 0,
rightBoundary: 0,
bottomBoundary: 0,
leftBoundary: 0,
x0: 0,
x: 0,
y0: 0,
y: 0,
verlet: function(a) {
var b = this.x;
this.x += b - this.x0, this.x0 = b;
var c = this.y;
this.y += c - this.y0, this.y0 = c;
},
damping: function(a, b, c, d) {
var e = .5;
if (Math.abs(a - b) < e) return b;
return a * d > b * d ? c * (a - b) + b : a;
},
boundaryDamping: function(a, b, c, d) {
return this.damping(this.damping(a, b, d, 1), c, d, -1);
},
constrain: function() {
var a = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
a != this.y && (this.y0 = a - (this.y - this.y0) * this.kSnapFriction, this.y = a);
var b = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
b != this.x && (this.x0 = b - (this.x - this.x0) * this.kSnapFriction, this.x = b);
},
friction: function(a, b, c) {
var d = .01, e = this[a] - this[b], f = Math.abs(e) > d ? c : 0;
this[a] = this[b] + f * e;
},
frame: 10,
simulate: function(a) {
while (a >= this.frame) a -= this.frame, this.dragging || this.constrain(), this.verlet(), this.friction("y", "y0", this.kFrictionDamping), this.friction("x", "x0", this.kFrictionDamping);
return a;
},
interval: 20,
animate: function() {
this.stop();
var a = (new Date).getTime(), b = 0, c = 0, d = 0, e = [], f, g, h, i = enyo.hitch(this, function() {
this.dragging && (this.y0 = this.y = this.uy, this.x0 = this.x = this.ux);
var i = (new Date).getTime();
b += i - a, f = i - a, d += f, e.push(f), ++c == 20 && (c--, d -= e.shift()), this.fps = (c * 1e3 / d).toFixed(1) + " fps", a = i, b = this.simulate(b), h != this.y || g != this.x ? this.scroll() : this.dragging || (this.stop(!0), this.fps = "stopped", this.scroll()), h = this.y, g = this.x;
});
this.job = window.setInterval(i, this.interval);
},
start: function() {
this.job || (this.animate(), this.doScrollStart());
},
stop: function(a) {
window.clearInterval(this.job), this.job = null, a && this.doScrollStop();
},
startDrag: function(a) {
this.dragging = !0, this.my = a.pageY, this.py = this.uy = this.y, this.mx = a.pageX, this.px = this.ux = this.x;
},
drag: function(a) {
if (this.dragging) {
var b = this.vertical ? a.pageY - this.my : 0;
this.uy = b + this.py, this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
var c = this.horizontal ? a.pageX - this.mx : 0;
this.ux = c + this.px, this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping), this.start();
return !0;
}
},
dragDrop: function(a) {
this.dragging && !window.PalmSystem && (this.y = this.uy, this.y0 = this.y - (this.y - this.y0) * 1, this.x = this.ux, this.x0 = this.x - (this.x - this.x0) * 1), this.dragging = !1, this.job && enyo.dispatcher.squelchNextClick();
},
dragFinish: function() {
this.dragging = !1;
},
flick: function(a) {
this.vertical && (this.y = this.y0 + a.yVel * this.kFlickScalar), this.horizontal && (this.x = this.x0 + a.xVel * this.kFlickScalar), this.start();
},
scroll: function() {
this.doScroll();
}
});

// base/scroller/ScrollFades.js

enyo.kind({
name: "enyo.ScrollFades",
kind: enyo.Control,
className: "enyo-view",
components: [ {
name: "top",
showing: !1,
className: "enyo-scrollfades-top"
}, {
name: "bottom",
showing: !1,
className: "enyo-scrollfades-bottom"
}, {
name: "left",
showing: !1,
className: "enyo-scrollfades-left"
}, {
name: "right",
showing: !1,
className: "enyo-scrollfades-right"
} ],
showHideFades: function(a) {
var b = a.scrollTop, c = a.scrollLeft, d = a.getBoundaries();
this.$.top.setShowing(a.vertical && b > d.top), this.$.bottom.setShowing(a.vertical && b < d.bottom), this.$.left.setShowing(a.horizontal && c > d.left), this.$.right.setShowing(a.horizontal && c < d.right);
}
});

// base/scroller/DragScroller.js

enyo.kind({
name: "enyo.DragScroller",
kind: enyo.Control,
published: {
horizontal: !0,
vertical: !0
},
tools: [ {
name: "drag",
kind: "Drag"
}, {
name: "scroll",
kind: "ScrollMath"
} ],
create: function() {
this.inherited(arguments), this.horizontalChanged(), this.verticalChanged();
},
initComponents: function() {
this.createComponents(this.tools), this.inherited(arguments);
},
horizontalChanged: function() {
this.$.scroll.setHorizontal(this.horizontal);
},
verticalChanged: function() {
this.$.scroll.setVertical(this.vertical);
},
flickHandler: function(a, b) {
this.$.scroll.flick(b);
return !0;
},
shouldDrag: function(a) {
var b = Math.abs(a.dx) < Math.abs(a.dy), c = this.horizontal || this.autoHorizontal, d = this.vertical || this.autoVertical;
return b && d || !b && c;
},
startDragHandler: function(a, b) {
if (this.shouldDrag(b)) {
this.$.drag.start(b), this.$.scroll.startDrag(b);
return !0;
}
},
drag: function(a, b) {
this.$.scroll.drag(b);
},
dragDrop: function(a, b) {
this.$.scroll.dragDrop(b);
},
dragFinish: function(a) {
this.$.scroll.dragFinish();
}
});

// base/scroller/BasicScroller.js

enyo.kind({
name: "enyo.BasicScroller",
kind: enyo.DragScroller,
published: {
scrollTop: 0,
scrollLeft: 0,
autoHorizontal: !0,
autoVertical: !1,
fpsShowing: !1,
accelerated: !0
},
events: {
onScroll: ""
},
className: "enyo-scroller",
chrome: [ {
name: "client"
} ],
create: function() {
this.inherited(arguments), this.fpsShowingChanged(), this.acceleratedChanged();
},
rendered: function() {
this.inherited(arguments), this.hasNode() && enyo.asyncMethod(this.$.scroll, "start");
},
locateScrollee: function() {
return this.$.client;
},
setScrollee: function(a) {
this.scrollee && this.scrollee.removeClass("enyo-scroller-scrollee"), a || this.log("Setting null scrollee"), this.scrollee = a, this.scrollee.addClass("enyo-scroller-scrollee");
},
flow: function() {
this.setScrollee(this.locateScrollee()), this.layoutKindChanged(), this.inherited(arguments);
},
layoutKindChanged: function() {
this.$.client && this.$.client.setLayoutKind(this.layoutKind);
},
showingChanged: function() {
this.inherited(arguments), this.showing && enyo.asyncMethod(this, this.start);
},
fpsShowingChanged: function() {
!this.$.fps && this.fpsShowing && (this.createChrome([ {
name: "fps",
content: "stopped",
className: "enyo-scroller-fps",
parent: this
} ]), this.generated && this.$.fps.render()), this.$.fps && this.$.fps.setShowing(this.fpsShowing);
},
acceleratedChanged: function() {
var a = {
top: this.scrollTop,
left: this.scrollLeft
};
this.scrollTop = 0, this.scrollLeft = 0, this.effectScroll && this.effectScroll(), this.scrollTop = a.top, this.scrollLeft = a.left, this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated, this.effectScroll();
},
start: function() {
this.$.scroll.start();
},
scrollStart: function(a) {
this.calcBoundaries(), this.calcAutoScrolling();
},
scroll: function(a) {
this.scrollLeft = -a.x, this.scrollTop = -a.y, this.effectScroll(), this.doScroll();
},
scrollStop: function(a) {
this.fpsShowing && this.$.fps.setContent(a.fps);
},
effectScrollAccelerated: function() {
if (this.scrollee && this.scrollee.hasNode()) {
var a = this.scrollee.node.style, b = this.scrollee.domStyles, c = -this.scrollLeft + "px, " + -this.scrollTop + "px";
b.webkitTransform = a.webkitTransform = "translate3d(" + c + ",0)";
}
},
effectScrollNonAccelerated: function() {
if (this.scrollee && this.scrollee.hasNode()) {
var a = this.scrollee.node.style, b = this.scrollee.domStyles;
b.top = a.top = -this.scrollTop + "px", b.left = a.left = -this.scrollLeft + "px";
}
},
calcBoundaries: function() {
var a = this.scrollee && this.scrollee.hasNode();
a && this.hasNode() && (this.$.scroll.bottomBoundary = Math.min(0, this.node.clientHeight - (a.scrollHeight + a.offsetHeight - a.clientHeight)), this.$.scroll.rightBoundary = Math.min(0, this.node.clientWidth - (a.scrollWidth + a.offsetWidth - a.clientWidth)));
},
calcAutoScrolling: function() {
this.autoHorizontal && this.setHorizontal(this.$.scroll.rightBoundary != 0), this.autoVertical && this.setVertical(this.$.scroll.bottomBoundary != 0);
},
scrollLeftChanged: function() {
var a = this.$.scroll;
a.x = a.x0 = -this.scrollLeft, this.scrollee && a.start();
},
scrollTopChanged: function() {
var a = this.$.scroll;
a.y = a.y0 = -this.scrollTop, this.scrollee && a.start();
},
getBoundaries: function() {
var a = this.$.scroll;
this.calcBoundaries();
return {
top: a.topBoundary,
right: -a.rightBoundary,
bottom: -a.bottomBoundary,
left: a.leftBoundary
};
},
scrollTo: function(a, b) {
var c = this.$.scroll;
a != null && (c.y = c.y0 - (a + c.y0) * (1 - c.kFrictionDamping)), b != null && (c.x = c.x0 - (b + c.x0) * (1 - c.kFrictionDamping)), c.start();
},
scrollIntoView: function(a, b) {
if (this.hasNode()) {
var c = this.getBoundaries(), d = this.node.clientHeight, e = this.node.clientWidth;
(a < this.scrollTop || a > this.scrollTop + d) && this.setScrollTop(Math.max(c.top, Math.min(c.bottom, a))), (b < this.scrollLeft || b > this.scrollLeft + e) && this.setScrollLeft(Math.max(c.left, Math.min(c.right, a)));
}
},
scrollToBottom: function() {
this.scrollIntoView(9e6, 0);
}
});

// base/scroller/Scroller.js

enyo.kind({
name: "enyo.Scroller",
kind: enyo.BasicScroller,
chrome: [],
monoChrome: [ {
name: "client",
className: "enyo-view"
} ],
multiChrome: [ {
name: "client",
className: "enyo-view",
components: [ {
name: "innerClient"
} ]
} ],
initComponents: function() {
this.components && this.components.length === 1 ? this.createChrome(this.monoChrome) : (this.controlParentName = "innerClient", this.createChrome(this.multiChrome)), this.inherited(arguments);
},
locateScrollee: function() {
return this.$.innerClient || this.getControls()[0];
}
});

// base/scroller/TransformScroller.js

enyo.kind({
name: "enyo.TransformScroller",
kind: enyo.Scroller,
effectScroll: function() {
if (this.scrollee && this.scrollee.hasNode()) {
var a = -this.scrollLeft + "px, " + -this.scrollTop + "px";
this.scrollee.node.style.webkitTransform = "translate3d(" + a + ",0)";
}
}
});

// base/scroller/SnapScroller.js

enyo.kind({
name: "enyo.SnapScroller",
kind: enyo.BasicScroller,
published: {
index: 0
},
events: {
onSnap: "",
onSnapFinish: ""
},
layoutKind: "HFlexLayout",
dragSnapWidth: 0,
revealAmount: 0,
create: function() {
this.inherited(arguments), this.$.scroll.kFrictionDamping = .85;
},
layoutKindChanged: function() {
this.inherited(arguments), this.scrollH = this.layoutKind == "HFlexLayout";
var a = this.revealAmount + "px";
this.$.client.applyStyle("padding", this.scrollH ? "0 " + a : a + " 0");
},
indexChanged: function() {
var a = this.calcPos(this.index);
a != undefined && this.scrollToDirect(a);
},
scrollStart: function() {
this.inherited(arguments), this._scrolling = !0;
},
scroll: function(a) {
this.inherited(arguments), this.pos = this.scrollH ? this.getScrollLeft() : this.getScrollTop(), this.goPrev = this.pos0 != this.pos ? this.pos0 > this.pos : this.goPrev;
if (this.$.scroll.dragging) this.snapStarting = !1; else if (this.snapStarting) this._scrolling || (this.snapStarting = !1); else {
var b = this.getBoundaries(), c = b[this.scrollH ? "left" : "top"], d = b[this.scrollH ? "right" : "bottom"];
this.pos > c && this.pos < d && this.snap();
}
this.pos0 = this.pos;
},
scrollStop: function() {
this._scrolling = !1, this.snapping && this.index != this.oldIndex && (this.snapping = !1, this.snapFinish());
},
snapFinish: function() {
this.doSnapFinish();
},
snapScrollTo: function(a) {
this.pos = a, this.snapStarting = !0, this.snapping = !0, this.scrollH ? this.scrollTo(0, a) : this.scrollTo(a, 0);
},
scrollToDirect: function(a) {
this.pos = a;
var b = this.scrollH ? "Left" : "Top";
this["scroll" + b] = a, this.effectScroll();
var c = this.$.scroll;
this.scrollH ? c.x = c.x0 = -this.scrollLeft : c.y = c.y0 = -this.scrollTop;
},
calcSnapScroll: function() {
for (var a = 0, b = this.getControls(), c, d; c = b[a]; a++) {
d = c.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
if (this.pos < d) {
var e = this.scrollH ? c.hasNode().clientWidth : c.hasNode().clientHeight, f = Math.abs(this.pos + (this.goPrev ? 0 : e) - d) > this.dragSnapWidth;
return f ? this.goPrev ? a - 1 : a : this.index;
}
}
},
calcPos: function(a) {
var b = this.getControls()[a];
if (b && b.hasNode()) return b.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
},
snap: function() {
var a = this.calcSnapScroll();
a != undefined && this.snapTo(a);
},
snapTo: function(a) {
this.oldIndex = this.index;
var b = this.calcPos(a);
b != undefined && (this.index = a, this.snapScrollTo(b), this.doSnap(a));
},
previous: function() {
!this.snapping && this.snapTo(this.index - 1);
},
next: function() {
!this.snapping && this.snapTo(this.index + 1);
}
});

// base/scroller/FadeScroller.js

enyo.kind({
name: "enyo.FadeScroller",
kind: enyo.Scroller,
initComponents: function() {
this.createChrome([ {
kind: "ScrollFades"
} ]), this.inherited(arguments);
},
scroll: function(a) {
this.inherited(arguments), this.$.scrollFades.showHideFades(this);
}
});

// base/controls/Image.js

enyo.kind({
name: "enyo.Image",
kind: enyo.Control,
published: {
src: "$base-controls/images/blank.gif"
},
nodeTag: "img",
create: function() {
this.inherited(arguments), enyo.mixin(this.domAttributes, {
onerror: enyo.bubbler,
draggable: !1
}), this.srcChanged();
},
srcChanged: function() {
this.setAttribute("src", enyo.path.rewrite(this.src));
}
});

// base/controls/Stateful.js

enyo.kind({
name: "enyo.Stateful",
kind: enyo.Control,
published: {
cssNamespace: "enyo"
},
setState: function(a, b) {
this.addRemoveClass(this.cssNamespace + "-" + a, Boolean(b));
},
stateChanged: function(a) {
this.setState(a, this[a]);
}
});

// base/controls/CustomButton.js

enyo.kind({
name: "enyo.CustomButton",
kind: enyo.Stateful,
cssNamespace: "enyo-button",
className: "enyo-custom-button",
published: {
caption: "",
disabled: !1,
isDefault: !1,
down: !1,
depressed: !1,
hot: !1,
toggling: !1,
allowDrag: !1
},
create: function() {
this.inherited(arguments), this.caption = this.caption || this.label || this.content, this.captionChanged(), this.disabledChanged(), this.isDefaultChanged(), this.downChanged();
},
captionChanged: function() {
this.setContent(this.caption);
},
disabledChanged: function() {
this.stateChanged("disabled");
},
isDefaultChanged: function() {
this.stateChanged("isDefault");
},
downChanged: function() {
this.stateChanged("down");
},
hotChanged: function() {
this.stateChanged("hot");
},
depressedChanged: function() {
this.stateChanged("depressed");
},
startDragHandler: function() {
if (this.allowDrag) this.setDown(!1); else return !0;
},
mouseoverHandler: function(a, b, c) {
this.setHot(!0);
},
mouseoutHandler: function(a, b, c) {
this.setHot(!1), this.setDown(!1);
},
mousedownHandler: function(a, b, c) {
if (!this.disabled) {
this.setDown(!0);
return this.doMousedown(b);
}
},
mouseupHandler: function(a, b, c) {
if (!this.disabled && this.down) {
this.setDown(!1);
var d = this.doMouseup(b);
this.performClick(this, b);
return d;
}
},
clickHandler: function() {
return this._preventClick;
},
performClick: function(a, b) {
this.disabled || (this.toggling && this.setDepressed(!this.depressed), this._preventClick = this.doClick(b));
}
});

// base/controls/Button.js

enyo.kind({
name: "enyo.Button",
kind: enyo.CustomButton,
className: "enyo-button",
create: function() {
this.inherited(arguments), this.caption = this.caption || this.label || this.content || this.onclick || "Button", this.captionChanged();
}
});

// base/controls/AjaxContent.js

enyo.kind({
name: "enyo.AjaxContent",
kind: enyo.Control,
published: {
url: ""
},
events: {
onContentChanged: ""
},
create: function() {
this.inherited(arguments), this.urlChanged();
},
urlChanged: function() {
this.url && enyo.xhrGet({
url: this.url,
load: enyo.hitch(this, "_loaded")
});
},
_loaded: function(a, b) {
this.setContent(a);
},
contentChanged: function() {
this.doContentChanged(), this.inherited(arguments);
}
}), enyo.Html = enyo.AjaxContent;

// base/controls/HtmlContent.js

enyo.kind({
name: "enyo.HtmlContent",
kind: enyo.Control,
published: {
srcId: ""
},
events: {
onLinkClick: ""
},
create: function() {
this.inherited(arguments), this.idChanged();
},
idChanged: function() {
var a = enyo.byId(this.srcId);
a && (a.nodeType == 1 ? (this.setContent(a.innerHTML), a.style.display = "none") : this.setContent(a.textContent));
},
findLink: function(a, b) {
var c = a;
while (c && c != b) {
if (c.href) return c.href;
c = c.parentNode;
}
},
clickHandler: function(a, b) {
var c = this.findLink(b.target, this.hasNode());
if (c) {
this.doLinkClick(c), enyo.stopEvent(b);
return !0;
}
this.doClick();
}
});

// base/controls/BasicInput.js

enyo.kind({
name: "enyo.BasicInput",
kind: enyo.Control,
published: {
value: "",
disabled: !1,
readonly: !1,
placeholder: ""
},
events: {
onfocus: "",
onblur: "",
onchange: "",
onkeypress: ""
},
nodeTag: "input",
create: function() {
this.inherited(arguments), enyo.mixin(this.domAttributes, {
onfocus: enyo.bubbler,
onblur: enyo.bubbler
}), this.disabledChanged(), this.readonlyChanged(), this.valueChanged(), this.placeholderChanged();
},
getDomValue: function() {
if (this.hasNode()) return this.node.value;
},
setDomValue: function(a) {
this.setAttribute("value", a), this.hasNode() && (this.node.value = a);
},
changeHandler: function(a, b) {
this.domAttributes.value = this.getValue(), this.doChange(b);
},
getValue: function() {
var a = this.getDomValue();
enyo.isString(a) && (this.value = a);
return this.value;
},
valueChanged: function() {
this.setDomValue(this.value);
},
disabledChanged: function() {
this.setAttribute("disabled", this.disabled ? "disabled" : null);
},
readonlyChanged: function() {
this.setAttribute("readonly", this.readonly ? "readonly" : null);
},
placeholderChanged: function() {
this.setAttribute("placeholder", this.placeholder);
},
forceFocus: function() {
this.hasNode() && enyo.asyncMethod(this, function() {
this.hasNode().focus();
});
},
forceBlur: function() {
this.hasNode() && enyo.asyncMethod(this, function() {
this.hasNode().blur();
});
},
hasFocus: function() {
if (this.hasNode()) return Boolean(this.node.parentNode.querySelector(this.nodeTag + ":focus"));
}
});

// base/controls/Input.js

enyo.kind({
name: "enyo.Input",
kind: enyo.Control,
published: {
hint: "Tap Here To Type",
value: "",
spellcheck: !0,
autocorrect: !0,
autoKeyModifier: "",
autoCapitalize: "sentence",
autoEmoticons: !1,
autoLinking: !1,
inputType: "",
selection: null,
disabled: !1,
changeOnKeypress: !1
},
events: {
onfocus: "",
onblur: "",
onchange: "",
onkeypress: ""
},
chrome: [ {
name: "input",
kind: enyo.BasicInput,
className: "enyo-input"
} ],
create: function() {
this.inherited(arguments), this.disabledChanged(), this.inputTypeChanged(), this.valueChanged(), this.hintChanged(), this.applySmartTextOptions();
},
selectAllHandler: function() {
document.execCommand("selectAll");
},
cutHandler: function() {
document.execCommand("cut");
},
copyHandler: function() {
document.execCommand("copy");
},
pasteHandler: function() {
PalmSystem && PalmSystem.paste && PalmSystem.paste();
},
rendered: function() {
this.inherited(arguments), this.selectionChanged();
},
inputTypeChanged: function() {
this.$.input.domAttributes.type = this.inputType, this.hasNode() && this.$.input.render();
},
valueChanged: function() {
this.$.input.setValue(this.value);
},
getDomValue: function() {
return this.$.input.getDomValue();
},
getValue: function() {
return this.$.input.getValue();
},
changeHandler: function(a, b) {
if (this.changeOnKeypress) return !0;
this.value = a.getValue(), this.doChange(b, this.value);
},
keyupHandler: function(a, b) {
this.changeOnKeypress && (this.value = a.getValue(), this.doChange(b, this.value));
},
keypressHandler: function(a, b) {
return this.doKeypress(b);
},
selectionChanged: function() {
var a = this.$.input.hasNode();
a && this.selection && (a.selectionStart = this.selection.start, a.selectionEnd = this.selection.end);
},
getSelection: function() {
var a = this.$.input.hasNode();
return a ? {
start: a.selectionStart,
end: a.selectionEnd
} : {
start: 0,
end: 0
};
},
disabledChanged: function() {
this.$.input.setDisabled(this.disabled);
},
hintChanged: function() {
this.$.input.setPlaceholder(this.hint);
},
autoKeyModifierChanged: function() {
this.$.input.setAttribute("x-palm-text-entry", this.autoKeyModifier ? this.autoKeyModifier : null);
},
autoCapitalizeChanged: function() {
this.autoCapitalize === "lowercase" ? (this.$.input.setAttribute("x-palm-disable-auto-cap", "true"), this.$.input.setAttribute("x-palm-title-cap", null)) : (this.$.input.setAttribute("x-palm-disable-auto-cap", null), this.$.input.setAttribute("x-palm-title-cap", this.autoCapitalize === "title" ? !0 : null));
},
autocorrectChanged: function() {
this.$.input.setAttribute("autocorrect", this.autocorrect ? "on" : "off");
},
spellcheckChanged: function() {
this.$.input.setAttribute("spellcheck", !!this.spellcheck);
},
autoLinkingChanged: function() {
this.$.input.setAttribute("x-palm-enable-linker", this.autoLinking ? this.autoLinking : null);
},
autoEmoticonsChanged: function() {
this.$.input.setAttribute("x-palm-enable-emoticons", this.autoEmoticons ? this.autoEmoticons : null);
},
applySmartTextOptions: function() {
this.spellcheckChanged(), this.autocorrectChanged(), this.autoLinkingChanged(), this.autoEmoticonsChanged(), this.autoCapitalizeChanged(), this.autoKeyModifierChanged();
},
forceFocus: function() {
this.$.input.forceFocus();
},
forceBlur: function() {
this.$.input.forceBlur();
},
hasFocus: function() {
return this.$.input.hasFocus();
}
});

// base/controls/RichText.js

enyo.kind({
name: "enyo.RichText",
kind: enyo.BasicInput,
className: "enyo-richtext",
published: {
richContent: !0
},
nodeTag: "div",
domAttributes: {
tabIndex: 0,
contenteditable: !0
},
create: function() {
this.inherited(arguments), this.richContentChanged();
},
focusHandler: function() {
this.hasNode() && (this.node.focus(), this.doFocus());
},
blurHandler: function(a, b) {
this.doChange(b, this.getValue()), this.doBlur();
},
getText: function() {
return this.hasNode() && this.node.innerText || "";
},
getHtml: function() {
return this.hasNode() && this.node.innerHTML || "";
},
setDomValue: function(a) {
this.richContent || (a = a.replace(/\n/g, "<br>")), this.setContent(a);
},
getDomValue: function() {
return enyo.string.trim(this.richContent ? this.getHtml() : this.getText());
},
valueChanged: function() {
this.setDomValue(this.value);
},
contentChanged: function() {
var a = this.hasFocus();
this.inherited(arguments), a && this.hasNode() && (this.node.blur(), this.forceFocus());
},
readonlyChanged: function() {
this.addRemoveClass("enyo-richtext-readonly", this.readonly);
},
richContentChanged: function() {
this.addRemoveClass("enyo-richtext-plaintext", !this.richContent), this.richContent || this.setValue(this.hasNode() ? this.getText() : this.value);
}
});

// base/controls/AnimatedImage.js

enyo.kind({
name: "enyo.AnimatedImage",
kind: enyo.Control,
published: {
imageCount: 0,
imageHeight: 32,
tick: 50,
repeat: 0,
easingFunc: enyo.easing.cubicOut
},
tick: 33,
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation"
} ],
create: function() {
this.inherited(arguments), this.imageCountChanged(), this.tickChanged(), this.repeatChanged(), this.easingFuncChanged();
},
imageCountChanged: function() {
this.$.animator.setDuration(this.imageCount * this.tick);
},
tickChanged: function() {
this.$.animator.setTick(this.tick);
},
repeatChanged: function() {
this.$.animator.setRepeat(this.repeat);
},
easingFuncChanged: function() {
this.$.animator.setEasingFunc(this.easingFunc);
},
stepAnimation: function(a, b) {
this.positionBackgroundImage(b);
},
positionBackgroundImage: function(a) {
var b = Math.round(a) % this.imageCount, c = -b * this.imageHeight;
this.applyStyle("background-position", "0px " + c + "px");
},
start: function() {
this.$.animator.play(0, this.imageCount);
},
stop: function() {
this.$.animator.stop();
}
});

// base/controls/Iframe.js

enyo.kind({
name: "enyo.Iframe",
kind: enyo.Control,
published: {
url: ""
},
className: "enyo-iframe",
domAttributes: {
frameborder: 0
},
nodeTag: "iframe",
create: function() {
this.inherited(arguments), this.urlChanged();
},
urlChanged: function() {
this.setAttribute("src", this.url);
},
goBack: function() {
this.hasNode() && this.node.contentWindow.history.go(-1);
},
goForward: function() {
this.hasNode() && this.node.contentWindow.history.go(1);
},
refresh: function() {
this.setUrl(this.url);
},
fetchCurrentUrl: function() {
var a = this.hasNode(), b = this.getUrl();
try {
return a ? a.contentDocument.location.href : b;
} catch (c) {
return b;
}
}
});

// base/controls/Popup.js

enyo.kind({
name: "enyo.Popup",
kind: enyo.Control,
showing: !1,
published: {
modal: !1,
dismissWithClick: !0,
dismissWithEscape: !0,
scrim: !1
},
events: {
onOpen: "",
onClose: ""
},
className: "enyo-popup",
create: function() {
this.inherited(arguments), this.dispatcher = enyo.dispatcher, this.setParent(this.findRootParent());
},
destroy: function() {
this.close(), this.inherited(arguments);
},
findRootParent: function() {
var a = this;
while (a = a.owner) if (!(a.owner instanceof enyo.Control)) return a;
},
show: function() {
this.inherited(arguments), this.scrim && (this._scrimZ = this.findZIndex() - 1, enyo.scrim.showAtZIndex(this._scrimZ));
},
hide: function() {
this.inherited(arguments), this.scrim && enyo.scrim.hideAtZIndex(this._scrimZ);
},
toggleOpen: function() {
this[this.isOpen ? "close" : "open"]();
},
open: function() {
this.isOpen || (this.isOpen = !0, this._open(), this.dispatcher.capture(this, !this.modal), this.doOpen());
},
_open: function() {
this._zIndex = ++enyo.Popup.count * 2 + this.findZIndex() + 1, this.applyStyle("z-index", this._zIndex), this.generated || this.render(), this.show();
},
openAt: function(a) {
enyo.mixin(a, this.clampSize(a)), this.applyMaxDimensions(a), this.open();
},
openAtEvent: function(a, b) {
var c = {
l: a.centerX || a.clientX || a.pageX,
t: a.centerY || a.clientY || a.pageY
};
b && (c.l += b.left || 0, c.t += b.top || 0), c = this.clampPosition(enyo.mixin(c, this.calcSize())), this.openAt(c);
},
openNearNode: function(a, b) {
var c = enyo.mixin({
w: 0,
h: 0,
t: 0,
l: 0
}, b);
c.w += a.offsetWidth, c.h += a.offsetHeight;
var d = enyo.dom.fetchNodeOffset(a);
c.t += d.offsetTop, c.l += d.offsetLeft, this.openNear(c);
},
openAroundNode: function(a) {
var b = enyo.dom.fetchNodeOffset(a), c = {};
c.t = b.offsetTop + a.offsetHeight;
var d = this.calcViewport();
c.r = d.w - (b.offsetLeft + a.offsetWidth), this.openNear(c);
},
openNear: function(a, b) {
var c = a, d = {
l: c.l,
t: c.t,
r: c.r,
b: c.b
};
b && (d.w = b.w, d.h = b.h), this.clearSize();
var e = this.calcSize(), f = this.calcViewport();
c.t + e.h > f.h && c.t > f.h / 2 && (d.b = f.h - c.t - (c.h || 0), delete d.t), c.l + e.w > f.w && c.l > f.w / 2 && (d.r = f.w - c.l - (c.w || 0), delete d.l), this.openAt(d);
},
openAtCenter: function() {
var a = this.calcSize(), b = this.calcViewport(), c = {
l: Math.max(0, (b.w - a.w) / 2),
t: Math.max(0, (b.h - a.h) / 2)
};
this.openAt(c);
},
close: function(a) {
this.isOpen = !1, this.dispatcher.release(this, !this.modal), this._close(), this.doClose(a);
},
_close: function() {
this.clearSizeCache(), this.showing && enyo.Popup.count--, this._zIndex = null, this.applyStyle("z-index", null), this.hide();
},
mousedownHandler: function(a, b) {
!this.modal && this.dismissWithClick && b.dispatchTarget != this && !b.dispatchTarget.isDescendantOf(this) && this.close(b);
},
keydownHandler: function(a, b, c) {
switch (b.keyCode) {
case 27:
this.dismissWithEscape && !this.modal && (this.close(b), enyo.stopEvent(b));
return !0;
}
},
applyMaxDimensions: function(a) {
this.applyMaxSize(a), this.applyPosition(a);
},
applyMaxSize: function(a) {
this.applyStyle("max-width", a.w + "px"), this.applyStyle("max-height", a.h + "px");
},
clearSize: function() {
this.applyStyle("max-width", "none"), this.applyStyle("max-height", "none");
},
applyPosition: function(a) {
a.l !== undefined ? (this.applyStyle("left", a.l + "px"), this.applyStyle("right", "auto")) : a.r !== undefined && (this.applyStyle("right", a.r + "px"), this.applyStyle("left", "auto")), a.t !== undefined ? (this.applyStyle("top", a.t + "px"), this.applyStyle("bottom", "auto")) : a.b !== undefined && (this.applyStyle("bottom", a.b + "px"), this.applyStyle("top", "auto"));
},
clampPosition: function(a) {
var b = {}, c = this.calcViewport();
a.r ? b.r = Math.max(0, Math.min(c.w - a.w, a.r)) : b.l = Math.max(0, Math.min(c.w - a.w, a.l)), a.b ? b.b = Math.max(0, Math.min(c.h - a.h, a.b)) : b.t = Math.max(0, Math.min(c.h - a.h, a.t));
return b;
},
clampSize: function(a) {
var b = a || {}, c = this.calcViewport(), d = {
w: c.w - (b.l || b.r || 0),
h: c.h - (b.t || b.b || 0)
};
b.w && (d.w = Math.min(b.w, d.w)), b.h && (d.h = Math.min(b.h, d.h));
return d;
},
calcViewport: function() {
if (this._viewport) return this._viewport;
var a = this.parent && this.parent.hasNode() || document.body;
return this._viewport = {
w: a.offsetWidth,
h: a.offsetHeight
};
},
calcSize: function() {
this.generated || this.render();
if (this._size) return this._size;
if (this.hasNode()) {
var a = {
h: 0,
w: 0
}, b = this.node.style.display == "none";
b && (this.node.style.display = "block"), a.h = a.offsetHeight = this.node.offsetHeight, a.w = a.offsetWidth = this.node.offsetWidth, a.clientHeight = this.node.clientHeight, a.clientWidth = this.node.clientWidth, b && (this.node.style.display = "none");
return this._size = a;
}
},
clearSizeCache: function() {
this._viewport = null, this._size = null;
},
findZIndex: function() {
if (this._zIndex) return this._zIndex;
if (this.hasNode()) return this._zIndex = Number(enyo.dom.getComputedStyleValue(this.node, "z-index"));
}
}), enyo.Popup.count = 0;

// base/controls/LabeledContainer.js

enyo.kind({
name: "enyo.LabeledContainer",
kind: enyo.HFlexBox,
published: {
label: ""
},
chrome: [ {
name: "label",
flex: 1
}, {
name: "client"
} ],
create: function(a) {
this.inherited(arguments), this.layout.align = "center", this.label = this.label || this.caption, this.labelChanged();
},
labelChanged: function() {
this.$.label.setContent(this.label);
}
});

// base/controls/Scrim.js

enyo.kind({
name: "enyo.Scrim",
kind: enyo.Control,
showing: !1,
className: "enyo-scrim",
create: function() {
this.inherited(arguments), this.zStack = [];
},
addZIndex: function(a) {
enyo.indexOf(a, this.zStack) < 0 && this.zStack.push(a);
},
removeZIndex: function(a) {
enyo.remove(a, this.zStack);
},
showAtZIndex: function(a) {
this.addZIndex(a), a != undefined && this.setZIndex(a), this.show();
},
hideAtZIndex: function(a) {
this.removeZIndex(a);
if (this.zStack.length) {
var b = this.zStack[this.zStack.length - 1];
this.setZIndex(b);
} else this.hide();
},
setZIndex: function(a) {
this.zIndex = a, this.applyStyle("z-index", a);
}
}), enyo.scrim = {
make: function() {
var a = enyo.create({
kind: "Scrim",
manager: enyo.master.getComponents()[0]
});
a.renderNode();
return a;
},
show: function() {
enyo.scrim = enyo.scrim.make(), enyo.scrim.show();
},
showAtZIndex: function(a) {
enyo.scrim = enyo.scrim.make(), enyo.scrim.showAtZIndex(a);
},
hideAtZIndex: enyo.nop,
hide: enyo.nop,
destroy: enyo.nop
};

// base/controls/Progress.js

enyo.kind({
name: "enyo.Progress",
kind: enyo.Control,
published: {
maximum: 100,
minimum: 0,
position: 0,
snap: 1
},
lastPosition: -1,
statified: {
lastPosition: 0
},
create: function() {
this.inherited(arguments), this.positionChanged();
},
positionChanged: function(a) {
this.position = this.calcNormalizedPosition(this.position), this.lastPosition != this.position && (this.applyPosition(), this.lastPosition = this.position);
},
applyPosition: function() {},
calcNormalizedPosition: function(a) {
a = Math.max(this.minimum, Math.min(this.maximum, a));
return Math.round(a / this.snap) * this.snap;
},
calcRange: function() {
return this.maximum - this.minimum;
},
calcPercent: function(a) {
return Math.round(100 * (a - this.minimum) / this.calcRange());
},
calcPositionByPercent: function(a) {
return a / 100 * this.calcRange() + this.minimum;
}
});

// base/controls/LazyControl.js

enyo.kind({
name: "enyo.LazyControl",
kind: enyo.Control,
config: {},
hasKind: function() {
if (this.config) {
this.log("Energizing", this.name);
var a = this.manager, b = a.indexOfControl(this);
a.name == "client" && (a = a.manager), this.destroy();
var c = this.createControl(a);
this.moveControl(c.manager, c, b), this.renderControl(a, c);
return c;
}
return this;
},
createControl: function(a) {
this.config.name = this.name;
var b = a.createComponent(this.config);
b.hasKind || (b.hasKind = function() {
return !0;
});
return b;
},
moveControl: function(a, b, c) {
enyo.Control.prototype.removeControl.apply(a, [ b ]), a.controls.splice(c, 0, b);
},
renderControl: function(a, b) {
if (this.hasNode()) {
a.layout && a.layout.flow(a), a.flow && a.flow();
var c = b.generateHtml(), d = document.createElement("div");
d.innerHTML = c;
var e = b.node = d.firstChild;
this.node.parentNode.replaceChild(e, this.node), b.rendered();
}
},
destroy: function() {
this.setManager(null);
}
}), enyo.kind({
name: "enyo.LazyControl2",
kind: enyo.Control,
createComponent: function(a, b) {
if (!a.lazy) return this.inherited(arguments);
},
findByName: function(a, b) {
for (var c = 0, d; d = b[c]; c++) if (d.name == a) return d;
},
hasComponent: function(a) {
if (!this.$[a] && !this.findByName(a, this.controls)) {
var b = this.findByName(a, this.components);
if (b) {
b.lazy = !1;
var c = this.createComponent(b);
c.parent && (c.parent.flow(), c.render());
return c;
}
}
}
});

// base/containers/BasicDrawer.js

enyo.kind({
name: "enyo.BasicDrawer",
kind: enyo.Control,
published: {
open: !0,
canChangeOpen: !0,
animate: !0
},
events: {
onOpenChanged: ""
},
chrome: [ {
name: "client"
} ],
className: "enyo-drawer",
create: function(a) {
this.inherited(arguments), this.openChanged();
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
openChanged: function(a) {
this.canChangeOpen ? (this.hasNode() ? this.node.style.visibility = "visible" : this.applyStyle("visibility", "visible"), this.animate && this.hasNode() ? this.playAnimation() : (this.applyStyle("height", this.open ? "auto" : "0px"), this.applyStyle("visibility", this.open ? null : "hidden")), a != undefined && this.open != a && this.doOpenChanged()) : this.open = a;
},
getOpenHeight: function() {
return this.$.client.hasNode().offsetHeight;
},
playAnimation: function() {
if (this.hasNode()) {
var a = this.node.animation;
a && a.stop();
var b = this.node.offsetHeight, c = this.open ? this.getOpenHeight() : 0, d = this.domStyles;
d.height = c + "px", d.visibility = this.open ? null : "hidden", a = this.createComponent({
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
node: this.node,
style: this.node.style,
open: this.open,
s: b,
e: c
}), a.duration = this.open ? 250 : 100, a.play(b, c), this.node.animation = a;
}
},
stepAnimation: function(a, b) {
a.style.height = Math.round(b) + "px";
},
endAnimation: function(a) {
a.style.height = a.open ? "auto" : "0px", a.style.visibility = a.open ? null : "hidden", a.node.animation = null, a.destroy();
},
open: function() {
this.setOpen(!0);
},
close: function() {
this.setOpen(!1);
},
toggleOpen: function() {
this.setOpen(!this.open);
}
});

// base/containers/Drawer.js

enyo.kind({
name: "enyo.Drawer",
kind: enyo.Control,
published: {
open: !0,
canChangeOpen: !0,
animate: !0,
captionClassName: "",
caption: ""
},
events: {
onOpenChanged: ""
},
chrome: [ {
name: "caption",
kind: enyo.Control,
onclick: "toggleOpen"
}, {
name: "client",
kind: enyo.BasicDrawer,
onOpenChanged: "doOpenChanged"
} ],
create: function(a) {
this.inherited(arguments), this.captionContainer = this.$.caption, this.captionChanged(), this.captionClassNameChanged(), this.canChangeOpenChanged(), this.animateChanged(), this.openChanged();
},
captionChanged: function() {
this.$.caption.setContent(this.caption), this.captionContainer.applyStyle("display", this.caption ? "block" : "none");
},
captionClassNameChanged: function(a) {
a && this.$.caption.removeClass(a), this.$.caption.addClass(this.captionClassName);
},
openChanged: function(a) {
this.canChangeOpen ? this.$.client.setOpen(this.open) : this.open = a;
},
canChangeOpenChanged: function() {
this.$.client.setCanChangeOpen(this.canChangeOpen);
},
animateChanged: function() {
this.$.client.setAnimate(this.animate);
},
open: function() {
this.setOpen(!0);
},
close: function() {
this.setOpen(!1);
},
toggleOpen: function() {
this.setOpen(!this.open);
}
});

// base/containers/Pane.js

enyo.kind({
name: "enyo.Pane",
kind: enyo.Control,
layoutKind: "PaneLayout",
published: {
transitionKind: "enyo.transitions.Fade"
},
view: null,
lastView: null,
events: {
onSelectView: "",
onCreateView: ""
},
maxHistory: 40,
create: function() {
this.queue = [], this.history = [], this.views = [], this.lazyViews = this.lazyViews || [], this.inherited(arguments), this.addClass("enyo-pane"), this.transitionKindChanged(), this.view = this.findDefaultView();
},
initComponents: function() {
this._extractLazyViews("components"), this._extractLazyViews("kindComponents", this), this.inherited(arguments);
},
_extractLazyViews: function(a, b) {
var c = this[a];
if (c) {
var d = [];
for (var e = 0, f; f = c[e]; e++) f.lazy ? (b && (f = enyo.mixin(enyo.clone(f), {
owner: b
})), this.lazyViews.push(f)) : d.push(f);
this[a] = d;
}
},
addControl: function(a) {
this.inherited(arguments), this.controlIsView(a) ? this.addView(a) : this.finishTransition();
},
removeControl: function(a) {
this.controlIsView(a) && (this.finishTransition(), this.removeView(a)), this.inherited(arguments);
},
controlIsView: function(a) {
return !a.isChrome;
},
transitioneeForView: function(a) {
return a;
},
findDefaultView: function() {
return this.getViewList()[0];
},
addView: function(a) {
this.views.push(a);
},
removeView: function(a) {
enyo.remove(a, this.views), this.removeHistoryItem(a);
},
flow: function() {
var a = this.getControls();
for (var b = 0, c; c = a[b]; b++) c != this.view && !this.$.transition.isTransitioningView(c) && c.applyStyle("display", "none");
this.inherited(arguments);
},
getContent: function() {
this.finishTransition(), this.flow();
return this.inherited(arguments);
},
_selectView: function(a) {
this.lastView = this.view, this.view = a, this.transitionView(this.lastView, this.view);
},
_selectViewBack: function(a) {
this._selectView(a), this.doSelectView(this.view, this.lastView);
},
reallySelectView: function(a) {
a != this.view && (this._selectView(a), this.addHistoryItem(this.lastView)), this.doSelectView(this.view, this.lastView);
},
selectView: function(a, b) {
b ? this.reallySelectView(a) : enyo.asyncMethod(this, "reallySelectView", a);
},
selectViewByName: function(a, b) {
var c = this.viewByName(a);
c && this.selectView(c, b);
return c;
},
selectViewByIndex: function(a, b) {
var c = this.viewByIndex(a);
c && this.selectView(c, b);
return c;
},
getViewList: function() {
return this.views;
},
getViewCount: function() {
return this.getViewList().length;
},
getViewIndex: function() {
return this.indexOfView(this.view);
},
getViewName: function() {
return this.view && this.view.name;
},
validateView: function(a) {
return this.viewByName(a);
},
viewByName: function(a) {
var b = this.getViewList();
for (var c = 0, d; d = b[c]; c++) if (d.name == a) return d;
return this.createView(a);
},
viewByIndex: function(a) {
return this.getViewList()[a];
},
indexOfView: function(a) {
var b = this.getViewList();
return enyo.indexOf(a, b);
},
findLazyView: function(a) {
for (var b = 0, c; c = this.lazyViews[b]; b++) if (c.name == a) return c;
},
createView: function(a) {
var b = this.findLazyView(a) || this.doCreateView(a);
if (b) {
var c = this.createManagedComponent(b);
this.flow(), c.render();
return c;
}
},
transitionView: function(a, b) {
if (this._transitioning) this.addToQueue({
from: a,
to: b
}); else if (a != b) {
var c = this.transitioneeForView(b);
c && c.start && enyo.asyncMethod(c, c.start), a && this.dispatch(this.owner, a.onHide), this.hasNode() ? (this._transitioning = !0, this.$.transition.viewChanged(a, b)) : this.transitionDone(a, b);
}
},
transitionDone: function(a, b) {
this._transitioning = !1, a && a.setShowing(!1), b && (b.setShowing(!0), this.selectNextInQueue() || this.dispatch(this.owner, b.onShow));
},
transitionKindChanged: function() {
this.$.transition && this.$.transition.destroy(), this.createComponent({
name: "transition",
kind: this.transitionKind,
pane: this
});
},
finishTransition: function() {
this._transitioning && (this.queue = [], this.$.transition.done ? this.$.transition.done() : this.transitionDone());
},
addToQueue: function(a) {
this.queue.push(a);
},
selectNextInQueue: function() {
var a = this.queue.shift();
if (a) {
this.transitionView(a.from, a.to);
return !0;
}
},
addHistoryItem: function(a) {
this.history.push(this.indexOfView(a)) > this.maxHistory && this.history.shift();
},
removeHistoryItem: function(a) {
var b = this.getViewList();
while (enyo.indexOf(a, b) > -1) enyo.remove(a, b);
a == this.lastView && (this.lastView = this.history[this.history.length - 1] || 0);
},
backHandler: function(a, b) {
this.back(b);
},
back: function(a) {
if (this.history.length) {
a && a.preventDefault();
var b = this.indexOfView(this.view);
do var c = this.history.pop(); while (c == b);
c >= 0 && this._selectViewBack(this.viewByIndex(c));
}
},
next: function() {
this.selectViewByIndex((this.indexOfView(this.view) + 1) % this.getViewCount());
}
});

// base/containers/PaneLayout.js

enyo.kind({
name: "enyo.PaneLayout",
flow: function(a) {
for (var b = 0, c = a.controls, d; d = c[b]; b++) d.addClass("enyo-view");
}
});

// base/containers/Transitions.js

enyo.transitions = {}, enyo.kind({
name: "enyo.transitions.Simple",
kind: enyo.Component,
viewChanged: function(a, b) {
this.fromView = a, this.toView = b, this.begin();
},
isTransitioningView: function(a) {
return a == this.fromView || a == this.toView;
},
begin: function() {
var a = this.pane.transitioneeForView(this.fromView);
a.hide();
var a = this.pane.transitioneeForView(this.toView);
a.show(), this.done();
},
done: function() {
this.pane.transitionDone(this.fromView, this.toView);
}
}), enyo.kind({
name: "enyo.transitions.LeftRightFlyin",
kind: enyo.transitions.Simple,
duration: 300,
begin: function() {
var a, b, c = this.pane.transitioneeForView(this.fromView);
c && c.hasNode() && (b = c.node.style, b.zIndex = 1), c1 = this.pane.transitioneeForView(this.toView), c1 && c1.hasNode() && (a = c1.node.style, a.zIndex = 2, a.display = "");
var d = this.pane.hasNode().offsetWidth;
a && this.flyin("left", d, 0, this.duration, a, b);
},
flyin: function(a, b, c, d, e, f) {
var g = c - b, h = this, i = -1, j = function() {
i == -1 && (i = (new Date).getTime());
var c = enyo.easedLerp(i, d, enyo.easing.cubicOut), k = b + c * g;
e[a] = Math.max(k, 0) + "px", c < 1 ? h.handle = setTimeout(j, 30) : (f && (f.display = "none"), h.done());
};
e[a] = Math.max(b, 0) + "px", this.handle = setTimeout(j, 10);
},
done: function() {
clearTimeout(this.handle);
var a = this.pane.transitioneeForView(this.fromView);
if (a && a.hasNode()) {
var b = a.node.style;
b.left = "", b.right = "0px", b.display = "", b.zIndex = null, b.top = null;
}
this.inherited(arguments);
}
}), enyo.kind({
name: "enyo.transitions.Fade",
kind: enyo.transitions.Simple,
duration: 300,
begin: function() {
var a = this.pane.transitioneeForView(this.fromView);
if (a && a.hasNode()) {
var b = a.node.style;
b.zIndex = 1;
}
var c = this.pane.transitioneeForView(this.toView);
if (c && c.hasNode()) {
var d = c.node.style;
d.zIndex = 2, d.opacity = 0, d.display = "";
}
b && d ? this.fade(this.duration, b, d) : this.done();
},
fade: function(a, b, c) {
var d = this, e = -1, f = function() {
e == -1 && (e = (new Date).getTime());
var g = enyo.easedLerp(e, a, enyo.easing.cubicOut);
c.opacity = g, g < 1 ? d.handle = setTimeout(f, 1) : (b && (b.display = "none"), d.done());
};
this.handle = setTimeout(f, 10);
},
done: function() {
clearTimeout(this.handle);
var a = this.pane.transitioneeForView(this.toView);
if (a && a.hasNode()) {
var b = a.node.style;
b.position = null, b.display = "", b.zIndex = null, b.opacity = null, b.top = null;
}
this.inherited(arguments);
}
});

// base/containers/FloatingHeader.js

enyo.kind({
name: "enyo.FloatingHeader",
kind: enyo.Control,
className: "enyo-floating-header"
});

// base/repeaters/Repeater.js

enyo.kind({
name: "enyo.Repeater",
kind: enyo.Control,
events: {
onGetItem: ""
},
build: function() {
this.destroyControls();
for (var a = 0, b; b = this.doGetItem(a); a++) {
var c = this.createComponent({
index: a
});
c.createComponents(b, {
owner: this.owner
});
}
},
getItemByIndex: function(a) {
return this.getControls()[a];
}
});

// base/repeaters/VirtualRepeater.js

enyo.kind({
name: "enyo.VirtualRepeater",
kind: enyo.Control,
events: {
onGetItem: "",
onRowIndexChanged: ""
},
chrome: [ {
name: "client",
kind: "Flyweight",
onNodeChange: "clientNodeChanged",
onDecorateEvent: "clientDecorateEvent"
} ],
rowOffset: 0,
maxRows: -1,
getContent: function() {
var a = "";
this.$.client.disableNodeAccess(), this.$.client.canGenerate = !0;
for (var b = this.rowOffset, c = this.maxRows; c != 0; b++, c--) {
this.$.client.domAttributes.rowIndex = b;
if (!this.formatRow(b)) {
this.$.client.canGenerate = !1;
break;
}
a += this.inherited(arguments);
}
this.$.client.enableNodeAccess();
return a;
},
formatRow: function(a) {
return this.doGetItem(a);
},
clientNodeChanged: function(a, b) {
this.doRowIndexChanged(this.fetchRowIndex());
},
clientDecorateEvent: function(a, b) {
b.rowIndex = this.fetchRowIndex(a);
},
renderRow: function(a) {
this.formatRow(a) && (this.controlsToRow(a) && this.$.client.contentChanged());
},
controlsToRow: function(a) {
if (this.hasNode()) {
var b = this.fetchRowNode(a);
if (b) {
this.$.client.setNode(b);
return !0;
}
}
},
fetchRowIndex: function(a) {
var b = a || this.$.client;
return this.fetchRowIndexByNode(b.hasNode());
},
fetchRowNode: function(a) {
if (this.hasNode()) return this.node.querySelector('[rowindex="' + a + '"]');
},
fetchRowIndexByNode: function(a) {
var b = this.hasNode(), c = a, d;
while (c && c.getAttribute && c != b) {
d = c.getAttribute("rowIndex");
if (d != null) return Number(d);
c = c.parentNode;
}
}
});

// base/list/Flyweight.js

enyo.kind({
name: "enyo.Flyweight",
kind: enyo.Control,
events: {
onNodeChange: "",
onDecorateEvent: ""
},
captureDomEvent: function(a) {
a.type != "mousemove" && (this.setNodeByEvent(a), this.doDecorateEvent(a));
},
setNodeByEvent: function(a) {
var b = this.findNode(a.target);
b && (this.setNode(b), this.doNodeChange(b));
},
findNode: function(a) {
var b = a;
while (b) {
if (b.id == this.id) return b;
b = b.parentNode;
}
},
disableNodeAccess: function() {
this.disEnableNodeAccess(this, !0);
},
enableNodeAccess: function() {
this.disEnableNodeAccess(this);
},
disEnableNodeAccess: function(a, b) {
b ? a._hasNode || (a._hasNode = a.hasNode, a.hasNode = enyo.nop) : a._hasNode && (a.hasNode = a._hasNode, delete a._hasNode);
for (var c = 0, d = a.children, e; e = d[c]; c++) this.disEnableNodeAccess(e, b);
},
setNode: function(a) {
this.inherited(arguments), this.assignControlNodes(this);
},
assignControlNodes: function(a) {
for (var b = 0, c = a.children, d, e; d = c[b]; b++) e = this.findControlNode(d, a.node, b), e && (d.node = e, this.assignControlNodes(d));
},
findControlNode: function(a, b, c) {
var d = a.id, e = b.childNodes[c];
if (e && e.id == d) return e;
return b.querySelector("[id=" + d + "]");
}
});

// base/services/BasicService.js

enyo.kind({
name: "enyo.BasicService",
kind: enyo.Component,
published: {
service: "",
timeout: 0
},
events: {
onSuccess: "",
onFailure: "",
onResponse: ""
},
requestKind: "Request",
masterService: enyo.nob,
create: function() {
this.defaultKind = this.kindName, this.inherited(arguments);
},
importProps: function(a) {
this.inherited(arguments);
var b = this.masterService;
this.service = this.service || b.service, this.onResponse = this.onResponse || b.onResponse, this.onSuccess = this.onSuccess || b.onSuccess, this.onFailure = this.onFailure || b.onFailure;
},
adjustComponentProps: function(a) {
this.inherited(arguments), a.masterService = this;
},
makeRequestProps: function(a) {
var b = {
kind: this.requestKind,
timeout: this.timeout
};
a && enyo.mixin(b, a);
return b;
},
cancel: function() {
this.destroyComponents();
},
request: function(a) {
return this.createComponent(this.makeRequestProps(a));
},
response: function(a) {
this.doResponse(a.response, a);
},
responseSuccess: function(a) {
this.doSuccess(a.response, a);
},
responseFailure: function(a) {
this.doFailure(a.response, a);
}
}), enyo.kind({
name: "enyo.Request",
kind: enyo.Component,
events: {
onRequestSuccess: "responseSuccess",
onRequestFailure: "responseFailure",
onRequestResponse: "response"
},
create: function() {
this.inherited(arguments), this.startTimer(), this.call();
},
destroy: function() {
this.endTimer(), this.inherited(arguments);
},
call: function() {},
isFailure: function(a) {
return !Boolean(a);
},
setResponse: function(a) {
this.response = a;
},
receive: function(a) {
this.endTimer(), this.setResponse(a), this.processResponse();
},
processResponse: function() {
this.isFailure(this.response) ? this.doRequestFailure() : this.doRequestSuccess(), this.doRequestResponse(), this.finish();
},
startTimer: function() {
this.startTime = Date.now(), this.timeout && (this.timeoutJob = setTimeout(enyo.bind(this, "timeoutComplete"), this.timeout));
},
endTimer: function() {
clearTimeout(this.timeoutJob), this.endTime = Date.now(), this.latency = this.endTime - this.startTime;
},
timeoutComplete: function() {
this.didTimeout = !0, this.receive();
},
finish: function() {
this.destroy();
}
});

// base/services/Service.js

enyo.kind({
name: "enyo.Service",
kind: enyo.BasicService,
methodHandlers: {},
call: function(a, b) {
var c = b || {};
c.params = c.params || a || this.params || {};
var d = this.findMethodHandler(c.method || this.method) || "request";
return this[d](c);
},
cancelCall: function(a) {
enyo.call(this.$[a], "destroy");
},
findMethodHandler: function(a) {
if (a in this.methodHandlers) return this.methodHandlers[a] || a;
},
makeRequestProps: function(a) {
var b = {
onResponse: this.onResponse,
onSuccess: this.onSuccess,
onFailure: this.onFailure
}, c = this.inherited(arguments);
return enyo.mixin(b, c);
},
dispatchResponse: function(a, b) {
this.dispatch(this.owner, a, [ b.response, b ]);
},
response: function(a) {
this.dispatchResponse(a.onResponse, a);
},
responseSuccess: function(a) {
this.dispatchResponse(a.onSuccess, a);
},
responseFailure: function(a) {
this.dispatchResponse(a.onFailure, a);
}
});

// base/services/MockService.js

enyo.kind({
name: "enyo.MockService",
kind: enyo.Service,
requestKind: "MockService.Request",
published: {
method: "",
subscribe: !1
},
importProps: function(a) {
a.method = a.method || a.name, this.inherited(arguments);
},
call: function() {
return this.request({
method: this.method,
subscribe: this.subscribe
});
}
}), enyo.kind({
name: "enyo.MockService.Request",
kind: enyo.Request,
destroy: function() {
this.inherited(arguments), clearInterval(this.job);
},
_call: function() {
setTimeout(enyo.bind(this, "receive", this.makeResponse()), enyo.irand(200) + 100);
},
call: function() {
this._call(), this.subscribe && (this.job = setInterval(enyo.bind(this, "_call"), 3e3));
},
makeResponse: function() {
return enyo.irand(1e3) + 1e3;
},
isFailure: function(a) {
return a < 1250;
},
finish: function() {
this.subscribe || this.destroy();
}
});

// base/services/WebService.js

enyo.kind({
name: "enyo.WebService",
kind: enyo.Service,
requestKind: "WebService.Request",
published: {
url: "",
method: "GET",
handleAs: "json",
contentType: "application/x-www-form-urlencoded",
sync: !1,
headers: null
},
constructor: function() {
this.inherited(arguments), this.headers = {};
},
makeRequestProps: function(a) {
var b = {
params: a,
url: this.url,
method: this.method,
handleAs: this.handleAs,
contentType: this.contentType,
sync: this.sync,
headers: this.headers
};
return enyo.mixin(b, this.inherited(arguments));
}
}), enyo.kind({
name: "enyo.WebService.Request",
kind: enyo.Request,
call: function() {
var a = this.params || "";
a = enyo.isString(a) ? a : enyo.objectToQuery(a);
var b = this.url;
this.method == "GET" && a && (b += (b.indexOf("?") >= 0 ? "&" : "?") + a, a = null);
var c = {};
c["Content-Type"] = this.contentType, enyo.mixin(c, this.headers), enyo.xhr.request({
url: b,
method: this.method,
callback: enyo.bind(this, "receive"),
body: a,
headers: c,
sync: window.PalmSystem ? !1 : this.sync
});
},
receive: function(a, b) {
this.xhr = b, this.inherited(arguments, [ b ]);
},
setResponse: function(a) {
var b;
if (a.status != 404) switch (this.handleAs) {
case "json":
try {
var c = a.responseText;
b = c && enyo.json.from(c);
} catch (d) {
this.log("responseText is not in JSON format"), this.log(d), this.log(c), b = c;
}
break;
case "xml":
b = a.responseXML;
break;
default:
b = a.responseText;
}
this.response = b;
}
});

// base/media/sound.js

enyo.kind({
name: "enyo.Sound",
kind: enyo.Component,
published: {
src: "",
preload: !0
},
create: function() {
this.inherited(arguments), this.srcChanged(), this.preloadChanged();
},
srcChanged: function() {
var a = enyo.path.rewrite(this.src);
window.PhoneGap ? this.media = new Media(a) : (this.audio = new Audio, this.audio.src = a);
},
preloadChanged: function() {},
play: function() {
window.PhoneGap ? this.media.play() : this.audio.paused ? this.audio.play() : this.audio.currentTime = 0;
}
});

// base/media/video.js

enyo.kind({
name: "enyo.Video",
kind: enyo.Control,
published: {
src: "",
showControls: !0,
autoplay: !1,
loop: !1
},
nodeTag: "video",
create: function() {
this.inherited(arguments), this.srcChanged(), this.showControlsChanged(), this.autoplayChanged();
},
srcChanged: function() {
var a = enyo.path.rewrite(this.src);
this.setAttribute("src", a);
},
showControlsChanged: function() {
this.setAttribute("controls", this.showControls ? "controls" : null);
},
autoplayChanged: function() {
this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
},
loopChanged: function() {
this.setAttribute("loop", this.loop ? "loop" : null);
},
play: function() {
this.hasNode() && (this.node.paused ? this.node.play() : this.node.currentTime = 0);
},
pause: function() {
this.hasNode() && this.node.pause();
}
});

// system/system.js

enyo.fittingClassName = "enyo-fit", enyo.logTimers = function(a) {
var b = a ? " (" + a + ")" : "";
console.log("*** Timers " + b + " ***");
var c = enyo.time.timed;
for (var d in c) console.log(d + ": " + c[d] + "ms");
console.log("***************");
}, enyo.setAllowedOrientation = function(a) {
enyo._allowedOrientation = a, window.PalmSystem && PalmSystem.setWindowOrientation(a);
}, enyo.getWindowOrientation = function() {
if (window.PalmSystem) return PalmSystem.windowOrientation;
}, enyo.ready = function() {
window.PalmSystem && (setTimeout(function() {
PalmSystem.stageReady();
}, 1), enyo.setAllowedOrientation(enyo._allowedOrientation ? enyo._allowedOrientation : "free"));
}, enyo.addOnStart(function() {
window.addEventListener("load", enyo.ready(), !1);
}), enyo.fetchAppId = function() {
if (window.PalmSystem) return PalmSystem.identifier.split(" ")[0];
}, enyo.fetchAppInfo = function() {
var a = enyo.windows.getRootWindow();
if (a.enyo) {
var b = a.enyo.xhr.request({
url: "appinfo.json",
sync: !0
}).responseText;
try {
b = enyo.json.from(b);
return b;
} catch (c) {
console.warn("Could not parse appInfo: " + c);
}
}
};

// system/windows/windows.js

enyo.windows = {
openWindow: function(a, b, c, d, e) {
var f = d || {};
f.window = f.window || "card";
var g = this.getRootWindow(), h = this.agent.open(g, a, b || "", f, e);
this.finishOpenWindow(h, c, f);
return h;
},
finishOpenWindow: function(a, b, c) {
a.name = a.name || enyo.windows.makeUniqueWindowName(), this.assignWindowParams(a, b);
var d = c && c.window == "card";
this.manager.addWindow(a, d);
},
makeUniqueWindowName: function() {
var a = this.getWindows(), b = "window";
for (var c = 1, d; Boolean(a[d = b + (c > 1 ? String(c) : "")]); c++) ;
return d;
},
openDashboard: function(a, b, c) {
return this.openWindow(a, b, c, {
window: "dashboard"
});
},
openPopup: function(a, b, c, d) {
return this.openWindow(a, b, c, {
window: "popupalert"
}, "height=" + (d || 200));
},
activate: function(a, b, c, d, e) {
var f = this.fetchWindow(a);
f ? this.activateWindow(f, c) : b && (f = this.openWindow(b, a, c, d, e));
return f;
},
activateWindow: function(a, b) {
this.agent.activate(a), b && this.setWindowParams(a, b);
},
deactivate: function(a) {
var b = this.fetchWindow(a);
this.deactivateWindow(b);
},
deactivateWindow: function(a) {
a && this.agent.deactivate(a);
},
addBannerMessage: function() {
this.agent.addBannerMessage.apply(this.agent, arguments);
},
removeBannerMessage: function(a) {
this.agent.removeBannerMessage.apply(this.agent, arguments);
},
setWindowParams: function(a, b) {
this.assignWindowParams(a, b), this.events.dispatchWindowParamsChange(a);
},
assignWindowParams: function(a, b) {
var c = b && enyo.isString(b) ? enyo.json.from(b) : b || {};
a.enyo = a.enyo || {}, a.enyo.windowParams = c || {};
},
fetchWindow: function(a) {
return this.manager.fetchWindow(a);
},
getRootWindow: function() {
return this.manager.getRootWindow();
},
getWindows: function() {
return this.manager.getWindows();
},
getActiveWindow: function() {
return this.manager.getActiveWindow();
}
};

// system/windows/manager.js

enyo.windows.manager = {
getRootWindow: function() {
return window.opener || window.rootWindow || window.top || window;
},
getWindows: function() {
var a = this.getRootWindow(), b = a.enyo.windows.manager, c = b._windowList, d = {};
for (var e in c) this.isValidWindow(c[e]) && (d[e] = c[e]);
b._windowList = d;
return d;
},
_windowList: {},
isValidWindow: function(a) {
return Boolean(a && !a.closed && (!a.PalmSystem || a.PalmSystem));
},
addWindow: function(a, b) {
var c = this.getWindows();
c[a.name] = a, b && this.recordActiveWindow(a);
},
removeWindow: function(a) {
var b = this.getWindows();
delete b[a.name];
},
fetchWindow: function(a) {
var b = this.getWindows();
return b[a];
},
getActiveWindow: function() {
var a = this.getRootWindow(), b = a.enyo.windows.manager, c = b._activeWindow;
return this.fetchWindow(c);
},
recordActiveWindow: function(a) {
var b = this.getRootWindow();
b.enyo.windows.manager._activeWindow = a;
},
resetRootWindow: function(a) {
var b = this.getWindows(), c, d = this.findRootableWindow(b);
if (d) {
this.transferRootToWindow(d, a);
for (var e in b) c = b[e], c.rootWindow = c == d ? null : d, this.setupApplication(c);
}
},
findRootableWindow: function(a) {
var b;
for (var c in a) {
b = a[c];
if (b.enyo && b.enyo.windows) return a[c];
}
},
setupApplication: function(a) {
var b = a.enyo;
b.application = (b.windows.getRootWindow().enyo || b).application || {};
},
transferRootToWindow: function(a, b) {
var c = a.enyo.windows.manager, d = b.enyo.windows.manager;
c._windowList = enyo.clone(d._windowList), c._activeWindow = d._activeWindow;
},
addUnloadListener: function() {
window.addEventListener("unload", enyo.hitch(this, function() {
this.removeWindow(window), this.getRootWindow() == window && this.resetRootWindow(window);
}), !1);
},
addLoadListener: function() {
window.addEventListener("load", function() {
enyo.windows.setWindowParams(window, enyo.windowParams);
}, !1);
}
}, enyo.addOnStart(function() {
var a = enyo.windowParams || window.PalmSystem && PalmSystem.launchParams;
enyo.windows.finishOpenWindow(window, a);
var b = enyo.windows.manager;
b.addUnloadListener(window), b.addLoadListener(window), b.setupApplication(window);
});

// system/windows/events.js

enyo.windows.events = {
dispatchEvent: function(a, b) {
a.enyo.dispatch(b);
},
handleAppMenu: function(a) {
var b = enyo.windows.getActiveWindow();
if (b && a["palm-command"] == "open-app-menu") if (b.enyo) {
b.enyo.appMenu.toggle();
return !0;
}
},
handleActivated: function() {
enyo.windows.manager.recordActiveWindow(window.name), this.dispatchEvent(window, {
type: "windowActivated"
});
},
handleDeactivated: function() {
enyo.appMenu.close(), enyo.windows.manager.recordActiveWindow(null), this.dispatchEvent(window, {
type: "windowDeactivated"
});
},
handleRelaunch: function() {
var a = enyo.windows.getRootWindow(), b = PalmSystem.launchParams;
b = b && enyo.json.from(b);
if (!this.handleAppMenu(b)) {
enyo.windows.setWindowParams(a, b);
return this.dispatchApplicationRelaunch(a);
}
},
dispatchWindowParamsChange: function(a) {
var b = a.enyo.windowParams, c = "windowParamsChange", d = c + "Handler";
this.dispatchEvent(a, {
type: c,
params: b
}), enyo.call(a.enyo, d, [ b ]);
},
dispatchApplicationRelaunch: function(a) {
var b = a.enyo.windowParams, c = "applicationRelaunch", d = c + "Handler", e = this.dispatchEvent(a, {
type: c,
params: b
}), f = enyo.call(a.enyo, d, [ b ]), g = enyo.call(enyo.application, d, [ b ]);
return e || f || g;
}
}, Mojo = window.Mojo || {}, Mojo.stageActivated = function() {
enyo.windows.events.handleActivated();
}, Mojo.stageDeactivated = function() {
enyo.windows.events.handleDeactivated();
}, Mojo.relaunch = function() {
return enyo.windows.events.handleRelaunch();
};

// system/windows/agent.js

enyo.windows.agent = {
open: function(a, b, c, d, e) {
var f = this.makeAbsoluteUrl(window, b), g = d && enyo.isString(d) ? "" : enyo.json.stringify(d), g = "attributes=" + g, h = e ? e + ", " : "";
return a.open(b, c, h + g);
},
activate: function(a) {
a.PalmSystem && a.PalmSystem.activate();
},
deactivate: function(a) {
a.PalmSystem && a.PalmSystem.deactivate();
},
addBannerMessage: function() {
PalmSystem.addBannerMessage.apply(PalmSystem, arguments);
},
removeBannerMessage: function(a) {
PalmSystem.removeBannerMessage.apply(removeBannerMessage, arguments);
},
makeAbsoluteUrl: function(a, b) {
if (b.slice(0, 7) == "file://") return b;
if (b[0] === "/") return "file://" + b;
var c = a.location.href.split("/");
c.pop(), c.push(b);
return c.join("/");
}
};

// system/windows/browserAgent.js

enyo.windows.browserAgent = {
open: function(a, b, c, d, e) {
var f = this.makeAbsoluteUrl(window, b), g = a.document, h = g.createElement("iframe");
h.src = b, h.setAttribute("frameborder", 0);
var i = (e || "").match(/height=(.*)($|,)/), j = i && i[1] || d.window == "dashboard" && 96;
j ? h.style.cssText = "position:absolute; bottom: 0px; height: " + j + "px; width:100%" : h.style.cssText = "position:absolute; width:100%;height:100%;", g.body.appendChild(h);
var k = h.contentWindow;
k.name = c, k.close = function() {
this.frameElement.parentNode.removeChild(this.frameElement);
};
return k;
},
activate: function(a) {
var b = enyo.windows.getWindows(), c;
for (var d in b) c = b[d].frameElement, c && (c.style.zIndex = a == b[d] ? 1 : -1, c.style.display = a.name == d ? "" : "none");
a.enyo.windows.events.handleActivated();
},
deactivate: function(a) {
var b = a.frameElement;
b && (b.style.zIndex = -1), a.enyo.windows.events.handleDeactivated();
},
addBannerMessage: function() {
console.log("addBannerMessage", arguments);
},
removeBanner: function() {
console.log("removeBanner");
}
}, enyo.addOnStart(function() {
window.PalmSystem || (enyo.dispatcher.features.push(function(a) {
a.type == "keydown" && a.ctrlKey && a.keyCode == 192 && enyo.appMenu.toggle();
}), enyo.mixin(enyo.windows.agent, enyo.windows.browserAgent), window.addEventListener("unload", function() {
enyo.windows.events.handleDeactivated();
var a = window.parent;
a.enyo.windows.events.handleActivated();
}, !1), window.addEventListener("load", function() {
enyo.windows.events.handleActivated();
}));
});

// system/Dashboard.js

enyo.kind({
name: "enyo.Dashboard",
kind: enyo.Component,
published: {
layers: null
},
events: {
onIconTap: "",
onMessageTap: "",
onTap: "",
onUserClose: "",
onLayerSwipe: ""
},
create: function() {
this.inherited(arguments), this.layers = [];
},
destroy: function() {
this.layers.length = 0, this.updateWindow(), this.inherited(arguments);
},
push: function(a) {
a && (this.layers.push(a), this.updateWindow());
},
pop: function() {
var a = this.layers.pop();
this.updateWindow();
return a;
},
setLayers: function(a) {
this.layers = a.slice(0), this.updateWindow();
},
updateWindow: function() {
this.layers.length ? !this.window || this.window.closed || this.window.addEventListener === undefined ? this.window = enyo.windows.openDashboard(enyo.path.rewrite("$enyo-system/dashboard.html"), this.name, {
layers: this.layers,
docPath: document.location.pathname,
owner: this,
onTap: "dbTapped",
onIconTap: "iconTapped",
onMessageTap: "msgTapped",
onUserClose: "userClosed",
onLayerSwipe: "layerSwiped"
}) : enyo.windows.activate(this.name, undefined, {
layers: this.layers
}) : this.window && (this.window.close(), this.window = undefined);
},
dbTapped: function(a, b, c) {
this.doTap(b, c);
},
msgTapped: function(a, b, c) {
this.doMessageTap(b, c);
},
iconTapped: function(a, b, c) {
this.doIconTap(b, c);
},
layerSwiped: function(a, b) {
this.doLayerSwipe(b);
},
userClosed: function(a) {
this.doUserClose();
}
});

// system/DashboardContent.js

enyo.kind({
name: "enyo.DashboardContent",
kind: enyo.Control,
className: "dashboard-notification-module",
components: [ {
kind: "enyo.SwipeableItem",
layoutKind: "HFlexLayout",
confirmRequired: !1,
onConfirm: "dbSwiped",
components: [ {
className: "palm-dashboard-icon-container",
onclick: "iconTapHandler",
components: [ {
name: "badge",
className: "dashboard-count",
components: [ {
name: "count",
nodeTag: "span",
className: "dashboard-count-label"
} ]
}, {
name: "icon",
className: "dashboard-icon",
kind: enyo.Image
} ]
}, {
name: "layer0",
kind: "enyo.DashboardLayer",
className: "layer-0",
onclick: "msgTapHandler",
swipeable: !1
}, {
name: "layer1",
kind: "enyo.DashboardLayer",
className: "layer-1",
onclick: "msgTapHandler",
onSwipe: "layerSwiped"
}, {
name: "layer2",
kind: "enyo.DashboardLayer",
className: "layer-2",
onclick: "msgTapHandler",
onSwipe: "layerSwiped"
} ]
} ],
events: {
onIconTap: "",
onMessageTap: "",
onTap: "",
onUserClose: "",
onLayerSwipe: ""
},
clickHandler: function(a, b) {
this.doTap(this.layers[this.layers.length - 1], b);
},
iconTapHandler: function(a, b) {
this.doIconTap(this.layers[this.layers.length - 1], b);
},
msgTapHandler: function(a, b) {
this.doMessageTap(this.layers[this.layers.length - 1], b);
},
dbSwiped: function() {
this.doUserClose(), window.close();
},
layerSwiped: function() {
var a = this.layers.pop();
this.updateContents(), this.doLayerSwipe(a);
},
create: function() {
this.inherited(arguments);
var a = enyo.launchParams;
this.setOwner(a.owner);
for (var b in this.events) this.events.hasOwnProperty(b) && (this[b] = a[b]);
this.docPath = a.docPath, this.docPath = this.docPath.slice(0, this.docPath.lastIndexOf("/") + 1), this.layers = a.layers, this.indicateNewContent(!0), this.$.layer1.setClipControl(this.$.layer0), this.$.layer2.setClipControl(this.$.layer1), enyo.windowReactivatedHandler = enyo.bind(this, "handleNewLayers"), this.boundDestroy = enyo.bind(this, "destroy"), window.addEventListener("unload", this.boundDestroy);
},
destroy: function() {
console.log("Being destroyed!"), this.indicateNewContent(!1), window.removeEventListener("unload", this.boundDestroy), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.updateContents();
},
updateContents: function() {
var a = this.layers.length;
if (a) {
var b = this.layers.slice(-3);
this.$.layer2.setLayer(b[2]), this.$.layer1.setLayer(b[1]), this.$.layer0.setLayer(b[0]), this.setIcon(b[b.length - 1].icon), this.$.layer1.setSwipeable(!b[2]), a > 1 ? (this.$.count.setContent(a), this.$.badge.show()) : this.$.badge.hide();
} else this.indicateNewContent(!1), window.close();
},
handleNewLayers: function(a) {
var b = a && a.layers;
this.indicateNewContent(b && b.length && b.length > this.layers.length), this.layers = b || [], this.updateContents();
},
setIcon: function(a) {
a[0] !== "/" && (a = this.docPath + a), this.$.icon.setSrc(a);
},
indicateNewContent: function(a) {
this.window && this.window.PalmSystem && (this._throbId && (this.window.PalmSystem.removeNewContentIndicator(this._throbId), this._throbId = undefined), a && (this._throbId = this.window.PalmSystem.addNewContentIndicator()));
}
}), enyo.kind({
name: "enyo.DashboardLayer",
kind: "enyo.Control",
className: "dashboard-layer",
components: [ {
name: "swipeable",
kind: "enyo.SwipeableItem",
onDrag: "configureClipping",
onConfirm: "doSwipe",
className: "palm-dashboard-text-container",
confirmRequired: !1,
components: [ {
name: "title",
className: "dashboard-title"
}, {
name: "text",
className: "palm-dashboard-text"
} ]
} ],
published: {
layer: null,
swipeable: !0,
clipControl: null
},
events: {
onSwipe: ""
},
create: function() {
this.inherited(arguments), this.swipeableChanged();
},
configureClipping: function(a, b) {
this.clipControl && b >= 0 && this.clipControl.setStyle("width:" + (b + 10) + "px;");
},
layerChanged: function() {
this.layer ? (this.show(), this.$.title.setContent(this.layer.title), this.$.text.setContent(this.layer.text), this.configureClipping(this, 0)) : (this.hide(), this.configureClipping(this, 270));
},
swipeableChanged: function() {
this.$.swipeable.setSwipeable(this.swipeable);
}
});

// layout/OrderedLayout.js

enyo.kind({
name: "enyo.OrderedLayout",
getShowingChildren: function(a) {
var b = [];
for (var c = 0, d = a.children, e; e = d[c]; c++) e.showing && b.push(e);
return b;
},
flow: function(a) {
var b = this.getShowingChildren(a), c = b.length;
for (var d = 0, e, f; e = b[d]; d++) f = c == 1 ? "single" : d == 0 ? "first" : d == c - 1 ? "last" : "middle", this.styleChild(e, "enyo-" + f);
},
styleChild: function(a, b) {
a.setOrderStyle ? a.setOrderStyle(b) : this.defaultStyleChild(a, b);
},
defaultStyleChild: function(a, b) {
var c = a._orderStyle;
c && a.removeClass(c), a.addClass(b), a._orderStyle = b;
}
});

// controls/Spinner.js

enyo.kind({
name: "enyo.Spinner",
kind: enyo.AnimatedImage,
className: "enyo-spinner",
easingFunc: enyo.easing.linear,
imageHeight: 32,
imageCount: 12,
repeat: -1,
create: function() {
this.inherited(arguments), this.disEnableAnimation(this.showing);
},
disEnableAnimation: function(a) {
this[a ? "start" : "stop"]();
},
showingChanged: function(a) {
this.inherited(arguments), a !== undefined && this.disEnableAnimation(this.showing);
}
}), enyo.kind({
name: "enyo.SpinnerLarge",
kind: enyo.Spinner,
className: "enyo-spinner-large",
imageHeight: 128
});

// controls/button/IconButton.js

enyo.kind({
name: "enyo.IconButton",
kind: enyo.CustomButton,
className: "enyo-button",
published: {
label: "",
icon: ""
},
components: [ {
name: "icon",
className: "enyo-button-icon",
showing: !1
}, {
name: "label"
} ],
create: function() {
this.inherited(arguments), this.label = this.label || this.caption, this.labelChanged(), this.iconChanged();
},
iconChanged: function() {
this.$.icon.setShowing(Boolean(this.icon)), this.$.icon.applyStyle("background-image", "url(" + this.icon + ")");
},
labelChanged: function() {
this.$.label.setContent(this.label);
}
});

// controls/button/Pushable.js

enyo.kind({
name: "enyo.Pushable",
kind: enyo.Control,
events: {
ondown: "",
onup: ""
},
styleForDown: function() {
this.applyStyle("background-color", "gray");
},
styleForUp: function() {
this.applyStyle("background-color", "inherit");
},
mousedownHandler: function(a, b) {
this.styleForDown(), this.doDown();
},
mouseupHandler: function(a, b) {
this.styleForUp(), this.doUp();
}
});

// controls/button/ActivityButton.js

enyo.kind({
name: "enyo.ActivityButton",
kind: enyo.Button,
layoutKind: "HFlexLayout",
align: "center",
published: {
active: !1
},
chrome: [ {
name: "caption",
flex: 1
}, {
name: "spinner",
kind: "Spinner"
} ],
create: function() {
this.inherited(arguments), this.activeChanged();
},
activeChanged: function() {
this.$.spinner.setShowing(this.active);
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
}
});

// controls/input/FancyInput.js

enyo.kind({
name: "enyo.FancyInput",
kind: enyo.Input,
chrome: [ {
kind: enyo.HFlexBox,
wantsEvents: !1,
className: "enyo-group-inner enyo-fancy-input-inner",
components: [ {
kind: enyo.VFlexBox,
wantsEvents: !1,
pack: "center",
width: "100%",
components: [ {
name: "input",
className: "enyo-input enyo-fancy-input-input",
kind: enyo.BasicInput,
onfocus: "inputFocus",
onblur: "inputBlur"
} ]
}, {
name: "client",
wantsEvents: !1,
layoutKind: "HFlexLayout",
align: "center",
className: "enyo-fancy-input-client"
} ]
} ],
insetClass: "enyo-flat-shadow",
wantsEvents: !0,
create: function() {
this.inherited(arguments), this.addClass("enyo-roundy enyo-fancy-input enyo-bbox");
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
styleForIn: function() {
this.addClass(this.insetClass);
},
styleForOut: function() {
this.removeClass(this.insetClass);
},
inputBlur: function() {
this.styleForOut();
},
inputFocus: function() {
this.styleForIn();
},
mousedownHandler: function(a, b) {}
});

// controls/input/PasswordInput.js

enyo.kind({
name: "enyo.PasswordInput",
kind: enyo.FancyInput,
create: function() {
this.inherited(arguments), this.$.input.setAttribute("type", "password"), this.setAutoCapitalize("lowercase"), this.setSpellcheck(!1), this.setAutocorrect(!1);
}
});

// controls/input/FancyRichText.js

enyo.kind({
name: "enyo.FancyRichText",
kind: enyo.FancyInput,
published: {
richContent: !0
},
chrome: [ {
kind: enyo.HFlexBox,
wantsEvents: !1,
className: "enyo-group-inner enyo-fancy-input-inner",
components: [ {
kind: enyo.VFlexBox,
wantsEvents: !1,
pack: "center",
width: "100%",
components: [ {
name: "input",
className: "enyo-input enyo-fancy-input-input",
kind: enyo.RichText,
onfocus: "inputFocus",
onblur: "inputBlur",
onchange: "inputChange"
} ]
}, {
name: "client",
wantsEvents: !1,
className: "enyo-fancy-input-client"
} ]
} ],
create: function() {
this.inherited(arguments), this.richContentChanged();
},
richContentChanged: function() {
this.$.input.setRichContent(this.richContent);
},
getHtml: function() {
return this.$.input.getHtml();
},
inputChange: function(a, b) {
if (this.changeOnKeypress) return !0;
this.value = a.getValue(), this.doChange(b, this.value);
}
});

// controls/OrderedContainer.js

enyo.kind({
name: "enyo.OrderedContainer",
kind: enyo.Control,
layoutKind: "HFlexLayout",
create: function() {
this.inherited(arguments), this.orderedLayout = new enyo.OrderedLayout(this);
},
flow: function() {
this.orderedLayout.flow(this), this.inherited(arguments);
}
});

// controls/button/MenuButton.js

enyo.kind({
name: "enyo.MenuButtonHeader",
kind: enyo.Button,
style: "display: block",
className: "enyo-button enyo-menu-button-shape",
chrome: [ {
name: "client",
className: "enyo-menu-button-header-client"
} ],
create: function() {
this.inherited(arguments), this.contentChanged();
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
contentChanged: function() {
this.$.client.setContent(this.content);
}
}), enyo.kind({
name: "enyo.MenuButton",
kind: enyo.IconButton,
className: "enyo-button enyo-menu-button-shape"
});

// controls/button/ToggleButton.js

enyo.kind({
name: "enyo.ToggleButton",
kind: enyo.Control,
published: {
state: !1,
onLabel: "On",
offLabel: "Off"
},
events: {
onChange: ""
},
className: "enyo-toggle-button",
chrome: [ {
name: "labelOn",
nodeTag: "span",
className: "enyo-toggle-label-on",
content: "On"
}, {
name: "labelOff",
nodeTag: "span",
className: "enyo-toggle-label-off",
content: "Off"
}, {
name: "thumb",
className: "enyo-toggle-thumb-off"
} ],
labels: {
"true": "ON&nbsp;",
"false": "OFF"
},
ready: function() {
this.stateChanged(), this.onLabelChanged(), this.offLabelChanged();
},
onLabelChanged: function() {
this.$.labelOn.setContent(this.onLabel);
},
offLabelChanged: function() {
this.$.labelOff.setContent(this.offLabel);
},
stateChanged: function() {
this.$.thumb.setClassName("enyo-toggle-thumb-" + (this.state ? "on" : "off")), this.$.labelOn.applyStyle("display", this.state ? "inline" : "none"), this.$.labelOff.applyStyle("display", this.state ? "none" : "inline");
},
clickHandler: function() {
this.setState(!this.getState()), this.doChange(this.state);
}
});

// controls/button/CheckBox.js

enyo.kind({
name: "enyo.CheckBox",
kind: enyo.Button,
cssNamespace: "enyo-checkbox",
className: "enyo-checkbox",
published: {
checked: !1
},
events: {
onChange: ""
},
create: function() {
this.inherited(arguments), this.checkedChanged();
},
captionChanged: function() {},
checkedChanged: function() {
this.stateChanged("checked");
},
mousedownHandler: function(a, b, c) {
this.disabled || (this.setChecked(!this.checked), this.doChange());
},
mouseupHandler: function(a, b, c) {},
mouseoutHandler: function(a, b, c) {
this.setHot(!1);
}
});

// controls/PrevNextBanner.js

enyo.kind({
name: "enyo.PrevNextBanner",
published: {
previousDisabled: !1,
nextDisabled: !1
},
events: {
onPrevious: "",
onNext: ""
},
kind: enyo.HFlexBox,
align: "center",
chrome: [ {
name: "previous",
className: "enyo-banner-prev",
kind: enyo.CustomButton,
onclick: "doPrevious"
}, {
name: "client",
flex: 1,
kind: enyo.HFlexBox,
align: "center",
className: "enyo-banner-content"
}, {
name: "next",
className: "enyo-banner-next",
kind: enyo.CustomButton,
onclick: "doNext"
} ],
create: function() {
this.addClass("enyo-prev-next-banner"), this.inherited(arguments), this.contentChanged(), this.nextDisabledChanged(), this.previousDisabledChanged();
},
contentChanged: function() {
this.$.client.setContent(this.content);
},
_disabledChanged: function(a, b) {
a.setDisabled(b);
},
nextDisabledChanged: function() {
this._disabledChanged(this.$.next, this.nextDisabled);
},
previousDisabledChanged: function() {
this._disabledChanged(this.$.previous, this.previousDisabled);
}
});

// controls/BasicWebView.js

enyo.weightedAverage = {
data: {},
count: 4,
weights: [ 1, 2, 4, 8 ],
compute: function(a, b) {
this.data[b] || (this.data[b] = []);
var c = this.data[b];
c.push(a), c.length > this.count && c.shift();
for (var d = 0, e = 0, f = 0, g, h; (g = c[d]) && (h = this.weights[d]); d++) f += g * h, e += h;
e = e || 1, f = f / e;
return f;
},
clear: function(a) {
this.data[a] = [];
}
}, enyo.sizeableMixin = {
zoom: 1,
centeredZoomStart: function(a) {
var b = enyo.dom.fetchNodeOffset(this.node), c = this.fetchScrollPosition();
this._zoomStart = {
scale: a.scale,
centerX: a.centerX,
centerY: a.centerY,
scrollX: c.l,
scrollY: c.t,
offsetTop: b.offsetTop,
offsetLeft: b.offsetLeft,
zoom: this.zoom
};
},
centeredZoomChange: function(a) {
var b = this._zoomStart;
a.scale = a.scale || b.scale, a.centerX = a.centerX || b.centerX, a.centerY = a.centerY || b.centerY;
var c = Math.round(a.scale * 100) / 100, d = b.zoom * c;
d > this.maxZoom && (c = this.maxZoom / b.zoom);
var e = (c - 1) * b.centerX;
e += c * b.scrollX, e += c * (b.centerX - a.centerX);
var f = (c - 1) * b.centerY + c * b.scrollY + c * (b.centerY - a.centerY);
return {
zoom: d,
x: e,
y: f
};
},
resetZoom: function() {
this.setZoom(this.minZoom);
},
findScroller: function() {
if (this._scroller) return this._scroller;
var a = this.hasNode(), b;
while (a) {
b = enyo.$[a.id];
if (b && b instanceof enyo.BasicScroller) return this._scroller = b;
a = a.parentNode;
}
},
fetchScrollPosition: function() {
var a = {
t: 0,
l: 0
}, b = this.findScroller();
b && (a.l = b.getScrollLeft(), a.t = b.getScrollTop());
return a;
},
setScrollPosition: function(a, b) {
var c = this.findScroller();
c && (c.setScrollTop(b), c.setScrollLeft(a));
},
setScrollPositionDirect: function(a, b) {
var c = this.findScroller();
c && (c.scrollLeft = a, c.scrollTop = b, c.effectScroll());
}
}, enyo.kind({
name: "enyo.BasicWebView",
kind: enyo.Control,
mixins: [ enyo.sizeableMixin ],
published: {
url: "",
minFontSize: 16,
autoFit: !1,
fitRender: !1,
zoom: 1,
enableJavascript: !0,
blockPopups: !0,
acceptCookies: !0
},
domAttributes: {
"enyo-pass-events": !0
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
lastUrl: "",
nodeTag: "object",
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
} ],
create: function() {
this.inherited(arguments), this.history = [], this.callQueue = [], this.gestureEvent = {}, this.domAttributes.type = "application/x-palm-browser";
var a = enyo.fetchControlSize(this).w, b = enyo.fetchControlSize(this).h;
this.setAttribute("viewportwidth", a), this.setAttribute("viewportheight", b);
},
destroy: function() {
this.callQueue = null, this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.hasNode() && (this.node.eventListener = this, this.history = [], this.callQueue = [], this.lastUrl = "", this._viewInited = !1, this.initView());
},
hasView: function() {
return this.hasNode() && this.node.openURL;
},
adapterInitialized: function() {
this.log("adapterInitialized"), this.initView(), this.flushCallQueue();
},
initView: function() {
this.hasView() && !this._viewInited && (this.cacheBoxSize(), this.node.setPageIdentifier(this.id), this.node.interrogateClicks(!1), this.node.setShowClickedLink(!0), this.activate(), this.blockPopupsChanged(), this.acceptCookiesChanged(), this.enableJavascriptChanged(), this.updateViewportSize(), this.fitRenderChanged(), this.urlChanged(), this.minFontSizeChanged(), this._viewInited = !0);
},
resize: function() {
var a = enyo.fetchControlSize(this);
if (this._boxSize && this._boxSize.w != a.w) {
var b = a.w / this._boxSize.w;
this.setZoom(b * this.zoom), this.clearHistory();
if (!this.fitRender) {
var c = this.fetchScrollPosition();
this.setScrollPositionDirect(b * c.l, b * c.t), this.setScrollPosition(b * c.l, b * c.t);
}
this.cacheBoxSize(), this.fitRenderChanged(), this.updateViewportSize();
}
},
cacheBoxSize: function() {
this._boxSize = enyo.fetchControlSize(this);
},
activate: function() {
this.callBrowserAdapter("connectBrowserServer"), this.callBrowserAdapter("pageFocused", [ !0 ]);
},
updateViewportSize: function() {
var a = this._boxSize;
a.h = Math.min(window.innerHeight, a.h), this.callBrowserAdapter("setViewportSize", [ a.w, a.h ]);
},
urlChanged: function() {
this.url && (this.callBrowserAdapter("openURL", [ this.url ]), this.log(this.url));
},
minFontSizeChanged: function() {
this.callBrowserAdapter("setMinFontSize", [ Number(this.minFontSize) ]);
},
fitRenderChanged: function() {
if (this.fitRender) {
var a = enyo.fetchControlSize(this).w;
this.callBrowserAdapter("setDefaultLayoutWidth", [ a ]);
} else this.callBrowserAdapter("setDefaultLayoutWidth", [ 960 ]);
},
gesturestartHandler: function(a, b) {
enyo.dispatcher.capture(this), this.callBrowserAdapter("enableFastScaling", [ !0 ]), this.centeredZoomStart(b);
},
gesturechangeHandler: function(a, b) {
enyo.stopEvent(b);
var c = this.centeredZoomChange(b);
this.setZoom(c.zoom), c.zoom == this.getZoom() && this.setScrollPositionDirect(c.x, c.y);
},
gestureendHandler: function(a, b) {
enyo.dispatcher.release(this);
var c = this.fetchScrollPosition();
this.setScrollPosition(c.l, c.t), this.callBrowserAdapter("enableFastScaling", [ !1 ]);
},
zoomChanged: function(a) {
if (this._pageWidth && this._pageHeight) {
this.zoom = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));
var b = Math.round(this.zoom * this._pageWidth), c = Math.round(this.zoom * this._pageHeight);
this.applyStyle("width", b + "px"), this.applyStyle("height", c + "px");
var d = this.findScroller();
d && d.calcBoundaries();
}
},
fetchDefaultZoom: function() {
return this.autoFit ? this.minZoom : 1;
},
calcMinZoom: function() {
return this._boxSize.w / this._pageWidth;
},
dblclickHandler: function(a, b) {
var c = enyo.dom.fetchNodeOffset(this.node), d = b.clientX - c.offsetLeft, e = b.clientY - c.offsetTop;
this.callBrowserAdapter("smartZoom", [ d, e ]);
},
smartZoomAreaFound: function(a, b, c, d, e, f, g) {
this.log(a, b, c, d, e, f, g);
var h = this._boxSize.w / (c - a);
h == this.zoom ? (h = this.fetchDefaultZoom(), this.smartZoomRespLeft = 0) : this.smartZoomRespLeft = a, this.smartZoomRespCenterY = f, this.callBrowserAdapter("enableFastScaling", [ !0 ]), this.$.animator.play(this.zoom, h);
},
stepAnimation: function(a, b) {
this.setZoom(b);
var c = Math.floor(this.smartZoomRespLeft * b), d = Math.floor(this.smartZoomRespCenterY * b - this._boxSize.h / 2);
c = Math.max(0, c), d = Math.max(0, d), this.setScrollPositionDirect(c, d);
},
endAnimation: function() {
this.callBrowserAdapter("enableFastScaling", [ !1 ]);
},
enableJavascriptChanged: function() {
this.callBrowserAdapter("setEnableJavaScript", [ this.enableJavascript ]);
},
blockPopupsChanged: function() {
this.callBrowserAdapter("setBlockPopups", [ this.blockPopups ]);
},
acceptCookiesChanged: function() {
this.callBrowserAdapter("setAcceptCookies", [ this.acceptCookies ]);
},
clearHistory: function() {
this.callBrowserAdapter("clearHistory"), this.history = {};
},
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
storeToHistory: function() {
var a = this.lastUrl;
if (a) {
var b = this.fetchScrollPosition();
b.zoom = this.zoom, this.history[a] = b;
}
},
restoreFromHistory: function() {
var a = this.fetchScrollPosition();
a.zoom = this.fetchDefaultZoom(), a = enyo.mixin(a, this.history[this.url]), this.setZoom(a.zoom), this._scroller && this._scroller.setScrollTop(a.t);
},
listSelect: function(a, b, c) {
var d = a.getItems().indexOf(b.value);
this.callBrowserAdapter("selectPopupMenuItem", [ this.listId, d ]);
},
callBrowserAdapter: function(a, b) {
this.hasNode() && this.node[a] ? (this.log(a), this.node[a].apply(this.node, b)) : (this.log("queued!", a), this.callQueue.push({
name: a,
args: b
}));
},
flushCallQueue: function() {
this.log(this.callQueue.length, "view?", this.hasView());
if (this.callQueue.length > 0) if (this.hasView()) {
var a = this.callQueue.length;
for (var b = 0, c; b < a; b++) c = this.callQueue.shift(), this.callBrowserAdapter(c.name, c.args);
} else setTimeout(enyo.hitch(this, "flushCallQueue"), 100);
},
pageDimensionsChanged: function(a, b) {
if (a != 0 || b != 0) this.log(a, b), this._pageWidth = a, this._pageHeight = b, this.minZoom = this.calcMinZoom(), this.setZoom(this.fetchDefaultZoom());
},
scrollPositionChanged: function(a, b) {
this.setScrollPosition(a, b);
},
urlTitleChanged: function(a, b, c, d) {
this.lastUrl = this.url, this.url = a, this.doPageTitleChanged(b, a, c, d);
},
loadStarted: function() {
this.log(), this.storeToHistory(), this.doLoadStarted();
},
loadProgressChanged: function(a) {
this.doLoadProgress(a);
},
loadStopped: function() {
this.log(), this.restoreFromHistory(), this.doLoadStopped();
},
documentLoadFinished: function() {
this.doLoadComplete(), this.log();
},
mainDocumentLoadFailed: function(a, b, c, d) {
this.doError(b, d + ": " + c);
},
linkClicked: function(a) {},
urlRedirected: function(a, b) {
this.doUrlRedirected(a, b);
},
updateGlobalHistory: function(a, b) {},
firstPaintCompleted: function() {},
editorFocused: function(a) {},
showListSelector: function(a, b) {
this.listId = a;
if (this.listPopup == null) {
var c = this.createComponent({
kind: "PopupSelect",
onSelect: "listSelect"
});
this.owner instanceof enyo.Control && c.setParent(this.owner), this.listPopup = c;
}
this.listItems = [];
var d = enyo.json.from(b);
for (var e = 0, f; f = d.items[e]; e++) f.isEnabled && this.listItems.push(f.text);
this.listPopup.setItems(this.listItems), this.listPopup.render(), this.listPopup.openAtCenter();
},
dialogAlert: function(a) {
this.doAlertDialog(a);
},
dialogConfirm: function(a) {
this.doConfirmDialog(a);
},
dialogPrompt: function(a, b) {
this.doPromptDialog(a, b);
},
dialogSSLConfirm: function(a, b) {
this.doSSLConfirmDialog(a, b);
},
dialogUserPassword: function(a) {
this.doUserPasswordDialog(a);
},
mimeNotSupported: function(a, b) {
this.doFileLoad(a, b);
},
mimeHandoffUrl: function(a, b) {
this.doFileLoad(a, b);
},
eventFired: function(a, b) {
this.log(a.pageX, a.pageY, b.element);
var c = this.fetchScrollPosition(), d = {
l: this.getZoom() * a.pageX - c.l,
t: this.getZoom() * a.pageY - c.t
};
return this.doSingleTap(d, a, b);
},
showPopupMenu: function(a, b) {
this.showListSelector(a, b);
},
didFinishDocumentLoad: function() {
this.documentLoadFinished();
},
failedLoad: function(a, b, c, d) {},
setMainDocumentError: function(a, b, c, d) {
this.mainDocumentLoadFailed(a, b, c, d);
},
firstPaintComplete: function() {
this.firstPaintCompleted();
},
loadProgress: function(a) {
this.loadProgressChanged(a);
},
pageDimensions: function(a, b) {
this.pageDimensionsChanged(a, b);
},
smartZoomCalculateResponseSimple: function(a, b, c, d, e, f, g) {
this.smartZoomAreaFound(a, b, c, d, e, f, g);
},
titleURLChange: function(a, b, c, d) {
this.urlTitleChanged(b, a, c, d);
},
urlChange: function(a, b, c) {
this.url = a;
}
});

// controls/WebView.js

enyo.kind({
name: "enyo.WebView",
kind: enyo.Control,
forward: {
url: "view",
minFontSize: "view",
autoFit: "view",
fitRender: "view",
zoom: "view",
enableJavascript: "view",
blockPopups: "view",
acceptCookies: "view"
},
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
chrome: [ {
name: "view",
kind: enyo.BasicWebView,
onPageTitleChanged: "doPageTitleChanged",
onUrlRedirected: "doUrlRedirected",
onSingleTap: "doSingleTap",
onLoadStarted: "doLoadStarted",
onLoadProgress: "doLoadProgress",
onLoadStopped: "doLoadStopped",
onLoadComplete: "doLoadComplete",
onFileLoad: "doFileLoad",
onAlertDialog: "doAlertDialog",
onConfirmDialog: "doConfirmDialog",
onPromptDialog: "doPromptDialog",
onSSLConfirmDialog: "doSSLConfirmDialog",
onUserPasswordDialog: "doUserPasswordDialog",
onError: "doError"
} ],
activate: function() {
this.$.view.activate();
},
deferSetUrl: function(a) {
this.log(a), this.$.view.setUrl(a);
},
getHistoryState: function(a) {
this.$.view.getHistoryState(a);
},
goBack: function() {
this.$.view.callBrowserAdapter("goBack");
},
goForward: function() {
this.$.view.callBrowserAdapter("goForward");
},
reloadPage: function() {
this.$.view.callBrowserAdapter("reloadPage");
},
stopLoad: function() {
this.$.view.callBrowserAdapter("stopLoad");
},
clearHistory: function() {
this.$.view.clearHistory();
},
clearCookies: function() {
this.$.view.callBrowserAdapter("clearCookies");
},
clearCache: function() {
this.$.view.callBrowserAdapter("clearCache");
},
acceptDialog: function() {
var a = [].slice.call(arguments);
a.unshift("1"), this.$.view.callBrowserAdapter("sendDialogResponse", a);
},
cancelDialog: function() {
this.$.view.callBrowserAdapter("sendDialogResponse", [ "0" ]);
},
sendDialogResponse: function(a) {
this.$.view.callBrowserAdapter("sendDialogResponse", [ a ]);
},
saveImageAtPoint: function(a, b, c, d) {
this.$.view.callBrowserAdapter("saveImageAtPoint", [ a, b, c, d ]);
},
saveViewToFile: function(a, b, c, d, e) {
this.$.view.callBrowserAdapter("saveViewToFile", [ a, b, c, d, e ]);
},
generateIconFromFile: function(a, b, c, d) {
this.$.view.callBrowserAdapter("generateIconFromFile", [ a, b, c, d ]);
},
resizeImage: function(a, b, c, d) {
this.$.view.callBrowserAdapter("resizeImage", [ a, b, c, d ]);
},
deleteImage: function(a) {
this.$.view.callBrowserAdapter("deleteImage", [ a ]);
},
redirectUrl: function(a, b, c) {
this.$.view.callBrowserAdapter("redirectUrl", [ a, b, c ]);
},
setHTML: function(a, b) {
this.$.view.callBrowserAdapter("setHTML", [ a, b ]);
},
callBrowserAdapter: function(a, b) {
this.$.view.callBrowserAdapter(a, b);
}
}), window.PalmSystem || (enyo.WebView = enyo.Iframe);

// controls/image/SizeableImage.js

enyo.fetchControlSize = function(a) {
var b = a.hasNode(), c = b && b.parentNode, d;
while (c) {
if (c.clientWidth && c.clientHeight) {
d = {
w: c.clientWidth,
h: c.clientHeight
};
break;
}
c = c.parentNode;
}
d = d || {
w: window.innerWidth,
h: window.innerHeight
};
return d;
}, enyo.kind({
name: "enyo.SizeableImage",
kind: enyo.VFlexBox,
align: "center",
pack: "center",
mixins: [ enyo.sizeableMixin ],
published: {
src: "",
zoom: 1,
autoSize: !0
},
minZoom: 1,
defaultMaxZoom: 2,
events: {
onImageLoaded: ""
},
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "image",
kind: "Image"
} ],
create: function() {
this.bufferImage = new Image, this.bufferImage.onload = enyo.hitch(this, "imageLoaded"), this.bufferImage.onerror = enyo.hitch(this, "imageError"), this.maxZoom = this.defaultMaxZoom, this.inherited(arguments), this.srcChanged();
},
rendered: function() {
this.inherited(arguments), this.loadPendingRender && (this.imageLoaded(), this.loadPendingRender = null);
},
srcChanged: function() {
this.src && this.bufferImage.src == this.src ? this.imageLoaded() : this.src && (this.$.image.setSrc("$base-controls/images/blank.gif"), this.bufferImage.src = this.src);
},
imageLoaded: function(a) {
this.hasNode() ? this.destroyed || (this.$.image.setSrc(this.bufferImage.src), this.adjustSize(), this.doImageLoaded()) : this.loadPendingRender = !0;
},
imageError: function(a) {
this.log(a);
},
adjustSize: function() {
var a = this._imageWidth = this.bufferImage.width, b = this._imageHeight = this.bufferImage.height, c = this._boxSize = enyo.fetchControlSize(this);
if (this.autoSize) {
var d = a / b, e = this.node;
a = c.w, b = c.h, b * d > a ? b = a / d : a = b * d;
}
this.minZoom = a / this._imageWidth, this.maxZoom = Math.max(this.defaultMaxZoom, this.minZoom * this.defaultMaxZoom), this.setZoom(this.minZoom);
},
zoomChanged: function() {
this.zoom = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));
if (this._imageWidth && this._imageHeight) {
var a = this.zoom * this._imageWidth, b = this.zoom * this._imageHeight;
a && b && this.sizeImage(a, b);
}
},
sizeImage: function(a, b) {
this.$.image.applyStyle("width", a + "px"), this.$.image.applyStyle("height", b + "px");
},
updateZoomPosition: function(a) {
this.setZoom(a.zoom);
var b = this.findScroller(), c = {};
b && (c = b.getBoundaries());
var d = a.x > c.left ? a.x < c.right ? a.x : c.right : c.left, e = a.y > c.top ? a.y < c.bottom ? a.y : c.bottom : c.bottom;
this.setScrollPositionDirect(d, e);
return {
x: d,
y: e
};
},
gesturestartHandler: function(a, b) {
this.centeredZoomStart(b);
},
gesturechangeHandler: function(a, b) {
enyo.stopEvent(b);
var c = this.centeredZoomChange(b);
this.updateZoomPosition(c);
},
gestureendHanlder: function(a, b) {
enyo.stopEvent(b);
var c = this.fetchScrollPosition();
this.setScrollPosition(c.l, c.t);
},
clickHandler: function(a, b) {
if (this._clickMode) {
var c = this._clickMode != 1;
this._clickMode = 0;
return c;
}
this._clickMode = -1, this._clickJob = setTimeout(enyo.hitch(this, function() {
this._clickMode = 1, enyo.dispatch(b);
}), 300);
return !0;
},
dblclickHandler: function(a, b) {
if (this._clickJob && this._clickMode != -1) this._clickMode = 0, clearTimeout(this._clickJob), this._clickJob = null, this.smartZoom(b); else return !0;
},
smartZoom: function(a) {
var b = enyo.dom.fetchNodeOffset(this.node), c = a.clientX - b.offsetLeft, d = a.clientY - b.offsetTop, e = this.fetchScrollPosition();
this.centeredZoomStart({
scale: 1,
centerX: c,
centerY: d
}), this.fromZoom = this.zoom, this.toZoom = Math.abs(this.zoom - this.maxZoom) > .1 ? this.maxZoom : this.minZoom, this.$.animator.play(1, this.toZoom / this.fromZoom);
},
stepAnimation: function(a, b, c, d) {
var e = this.centeredZoomChange({
scale: b
}), f = this.updateZoomPosition(e);
this.setScrollPosition(f.x, f.y);
}
}), enyo.kind({
name: "enyo.SizeableCanvas",
kind: enyo.SizeableImage,
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "image",
nodeTag: "canvas"
} ],
create: function() {
this.inherited(arguments), this.$.image.setSrc = enyo.nop;
},
fetchContext: function() {
var a = this.$.image.hasNode();
return a && a.getContext("2d");
},
clearImage: function() {
var a = this.fetchContext();
a && this._zoomedWidth && this._zoomedHeight && a.clearRect(0, 0, this._zoomedWidth, this._zoomedHeight);
},
sizeImage: function(a, b) {
this.clearImage(), this._zoomedWidth = a, this._zoomedHeight = b;
var c = this.fetchContext();
c && (this.$.image.setAttribute("width", a), this.$.image.setAttribute("height", b), c.drawImage(this.bufferImage, 0, 0, a, b));
}
});

// controls/image/ScrollingImage.js

enyo.kind({
name: "enyo.ScrollingImage",
kind: enyo.SizeableImage,
autoSize: !1,
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "scroller",
kind: "BasicScroller",
className: "enyo-fit",
components: [ {
name: "image",
kind: "Image"
} ]
} ],
create: function() {
this.inherited(arguments), this._scroller = this.$.scroller;
}
});

// controls/BasicCarousel.js

enyo.NestedScrollerMixin = {
startDragHandler: function(a, b) {
this.$.drag.start(b), this.$.drag.dispatcher.release(this.$.drag), this.$.scroll.startDrag(b), b.handler = !0;
},
mousemoveHandler: function(a, b) {
this.$.drag.dragging && this.$.drag.mousemoveHandler(a, b);
},
mouseupHandler: function(a, b) {
this.$.drag.dragging && this.$.drag.mouseupHandler(a, b);
}
}, enyo.kind({
name: "enyo.BasicCarousel",
kind: enyo.SnapScroller,
mixins: [ enyo.NestedScrollerMixin ],
published: {
views: []
},
dragSnapThreshold: .1,
revealRatio: 0,
chrome: [ {
name: "client",
kind: "Control"
} ],
create: function(a) {
var b = [];
a && (b = a.components, delete a.components), b = b || this.kindComponents || [], this.inherited(arguments), this.$.scroll.kFrictionDamping = .85, this.$.scroll.kSpringDamping = .8, this.views = this.views.length ? this.views : b, this.viewsChanged();
},
rendered: function() {
this.inherited(arguments), this.resize(), this.indexChanged(), this.dragSnapWidth = (this.scrollH ? this._controlSize.w : this._controlSize.h) * this.dragSnapThreshold, this.revealAmount = (this.scrollH ? this._controlSize.w : this._controlSize.h) * this.revealRatio;
},
layoutKindChanged: function() {
this.inherited(arguments), this.setVertical(!this.scrollH), this.setHorizontal(this.scrollH);
},
viewsChanged: function() {
this.destroyControls(), this.createViews(this.views), this.render();
},
createViews: function(a) {
for (var b = 0, c; c = a[b]; b++) this.createView(this, c);
},
createView: function(a, b, c) {
var d = enyo.mixin(this.constructViewInfo(b), c), e = a.createComponent(d);
enyo.call(e, "setOuterScroller", [ this ]);
return e;
},
constructViewInfo: function(a) {
return enyo.isString(a) ? {
src: a
} : a;
},
addViews: function(a) {
this.views = this.views.concat(a), this.createViews(a), this.contentChanged();
},
resize: function() {
this.sizeControls("100%", "100%"), this._controlSize = enyo.fetchControlSize(this.$.client), this._controlSize[this.scrollH ? "w" : "h"] = this._controlSize[this.scrollH ? "w" : "h"] - 2 * this.revealAmount, this.sizeControls(this._controlSize.w + "px", this._controlSize.h + "px"), this.setIndex(this.index);
},
sizeControls: function(a, b) {
for (var c = 0, d = this.getControls(), e; e = d[c]; c++) a && e.applyStyle("width", a), b && e.applyStyle("height", b);
},
calcPos: function(a) {
if (this.getControls()[a]) {
var b = 0, c = this._controlSize[this.scrollH ? "w" : "h"];
for (var d = 0, e = this.getControls(), f; d < a && (f = e[d]); d++) f.showing && (b += c);
return b;
}
},
snapFinish: function() {
this.resetView(this.oldIndex), this.inherited(arguments);
},
snapTo: function(a) {
this.inherited(arguments), this.index != this.oldIndex && this.resetView(this.index);
},
findView: function(a) {
return a;
},
applyToView: function(a, b, c) {
var d = a[b] ? a : this.findView(a);
enyo.call(d, b, c);
},
resetView: function(a) {
var b = this.getControls()[a];
this.applyToView(b, "reset", []);
}
});

// controls/Carousel.js

enyo.kind({
name: "enyo.Carousel",
kind: enyo.BasicCarousel,
events: {
onGetLeft: "",
onGetRight: ""
},
components: [ {
name: "left",
kind: "Control"
}, {
name: "center",
kind: "Control"
}, {
name: "right",
kind: "Control"
} ],
centerIndex: 1,
setCenterView: function(a) {
this.newView(this.$.left, this.doGetLeft(!1)), this.newView(this.$.center, a), this.newView(this.$.right, this.doGetRight(!1)), this.setIndex(this.centerIndex);
},
fetchView: function(a) {
return this.findView(this.$[a]);
},
newView: function(a, b) {
a.setShowing(b ? !0 : !1), b && (a.destroyControls(), this.createView(a, b, {
kind: b.kind || this.defaultKind,
owner: this,
width: "100%",
height: "100%"
}), a.render());
},
moveView: function(a, b) {
a.setShowing(!0), b.setManager(a), b.setParent(a);
},
findView: function(a) {
var b = a.getControls();
if (b.length) return b[0];
},
snapFinish: function() {
this.inherited(arguments), this.adjustViews();
},
adjustViews: function() {
var a = this.index > this.oldIndex, b;
if (this.index != this.centerIndex || !this._info) this._info = this["doGet" + (a ? "Right" : "Left")](!0);
if (this.index != this.centerIndex) if (this._info) {
var c = a ? this.$.right : this.$.left, d = a ? this.$.left : this.$.right, e = this.findView(this.$.center);
this.moveView(this.$.center, this.findView(c)), this.newView(c, this._info), d.destroyControls(), this.moveView(d, e), this.setIndex(this.centerIndex);
}
}
});

// controls/image/ViewImage.js

enyo.kind({
name: "enyo.ViewImageScroller",
kind: enyo.BasicScroller,
mixins: [ enyo.NestedScrollerMixin ],
published: {
overscrollH: !0,
overscrollV: !0
},
events: {
onDrag: ""
},
start: function() {
this.$.scroll && this.inherited(arguments);
},
drag: function(a, b) {
this.inherited(arguments), this.doDrag(a, b);
},
scroll: function(a) {
var b = this.getBoundaries(), c = b.left - 1, d = b.right + 1, e = b.top - 1, f = b.bottom + 1, g = -a.x, h = -a.y;
this.overscrollH || g >= c && g <= d ? this.scrollLeft = g : this.scrollLeft = g < 0 ? c : d, this.overscrollV || h >= e && h <= f ? this.scrollTop = h : this.scrollTop = h < 0 ? e : f, this.effectScroll(), this.doScroll();
}
}), enyo.kind({
name: "enyo.ViewImage",
kind: enyo.ScrollingImage,
autoSize: !0,
forward: {
overscrollH: "scroller",
overscrollV: "scroller"
},
events: {
onImageLoaded: "imageLoaded"
},
chrome: [ {
name: "animator",
kind: "Animator",
onAnimate: "stepAnimation",
onEnd: "endAnimation"
}, {
name: "scroller",
kind: "ViewImageScroller",
className: "enyo-fit",
autoVertical: !0,
onDrag: "imageDrag",
components: [ {
name: "image",
kind: "Image",
className: "enyo-viewimage-image"
} ]
} ],
imageDrag: function(a, b, c) {
var d = this.outerScroller.scrollH ? a.getScrollLeft() : a.getScrollTop(), e = a.getBoundaries(), f = this.outerScroller.scrollH ? a.horizontal : a.vertical, g = this.outerScroller.scrollH ? e.left : e.top, h = this.outerScroller.scrollH ? e.right : e.bottom;
!f || d < g || d > h ? this.outerScroller.$.drag.dragging || this.outerScroller.startDragHandler(a, c) : this.outerScroller.$.drag.dragging && this.outerScroller.$.drag.finish();
},
setOuterScroller: function(a) {
this.outerScroller = a, this.setOverscrollH(!a.scrollH), this.setOverscrollV(a.scrollH);
},
reset: function() {
this.resetZoom();
var a = this.$.scroller;
a.scrollLeft = 0, a.scrollTop = 0, a.effectScroll(), a.setScrollTop(0), a.setScrollLeft(0);
}
});

// controls/image/ImageView.js

enyo.kind({
name: "enyo.ImageView",
kind: enyo.Carousel,
published: {
images: [],
centerSrc: ""
},
defaultKind: "ViewImage",
create: function() {
this.inherited(arguments), this.centerSrcChanged(), this.images && this.images.length && this.imagesChanged();
},
centerSrcChanged: function() {
this.centerSrc && this.setCenterView(this.centerSrc);
},
imagesChanged: function() {
this.setViews(this.images);
},
getImages: function() {
return this.views;
},
addImages: function(a) {
this.addViews(a);
}
}), enyo.BasicImageView = enyo.ImageView;

// controls/Divider.js

enyo.kind({
name: "enyo.Divider",
kind: enyo.HFlexBox,
align: "center",
published: {
icon: "",
iconBorderCollapse: !0,
caption: "Divider"
},
chrome: [ {
name: "rightCap",
className: "enyo-divider-right-cap"
}, {
name: "icon",
className: "enyo-divider-icon",
nodeTag: "img"
}, {
name: "caption",
className: "enyo-divider-caption"
}, {
className: "enyo-divider-left-cap"
}, {
name: "client",
kind: enyo.HFlexBox,
align: "center",
className: "enyo-divider-client"
} ],
create: function() {
this.inherited(arguments), this.iconChanged(), this.captionChanged();
},
iconChanged: function() {
this.$.icon.setAttribute("src", this.icon), this.icon ? (this.$.icon.show(), this.iconBorderCollapse ? (this.$.rightCap.hide(), this.$.icon.setClassName("enyo-divider-icon")) : this.$.icon.setClassName("enyo-divider-icon-collapse")) : (this.$.icon.hide(), this.$.rightCap.show());
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
}
});

// controls/AlphaDivider.js

enyo.kind({
name: "enyo.AlphaDivider",
kind: enyo.Control,
className: "enyo-divider-alpha",
published: {
caption: ""
},
components: [ {
name: "caption",
className: "enyo-divider-alpha-caption"
} ],
create: function() {
this.inherited(arguments), this.captionChanged();
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
}
});

// controls/PageHeader.js

enyo.kind({
name: "enyo.PageHeader",
kind: enyo.Control,
layoutKind: "HFlexLayout",
className: "enyo-page-header",
chrome: [ {
name: "client",
flex: 1,
align: "center",
className: "enyo-page-header-inner"
} ],
create: function() {
this.inherited(arguments), this.layout = new enyo.HFlexLayout, this.contentChanged();
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
contentChanged: function() {
this.$.client.setContent(this.content);
}
});

// controls/Item.js

enyo.kind({
name: "enyo.Item",
kind: enyo.Stateful,
className: "enyo-item",
published: {
tapHighlight: !1,
held: !1,
disabled: !1
},
create: function() {
this.inherited(arguments), this.disabledChanged();
},
heldChanged: function() {
this.tapHighlight && this.stateChanged("held");
},
disabledChanged: function() {
this.stateChanged("disabled");
},
mouseholdHandler: function(a, b) {
if (!this.disabled) {
this.setHeld(!0);
return !0;
}
},
mousereleaseHandler: function(a, b) {
this.setHeld(!1);
return !0;
},
clickHandler: function(a, b) {
if (!this.disabled) {
this.setHeld(!0);
var c = this.hasNode();
enyo.callWithoutNode(this, c, enyo.bind(this, "setHeld", !1));
var d = this.domAttributes.className;
setTimeout(enyo.hitch(this, function() {
c.className = d, this.doClick(b, b.rowIndex);
}), 100);
}
},
processClick: function(a) {
this.setHeld(!1), this.doClick(a, a.rowIndex);
}
}), enyo.findFlyweight = function(a) {
var b = a, c;
while (b) {
c = enyo.$[b.id];
if (c && c.kindName.indexOf("Flyweight") >= 0) return c;
b = b.parentNode;
}
}, enyo.callWithoutNode = function(a, b, c) {
a.node = null;
var d = a.hasNode;
a.hasNode = enyo.nop, c(), a.hasNode = d, a.node = b;
}, enyo.callWithNode = function(a, b, c) {
var d = enyo.findFlyweight(a.node), e = d || a, f = e.node, g = d ? d.findNode(b) : b;
e.setNode(g);
var h = enyo._toArray(arguments, 3);
c = enyo.isString(c) ? a[c] : c, c.apply(a, h);
};

// controls/SwipeableItem.js

enyo.kind({
name: "enyo.SwipeableItem",
kind: enyo.Item,
published: {
swipeable: !0,
confirmRequired: !0,
confirmCaption: "Confirm",
cancelCaption: "Cancel",
confirmShowing: !1
},
className: "enyo-item enyo-swipeableitem",
triggerDistance: 50,
events: {
onConfirm: "",
onCancel: "",
onSwipe: "",
onConfirmShowingChanged: "",
onDrag: ""
},
chrome: [ {
name: "drag",
kind: "Drag"
}, {
name: "confirm",
showing: !1,
kind: "ScrimmedConfirmPrompt",
className: "enyo-fit",
onConfirm: "confirmSwipe",
onCancel: "cancelSwipe"
} ],
create: function() {
this.inherited(arguments), this.confirmCaptionChanged(), this.cancelCaptionChanged();
},
confirmCaptionChanged: function() {
this.$.confirm.setConfirmCaption(this.confirmCaption);
},
cancelCaptionChanged: function() {
this.$.confirm.setCancelCaption(this.cancelCaption);
},
getContent: function() {
return this.inherited(arguments);
},
clickHandler: function(a, b) {
this.confirmShowing || this.inherited(arguments);
},
flickHandler: function() {
this.handleSwipe();
return !0;
},
startDragHandler: function(a, b) {
this.resetPosition();
if (!this.confirmShowing && this.swipeable && Math.abs(b.dx) > Math.abs(b.dy)) {
this.index = b.rowIndex, this.$.drag.start(b);
return !0;
}
},
drag: function(a) {
this.hasNode() ? (this.node.style.webkitTransform = "translate3d(" + a.dx + "px, 0, 0)", this.doDrag(a.dx)) : console.log("drag with no node!");
},
dragFinish: function(a, b) {
this.resetPosition(), Math.abs(a.dx) > this.triggerDistance && this.handleSwipe();
},
handleSwipe: function() {
this.doSwipe(this.index), this.confirmRequired ? this.setConfirmShowing(!0) : this.doConfirm(this.index);
},
resetPosition: function() {
this.hasNode() && (this.node.style.webkitTransform = "", this.doDrag(0));
},
confirmShowingChanged: function() {
this.$.confirm.setShowing(this.confirmShowing), this.doConfirmShowingChanged(this.confirmShowing);
},
confirmSwipe: function(a) {
this.setConfirmShowing(!1), this.doConfirm(this.index);
return !0;
},
cancelSwipe: function(a) {
this.setConfirmShowing(!1), this.doCancel(this.index);
return !0;
}
});

// controls/popup/PopupMenu.js

enyo.kind({
name: "enyo.PopupMenu",
kind: enyo.Popup,
published: {
items: []
},
chrome: [ {
name: "client",
className: "enyo-popup-inner",
kind: "BasicScroller",
layoutKind: "OrderedLayout"
} ],
scrim: !0,
defaultKind: "enyo.PopupMenuItem",
removeControl: function(a) {
this.inherited(arguments), a == this._lastItem && (this._lastItem = null);
},
itemsChanged: function() {
this._lastItem = null, this.destroyControls();
for (var a = 0, b, c; b = this.items[a]; a++) b = enyo.isString(b) ? {
caption: b
} : b, this.createComponent(b);
this.render();
},
fetchItemByValue: function(a) {
var b = this.getControls();
for (var c = 0, d; d = b[c]; c++) if (d.getValue() == a) return d;
},
scrollIntoView: function(a, b) {
this.$.client.scrollIntoView(a, b);
},
clampSize: function(a) {
var b = this.inherited(arguments), c = this.calcSize(), d = c.offsetHeight - c.clientHeight, e = c.offsetWidth - c.clientWidth;
b.h = b.h - d, b.w = b.w - e;
return b;
},
applyMaxSize: function(a) {
this.$.client.applyStyle("max-width", a.w + "px"), this.$.client.applyStyle("max-height", a.h + "px");
},
clearSize: function() {
this.$.client.applyStyle("max-width", "none"), this.$.client.applyStyle("max-height", "none");
},
flow: function() {
this.inherited(arguments), this.styleLastItem();
},
_locateLastItem: function(a) {
if (a.collapsed) return a;
var b = a.getControls(), c = b.length;
return c ? this._locateLastItem(b[c - 1]) : a;
},
locateLastItem: function() {
return this._locateLastItem(this);
},
styleLastItem: function() {
this._lastItem && this._lastItem.addRemoveMenuLastStyle(!1);
var a = this.locateLastItem();
a && a.addRemoveMenuLastStyle && (a.addRemoveMenuLastStyle(!0), this._lastItem = a);
}
});

// controls/popup/PopupMenuItem.js

enyo.kind({
name: "enyo.PopupMenuItem",
kind: enyo.Control,
published: {
caption: "",
value: undefined,
icon: "",
orderStyle: "",
open: !1,
disabled: !1,
hideIcon: !1,
tapHighlight: !0
},
indentPadding: 24,
events: {
onclick: "menuItemClick"
},
defaultKind: "enyo.PopupMenuItem",
chrome: [ {
name: "item",
kind: enyo.Item,
layoutKind: "HFlexLayout",
tapHighlight: !0,
align: "center",
onclick: "itemClick",
components: [ {
name: "icon",
kind: enyo.Image,
className: "enyo-popupmenuitem-icon"
}, {
name: "caption",
flex: 1,
className: "enyo-popupmenuitem-caption"
}, {
name: "arrow",
kind: enyo.CustomButton,
toggling: !0,
showing: !1,
className: "enyo-popupmenuitem-arrow"
} ]
} ],
_depth: 0,
create: function(a) {
this.inherited(arguments), this.value === undefined && (this.value = this.caption), this.caption = this.caption || this.content || this.value, this.captionContainer = this.$.item, this.$.item.addClass(this.itemClassName), this.captionChanged(), this.openChanged(), this.iconChanged(), this.disabledChanged(), this.tapHighlightChanged();
},
addControl: function(a) {
!a.isChrome && !this.$.client && (this.$.arrow.setShowing(!0), this.createChrome([ {
name: "client",
kind: enyo.BasicDrawer,
open: !1,
layoutKind: "OrderedLayout"
} ])), this.inherited(arguments);
},
updateDepth: function() {
!inControl.isChrome && inControl.styleDepth && (inControl._depth = this._depth + 1);
},
styleDepth: function() {
this.$.item.applyStyle("padding-left", this._depth * this.indentPadding + "px");
},
hasControls: function() {
return this.getControls().length;
},
flowMenu: function() {
var a = this.getControls();
this.$.item.addRemoveClass("enyo-menu-has-items", a.length);
for (var b = 0, c; c = a[b]; b++) c.styleDepth && (c._depth = this._depth + 1, c.styleDepth());
},
flow: function() {
this.flowMenu(), this.inherited(arguments);
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
},
iconChanged: function() {
this.$.icon.setSrc(enyo.path.rewrite(this.icon)), this.$.icon.setShowing(!this.hideIcon && this.icon);
},
hideIconChanged: function() {
this.$.icon.setShowing(!this.hideIcon);
},
disabledChanged: function() {
this.$.item.setDisabled(this.disabled);
},
tapHighlightChanged: function() {
this.$.item.tapHighlight = this.tapHighlight;
},
fetchMenu: function() {
var a = this.parent;
while (a) {
if (a instanceof enyo.PopupMenu) return a;
a = a.parent;
}
},
itemClick: function(a, b) {
if (this.hasControls()) this.setOpen(!this.open); else {
var c = this.fetchMenu();
c && c.close();
}
this.doClick(b);
},
clickHandler: function() {},
isLastControl: function() {
var a = this.manager ? this.manager.getControls() : [];
return this == a[a.length - 1];
},
openChanged: function() {
this.$.item.addRemoveClass("collapsed", !this.open), this.$.arrow.setDown(this.open), this.$.client && this.$.client.setOpen(this.open);
if (this.isLastControl()) {
var a = this.fetchMenu();
a && a.styleLastItem();
}
},
addRemoveMenuLastStyle: function(a) {
this.$.item.addRemoveClass("enyo-menu-last", a);
},
orderStyleChanged: function(a) {
this.$.item.removeClass(a), this.$.item.addClass(this.orderStyle);
},
getItemClassName: function() {
return this.$.item.getClassName();
},
setItemClassName: function(a) {
this.$.item.setClassName(a);
}
}), enyo.kind({
name: "enyo.PopupMenuCheckItem",
kind: enyo.PopupMenuItem,
published: {
checked: !1
},
chrome: [ {
name: "item",
kind: enyo.Item,
tapHighlight: !0,
align: "center",
className: "enyo-popupmenuitem",
layoutKind: "HFlexLayout",
onclick: "itemClick",
components: [ {
name: "icon",
kind: "Image",
className: "enyo-popupmenuitem-icon"
}, {
name: "caption",
flex: 1,
className: "enyo-popupmenucheckitem-caption"
}, {
name: "arrow",
kind: enyo.CustomButton,
toggling: !0,
className: "enyo-popupmenucheckitem-arrow"
} ]
} ],
create: function() {
this.inherited(arguments), this.checkedChanged();
},
checkedChanged: function() {
this.$.item.checked = this.checked, this.$.item.stateChanged("checked");
},
setSelected: function(a) {
this.setChecked(a);
}
});

// controls/popup/PopupSelect.js

enyo.kind({
name: "enyo.PopupSelect",
kind: enyo.PopupMenu,
published: {
selected: null
},
events: {
onSelect: ""
},
menuItemClick: function(a) {
this.setSelected(a);
},
selectedChanged: function(a) {
this.doSelect(this.selected, a);
}
});

// controls/popup/PopupList.js

enyo.kind({
name: "enyo.PopupList",
kind: enyo.PopupSelect,
chrome: [ {
name: "client",
className: "enyo-popup-inner",
kind: "BasicScroller",
components: [ {
name: "list",
kind: "VirtualRepeater",
onGetItem: "listGetItem"
} ]
} ],
create: function() {
this.inherited(arguments), this.$.list.createComponent({
name: "item",
kind: this.defaultKind,
owner: this
}), this.itemClassName = this.$.item.getItemClassName();
},
menuItemClick: function(a, b) {
this.setSelected(b.rowIndex);
},
listGetItem: function(a, b) {
var c = this.items.length;
if (b < c) {
this.$.item.setCaption(this.items[b]);
var d = c == 1 ? "single" : b == 0 ? "first" : b == c - 1 ? "last" : "";
d = d ? " enyo-" + d : "", this.$.item.setItemClassName(this.itemClassName + d);
return !0;
}
},
itemsChanged: function() {
this.generated && this.$.list.render();
},
fetchRowNode: function(a) {
return this.$.list.fetchRowNode(a);
},
scrollToSelected: function() {
var a = this.fetchRowNode(this.selected);
a && this.scrollIntoView(a ? a.offsetTop : 0);
}
});

// controls/ListSelector.js

enyo.kind({
name: "enyo.ListSelector",
kind: enyo.Control,
published: {
value: "",
items: [],
label: "",
hideItem: !1,
hideArrow: !1,
disabled: !1
},
events: {
onChange: "",
onSelect: ""
},
layoutKind: "HFlexLayout",
itemKind: "PopupMenuCheckItem",
align: "center",
chrome: [ {
kind: "HFlexBox",
flex: 1,
components: [ {
name: "itemContainer"
}, {
name: "client"
} ]
}, {
name: "label",
className: "enyo-listselector-label"
}, {
name: "arrow",
className: "enyo-listselector-arrow"
} ],
create: function(a) {
this.inherited(arguments), this.item = this.$.itemContainer.createComponent({
kind: this.itemKind,
itemClassName: "enyo-listselector-item",
tapHighlight: !1,
owner: this
}), this.makePopup(), this.itemsChanged(), this.disabledChanged(), this.labelChanged(), this.hideArrowChanged();
},
disabledChanged: function() {
this.$.itemContainer.addRemoveClass("enyo-disabled", this.disabled);
},
hideItemChanged: function() {
this.item.setShowing(!this.hideItem);
},
labelChanged: function() {
this.$.label.setContent(this.label);
},
hideArrowChanged: function() {
this.$.arrow.setShowing(!this.hideArrow);
},
fetchDefaultItem: function() {
var a = this.popup.getControls();
if (a.length) return a[0];
},
makePopup: function() {
this.popup = this.createComponent({
kind: "PopupSelect",
onSelect: "popupSelect",
defaultKind: this.itemKind
});
},
openPopup: function(a) {
var b = this.popup.selected;
b && b.setSelected(!1), this.valueChanged(), this.popup.openAroundNode(this.hasNode());
},
clickHandler: function(a, b) {
this.disabled || (this.doClick(b), this.openPopup(b));
},
itemsChanged: function() {
this.items = this.items || [], this.popup.setItems(this.items), this.item.setShowing(this.items && this.items.length), this.valueChanged();
},
valueChanged: function(a) {
var b = this.popup.fetchItemByValue(this.value);
b || (b = this.fetchDefaultItem(), this.value = b ? b.getValue() : "");
if (this.value != a) if (b === undefined) this.value = a; else {
this.hideItem || this.setItemProps(b), this.hideItemChanged(), b.setSelected(!0), this.popup.selected = this.selected = b;
var c = this.popup.fetchItemByValue(a);
c && c.setSelected(!1);
}
},
setItemProps: function(a) {
this.item.setCaption(a.getCaption()), this.item.setIcon(a.getIcon());
},
popupSelect: function(a, b, c) {
var d = this.value;
this.setValue(b.value), this.selected = b, this.doSelect(b, this.item), this.value != d && this.doChange(this.value, d);
}
});

// controls/button/RadioGroup.js

enyo.kind({
name: "enyo.RadioGroup",
kind: enyo.OrderedContainer,
defaultKind: "RadioButton",
className: "enyo-radiogroup",
published: {
value: 0
},
events: {
onChange: ""
},
create: function() {
this.inherited(arguments), this.valueChanged();
},
valueChanged: function(a) {
this.setRadioDepressed(a, !1), this.setRadioDepressed(this.value, !0);
},
setRadioDepressed: function(a, b) {
var c = this.fetchControlByValue(a);
c && c.setDepressed(b);
},
fetchControlByValue: function(a) {
var b = this.controls;
for (var c = 0, d; d = b[c]; c++) if (d.getValue() == a) return d;
},
radioButtonClick: function(a) {
var b = this.value;
this.setValue(a.getValue()), this.value != b && this.doChange(this.value);
}
});

// controls/button/RadioButton.js

enyo.kind({
name: "enyo.RadioButton",
kind: enyo.IconButton,
flex: 1,
className: "enyo-radiobutton",
published: {
value: "",
depressed: !1
},
events: {
onmousedown: ""
},
getValue: function() {
return this.value || this.manager.indexOfControl(this);
},
clickHandler: function(a, b) {
this.disabled || (this.inherited(arguments), this.dispatch(this.manager, "radioButtonClick"));
}
});

// controls/menu/AppMenu.js

enyo.kind({
name: "enyo.AppMenu",
kind: enyo.PopupMenu,
className: "enyo-appmenu",
chrome: [ {
name: "client",
className: "enyo-appmenu-inner",
kind: "BasicScroller",
layoutKind: "OrderedLayout"
} ],
show: function() {
this.applyMaxSize(this.clampSize()), this.inherited(arguments), enyo.appMenu.isOpen = !0;
},
hide: function() {
this.inherited(arguments), enyo.appMenu.isOpen = !1;
}
}), enyo.appMenu = {
isOpen: !1,
toggle: function() {
enyo.appMenu.isOpen ? enyo.appMenu.close() : enyo.appMenu.open();
},
open: function() {
enyo.dispatch({
type: "openAppMenu"
});
},
close: function() {
enyo.dispatch({
type: "closeAppMenu"
});
}
};

// controls/menu/HelpMenu.js

enyo.kind({
name: "enyo.HelpMenu",
kind: enyo.PopupMenuItem,
caption: "Help",
published: {
target: ""
},
helpAppId: "com.palm.app.help",
components: [ {
name: "launchHelp",
kind: "PalmService",
service: "palm://com.palm.applicationManager/",
method: "open"
} ],
itemClick: function() {
this.inherited(arguments), this.$.launchHelp.call({
id: this.helpAppId,
params: {
target: this.target
}
});
}
});

// controls/menu/MenuInput.js

enyo.kind({
name: "enyo.MenuInput",
kind: enyo.FancyInput,
insetClass: "enyo-menu-input-inset",
className: "enyo-menu-input"
});

// controls/menu/MenuToolbar.js

enyo.kind({
name: "enyo.MenuToolbar",
kind: enyo.OrderedContainer,
className: "enyo-menu-toolbar",
defaultKind: "MenuToolButton"
});

// controls/menu/CommandMenu.js

enyo.kind({
name: "enyo.CommandMenu",
kind: enyo.HFlexBox,
pack: "center",
className: "enyo-command-menu",
defaultKind: enyo.MenuButton
});

// controls/menu/EditMenu.js

enyo.kind({
name: "enyo.EditMenu",
kind: enyo.PopupMenuItem,
caption: "Edit",
published: {
selectAllDisabled: !1,
cutDisabled: !1,
copyDisabled: !1,
pasteDisabled: !1
},
domAttributes: {
"enyo-pass-events": !0
},
components: [ {
name: "selectAll",
caption: "Select All",
command: "selectAll",
onclick: "send"
}, {
name: "cut",
caption: "Cut",
command: "cut",
onclick: "send"
}, {
name: "copy",
caption: "Copy",
command: "copy",
onclick: "send"
}, {
name: "paste",
caption: "Paste",
command: "paste",
onclick: "send"
} ],
create: function() {
this.inherited(arguments), this.selectAllDisabledChanged(), this.cutDisabledChanged(), this.copyDisabledChanged(), this.pasteDisabledChanged();
},
mousedownHandler: function(a, b) {
b.preventDefault();
},
send: function(a) {
enyo.dispatch({
type: a.command,
target: document.activeElement
});
},
selectAllDisabledChanged: function() {
this.$.selectAll.setDisabled(this.selectAllDisabled);
},
cutDisabledChanged: function() {
this.$.cut.setDisabled(this.cutDisabled);
},
copyDisabledChanged: function() {
this.$.copy.setDisabled(this.copyDisabled);
},
pasteDisabledChanged: function() {
this.$.paste.setDisabled(this.pasteDisabled);
}
});

// controls/button/MenuToolButton.js

enyo.kind({
name: "enyo.MenuToolButton",
kind: enyo.IconButton,
className: "enyo-menu-toolbutton"
});

// controls/button/MenuRadioButton.js

enyo.kind({
name: "enyo.MenuRadioButton",
kind: enyo.RadioButton,
className: "enyo-menu-toolbutton"
});

// controls/button/MenuRadioGroup.js

enyo.kind({
name: "enyo.MenuRadioGroup",
kind: enyo.RadioGroup,
className: "enyo-menu-radiogroup",
defaultKind: "MenuRadioButton"
});

// controls/picker/PickerButton.js

enyo.kind({
name: "enyo.PickerButton",
kind: enyo.Button,
className: "enyo-button enyo-picker-button",
published: {
focus: !1
},
events: {
onFocusChange: ""
},
chrome: [ {
name: "caption",
className: "enyo-picker-button-caption"
} ],
create: function() {
this.inherited(arguments), this.focusChanged();
},
captionChanged: function() {
this.$.caption.setContent(this.caption);
},
focusChanged: function() {
this.stateChanged("focus"), this.doFocusChange();
}
});

// controls/picker/Picker.js

enyo.kind({
name: "enyo.Picker",
kind: enyo.PickerButton,
published: {
value: "",
textAlign: "center",
items: [],
scrim: !0
},
events: {
onChange: ""
},
create: function(a) {
this.inherited(arguments), this.makePopup(), this.textAlignChanged(), this.itemsChanged(), this.valueChanged();
},
makePopup: function() {
this.popup = this.createComponent({
kind: "PopupList",
className: "enyo-picker-popup",
onSelect: "popupSelect",
onClose: "popupClose",
scrim: this.scrim
});
},
scrimChanged: function() {
this.popup.scrim = this.scrim;
},
clickHandler: function(a, b) {
this.openPopup(b);
return this.doClick(b);
},
openPopup: function(a) {
this.setFocus(!0), this.dispatch(this.manager, this.managerOpenPopup);
var b = this.hasNode();
this.popup.applyStyle("min-width", b.offsetWidth + "px"), this.popup.openNearNode(b), this.valueChanged(), this.popup.scrollToSelected();
},
popupClose: function(a, b) {
this.setFocus(!1), this.dispatch(this.manager, this.managerClosePopup, [ b ]);
},
closePopup: function() {
this.popup.close();
},
itemsChanged: function() {
this.items = this.items || [], this.popup.setItems(this.items);
},
textAlignChanged: function() {
this.popup.applyStyle("text-align", this.textAlign);
},
fetchIndexByValue: function(a) {
for (var b = 0, c; c = this.items[b]; b++) if (c == a) return b;
},
valueChanged: function(a) {
if (this.value != a) {
var b = this.fetchIndexByValue(this.value);
b === undefined ? this.value = a : (this.popup.setSelected(b), this.setCaption(this.value));
}
},
updateSelected: function(a, b) {
this.addRemoveSelectedStyle(b, !1), this.addRemoveSelectedStyle(a, !0);
},
addRemoveSelectedStyle: function(a, b) {
if (a >= 0) {
var c = this.popup.fetchRowNode(a);
c && (c.className = b ? "enyo-picker-item-selected" : "");
}
},
popupSelect: function(a, b, c) {
this.updateSelected(b, c);
var d = this.items[b];
if (d !== undefined) {
var e = this.value;
this.setValue(d), this.value != e && (this.doChange(this.value), this.dispatch(this.manager, "pickerChange"));
}
}
});

// controls/picker/IntegerPicker.js

enyo.kind({
name: "enyo.IntegerPicker",
kind: enyo.HFlexBox,
published: {
label: "value",
value: 0,
min: 0,
max: 9
},
events: {
onChange: ""
},
components: [ {
name: "label",
className: "enyo-picker-label"
}, {
kind: "Picker"
} ],
create: function() {
this.inherited(arguments), this.labelChanged(), this.rangeChanged();
},
labelChanged: function() {
this.$.label.setContent(this.label);
},
minChanged: function() {
this.rangeChanged();
},
maxChanged: function() {
this.rangeChanged();
},
rangeChanged: function() {
var a = [];
for (var b = this.min; b <= this.max; b++) a.push(String(b));
this.$.picker.setItems(a), this.valueChanged();
},
valueChanged: function() {
this.value = this.value >= this.min && this.value <= this.max ? this.value : this.min, this.$.picker.setValue(String(this.value));
},
pickerChange: function() {
this.value = parseInt(this.$.picker.getValue()), this.doChange(this.value);
}
});

// controls/picker/PickerGroup.js

enyo.kind({
name: "enyo.PickerGroup",
kind: enyo.HFlexBox,
published: {
label: "",
labelClass: ""
},
events: {
onChange: ""
},
defaultKind: "enyo.Picker",
chrome: [ {
name: "label",
kind: "Control",
className: "enyo-picker-label"
}, {
name: "client",
kind: "Control",
layoutKind: "HFlexLayout"
} ],
constructor: function() {
this.inherited(arguments), this.pickers = [];
},
create: function() {
this.inherited(arguments), this.labelClassChanged(), this.labelChanged(), this.createChrome([ {
kind: "Popup",
scrim: !0,
style: "border-width: 0; -webkit-border-image: none;"
} ]);
},
addControl: function(a) {
this.inherited(arguments), a instanceof enyo.Picker && (a.scrim = !1, a.managerOpenPopup = "pickerPopupOpen", a.managerClosePopup = "pickerPopupClose", this.pickers.push(a));
},
removeControl: function(a) {
this.inherited(arguments);
},
pickerPopupOpen: function(a) {
this.applyToPickers("setFocus", [ !0 ]), this.openPopup();
},
pickerPopupClose: function(a, b) {
this.applyToPickers("setFocus", [ !1 ]), this.isEventInPicker(b) || this.closePopup();
},
isEventInPicker: function(a) {
var b = a && a.dispatchTarget;
if (b) for (var c = 0, d; d = this.pickers[c]; c++) if (b.isDescendantOf(d)) return !0;
},
openPopup: function() {
var a = this.$.popup;
a.isOpen || (a.openNearNode(this.$.client.hasNode()), a.setContent(this.$.client.generateHtml()));
},
closePopup: function() {
this.$.popup.setContent(""), this.$.popup.close();
},
applyToPickers: function(a, b) {
for (var c = 0, d; d = this.pickers[c]; c++) d[a].apply(d, b);
},
labelChanged: function() {
this.$.label.setContent(this.label);
},
labelClassChanged: function(a) {
a && this.$.label.removeClass(a), this.labelClass && this.$.label.addClass(this.labelClass);
},
pickerChange: function() {
this.doChange();
}
});

// controls/picker/TimePicker.js

enyo.kind({
name: "enyo.TimePicker",
kind: enyo.PickerGroup,
published: {
label: "time",
value: null,
minuteInterval: 1,
is24HrMode: !1
},
components: [ {
name: "hour"
}, {
name: "minute"
}, {
name: "ampm",
value: "AM",
items: [ "AM", "PM" ]
} ],
create: function() {
this.inherited(arguments), this.value = this.value || new Date, this.minuteIntervalChanged(), this.is24HrModeChanged();
},
minuteIntervalChanged: function() {
var a = [];
for (var b = 0; b < 60; b += this.minuteInterval) a.push(b < 10 ? "0" + b : String(b));
this.$.minute.setItems(a);
},
is24HrModeChanged: function() {
this.$.ampm.setShowing(!this.is24HrMode), this.setupHour(), this.valueChanged();
},
setupHour: function() {
var a = [];
for (var b = this.is24HrMode ? 0 : 1; b <= (this.is24HrMode ? 23 : 12); b++) a.push(String(b));
this.$.hour.setItems(a);
},
valueChanged: function() {
var a = this.value, b = a.getHours(), c = Math.floor(a.getMinutes() / this.minuteInterval) * this.minuteInterval, d = b < 12 ? "AM" : "PM";
this.$.hour.setValue(this.is24HrMode ? b : b % 12 || 12), this.$.minute.setValue(c < 10 ? "0" + c : String(c)), this.$.ampm.setValue(d);
},
pickerChange: function() {
var a = parseInt(this.$.hour.getValue()), b = parseInt(this.$.minute.getValue(), 10), c = this.$.ampm.getValue();
a = c == "AM" || this.is24HrMode ? a : a + 12, this.value.setHours(a), this.value.setMinutes(b), this.doChange(this.value);
}
});

// controls/picker/DatePicker.js

enyo.kind({
name: "enyo.DatePicker",
kind: enyo.PickerGroup,
published: {
label: "date",
value: null,
minYear: 1900,
maxYear: 2099
},
components: [ {
name: "month"
}, {
name: "day"
}, {
name: "year"
} ],
monthStrings: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
create: function() {
this.inherited(arguments), this.value = this.value || new Date, this.setupMonth(), this.yearRangeChanged(), this.valueChanged();
},
setupMonth: function() {
this.$.month.setItems(this.monthStrings);
},
setupDay: function(a, b, c) {
var d = 32 - (new Date(a, b, 32)).getDate(), e = [];
for (var f = 1; f <= d; f++) e.push(String(f));
this.$.day.setItems(e), this.$.day.value = "", this.$.day.setValue(c > d ? d : c);
},
minYearChanged: function() {
this.yearRangeChanged();
},
maxYearChanged: function() {
this.yearRangeChanged();
},
yearRangeChanged: function() {
var a = [];
for (var b = this.minYear; b <= this.maxYear; b++) a.push(String(b));
this.$.year.setItems(a);
},
valueChanged: function() {
var a = this.value, b = a.getMonth(), c = a.getDate(), d = a.getFullYear();
this.setupDay(d, b, c), this.$.month.setValue(this.monthStrings[b]), this.$.year.setValue(d);
},
pickerChange: function(a) {
var b = this.$.month.getValue(), c;
for (var d = 0, e; e = this.monthStrings[d]; d++) if (e == b) {
c = d;
break;
}
var f = parseInt(this.$.day.getValue()), g = parseInt(this.$.year.getValue());
a != this.$.day && this.setupDay(g, c, f), this.value.setMonth(c), this.value.setDate(f), this.value.setYear(g), this.doChange(this.value);
}
});

// controls/progress/ProgressBar.js

enyo.kind({
name: "enyo.ProgressBar",
kind: enyo.Progress,
className: "enyo-progress-bar",
published: {
animatePosition: !0
},
events: {
onBeginAnimation: "",
onEndAnimation: ""
},
chrome: [ {
name: "animator",
kind: enyo.Animator,
onBegin: "beginAnimation",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
onStop: "stopAnimation"
}, {
name: "bar",
className: "enyo-progress-bar-inner"
}, {
name: "client"
} ],
create: function() {
this.inherited(arguments), this.contentChanged();
},
contentChanged: function() {
this.$.client.setContent(this.content);
},
setPositionImmediate: function(a) {
var b = this.animatePosition;
this.animatePosition = !1, this.setPosition(a), this.animatePosition = b;
},
applyPosition: function() {
var a = this.calcPercent(this.position);
this.lastPosition >= 0 && this.animatePosition && !this.$.animator.isAnimating() && this.canAnimate() ? this.$.animator.play(this.calcPercent(this.lastPosition), a) : this.renderPosition(a);
},
renderPosition: function(a) {
this.$.bar.applyStyle("visibility", a <= 0 ? "hidden" : "visible"), this.$.bar.applyStyle("width", a + "%");
},
renderPositionDirect: function(a, b) {
a.visibility = b <= 0 ? "hidden" : "visible", a.width = b + "%";
},
canAnimate: function() {
return this.$.bar.hasNode();
},
beginAnimation: function(a, b, c) {
this.$.bar.domStyles.visibility = c <= 0 ? "hidden" : "visible", this.$.bar.domStyles.width = c + "%", this.$.bar.hasNode() && (a.style = this.$.bar.node.style, this.doBeginAnimation());
},
stepAnimation: function(a, b) {
this.renderPositionDirect(a.style, b);
},
endAnimation: function(a, b) {
this.completeAnimation(a, b);
},
stopAnimation: function(a, b, c, d) {
this.completeAnimation(a, d);
},
completeAnimation: function(a, b) {
this.renderPositionDirect(a.style, b), this.doEndAnimation();
},
forceBeginAnimation: function(a, b) {
this.beginAnimation(this.$.animator, a, b);
},
forceStepAnimation: function(a) {
this.stepAnimation(this.$.animator, a);
},
forceCompleteAnimation: function(a) {
this.completeAnimation(this.$.animator, a);
}
});

// controls/progress/ProgressPill.js

enyo.kind({
name: "enyo.ProgressPill",
kind: enyo.ProgressBar,
className: "enyo-progress-pill",
layoutKind: "VFlexLayout",
create: function() {
this.inherited(arguments), this.$.bar.setClassName("enyo-progress-pill-inner"), this.$.client.setLayoutKind("HFlexLayout"), this.$.client.addClass("enyo-progress-pill-client"), this.$.client.flex = 1, this.$.client.align = "center";
}
});

// controls/progress/Slider.js

enyo.kind({
name: "enyo.Slider",
kind: enyo.ProgressBar,
className: "enyo-slider",
published: {
tapPosition: !0
},
events: {
onChange: "",
onChanging: ""
},
chrome: [ {
name: "drag",
kind: enyo.Drag,
onDrag: "dragButton",
onFinish: "dragButtonFinish"
}, {
name: "animator",
kind: enyo.Animator,
onBegin: "beginAnimation",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
onStop: "stopAnimation"
}, {
className: "enyo-slider-progress",
components: [ {
name: "bar",
className: "enyo-slider-inner",
components: [ {
name: "button",
kind: "CustomButton",
caption: " ",
toggle: !0,
allowDrag: !0,
className: "enyo-slider-button"
} ]
} ]
}, {
name: "client"
} ],
renderPosition: function(a) {
this.$.button.applyStyle("left", a + "%");
},
renderPositionDirect: function(a, b) {
a.left = b + "%";
},
canAnimate: function() {
return this.$.button.hasNode();
},
beginAnimation: function(a, b, c) {
this.$.button.domStyles.left = c + "%", this.$.button.hasNode() && (a.style = this.$.button.node.style), this.doBeginAnimation();
},
stepAnimation: function(a, b) {
this.renderPositionDirect(a.style, b);
},
startDragHandler: function(a, b) {
this._width = this.calcWidth(), this.$.drag.start(b), this.$.button.setDown(!0);
return !0;
},
calcWidth: function() {
var a = this.$.bar.hasNode();
return a.offsetWidth;
},
calcEventPosition: function(a) {
var b = enyo.dom.fetchNodeOffset(this.$.bar.hasNode()), c = a - b.offsetLeft;
return c / this.calcWidth() * this.maximum;
},
dragButton: function(a) {
var b = this.calcEventPosition(a.px);
this.setPositionImmediate(b), this.doChanging(this.position);
},
dragButtonFinish: function() {
this.toggleButtonUp(), this.doChange(this.position);
},
completeAnimation: function(a, b) {
this.inherited(arguments), this._clicked && (this._clicked = !1, this.doChange(this.position));
},
clickHandler: function(a, b) {
if (this.tapPosition && b.dispatchTarget != this.$.button) {
this.$.animator.stop();
var c = this.calcEventPosition(b.pageX);
this._clicked = !0, this.setPosition(c);
}
},
mouseupHandler: function() {
this.toggleButtonUp();
},
toggleButtonUp: function() {
this.$.button.setDown(!1);
}
});

// controls/progress/ProgressSlider.js

enyo.kind({
name: "enyo.ProgressSlider",
kind: enyo.Slider,
published: {
lockBar: !1,
barPosition: 0,
barMinimum: 0,
barMaximum: 100
},
chrome: [ {
name: "drag",
kind: enyo.Drag,
onDrag: "dragButton",
onFinish: "dragButtonFinish"
}, {
name: "animator",
kind: enyo.Animator,
onBegin: "beginAnimation",
onAnimate: "stepAnimation",
onEnd: "endAnimation",
onStop: "stopAnimation"
}, {
className: "enyo-progressslider-progress",
components: [ {
name: "bar",
kind: enyo.ProgressBar,
components: [ {
name: "button",
kind: "CustomButton",
caption: " ",
toggling: !0,
allowDrag: !0,
className: "enyo-slider-button"
} ]
} ]
}, {
name: "client"
} ],
create: function() {
this.inherited(arguments), this.barMinimumChanged(), this.barMaximumChanged(), this.barPositionChanged();
},
barPositionChanged: function() {
this.$.bar.setPosition(this.lockBar ? this.position : this.barPosition);
},
barMinimumChanged: function() {
this.$.bar.setMinimum(this.lockBar ? this.minimum : this.barMinimum);
},
barMaximumChanged: function() {
this.$.bar.setMaximum(this.lockBar ? this.maximum : this.barMaximum);
},
renderPosition: function(a) {
this.inherited(arguments), this.lockBar && this.$.bar.renderPosition(a);
},
positionChanged: function(a) {
this.inherited(arguments), this.lockBar && a != undefined && !this.$.animator.isAnimating() && this.$.bar.setPositionImmediate(this.position);
},
lockBarChanged: function() {
this.lockBar && (this.$.bar.setMaximum(this.maximum), this.$.bar.setMinimum(this.minimum), this.$.bar.setPositionImmediate(this.position));
},
canAnimate: function() {
return this.inherited(arguments) && this.$.bar.canAnimate();
},
beginAnimation: function(a, b, c) {
this.inherited(arguments), this.lockBar && this.$.bar.forceBeginAnimation(b, c);
},
stepAnimation: function(a, b) {
this.inherited(arguments), this.lockBar && this.$.bar.forceStepAnimation(b);
},
completeAnimation: function(a, b) {
this.inherited(arguments), this.lockBar && this.$.bar.forceCompleteAnimation(b);
}
});

// controls/ConfirmPrompt.js

enyo.kind({
name: "enyo.ConfirmPrompt",
kind: enyo.HFlexBox,
published: {
confirmCaption: "Confirm",
cancelCaption: "Cancel"
},
className: "enyo-confirmprompt",
events: {
onConfirm: "confirmAction",
onCancel: "cancelAction"
},
defaultKind: "Button",
align: "center",
pack: "center",
chrome: [ {
name: "confirm",
onclick: "doConfirm"
}, {
kind: "Control",
width: "24px"
}, {
name: "cancel",
onclick: "doCancel"
} ],
create: function() {
this.inherited(arguments), this.confirmCaptionChanged(), this.cancelCaptionChanged();
},
confirmCaptionChanged: function() {
this.$.confirm.setCaption(this.confirmCaption);
},
cancelCaptionChanged: function() {
this.$.cancel.setCaption(this.cancelCaption);
}
}), enyo.kind({
name: "enyo.ScrimmedConfirmPrompt",
kind: enyo.Control,
forward: {
confirmCaption: "confirm",
cancelCaption: "confirm"
},
events: {
onConfirm: "",
onCancel: ""
},
chrome: [ {
name: "scrim",
className: "enyo-fit enyo-confirmprompt-scrim",
domStyles: {
"z-index": 1
}
}, {
name: "confirm",
kind: "ConfirmPrompt",
className: "enyo-fit",
domStyles: {
"z-index": 2
},
onConfirm: "doConfirm",
onCancel: "doCancel"
} ],
create: function() {
this.inherited(arguments), this.setConfirmCaption(this.confirmCaption), this.setCancelCaption(this.cancelCaption);
}
});

// controls/Spacer.js

enyo.kind({
name: "enyo.Spacer",
kind: enyo.Control,
className: "enyo-spacer",
flex: 1
});

// containers/Group.js

enyo.kind({
name: "enyo.Group",
kind: enyo.Control,
className: "enyo-group enyo-roundy",
published: {
caption: ""
},
chrome: [ {
name: "label",
kind: "Control",
className: "enyo-group-label"
}, {
name: "client",
kind: "Control",
className: "enyo-group-inner"
} ],
create: function() {
this.inherited(arguments), this.captionChanged();
},
captionChanged: function() {
this.$.label.setContent(this.caption), this.$.label.setShowing(this.caption), this.addRemoveClass("labeled", this.caption);
}
});

// containers/RowGroup.js

enyo.kind({
name: "enyo.RowGroup",
kind: enyo.Group,
chrome: [ {
name: "label",
kind: "Control",
className: "enyo-group-label"
}, {
name: "client",
kind: "Control",
layoutKind: "OrderedLayout",
className: "enyo-group-inner"
} ],
roundedClass: "rounded",
defaultKind: "enyo.Item",
addControl: function(a) {
a.isChrome || a.addClass(this.roundedClass), this.inherited(arguments);
},
addChild: function(a) {
if (a.isChrome || a instanceof enyo.Item) this.inherited(arguments); else {
var b = this.createComponent({
kind: "Item",
tapHighlight: a.tapHighlight
});
b.addChild(a);
}
},
controlAtIndex: function(a) {
return this.getControls()[a];
},
showRow: function(a) {
var b = this.controlAtIndex(a);
b.setShowing(!0), this.$.client.flow();
},
hideRow: function(a) {
var b = this.controlAtIndex(a);
b.setShowing(!1), this.$.client.flow();
}
});

// containers/DividerDrawer.js

enyo.kind({
name: "enyo.DividerDrawer",
kind: enyo.Drawer,
published: {
icon: "",
caption: ""
},
chrome: [ {
name: "caption",
kind: "enyo.Divider",
onclick: "toggleOpen",
components: [ {
name: "openButton",
kind: "enyo.SwitchedButton",
className: "enyo-collapsible-arrow"
} ]
}, {
name: "client",
kind: "enyo.BasicDrawer",
onOpenChanged: "doOpenChanged"
} ],
create: function() {
this.inherited(arguments), this.iconChanged();
},
captionChanged: function() {
this.$.caption.setCaption(this.caption), this.$.caption.applyStyle("display", this.caption ? "" : "none");
},
openChanged: function() {
this.inherited(arguments), this.$.openButton.setSwitched(!this.open);
},
iconChanged: function() {
this.$.caption.setIcon(this.icon);
}
}), enyo.kind({
name: "enyo.SwitchedButton",
kind: enyo.CustomButton,
published: {
switched: !1
},
caption: " ",
create: function() {
this.inherited(arguments), this.switchedChanged();
},
mouseupHandler: function(a, b, c) {
this.inherited(arguments), this.toggleSwitched();
},
toggleSwitched: function() {
this.setSwitched(!this.switched);
},
switchedChanged: function(a) {
this.stateChanged("switched");
}
});

// containers/Dialog.js

enyo.kind({
name: "enyo.Dialog",
kind: enyo.Popup,
className: "enyo-dialog",
chrome: [ {
name: "animator",
kind: enyo.Animator,
onAnimate: "animate",
onEnd: "finishAnimate"
}, {
name: "client",
className: "enyo-dialog-inner"
} ],
_open: function() {
this.inherited(arguments), this.startAnimate(100, 0);
},
_close: function() {
this.startAnimate(0, 100);
},
startAnimate: function(a, b) {
this.$.animator.play(a, b);
},
animate: function(a, b) {
this.applyStyle("-webkit-transform", "translateY(" + b + "%)");
},
finishAnimate: function(a, b) {
this.isOpen || this.hide();
}
});

// containers/DialogPrompt.js

enyo.kind({
name: "enyo.DialogPrompt",
kind: enyo.Dialog,
className: "enyo-dialog",
scrim: !0,
published: {
title: "",
message: "",
acceptButtonCaption: "OK",
cancelButtonCaption: "Cancel"
},
events: {
onAccept: "",
onCancel: ""
},
chrome: [ {
name: "animator",
kind: enyo.Animator,
onAnimate: "animate",
onEnd: "finishAnimate"
}, {
name: "client",
className: "enyo-dialog-inner",
components: [ {
name: "title",
className: "enyo-dialog-prompt-title"
}, {
className: "enyo-dialog-prompt-content",
components: [ {
name: "message",
className: "enyo-dialog-prompt-message"
}, {
name: "acceptButton",
kind: "Button",
onclick: "acceptClick"
}, {
name: "cancelButton",
kind: "Button",
onclick: "cancelClick"
} ]
} ]
} ],
create: function() {
this.inherited(arguments), this.titleChanged(), this.messageChanged(), this.acceptButtonCaptionChanged(), this.cancelButtonCaptionChanged();
},
open: function(a, b, c, d) {
a && this.setTitle(a), b && this.setMessage(b), c && this.setAcceptButtonCaption(c), d != undefined && this.setCancelButtonCaption(d), this.inherited(arguments);
},
titleChanged: function() {
this.$.title.setContent(this.title), this.$.title.setShowing(this.title);
},
messageChanged: function() {
this.$.message.setContent(this.message);
},
acceptButtonCaptionChanged: function() {
this.$.acceptButton.setCaption(this.acceptButtonCaption);
},
cancelButtonCaptionChanged: function() {
this.$.cancelButton.setCaption(this.cancelButtonCaption), this.$.cancelButton.setShowing(this.cancelButtonCaption);
},
acceptClick: function() {
this.doAccept(), this.close();
},
cancelClick: function() {
this.doCancel(), this.close();
}
});

// containers/Sliding.js

enyo.kind({
name: "enyo.Sliding",
kind: enyo.Control,
className: "enyo-sliding enyo-bg",
layoutKind: "VFlexLayout",
events: {
onResize: ""
},
published: {
slideState: "showing",
dragAnywhere: !0,
edgeDragging: !1,
fixedWidth: !1,
minWidth: 0,
peekWidth: 0
},
chrome: [ {
className: "enyo-sliding-shadow"
}, {
name: "client",
className: "enyo-bg",
kind: enyo.Control,
flex: 1
}, {
name: "edgeDragger",
slidingHandler: !0,
kind: enyo.Control,
className: "enyo-sliding-nub"
} ],
create: function() {
this.inherited(arguments), this.layout = new enyo.VFlexLayout, this.addClass("enyo-sliding-animate"), this.contentChanged(), this.slideStateChanged(), this.edgeDraggingChanged(), this.minWidthChanged();
},
destroy: function() {
this.unlistenTransitionEnd(), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.listenTransitionEnd();
},
listenTransitionEnd: function() {
this.hasNode() && (this.transitionEndListener = enyo.bind(this, "webkitTransitionEndHandler"), this.node.addEventListener("webkitTransitionEnd", this.transitionEndListener, !1));
},
unlistenTransitionEnd: function() {
this.node.addEventListener("webkitTransitionEnd", this.transitionEndListener, !1);
},
layoutKindChanged: function() {
this.$.client.setLayoutKind(this.layoutKind);
},
edgeDraggingChanged: function() {
this.$.edgeDragger.setShowing(this.edgeDragging);
},
slideStateChanged: function(a) {
this["_slideTo" + enyo.cap(this.slideState)]();
},
findSiblings: function() {
return this.manager.slidings;
},
getPreviousSibling: function() {
var a = this.findSiblings(), b = enyo.indexOf(this, a);
return a[b - 1];
},
getNextSibling: function() {
var a = this.findSiblings(), b = enyo.indexOf(this, a);
return a[b + 1];
},
_slideToHidden: function() {
this.hide();
},
_slideToShowing: function() {
var a = this.getPreviousSibling();
a && a.slideState == "covered" && (a.slideState = "selected");
while (a) a.slideState == "hidden" && (a.slideState = "showing"), a = a.getPreviousSibling();
this.validateAll();
},
_slideToSelected: function() {
var a = this.getPreviousSibling();
a && (a.slideState = "covered");
var b = this;
while (b = b.getNextSibling()) b.slideState != "hidden" && (b.slideState = "showing");
this.validateAll(), this.resizeLastSibling();
},
_slideToCovered: function() {
var a = this;
while (a = a.getPreviousSibling()) a.slideState = "covered";
this.validateAll(), this.resizeLastSibling();
},
validateAll: function() {
var a = this.findSiblings(), b = a[0] || this;
b.validateSlide();
},
validateSlide: function() {
this._move(this.calcSlide());
},
calcSlide: function() {
return this["calcSlide" + enyo.cap(this.slideState)]();
},
calcSlideHidden: function() {
var a = parseInt(this.domStyles.left), b = this.manager.hasNode().offsetWidth;
return b - a;
},
calcSlideShowing: function() {
var a = this.getPreviousSibling();
return a && a._slide || 0;
},
calcSlideSelected: function() {
return this.peekWidth + this.calcSlideCovered();
},
calcSlideCovered: function() {
return this.hasNode() ? -this.node.offsetLeft : 0;
},
_move: function(a) {
a != this._slide && (this._slide = a, this.hasNode() && (this.domStyles.display != "none" ? this.node.style.webkitTransform = "translate3d(" + a + "px,0,0)" : this.slideState != "hidden" && this._moveFromHidden(a)));
var b = this.getNextSibling();
b && b.validateSlide();
},
_moveFromHidden: function(a) {
this.removeClass("enyo-sliding-animate"), this.show(), this._move(this.calcSlideHidden()), enyo.asyncMethod(this, function() {
this.addClass("enyo-sliding-animate"), this._move(a || 0);
});
},
webkitTransitionEndHandler: function() {
this.slideComplete();
},
slideComplete: function() {
this.hasAdjustableWidth() && !this.manager.dragging && enyo.asyncMethod(this, "adjustWidth", this.calcSlide());
},
deAnimate: function() {
this.removeClass("enyo-sliding-animate");
},
reAnimate: function() {
this.addClass("enyo-sliding-animate");
},
hasAdjustableWidth: function() {
return !this.getNextSibling() && !this.fixedWidth;
},
fixedWidthChanged: function() {
this.fixedWidth && this.$.client.applyStyle("width", null);
},
minWidthChanged: function() {
this.$.client.applyStyle("min-width", this.minWidth || null);
},
adjustWidth: function(a) {
if (this.hasNode() && this.$.client.hasNode()) {
var b = this.node.offsetWidth, c = Math.max(b, b - a);
c && (this.$.client.node.style.width = c + "px", this.doResize());
}
},
findLastSibling: function() {
var a = this.findSiblings();
return a[a.length - 1];
},
resizeLastSibling: function() {
if (!this.manager.dragging) {
var a = this.findLastSibling();
if (a && !a.fixedWidth) {
var b = a.calcSlide();
a.adjustWidth(b);
}
}
},
startDragHandler: function(a, b) {
b.sliding = this;
},
isDraggableEvent: function(a) {
var b = a.dispatchTarget;
return b && b.slidingHandler || this.dragAnywhere;
},
canDrag: function(a) {
this.dragMin = this.calcSlideSelected(), this.dragMax = this.calcSlideShowing();
if (this.slideState == "selected" || this.slideState == "showing") {
var b = this.dragMax != this.dragMin && (a > 0 && this._slide <= this.dragMax || a < 0 && this._slide >= this.dragMax);
return b;
}
},
isAtDragMax: function() {
return this._slide == this.dragMax;
},
isAtDragMin: function() {
return this._slide == this.dragMin;
},
isAtDragBoundary: function() {
return this.isAtDragMax() || this.isAtDragMin();
},
beginDrag: function(a, b) {
this.dragStart = this._slide - b, this.manager.dragging = this;
},
drag: function(a, b) {
var c = a.dx + this.dragStart;
x = Math.max(this.dragMin, Math.min(c, this.dragMax)), this.dragSelect = c < this._slide, this._move(x);
if (this.isAtDragMin() && this.dragSelect || this.isAtDragMax() && !this.dragSelect) this.applyDragSlideState(), enyo.call(this.manager, "slidingDragComplete", [ this, b ]);
},
dragFinish: function() {
var a = this.isAtDragBoundary();
this.applyDragSlideState(), this.manager.dragging = null, a && this.resizeLastSibling(), enyo.call(this.manager, "processSlideEvent");
},
applyDragSlideState: function() {
this.dragSelect ? this.setSlideState("selected") : this.setSlideState("showing");
},
clickHandler: function(a, b) {
b.dispatchTarget.slidingHandler && (this.toggleSelected(), enyo.call(this.manager, "processSlideEvent")), this.doClick(b);
},
toggleSelected: function() {
var a = this.slideState == "hidden" || this.slideState == "selected";
this.setSlideState(a ? "showing" : "selected");
}
});

// containers/SlidingGroup.js

enyo.kind({
name: "enyo.SlidingGroup",
kind: enyo.Control,
published: {
autoLayout: !0,
wideLayout: !0,
wideWidth: 500,
selected: null
},
events: {
onSelect: ""
},
defaultKind: "Sliding",
chrome: [ {
name: "drag",
kind: enyo.Drag
}, {
name: "client",
kind: enyo.Control,
className: "enyo-view enyo-sliding-group-client",
layoutKind: "HFlexLayout"
} ],
constructor: function() {
this.inherited(arguments), this.slidingCache = [], this.slidings = [];
},
create: function() {
this.inherited(arguments);
var a = this.slidings[0];
a && this.setSelected(a);
},
rendered: function() {
this.inherited(arguments), this.resize();
},
addControl: function(a) {
this.inherited(arguments), a instanceof enyo.Sliding && this.slidings.push(a);
},
removeControl: function(a) {
this.inherited(arguments), a instanceof enyo.Sliding && enyo.remove(a, this.slidings);
},
resizeHandler: function() {
this.resize();
},
resize: function() {
var a = window.innerWidth > this.wideWidth;
a != this.wideLayout && this.autoLayout ? this.setWideLayout(a) : this.validate();
},
selectedChanged: function() {
this.selected.setSlideState("selected");
},
getSelected: function() {
for (var a = 0, b = this.slidings, c; c = b[a]; a++) if (c.slideState == "selected") return c;
},
processSlideEvent: function(a) {
var b = this.getSelected();
b != this.lastSelected && (this.slidingSelected(b, this.lastSelected), this.lastSelected = this.getSelected());
},
slidingSelected: function(a, b) {
this.doSelect(a, b);
},
wideLayoutChanged: function(a) {
this[this.wideLayout ? "applyWideLayout" : "applyNarrowLayout"]();
},
applyWideLayout: function() {
for (var a = 0, b = this.slidings, c; c = b[a]; a++) this.uncacheSliding(c, a);
this.$.client.applyStyle("width", null), this.reflow();
},
applyNarrowLayout: function() {
for (var a = 0, b = this.slidings, c; c = b[a]; a++) this.cacheSliding(c, a), c.setFixedWidth(!0), c.peekWidth = 0, c.domStyles.width = 0, c.flex = 1;
this.$.client.applyStyle("width", 100 * this.slidings.length + "%"), this.reflow();
},
cacheSliding: function(a, b) {
this.slidingCache[b] = {
flex: a.flex,
width: a.domStyles.width,
peekWidth: a.peekWidth,
fixedWidth: a.fixedWidth
};
},
uncacheSliding: function(a, b) {
var c = this.slidingCache[b];
c && (a.flex = c.flex, a.domStyles.width = c.width, a.peekWidth = c.peekWidth, a.setFixedWidth(c.fixedWidth));
},
reflow: function() {
this.$.client.flow();
for (var a = 0, b = this.slidings, c; c = b[a]; a++) c.applyStyle();
this.correctifyWidth(), enyo.asyncMethod(this, "validate");
},
correctifyWidth: function() {
this.$.client.applyStyle("display", "block"), enyo.asyncMethod(this.$.client, "applyStyle", "display", null);
},
validate: function() {
this.deAnimate();
var a = this.slidings;
enyo.call(a[0], "validateAll"), enyo.call(a[a.length - 1], "slideComplete"), enyo.asyncMethod(this, "reAnimate");
},
deAnimate: function() {
for (var a = 0, b = this.slidings, c; c = b[a]; a++) c.deAnimate();
},
reAnimate: function() {
for (var a = 0, b = this.slidings, c; c = b[a]; a++) c.reAnimate();
},
findDraggable: function(a) {
for (var b = 0, c = this.slidings, d; d = c[b]; b++) {
if (d.canDrag(a)) return d;
if (this.dragStartSliding == d) break;
}
},
startDragHandler: function(a, b) {
var c = this.dragStartSliding = b.sliding, d = c && c.isDraggableEvent(b) && this.findDraggable(b.dx);
if (d) {
this.deAnimate(), this.dragSliding = d, this.$.drag.start(b), this.dragSliding.beginDrag(b, 0);
return !0;
}
},
drag: function(a, b) {
this.dragSliding.drag(a, b);
},
dragFinish: function(a, b) {
this.reAnimate(), this.dragSliding.dragFinish(b);
},
slidingDragComplete: function(a, b) {
var c = a.isAtDragMax() ? 1 : -1, d = this.findDraggable(c);
d && (this.dragSliding = d, d.beginDrag(b, this.$.drag.dx));
},
backHandler: function(a, b) {
this.back(b);
},
back: function(a) {
var b = this.getSelected();
b && (b.setSlideState("showing"), a.preventDefault());
}
});

// services/PalmService.js

enyo.kind({
name: "enyo.PalmService",
kind: enyo.Service,
published: {
method: "",
subscribe: null,
resubscribe: !1,
params: null
},
resubscribeDelay: 1e4,
requestKind: "PalmService.Request",
create: function() {
this.params = {}, this.inherited(arguments);
},
destroy: function() {
this.inherited(arguments), enyo.job.stop(this.id + "-resubscribe");
},
importProps: function(a) {
this.inherited(arguments), this.method = this.method || this.name;
},
makeRequestProps: function(a) {
var b = this.inherited(arguments), c = {
service: this.service,
method: this.method
};
b = enyo.mixin(c, b), this.subscribe === !0 && (b.params.subscribe = this.subscribe, b.subscribe = this.subscribe);
return b;
},
responseFailure: function(a) {
this.inherited(arguments), this.resubscribe && this.subscribe && enyo.job(this.id + "-resubscribe", enyo.hitch(this, "reCall", a), this.resubscribeDelay);
},
reCall: function(a) {
if (!a.destroyed) {
a.call();
return a;
}
}
}), enyo.kind({
name: "enyo.PalmService.Request",
kind: enyo.Request,
create: function() {
this.bridge = new PalmServiceBridge, this.bridge.onservicecallback = this.clientCallback = enyo.bind(this, "receive"), this.inherited(arguments);
},
call: function() {
var a = this.params || {};
this.json = enyo.isString(a) ? a : enyo.json.stringify(a), this.bridge.call(this.service + this.method, this.json);
},
destroy: function() {
this.bridge.cancel(), this.inherited(arguments);
},
setResponse: function(a) {
try {
this.response = enyo.isString(a) ? enyo.json.parse(a) : a;
} catch (b) {
this.warn("Failed to convert response from JSON:", b, " for response: [" + a + "]"), this.response = null;
}
},
isFailure: function(a) {
return !this.response || (this.response.errorCode || this.response.returnValue === !1);
},
finish: function() {
this.subscribe || this.destroy();
}
});

// services/MockPalmService.js

enyo.kind({
name: "enyo.PalmService.MockRequest",
kind: enyo.WebService.Request,
handleAs: "json",
call: function() {
"mockDataProvider" in this.owner ? this.url = this.owner.mockDataProvider(this) : this.url = "mock/" + this.owner.id + ".json", enyo.xhr.request({
url: this.url,
method: "GET",
callback: enyo.hitch(this, "receive")
});
},
isFailure: function() {
this.response || (this.response = {
returnValue: !1,
errorText: "Expected mock response at: " + this.url
}, this.log(this.response.errorText));
return !this.response.returnValue;
}
}), window.PalmSystem || (enyo.PalmService.Request = enyo.PalmService.MockRequest);

// services/PalmServices.js

enyo.palmServices = {
system: "palm://com.palm.systemservice/",
telephony: "palm://com.palm.telephony/",
database: "luna://com.palm.db/",
application: "palm://com.palm.applicationManager/",
accounts: "palm://com.palm.service.accounts/"
};

// services/SystemService.js

enyo.kind({
name: "enyo.SystemService",
kind: enyo.PalmService,
service: enyo.palmServices.system
});

// services/DbService.js

enyo.kind({
name: "enyo.DbService",
kind: enyo.PalmService,
requestKind: "DbService.Request",
published: {
dbKind: "",
reCallWatches: !1
},
events: {
onWatch: ""
},
methodHandlers: {
putKind: "putKind",
delKind: "delKind",
find: "findOrSearch",
search: "findOrSearch",
delByQuery: "delByQuery"
},
service: enyo.palmServices.database,
importProps: function(a) {
this.inherited(arguments), this.dbKind = this.dbKind || this.masterService.dbKind;
},
call: function(a, b) {
b = b || {}, b.dbKind = b.dbKind || this.dbKind || this.masterService.dbKind;
return this.inherited(arguments, [ a, b ]);
},
makeRequestProps: function(a) {
var b = this.inherited(arguments);
delete b.params.subscribe;
var c = {
onWatch: this.onWatch
};
return enyo.mixin(c, b);
},
putKind: function(a) {
var b = {
id: a.dbKind
};
a.params = enyo.mixin(b, a.params);
return this.request(a);
},
delKind: function(a) {
a.params = {
id: a.dbKind
};
return this.request(a);
},
findOrSearch: function(a) {
var b = {};
if (a.subscribe === !0 || a.subscribe === !1) b.watch = a.subscribe; else if (this.subscribe === !0 || this.subscribe === !1) b.watch = this.subscribe;
b = enyo.mixin(b, a.params);
var c = {
from: a.dbKind
};
b.query = enyo.mixin(c, b.query), a.params = b;
return this.request(a);
},
delByQuery: function(a) {
a.method = "del";
var b = a.params = a.params || {};
b.query = enyo.mixin({
from: a.dbKind
}, b.query || {});
return this.request(a);
},
responseWatch: function(a) {
this.reCallWatches && this.reCall(a), this.dispatch(this.owner, a.onWatch, [ a.response, a ]);
}
}), enyo.kind({
name: "enyo.DbService.Request",
kind: enyo.PalmService.Request,
events: {
onRequestWatch: "responseWatch"
},
isWatch: function(a) {
return a && a.fired;
},
processResponse: function() {
this.isWatch(this.response) ? this.doRequestWatch(this.response) : this.inherited(arguments);
}
});

// services/TempDbService.js

enyo.kind({
name: "enyo.TempDbService",
kind: enyo.DbService,
service: "palm://com.palm.tempdb/"
});

// list/VirtualScroller.js

enyo.kind({
name: "enyo.VirtualScroller",
kind: enyo.DragScroller,
events: {
onScroll: ""
},
published: {
fpsShowing: !1,
accelerated: !0
},
className: "enyo-virtual-scroller",
tools: [ {
name: "drag",
kind: "Drag"
}, {
name: "scroll",
kind: "ScrollMath",
kFrictionDamping: .97,
interval: 20,
topBoundary: 1e9,
bottomBoundary: -1e9
} ],
chrome: [ {
name: "content"
} ],
top: 0,
bottom: -1,
pageTop: -1,
pageOffset: 0,
contentHeight: 0,
constructor: function() {
this.heights = [], this.inherited(arguments);
},
create: function() {
this.inherited(arguments), this.fpsShowingChanged(), this.acceleratedChanged();
},
rendered: function() {
this.inherited(arguments), this.measure(), this.$.scroll.animate();
},
fpsShowingChanged: function() {
!this.$.fps && this.fpsShowing && (this.createChrome([ {
name: "fps",
content: "stopped",
className: "enyo-scroller-fps",
parent: this
} ]), this.generated && this.$.fps.render()), this.$.fps && this.$.fps.setShowing(this.fpsShowing);
},
acceleratedChanged: function() {
var a = this.pageTop;
this.pageTop = 0, this.effectScroll && this.effectScroll(), this.pageTop = a, this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated, this.$.content.applyStyle("margin", this.accelerated ? null : "900px 0"), this.effectScroll();
},
measure: function(a, b) {
this.viewNode = this.hasNode(), this.viewHeight = this.viewNode.clientHeight, this.contentHeight = this.$.content.hasNode().offsetHeight;
},
adjustTop: function(a) {},
adjustBottom: function(a) {},
unshiftPage: function() {
var a = this.top - 1;
if (this.adjustTop(a) === !1) {
enyo.vizLog && enyo.vizLog.log("VirtualScroller: FAIL unshift page " + a);
return !1;
}
this.top = a, enyo.vizLog && enyo.vizLog.log("VirtualScroller: unshifted page " + a);
},
shiftPage: function() {
this.adjustTop(++this.top);
},
pushPage: function() {
var a = this.bottom + 1;
if (this.adjustBottom(a) === !1) {
enyo.vizLog && enyo.vizLog.log("VirtualScroller: FAIL push page " + a);
return !1;
}
this.bottom = a, enyo.vizLog && enyo.vizLog.log("VirtualScroller: pushed page " + a);
},
popPage: function() {
enyo.vizLog && enyo.vizLog.log("VirtualScroller: popped page " + this.bottom), this.adjustBottom(--this.bottom);
},
pushPages: function() {
while (this.contentHeight + this.pageTop < this.viewHeight) {
if (this.pushPage() === !1) {
this.$.scroll.bottomBoundary = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1);
break;
}
this.contentHeight += this.heights[this.bottom] || 0;
}
},
popPages: function() {
var a = this.heights[this.bottom];
while (a !== undefined && this.bottom && this.contentHeight + this.pageTop - a > this.viewHeight) this.popPage(), this.contentHeight -= a, a = this.heights[this.bottom];
},
shiftPages: function() {
var a = this.heights[this.top];
while (a !== undefined && a < -this.pageTop) enyo.vizLog && enyo.vizLog.log("VirtualScroller: shift page " + this.top + " (height: " + a + ")"), this.pageOffset -= a, this.pageTop += a, this.contentHeight -= a, this.shiftPage(), a = this.heights[this.top];
},
unshiftPages: function() {
while (this.pageTop > 0) {
if (this.unshiftPage() === !1) {
this.$.scroll.topBoundary = this.pageOffset, this.$.scroll.bottomBoundary = -9e9;
break;
}
var a = this.heights[this.top];
if (a == undefined) {
this.top++;
return;
}
this.contentHeight += a, this.pageOffset += a, this.pageTop -= a;
}
},
updatePages: function() {
enyo.vizLog && (enyo.vizLog.log("VirtualScroller: updatePages start"), enyo.vizLog.log("- top/bottom: " + this.top + "/" + this.bottom), enyo.vizLog.log("- content/pageTop: " + this.contentHeight + "/" + this.pageTop));
this.viewNode && (this.viewHeight = this.viewNode.clientHeight, this.$.scroll.topBoundary = 9e9, this.$.scroll.bottomBoundary = -9e9, this.pushPages(), this.popPages(), this.unshiftPages(), this.shiftPages(), enyo.vizLog && (enyo.vizLog.log("VirtualScroller: updatePages finish"), enyo.vizLog.log("- top/bottom: " + this.top + "/" + this.bottom), enyo.vizLog.log("- content/pageTop: " + this.contentHeight + "/" + this.pageTop), enyo.vizLog.log("- boundaries: " + this.$.scroll.topBoundary + "/" + this.$.scroll.bottomBoundary)), this.effectScroll());
},
scroll: function() {
enyo.vizLog && enyo.vizLog.startFrame("VirtualScroller: scroll");
var a = Math.round(this.$.scroll.y) - this.pageOffset;
a != this.pageTop && (this.pageTop = a, this.updatePages(), this.doScroll());
},
scrollStop: function(a) {
this.fpsShowing && this.$.fps.setContent(a.fps);
},
effectScrollNonAccelerated: function() {
this.node.scrollTop = 900 - this.pageTop;
},
effectScrollAccelerated: function() {
var a = this.$.content.hasNode();
if (a) for (var b = 0, c = a.childNodes, d; d = c[b]; b++) d.style.webkitTransform = "translate3d(0," + this.pageTop + "px,0)";
}
});

// list/Buffer.js

enyo.kind({
name: "enyo.Buffer",
kind: enyo.Component,
events: {
onAcquirePage: "",
onDiscardPage: ""
},
top: 0,
bottom: -1,
margin: 0,
overbuffer: 0,
firstPage: null,
lastPage: null,
acquirePage: function(a) {
return this.doAcquirePage(a);
},
discardPage: function(a) {
return this.doDiscardPage(a);
},
flush: function() {
while (this.bottom >= this.top) this.pop();
},
adjustTop: function(a) {
this.specTop = a;
var b = a - this.overbuffer;
if (b < this.top || b > this.top + this.margin || b > this.bottom) {
var c = b - this.margin;
while (this.top < c) this.shift();
while (this.top > b) if (this.unshift() === !1) {
this.firstPage = this.top;
return this.top <= a && this.bottom >= a;
}
}
},
adjustBottom: function(a) {
this.specBottom = a;
var b = a + this.overbuffer;
if (b < this.bottom - this.margin || b > this.bottom) {
var c = b + this.margin;
while (this.bottom > c) this.pop();
while (this.bottom < b) if (this.push() === !1) {
this.lastPage = this.bottom;
return this.bottom >= a;
}
}
},
shift: function() {
this.discardPage(this.top++);
},
unshift: function() {
if (this.acquirePage(this.top - 1) === !1) return !1;
this.top--;
},
push: function() {
if (this.acquirePage(this.bottom + 1) === !1) return !1;
this.bottom++;
},
pop: function() {
this.discardPage(this.bottom--);
},
refresh: function() {
for (var a = this.top; a <= this.bottom; a++) this.acquirePage(a);
}
}), enyo.kind({
name: "enyo.BufferView",
kind: enyo.Control,
style: "font-size: 0.7em; border: 1px solid black;",
chrome: [ {
name: "bufferName",
content: "Buffer",
style: "border-bottom: 1px dotted black; padding: 2px;"
}, {
name: "first",
content: "0",
style: "color: green; padding: 2px;"
} ],
update: function(a) {
this.$.bufferName.setContent(a.name), this.$.first.setContent(a.top + " (" + (a.specTop || "n/a") + ") - " + a.bottom + " (" + (a.specBottom || "n/a") + ")");
}
});

// list/DisplayBuffer.js

enyo.kind({
name: "enyo.DisplayBuffer",
kind: enyo.Buffer,
height: 0,
acquirePage: function(a) {
var b = this.pages[a];
b && (b.style.display = "", this.heights[a] || (this.height += this.heights[a] = b.offsetHeight));
},
discardPage: function(a) {
var b = this.pages[a];
b && (b.style.display = "none"), this.height -= this.heights[a] || 0;
}
});

// list/DomBuffer.js

enyo.kind({
name: "enyo.DomBuffer",
kind: enyo.Buffer,
rowsPerPage: 3,
lastPage: 0,
constructor: function() {
this.inherited(arguments), this.pool = [];
},
generateRows: function(a) {
var b = [], c = this.rowsPerPage * a;
for (var d = 0, e; d < this.rowsPerPage; d++, c++) e = "", 1 ? e = this.generateRow(c) : c >= 0 && c < 200 && (e = '<div id="canonVirtualList_list_list_client" rowindex="0"><div class="enyo-item item" id="canonVirtualList_item"><div id="canonVirtualList_hFlexBox" class="enyo-hflexbox" style="-webkit-box-pack:start;-webkit-box-align:stretch;"><div id="canonVirtualList_itemColor" class="item-color"></div><div id="canonVirtualList_itemName" style="-webkit-box-flex:1;width:0px;">Rose Lucas</div><div id="canonVirtualList_itemIndex" class="item-index">(' + c + ')</div></div><div id="canonVirtualList_itemSubject" class="item-subject">Uxumplo acriss buon lurgo griut. </div></div></div>'), e && b.push(e);
if (!b.length) return !1;
return b.join("");
},
preparePage: function(a) {
var b = this.pages[a] = this.pages[a] || (this.pool.length ? this.pool.pop() : document.createElement("div"));
b.style.display = "none", b.className = "page", b.id = "page-" + a;
return b;
},
installPage: function(a, b) {
if (!a.parentNode) {
var c = this.pagesNode;
b < this.bottom ? c.insertBefore(a, c.firstChild) : c.appendChild(a);
}
},
acquirePage: function(a) {
var b = this.generateRows(a);
if (b === !1) return !1;
var c = this.preparePage(a);
c.innerHTML = b, this.installPage(c, a);
},
discardPage: function(a) {
var b = this.pages[a];
b ? (b.parentNode.removeChild(b), this.pool.push(b), this.pages[a] = null) : (enyo.vizLog && enyo.vizLog.log("DomBuffer.discardPage: bad page: " + a + " " + this.top + "/" + this.bottom, "background-color: orange;"), this.warn("bad page:", a));
}
});

// list/BufferedScroller.js

enyo.kind({
name: "enyo.BufferedScroller",
kind: enyo.VirtualScroller,
rowsPerPage: 3,
events: {
onGenerateRow: "generateRow",
onAdjustTop: "",
onAdjustBottom: ""
},
constructor: function() {
this.pages = [], this.inherited(arguments);
},
create: function() {
this.inherited(arguments), this.createDomBuffer(), this.createDisplayBuffer();
},
createDomBuffer: function() {
this.domBuffer = this.createComponent({
kind: enyo.DomBuffer,
rowsPerPage: this.rowsPerPage,
pages: this.pages,
margin: 20,
generateRow: enyo.hitch(this, "doGenerateRow")
});
},
createDisplayBuffer: function() {
this.displayBuffer = new enyo.DisplayBuffer({
heights: this.heights,
pages: this.pages
});
},
rendered: function() {
this.domBuffer.pagesNode = this.$.content.hasNode(), this.inherited(arguments);
},
pageToTopRow: function(a) {
return a * this.rowsPerPage;
},
pageToBottomRow: function(a) {
return a * this.rowsPerPage + (this.rowsPerPage - 1);
},
adjustTop: function(a) {
this.doAdjustTop(this.pageToTopRow(a));
if (this.domBuffer.adjustTop(a) === !1) return !1;
this.displayBuffer.adjustTop(a), enyo.viz && enyo.viz.scrollerUpdate(this);
},
adjustBottom: function(a) {
this.doAdjustBottom(this.pageToBottomRow(a));
if (this.domBuffer.adjustBottom(a) === !1) return !1;
this.displayBuffer.adjustBottom(a), enyo.viz && enyo.viz.scrollerUpdate(this);
},
findBottom: function() {
while (this.pushPage() !== !1) ;
this.contentHeight = this.displayBuffer.height, this.bottomBoundary = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1), this.py = this.uy = this.y = this.y0 = this.bottomBoundary;
},
refreshPages: function() {
this.domBuffer.flush(), this.bottom = this.top - 1, this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom, this.displayBuffer.top = this.domBuffer.top = this.top, this.contentHeight = 0, this.displayBuffer.height = 0, this.heights = this.displayBuffer.heights = [], this.updatePages();
},
punt: function() {
this.$.scroll.stop(), this.bottom = -1, this.top = 0, this.domBuffer.flush(), this.displayBuffer.bottom = this.domBuffer.bottom = this.bottom, this.displayBuffer.top = this.domBuffer.top = this.top, this.contentHeight = 0, this.displayBuffer.height = 0, this.heights = this.displayBuffer.heights = [], this.pageOffset = 0, this.pageTop = 0, this.$.scroll.y = this.$.scroll.y0 = 0, this.updatePages();
}
});

// list/StateManager.js

enyo.kind({
name: "enyo.StateManager",
kind: enyo.Component,
published: {
control: null
},
create: function() {
this.inherited(arguments), this.state = [];
},
controlChanged: function() {
this.clear(), this.defaultState = null, this.makeDefaultState();
},
makeDefaultState: function() {
var a = {};
this.read(this.control, a);
return a;
},
getDefaultState: function() {
this.defaultState || (this.defaultState = this.makeDefaultState());
return this.copyState(this.defaultState);
},
clear: function() {
this.state = [];
},
fetch: function(a) {
return this.state[a] || (this.state[a] = {});
},
save: function(a) {
this.read(this.control, this.fetch(a));
},
restore: function(a) {
this.state[a] || (this.state[a] = this.getDefaultState()), this.write(this.control, this.fetch(a));
},
read: function(a, b) {
for (var c in a.published) b[c] = a[c];
for (var c in a.statified) b[c] = a[c];
b.domStyles = enyo.clone(a.domStyles), b.domAttributes = enyo.clone(a.domAttributes), this.readChildren(a, b);
},
readChildren: function(a, b) {
var c = b.children = b.children || {};
for (var d = 0, e = a.children, f, g; f = e[d]; d++) g = c[f.id] || (c[f.id] = {}), this.read(f, g);
},
write: function(a, b) {
var c = b.children;
delete b.children;
for (var d in b) a[d] = b[d];
b.children = c || {}, this.writeChildren(a, b);
},
writeChildren: function(a, b) {
var c = b.children;
for (var d = 0, e = a.children, f, g; f = e[d]; d++) g = c[f.id], g && this.write(f, g);
},
copyState: function(a) {
var b = enyo.clone(a);
b.domStyles = enyo.clone(b.domStyles), b.domAttributes = enyo.clone(b.domAttributes), this.copyChildrenState(b, a);
return b;
},
copyChildrenState: function(a, b) {
a.children = {};
var c = b.children;
for (var d in c) a.children[d] = this.copyState(c[d]);
}
});

// list/ListServer.js

enyo.kind({
name: "enyo.ListServer",
kind: enyo.Control,
events: {
onSetupRow: ""
},
chrome: [ {
name: "client",
kind: "Flyweight",
onNodeChange: "clientNodeChanged",
onDecorateEvent: "clientDecorateEvent"
}, {
name: "state",
kind: "StateManager"
} ],
lastIndex: -1,
create: function() {
this.inherited(arguments), this.$.client.generateHtml(), this.$.state.setControl(this.$.client);
},
prepareRow: function(a) {
this.transitionRow(a), this.controlsToRow(a);
},
generateHtml: function() {
return "";
},
generateRow: function(a) {
var b;
this.lastIndex = -1, this._nodesDisabled || this.disableNodeAccess(), this.$.state.restore(a);
var c = this.formatRow(a);
c !== undefined && (c === null ? b = " " : (this.$.client.domAttributes.rowIndex = a, b = this.getChildContent(), this.$.state.save(a)));
return b;
},
clearState: function() {
this.$.state.clear();
},
formatRow: function(a) {
return this.doSetupRow(a);
},
clientDecorateEvent: function(a, b) {
b.rowIndex = this.fetchRowIndex(a);
},
clientNodeChanged: function(a, b) {
this.transitionRow(this.fetchRowIndex());
},
disableNodeAccess: function() {
this.$.client.disableNodeAccess(), this._nodesDisabled = !0;
},
enableNodeAccess: function() {
this.$.client.enableNodeAccess(), this._nodesDisabled = !1;
},
transitionRow: function(a) {
this.lastIndex > -1 && this.$.state.save(this.lastIndex), this.lastIndex = a, this.$.state.restore(a), this.enableNodeAccess();
},
controlsToRow: function(a) {
var b = this.fetchRowNode(a);
if (b) {
this.$.client.setNode(b);
return !0;
}
},
fetchRowNode: function(a) {
var b = this.getParentNode();
if (b) return b.querySelector('[rowindex="' + a + '"]');
},
fetchRowIndex: function(a) {
var b = a || this.$.client;
return this.fetchRowIndexByNode(b.hasNode());
},
fetchRowIndexByNode: function(a) {
var b, c = a, d = this.getParentNode();
while (c && c.getAttribute && c != d) {
b = c.getAttribute("rowIndex");
if (b != null) return Number(b);
c = c.parentNode;
}
}
});

// list/ScrollingList.js

enyo.kind({
name: "enyo.ScrollingList",
kind: enyo.VFlexBox,
events: {
onSetupRow: ""
},
components: [ {
name: "scroller",
kind: enyo.BufferedScroller,
flex: 1,
onGenerateRow: "generateRow",
onAdjustTop: "adjustTop",
onAdjustBottom: "adjustBottom",
components: [ {
name: "list",
kind: enyo.ListServer,
onSetupRow: "doSetupRow"
} ]
} ],
controlParentName: "list",
generateRow: function(a, b) {
return this.$.list.generateRow(b);
},
prepareRow: function(a) {
this.$.list.prepareRow(a);
},
updateRow: function(a) {
this.prepareRow(a), this.doSetupRow(a);
},
fetchRowIndex: function() {
return this.$.list.fetchRowIndex();
},
refresh: function() {
this.$.scroller.refreshPages();
},
reset: function() {
this.$.list.clearState(), this.$.scroller.$.scroll.stop(), this.refresh();
},
punt: function() {
this.$.list.clearState(), this.$.scroller.punt();
}
});

// list/Selection.js

enyo.kind({
name: "enyo.Selection",
kind: enyo.Component,
published: {
multi: !1
},
events: {
onChange: ""
},
create: function() {
this.clear(), this.inherited(arguments);
},
clear: function(a) {
this.selected = [];
},
multiChanged: function() {
this.multi || this.clear(), this.doChange();
},
isSelected: function(a) {
return this.selected[a];
},
setByIndex: function(a, b) {
this.selected[a] = b;
},
deselect: function(a) {
this.setByIndex(a, !1);
},
select: function(a) {
var b = this.isSelected(a);
this.multi || this.clear(), this.setByIndex(a, !b), this.doChange();
}
});

// list/VirtualList.js

enyo.kind({
name: "enyo.VirtualList",
kind: enyo.ScrollingList,
published: {
lookAhead: 2,
pageSize: 10
},
events: {
onAcquirePage: "",
onDiscardPage: ""
},
create: function() {
this.inherited(arguments), this.createComponents([ {
kind: "Selection",
onChange: "selectionChanged"
}, {
kind: "Buffer",
overbuffer: this.lookAhead,
margin: 3,
onAcquirePage: "doAcquirePage",
onDiscardPage: "doDiscardPage"
} ]);
},
select: function(a) {
return this.$.selection.select(a);
},
isSelected: function(a) {
return this.$.selection.isSelected(a);
},
setMultiSelect: function(a) {
this.$.selection.setMulti(a);
},
getSelection: function() {
return this.$.selection;
},
selectionChanged: function() {
this.refresh();
},
rowToPage: function(a) {
return Math.floor(a / this.pageSize);
},
adjustTop: function(a, b) {
var c = this.rowToPage(b);
enyo.vizLog && enyo.vizLog.log("VirtualList.adjustTop: row: " + b + " converted to page " + c), this.$.buffer.adjustTop(c), enyo.viz && enyo.viz.listUpdate(this);
},
adjustBottom: function(a, b) {
var c = this.rowToPage(b);
enyo.vizLog && enyo.vizLog.log("VirtualList.adjustBottom: row: " + b + " converted to page " + c), this.$.buffer.adjustBottom(c), enyo.viz && enyo.viz.listUpdate(this);
},
reset: function() {
this.$.buffer.bottom = this.$.buffer.top - 1, this.inherited(arguments);
}
});

// list/dbUtil.js

parseQuery = function(a) {
var b = {}, c = /(where .*)?(orderBy .*)?/i, d = a.match(c);
if (d && d[1]) {
var e = d[1].slice(6).split(" and "), f = /(.*)([=<>%])(.*)/;
b.where = [];
for (var g = 0, h; h = e[g]; g++) {
var i = h.match(f);
i && b.where.push({
prop: i[1],
op: i[2],
val: enyo.json.from(enyo.string.trim(i[3]))
});
}
}
d && d[2] && (b.orderBy = d[2].slice(8));
return b;
};

// list/DbPages.js

enyo.kind({
name: "enyo.DbPages",
kind: "Component",
events: {
onQuery: ""
},
size: 36,
desc: !1,
min: 9999,
max: 0,
create: function() {
this.pages = [], this.handles = [], this.inherited(arguments);
},
reset: function(a) {
var b = a;
while (b <= this.max && this.handles[b] == undefined && b) b++;
var c = this.handles[b];
this.handles = [], b > this.max ? (enyo.vizLog && enyo.vizLog.log("DbPages: reset: saving no handles, returning to 'special 0' page"), b = 0) : (enyo.vizLog && enyo.vizLog.log("DbPages: reset: retaining handle for page " + b), this.handles[b] = c);
},
query: function(a) {
var b = {
limit: this.size,
desc: this.desc
};
a !== undefined && a !== null && (b.page = a);
return this.doQuery(b);
},
queryBack: function(a) {
var b = {
page: a,
limit: this.size,
desc: !this.desc
};
return this.doQuery(b);
},
queryResponse: function(a, b) {
var c = b.params.query || {}, d = c.desc != this.desc;
a.results && d && (a.results.reverse(), a.handle = a.next, delete a.next), this.receivePage(a, b);
},
receivePage: function(a, b) {
var c = b.index;
a.results.length ? (this.pages[c] = {
data: a.results,
request: b
}, this.min = Math.min(this.min, c), this.max = Math.max(this.max, c), this.setHandle(c, a.handle), this.setHandle(c + 1, a.next)) : this.pages[c] = {};
},
setHandle: function(a, b) {
if (b != undefined) {
this.handles[a] = b;
var c = this.pages[a];
c && c.pending && (c.inflight = !0, this.acquireNext(a, b));
var c = this.pages[a - 1];
c && c.pending && (c.inflight = !0, this.acquirePrevious(a - 1, b));
}
},
acquireNext: function(a, b) {
var c = this.query(b);
this._acquire(c, a);
},
acquirePrevious: function(a, b) {
var c = this.queryBack(b);
this._acquire(c, a);
},
_acquire: function(a, b) {
a && (a.index = b);
},
require: function(a) {
enyo.vizLog && enyo.vizLog.log("DbPages: require: " + a);
var b = this.pages[a];
if (b) return b.pending ? null : b;
b = this.pages[a] = {
pending: !0
};
if (this.handles[a] !== undefined) this.acquireNext(a, this.handles[a]); else if (this.handles[a + 1] !== undefined) this.acquirePrevious(a, this.handles[a + 1]); else if (a == 0) {
for (var c = -1; c >= this.min; c--) if (this.pages[c] && this.pages[c].inflight) return;
this.acquireNext(0, null);
}
},
dispose: function(a) {
var b = this.pages[a];
b && (enyo.vizLog && enyo.vizLog.log("DbPages: dispose: page " + a), b.request && b.request.destroy(), this.min == a && this.min++, this.max == a && this.max--, delete this.pages[a]);
},
fetch: function(a) {
var b = Math.floor(a / this.size), c = this.pages[b];
if (!c) return undefined;
if (!c.data) return undefined;
var d = a - b * this.size;
a < 0 && (d -= this.size - c.data.length);
return c.data[d] || null;
}
});

// list/DbList.js

enyo.kind({
name: "enyo.DbList",
kind: enyo.VFlexBox,
published: {
pageSize: 20,
desc: !1
},
events: {
onQuery: "",
onSetupRow: ""
},
components: [ {
kind: "DbPages",
onQuery: "doQuery"
}, {
flex: 1,
name: "list",
kind: "VirtualList",
onSetupRow: "setupRow",
onAcquirePage: "acquirePage",
onDiscardPage: "discardPage"
} ],
controlParentName: "list",
create: function() {
this.inherited(arguments), this.pageSizeChanged(), this.descChanged();
},
descChanged: function() {
this.$.dbPages.desc = this.desc;
},
pageSizeChanged: function() {
this.$.list.pageSize = this.pageSize, this.$.dbPages.size = this.pageSize;
},
acquirePage: function(a, b) {
this.$.dbPages.require(b);
},
discardPage: function(a, b) {
this.$.dbPages.dispose(b), enyo.viz && enyo.viz.dbListUpdate(this);
},
queryResponse: function(a, b) {
this.$.dbPages.queryResponse(a, b), enyo.viz && enyo.viz.dbListUpdate(this);
var c = b.index, d = this.$.list.$.buffer;
c < d.specTop || c > d.specBottom ? enyo.vizLog && enyo.vizLog.log("DbList: no-render queryResponse (page: " + c + ")") : (enyo.vizLog && enyo.vizLog.startFrame("DbList: queryResponse (page: " + c + ")"), this.refresh());
},
fetch: function(a) {
return this.$.dbPages.fetch(a);
},
setupRow: function(a, b) {
var c = this.fetch(b);
if (c) {
this.doSetupRow(c, b);
return !0;
}
return c;
},
updateRow: function(a) {
this.$.list.updateRow(a);
},
update: function() {
this.$.list.$.scroller.updatePages(), enyo.viz && enyo.viz.dbListUpdate(this);
},
refresh: function() {
this.$.list.refresh();
},
reset: function() {
var a = this.$.list.$.buffer, b = a.specTop === undefined ? a.top : a.specTop;
this.$.dbPages.reset(b), a.flush(), a.top = b, a.bottom = b - 1, this.$.list.reset();
},
punt: function() {
this.$.list.$.buffer.flush(), this.$.list.$.buffer.top = this.$.list.$.buffer.specTop = 0, this.$.list.$.buffer.bottom = this.$.list.$.buffer.specBottom = -1, this.$.dbPages.reset(0), this.$.dbPages.handles = [], this.$.list.punt(), enyo.viz && enyo.viz.dbListUpdate(this);
}
});

// list/MockDb.js

enyo.kind({
name: "enyo.MockDb",
kind: enyo.Service,
components: [ {
kind: "WebService",
sync: !0,
onSuccess: "gotData",
onFailure: "failData"
} ],
events: {
onSuccess: "",
onWatch: ""
},
methodHandlers: {
find: "query",
del: "del",
put: "put",
merge: "merge"
},
minLatency: 10,
maxLatency: 200,
create: function() {
this.data = [], this.cursors = {}, this.inherited(arguments), window.PalmSystem || this.getData();
},
generateId: function(a) {
return ("00000" + enyo.irand(1e5)).slice(-5);
},
getData: function() {
this.file = (this.dbKind || this.id).replace(":", "-"), this.data = enyo.MockDb.dataSets[this.file], this.data || this.$.webService.call(null, {
url: "mock/" + this.file + ".json"
});
},
failData: function(a, b, c) {
this.log("expected mock data at:", c.url);
},
gotData: function(a, b, c) {
this.log("got mock data from:", c.url), this.data = enyo.MockDb.dataSets[this.file] = b.results;
for (var d = 0, e; e = this.data[d]; d++) e._id = this.generateId();
},
sort: function() {
var a = this.data[0];
if (a) {
for (var b in a) if (b) break;
this.data.sort(function(a, c) {
var d = a[b], e = c[b];
return d < e ? -1 : d > e ? 1 : 0;
});
}
},
latency: function() {
return enyo.irand(this.maxLatency - this.minLatency) + this.minLatency;
},
latent: function(a) {
setTimeout(enyo.bind(this, a), this.latency());
},
query: function(a) {
var b = a.params.query || {};
b.page == undefined && (this.cursors = {});
var c = this.cursors[b.page] || (b.desc ? this.data.length - 1 : 0), d = b.limit ? c + b.limit : -1, e = d;
b.desc && (d = c, c = Math.max(0, c - b.limit), e = c);
var f = b.limit ? this.data.slice(c, d) : this.data.slice(c);
b.desc && f.reverse();
var g = {
results: f
};
if (f.length == b.limit) {
var h;
do h = enyo.irand(1e4) + 1e4; while (this.cursors[h] !== undefined);
this.cursors[h] = e, g.next = h;
}
enyo.vizLog && enyo.vizLog.log("MockDb.query: " + b.page + ": " + c + "/" + d + (inQqueryuery.desc ? " (desc) " : " next: ") + e + " (" + h + ")");
var i = {
params: {
query: b
},
destroy: enyo.nop,
isWatch: enyo.nop
};
setTimeout(enyo.bind(this, function() {
this.doSuccess(g, i);
}), this.latency());
return i;
},
watch: function(a) {
this.doWatch();
},
findById: function(a) {
for (var b = 0, c; c = this.data[b]; b++) if (c._id == a) return b;
return -1;
},
put: function(a) {
this.latent(function() {
for (var b = 0, c = a.params.objects, d; d = c[b]; b++) this.data.push(d);
this.sort(), this.watch();
});
},
_merge: function(a) {
var b = this.findById(a._id);
b >= 0 && enyo.mixin(this.data[b], a);
},
merge: function(a) {
this.latent(function() {
for (var b = 0, c = a.params.objects, d; d = c[b]; b++) this._merge(d);
this.sort(), this.watch();
});
},
_remove: function(a) {
var b = this.findById(a);
b >= 0 && (this.log(a), this.data.splice(b, 1));
},
remove: function(a) {
this._remove(a._id);
},
del: function(a) {
this.latent(function() {
for (var b = 0, c = a.params.ids, d; d = c[b]; b++) this._remove(d);
this.watch();
});
}
}), enyo.kind({
name: "enyo.DbInstaller",
kind: enyo.Component,
events: {
onFailure: "",
onSuccess: ""
},
components: [ {
kind: "WebService",
sync: !0,
onSuccess: "gotData",
onFailure: "failure"
}, {
kind: "DbService",
onFailure: "failure",
components: [ {
name: "delKind",
onResponse: "putKind",
failure: ""
}, {
name: "putKind",
onSuccess: "putRecords"
}, {
name: "put",
onSuccess: "putSuccess"
} ]
} ],
install: function(a, b, c) {
this.dbKind = a, this.dbOwner = b, this.$.dbService.setDbKind(a), this.getData();
},
getData: function() {
var a = (this.dbKind || this.id).replace(":", "-");
this.$.webService.call(null, {
url: "mock/" + a + ".json"
});
},
gotData: function(a, b) {
this.prepareRecords(b.results), this.delKind();
},
prepareRecords: function(a) {
this.records = [];
for (var b = 0, c, d; c = a[b]; b++) d = enyo.clone(c), d._kind = this.dbKind, delete d._id, this.records.push(d);
},
delKind: function() {
this.$.delKind.call();
},
putKind: function() {
var a = this.records[0];
for (var b in a) if (b) break;
var c = {
name: b + "Idx",
props: [ {
name: b
} ]
}, d = this.$.putKind.call({
owner: this.dbOwner,
indexes: [ c ]
});
},
putRecords: function() {
var a = this.$.put.call({
objects: this.records
});
},
putSuccess: function(a, b) {
this.doSuccess();
},
failure: function(a, b) {
this.doFailure(enyo.json.to(b));
}
}), enyo.MockDb.dataSets = [];

// tellurium/loader.js

var Tellurium = {};

Tellurium.identifier = "palm://com.palm.telluriumservice/", Tellurium.nubVersion = "2.1.8", Tellurium.config = {
enableUserEvents: !1
}, Tellurium.nubPath = "/usr/palm/frameworks/tellurium/", Tellurium.setup = function(a) {
window.Tellurium = Tellurium, Tellurium.enyo = a, Tellurium.extend = Tellurium.enyo.mixin, Tellurium.isActive = !0, Tellurium.topSceneName = "", Tellurium.metaDown = !1, Tellurium.inVerifyDialog = !1, Tellurium.delayedEvents = [], Tellurium.serviceAvailable = !0;
var b = Tellurium.enyo.xhr.request({
url: Tellurium.enyo.path.rewrite("$enyo/tellurium/tellurium_config.json"),
sync: !0
}).responseText || "{}";
Tellurium.config = Tellurium.extend(Tellurium.config, enyo.json.from(b)), Tellurium.stageType = "card", Tellurium.subscribeToCommands(), window.addEventListener("unload", Tellurium.cleanup, !1), window.addEventListener("resize", Tellurium.handleResize, !1), Tellurium.config.enableUserEvents && Tellurium.events.setup();
}, Tellurium.cleanup = function() {
console.log("enyo_tellurium [cleanup]"), window.removeEventListener("unload", Tellurium.cleanup, !1), window.removeEventListener("resize", Tellurium.handleResize, !1), Tellurium.subscribeRequest && Tellurium.subscribeRequest.destroy(), Tellurium.notifyRequest && Tellurium.notifyRequest.destroy(), Tellurium.replyReq && Tellurium.replyReq.destroy();
};

// tellurium/service.js

Tellurium.subscribeToCommands = function() {
Tellurium.stageType = "card", console.log("Tellurium : Subscribe Service...");
var a = {
subscribe: !0,
appInfo: Tellurium.fetchAppInfo(),
baseURI: window.document.baseURI,
width: window.innerWidth,
height: window.innerHeight,
name: window.name || "",
type: Tellurium.stageType,
scene: "phone",
version: Tellurium.nubVersion
};
Tellurium.subscribeRequest = new Tellurium.enyo.PalmService({
service: Tellurium.identifier,
method: "subscribeToCommands",
subscribe: !0,
responseSuccess: Tellurium.handleCommands,
responseFailure: Tellurium.reqFailed
}), Tellurium.subscribeRequest.call(a);
}, Tellurium.fetchAppInfo = function() {
return Tellurium.enyo.fetchAppInfo();
}, Tellurium.notifyEvent = function(a) {
Tellurium.serviceAvailable && (!Tellurium.stageId || Tellurium.inVerifyDialog && a.event !== "verify" ? Tellurium.delayedEvents.push(a) : (a.stageId = Tellurium.stageId, a.appId = Tellurium.appId, Tellurium.notifyRequest = Tellurium.notifyRequest || new Tellurium.enyo.PalmService({
service: Tellurium.identifier,
method: "notifyEvent"
}), Tellurium.notifyRequest.call(a)));
}, Tellurium.reqFailed = function() {
console.log("Tellurium service not available."), Tellurium.serviceAvailable = !1;
}, Tellurium.cloneArray = function(a) {
if (!a) return [];
if (a.toArray) return a.toArray();
var b = a.length || 0, c = Array(b);
while (b--) c[b] = a[b];
return c;
}, Tellurium.handleCommands = function(a) {
var b = a.response, c = b;
if (b.command) {
try {
c.result = Tellurium[b.command].apply(this, b.args), c.returnValue = !0;
} catch (d) {
c.returnValue = !1, c.error = d.message || "Unkown error", c.errorStack = d.stack;
}
Tellurium.replyToCommand(c);
} else if (b.stageId) {
Tellurium.stageId = b.stageId, Tellurium.appId = Tellurium.enyo.fetchAppId();
if (Tellurium.delayedEvents.length > 0) {
for (var e = 0; e < Tellurium.delayedEvents.length; e++) Tellurium.notifyEvent(Tellurium.delayedEvents[e]);
Tellurium.delayedEvents = [];
}
} else c.returnValue = !1, c.error = "Invalid command payload", Tellurium.replyToCommand(c);
}, Tellurium.replyToCommand = function(a) {
Tellurium.replyReq && Tellurium.replyReq.destroy(), Tellurium.replyReq = new Tellurium.enyo.PalmService({
service: Tellurium.identifier,
method: "replyToCommand",
responseFailure: function() {
console.error("[Tellurium] replyToCommand Failure");
}
}), Tellurium.replyReq.call(a);
}, Tellurium.dumpProperties = function(a, b) {
b = b || "";
for (var c in a) typeof a[c] !== "function" && console.error(b + "[" + c + "] = " + a[c]);
};

// tellurium/events.js

Tellurium.mouseTap = function(a) {
var b = {
detail: 1,
ctrlKey: !1,
altKey: !1,
shiftKey: !1,
metaKey: !1,
button: 0
};
Tellurium.mouseEvent(a, "mousedown", b), Tellurium.mouseEvent(a, "mouseup", b), Tellurium.mouseEvent(a, "click", b);
}, Tellurium.mouseEvent = function(a, b, c) {
var d = Tellurium.getMetrics(a), e = Tellurium.getElement(a), f = document.createEvent("MouseEvents");
f.initMouseEvent(b, !0, !0, window, c.detail, d.left, d.top, d.left, d.top, c.ctrlKey, c.altKey, c.shiftKey, c.metaKey, c.button, null), e.dispatchEvent(f);
}, Tellurium.fireEvent = function(a, b, c) {
var d = Tellurium.getElement(a), e = document.createEvent("HTMLEvents");
e.initEvent(b, !0, !0), d.dispatchEvent(e);
}, Tellurium.keyEvent = function(a, b, c, d, e, f, g, h) {
var i = Tellurium.getElement(a), j = document.createEvent("HTMLEvents");
j.initEvent(b, !0, !0, window), j.keyCode = c, j.charCode = j.keyCode, j.which = j.keyCode, j.shiftKey = e || !1, j.metaKey = f || !1, j.altKey = g || !1, j.ctrlKey = h || !1, j.altGraphKey = !1, j.keyIdentifier = d, j.keyLocation = 0, j.detail = 0, j.view = window, i.dispatchEvent(j);
}, Tellurium.textEvent = function(a, b) {
var c = Tellurium.getElement(a), d = document.createEvent("TextEvent");
d.initTextEvent("textInput", !0, !0, null, b), c.dispatchEvent(d);
}, Tellurium.simulatedTap = function(a) {
var b, c;
if (a === "window") b = window.innerWidth / 2, c = window.innerHeight / 2; else {
var d = Tellurium.getMetrics(a);
b = Math.round(d.left + d.width / 2), c = Math.round(d.top + d.height / 2);
}
return Tellurium.simulatedTapXY(b, c);
}, Tellurium.simulatedTapXY = function(a, b) {
window.PalmSystem.simulateMouseClick(a, b, !0), window.PalmSystem.simulateMouseClick(a, b, !1);
return !0;
}, Tellurium.mojoTap = function(a) {};

// tellurium/enyo-events.js

Tellurium.events = {
setup: function() {
this.dom.setup(), this.enyo.setup();
}
}, Tellurium.events.dom = {
types: {
keyup: "key",
keydown: "key",
keypress: "key",
mouseup: "mouse",
mousedown: "mouse",
mousehold: "mouse",
mouserelease: "mouse",
click: "mouse",
flick: "flick",
dragStart: "drag"
},
setup: function() {
enyo.dispatcher.features.push(function(a) {
var b = Tellurium.events.dom.types[a.type];
b && Tellurium.events.dom.handle(b, a);
});
},
handle: function(a, b) {
var c = "make" + enyo.cap(a) + "Payload", d = this[c];
if (d) {
var e = d.call(this, b);
e.id = b.dispatchTarget && b.dispatchTarget.id, Tellurium.notifyEvent(e);
}
},
mixinPayloadDetails: function(a, b, c) {
for (var d in c) a[d] = b[d];
return a;
},
keyDetails: {
type: !0,
keyCode: !0,
keyIdentifier: !0,
ctrlKey: !0,
altKey: !0,
shiftKey: !0,
metaKey: !0
},
makeKeyPayload: function(a) {
var b = {};
a.target & a.target.getStyle && (b.lineFeed = a.target.getStyle("-webkit-user-modify") == "read-write");
return this.mixinPayloadDetails(b, a, this.keyDetails);
},
mouseDetails: {
type: !0,
detail: !0,
screenX: !0,
screenY: !0,
pageX: !0,
pageY: !0,
clientX: !0,
clientY: !0,
ctrlKey: !0,
altKey: !0,
shiftKey: !0,
metaKey: !0,
button: !0
},
makeMousePayload: function(a) {
return this.mixinPayloadDetails({}, a, this.mouseDetails);
},
makeFlickPayload: function(a) {
payload = {
velocity: a.velocity
};
return this.mixinPayloadDetails(payload, a, this.mouseDetails);
},
makeDragPayload: function(a) {
var b = enyo.clone(a);
delete b.target;
return b;
}
}, Tellurium.events.enyo = {
types: {
onSelectView: enyo.Pane
},
setup: function() {
for (var a in this.types) this.setupHandler(this.types[a].prototype, a);
},
setupHandler: function(a, b) {
var c = b.slice(2), d = "make" + c + "Payload";
fn = this[d];
var e = "do" + enyo.cap(c), f = a[e];
fn && this.wrapEvent(a, e, f, b, fn);
},
wrapEvent: function(a, b, c, d, e) {
a[b] = function() {
var a = e.apply(this, arguments);
a.type = d, Tellurium.notifyEvent(a);
return c.apply(this, arguments);
};
},
makeSelectViewPayload: function(a, b) {
return {
pane: this.id,
view: a.id,
lastView: b && b.id
};
}
};

// tellurium/locator.js

Tellurium.getTopElement = function() {
return document;
}, Tellurium.getElement = function(a) {
var b = "css", c = a, d = Tellurium.getTopElement();
if (a === "document") return document;
if (a === "window") return window;
if (typeof a !== "string") return a;
var e = a.match(/^([A-Za-z]+)=(.+)/);
e && (b = e[1].toLowerCase(), c = e[2]), b = b.substr(0, 1).toUpperCase() + b.substr(1);
return Tellurium["getElementBy" + b].call(this, c, d);
}, Tellurium.getElementById = function(a, b) {
var c = b.querySelector("#" + a);
return c;
}, Tellurium.getElementByName = function(a, b) {
var c = b.querySelector('[name="' + a + '"');
return c;
}, Tellurium.getElementByDom = function(locator) {
return eval(locator);
}, Tellurium.getElementByXpath = function(a, b) {
var c = document.evaluate(a, b, null, XPathResult.ANY_TYPE, null);
return c.iterateNext();
}, Tellurium.getElementByCss = function(a, b) {
var c = b.querySelector(a);
return c;
}, Tellurium.getElementByClass = function(a, b) {
var c = b.querySelector('[class~="' + a + ']"');
return c;
}, Tellurium._isXPathUnique = function(a, b) {
var c = 0, d = document.evaluate(a, b, null, XPathResult.ANY_TYPE, null);
while (d.iterateNext()) c++;
return c === 1 ? !0 : !1;
}, Tellurium.getElementIndex = function(a) {
var b = a.parentNode.childNodes, c = 0, d = 0;
for (var e = 0; e < b.length; e++) {
var f = b[e];
f.nodeName === a.nodeName && c++, f === a && (d = c);
}
return c > 1 ? d : 0;
}, Tellurium.getElementXPath = function(a, b) {
var c = "", d = !1, e = Tellurium.getTopElement(), f = [ "id", "style", "x-mojo-tap-highlight", "width", "height" ];
b = b === undefined ? !0 : b;
for (;;) {
var g = 0, h = [];
if (a.nodeName === "#document") return c;
if (a.nodeName !== "#text") {
if (a.id && !a.id.match("palm_anon")) {
h.push("@id='" + a.id + "'");
var i = "//" + a.nodeName.toLowerCase() + "[@id='" + a.id + "']" + c;
if (Tellurium._isXPathUnique(i, e)) return i;
}
for (var j = 0; j < a.attributes.length; j++) {
var k = a.attributes[j].name, l = a.attributes[j].value;
f.indexOf(k) === -1 && k.indexOf("x-palm-") !== 0 && l.indexOf("palm_anon_") !== 0 && h.push("contains(@" + k + ",'" + l + "')");
}
if (b && a.childNodes.length === 1 && a.childNodes[0].nodeName === "#text") {
var m = a.childNodes[0].textContent.trim();
m.length > 0 && h.push("contains(child::text(),'" + m + "')");
}
g = Tellurium.getElementIndex(a), d && g !== 0 && h.push(h.length > 0 ? "position()=" + g : "" + g);
var n = a.nodeName.toLowerCase();
if (h.length > 0) {
n += "[";
for (var o = 0; o < h.length - 1; o++) n += h[o] + " and ";
n += h[h.length - 1] + "]";
}
!Tellurium._isXPathUnique("//" + n + c, e), h.length === 0 && g !== 0 && (n += "[" + g + "]"), c = "/" + n + c;
}
a = a.parentNode;
if (!a || a === e) break;
}
console.error("XPATH IS NOT UNIQUE: /" + c);
return "/" + c;
}, Tellurium.highlightElement = function(a, b) {
if (Tellurium.highlight) {
var c = Tellurium.getElement(Tellurium.highlight.locator);
c && (c.style.background = Tellurium.highlight.oldBackground, c.style.border = Tellurium.highlight.oldBorder), Tellurium.highlight = undefined;
}
if (typeof a !== "string" || a.length !== 0) if (a) {
var c = Tellurium.getElement(a), b = b || "#FF3";
Tellurium.highlight = {
locator: a,
oldBackground: c.style.background,
oldBorder: c.style.border
}, c.style.backgroundColor = b, c.style.border = "2px solid red", c.style.backgroundImage = "none";
}
};

// tellurium/dom.js

function createOffset(a, b) {
var c = [ a, b ];
c.left = a, c.top = b;
return c;
}

Tellurium.getDomProperty = function(a, b) {
var c, d = document.evaluate(a, document, null, XPathResult.ANY_TYPE, null);
while (c = d.iterateNext()) return c[b];
return -1;
}, Tellurium.clickDom = function(a) {
var b, c = document.evaluate(a, document, null, XPathResult.ANY_TYPE, null);
b = c.iterateNext();
if (b == null) {
console.log("Invalid xpath");
return !1;
}
var d, e, f = {
detail: 1,
ctrlKey: !1,
altKey: !1,
shiftKey: !1,
metaKey: !1,
button: 0
}, g = document.createEvent("MouseEvents");
d = b.id, e = Tellurium.getMetrics("#" + d), g.initMouseEvent("click", !0, !0, window, f.detail, e.left, e.top, e.left, e.top, f.ctrlKey, f.altKey, f.shiftKey, f.metaKey, f.button, null), b.dispatchEvent(g);
return !0;
}, Tellurium.queryElementValue = function(locator, arg) {
var element = eval("document.querySelector(locator)." + arg);
return element;
}, Tellurium.queryElement = function(a) {
var b = document.querySelector(a);
return b.innerHTML;
}, Tellurium.setValue = function(a, b) {
var c = document.querySelector(a);
c.innerHTML = b;
return !0;
}, Tellurium.setElementValue = function(locator, arg, value) {
var element = eval("document.querySelector(locator)." + arg);
element = value;
return !0;
}, Tellurium.getDimensions = function(a) {
if (a.style.display != "none") return {
width: a.offsetWidth,
height: a.offsetHeight
};
var b = a.style, c = {
visibility: b.visibility,
position: b.position,
display: b.display
};
b.visibility = "hidden", b.position = "absolute", b.display = "block";
var d = {
width: a.clientWidth,
height: a.clientHeight
};
Tellurium.enyo.mixin(b, c);
return d;
}, Tellurium.viewportOffset = function(a) {
var b = a, c = 0, d = 0, e, f = a.ownerDocument;
while (b) {
c += b.offsetTop, d += b.offsetLeft, b !== a && (c += b.clientTop, d += b.clientLeft);
if (b.style.position === "fixed") {
e = b;
break;
}
b = b.offsetParent;
}
b = a;
while (b && b !== f) {
d -= b.scrollLeft, c -= b.scrollTop;
if (b === e) break;
b = b.parentNode;
}
return createOffset(d, c);
}, Tellurium.runScript = function(script) {
var result = eval(script);
return result || !0;
}, Tellurium.focus = function(a) {
var b = Tellurium.getElement(a);
b.focus();
}, Tellurium.blur = function(a) {
var b = Tellurium.getElement(a);
b.blur();
}, Tellurium.getProperty = function(a, b) {
var c = Tellurium.getElement(a);
return c[b];
}, Tellurium.setProperty = function(a, b, c) {
var d = Tellurium.getElement(a);
d[b] = c;
}, Tellurium.getStyleProperty = function(a, b) {
var c = Tellurium.getElement(a), d = window.getComputedStyle(c, null);
return d[b];
}, Tellurium.setStyleProperty = function(a, b, c) {
var d = Tellurium.getElement(a);
d.style[b] = c;
}, Tellurium.isElementPresent = function(a) {
var b = Tellurium.getElement(a);
return b ? !0 : !1;
}, Tellurium.isElementVisible = function(a) {
var b = Tellurium.getElement(a);
return b.style.display != "none";
}, Tellurium.revealElement = function(a) {
var b = Tellurium.getElement(a);
}, Tellurium.getWidth = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.getDimensions(b).width;
}, Tellurium.getHeight = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.getDimensions(b).height;
}, Tellurium.getViewportOffsetTop = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.viewportOffset(b).top;
}, Tellurium.getViewportOffsetLeft = function(a) {
var b = Tellurium.getElement(a);
return Tellurium.viewportOffset(b).left;
}, Tellurium.getMetrics = function(a) {
var b = Tellurium.getElement(a), c = Tellurium.viewportOffset(b), d = Tellurium.getDimensions(b), e = {
width: d.width,
height: d.height,
left: c.left,
top: c.top
};
return e;
}, Tellurium.getDayViewEventMetrics = function(a) {
var b = Tellurium.calendarDayViewInspector.getBySubject({
bounds: a
});
{
if (b) {
var c = {
width: b.width,
height: b.height,
left: b.left,
top: b.top
};
return c;
}
console.error("\n\n\tNo event was found with subject [ %s ].\n\n", a);
}
};

// tellurium/cards.js

Tellurium.getViewNameByPaneId = function(paneId) {
var viewName = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + paneId + ".getViewName()");
return viewName;
}, Tellurium.handleResize = function() {
var a = {};
a.type = "windowResize", a.width = window.innerWidth, a.height = window.innerHeight, Tellurium.notifyEvent(a);
}, Tellurium.defaultStageActivated = Mojo.stageActivated, Mojo.stageActivated = function() {
Tellurium.defaultStageActivated();
var a = {};
a.type = "windowActivate", a.stageId = Tellurium.stageId, Tellurium.notifyEvent(a), Tellurium.isActive = !0;
}, Tellurium.defaultStageDeactivated = Mojo.stageDeactivated, Mojo.stageDeactivated = function(a) {
Tellurium.defaultStageDeactivated();
var b = {};
b.type = "windowDeactivate", b.stageId = Tellurium.stageId, Tellurium.notifyEvent(b), Tellurium.isActive = !1, Tellurium.inVerifyDialog = !1, Tellurium.metaDown = !1;
}, Tellurium.closeStage = function() {
console.log("ENYO EVENT : closeStage  "), window.close();
}, Tellurium.activateStage = function() {
Tellurium.enyo.windows.activateWindow(window);
}, Tellurium.deactivateStage = function() {
Tellurium.enyo.windows.deactivateWindow(window);
}, Tellurium.isStageActive = function() {
return Tellurium.enyo.isCardActive;
}, Tellurium.getStageYOffset = function() {
var a = 0;
switch (Tellurium.stageType) {
case "card":
case "childcard":
a = screen.height !== window.innerHeight ? 28 : 0;
break;
case "dashboard":
a = Tellurium.isActive ? screen.height - window.innerHeight : screen.height - 28;
break;
case "banneralert":
case "activebanner":
a = screen.height - 28;
break;
case "popupalert":
a = screen.height - window.innerHeight;
}
return a;
}, Tellurium.back = function() {
Tellurium.keyEvent(document, "keydown", 27, 27, !1, !1, !1, !1);
}, Tellurium.getHtmlSource = function() {
return Tellurium.getTopElement().getElementsByTagName("html")[0].innerHTML;
};

// tellurium/widgets.js

Tellurium.toggleMenu = function(menu) {
return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + menu + ".toggleOpen()");
}, Tellurium.menuShow = function(menu) {
return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + menu + ".show()");
}, Tellurium.menuHide = function(menu) {
return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + menu + ".hide()");
}, Tellurium.isMenuVisible = function(a) {
var b = Tellurium._getTopScene();
return a === "appMenu" ? b._menu.assistant.appMenuPopup ? !0 : !1 : b.getMenuVisible(Tellurium.mojo.Menu[a]) ? !0 : !1;
}, Tellurium.toggleMenuVisible = function(a) {
var b = Tellurium._getTopScene();
a === "appMenu" ? b._menu.assistant.toggleAppMenu() : b.toggleMenuVisible(Tellurium.mojo.Menu[a]);
}, Tellurium.getMenuCommands = function(a) {
var b = [], c = [], d = Tellurium._getTopScene();
if (a === "appMenu") {
if (Tellurium.isMenuVisible(a)) {
var e = Tellurium.cloneArray(d._menu.assistant.appMenuPopup.querySelectorAll("[x-mojo-menu-cmd]"));
e.forEach(function(a) {
var c = a.getAttribute("x-mojo-menu-cmd");
c !== "" && b.push(c);
});
return b;
}
} else a === "viewMenu" ? c = Tellurium.cloneArray(d._menu.assistant.viewModel.items) : a === "commandMenu" && (c = Tellurium.cloneArray(d._menu.assistant.commandModel.items));
var f = function(a) {
a.forEach(function(a) {
a.items ? f(a.items) : a.command && b.push(a.command);
});
};
f(c);
return b;
}, Tellurium.sendMenuCommand = function(a) {
var b = Tellurium.Event.make(Tellurium.Event.command, {
command: a
});
Mojo.Controller.stageController.sendEventToCommanders(b);
}, Tellurium.getIndexFromList = function(a, b) {
var c = document.querySelectorAll(a), d;
for (i = 0; i < c.length; i++) {
d = c[i].innerHTML;
if (d.indexOf(b) != -1) return i + 1;
}
return -1;
}, Tellurium.getListItems = function(a, b, c) {
var d = Tellurium.getElement(a);
if (d.getAttribute("x-mojo-element") === "FilterList" || d.getAttribute("x-mojo-element") === "IndexedFilterList") d = d.mojo.getList();
if (d.getAttribute("x-mojo-element") === "IndexedList") return d.mojo.getItems(b, c);
throw d.getAttribute("x-mojo-element") === "List" ? {
message: "Not yet implemented!"
} : {
message: "Not a list!"
};
}, Tellurium.getListLength = function(a) {
var b = Tellurium.getElement(a);
if (b.getAttribute("x-mojo-element") === "FilterList" || b.getAttribute("x-mojo-element") === "IndexedFilterList") b = b.mojo.getList();
if (b.getAttribute("x-mojo-element") === "IndexedList") return b.mojo.getLength();
throw b.getAttribute("x-mojo-element") === "List" ? {
message: "Not yet implemented!"
} : {
message: "Not a list!"
};
}, Tellurium.getNodeCount = function(a) {
var b, c = 0, d = document.evaluate(a, document, null, XPathResult.ANY_TYPE, null);
while (b = d.iterateNext()) c++;
return c;
}, Tellurium.revealListItem = function(a) {
var b = 200, c = Tellurium.getMetrics(a), d = Tellurium._getTopScene().getSceneScroller();
d.mojo.scrollTo(undefined, d.mojo.getState().top - (-c.top + b));
}, Tellurium.getListItemJsonObject = function(a) {
var b = Tellurium.getElement("xpath=//div[contains(@x-mojo-element,'List')]"), c = Tellurium.getElement(a);
return b.mojo.getModelFromNode(c);
}, Tellurium.getListItemMetrics = function(a, b) {
var c = Tellurium.getElement(a);
if (c.getAttribute("x-mojo-element") === "FilterList" || c.getAttribute("x-mojo-element") === "IndexedFilterList") c = c.mojo.getList();
if (c.getAttribute("x-mojo-element") === "IndexedList") c = c.mojo.getNodeByIndex(b); else throw c.getAttribute("x-mojo-element") === "List" ? {
message: "Not yet implemented!"
} : {
message: "Not a list!"
};
return Tellurium.getMetrics(c);
}, Tellurium.textFieldGetValue = function(a) {
var b = Tellurium.getElement(a);
return b.mojo.getValue();
}, Tellurium.textFieldSetValue = function(a, b) {
var c = Tellurium.getElement(a);
c.mojo.setValue ? c.mojo.setValue(b) : c.mojo.setText(b);
}, Tellurium.textFieldGetCursorPosition = function(a) {
var b = Tellurium.getElement(a);
return b.mojo.getCursorPosition();
}, Tellurium.textFieldSetCursorPosition = function(a, b, c) {
var d = Tellurium.getElement(a);
d.mojo.setCursorPosition(b, c);
};

// tellurium/startup.js

enyo.addOnStart(function() {
window.PalmSystem && window.addEventListener("load", function() {
Tellurium.setup(window.enyo), console.log("Tellurium loading...");
}, !1);
});

// this sheet load command specially inserted by builder tool:
if(!enyo.isBuiltin){enyo.sheet(enyo.path.rewrite("$enyo/enyo-build.css"));}

// themes/Nouveau/CommandMenu.js

enyo.kind({
name: "enyo.nouveau.CommandMenu",
kind: enyo.CommandMenu,
className: "enyo-nouveau enyo-command-menu",
defaultKind: "nouveau.MenuButton"
});

// themes/Nouveau/MenuButton.js

enyo.kind({
name: "enyo.nouveau.MenuButton",
kind: enyo.MenuButton,
className: "enyo-nouveau enyo-button enyo-menu-button-shape"
});

// themes/Nouveau/SwipeableItem.js

enyo.kind({
name: "enyo.nouveau.SwipeableItem",
kind: enyo.SwipeableItem,
className: "enyo-nouveau enyo-item"
});

// themes/Nouveau/PageHeader.js

enyo.kind({
name: "enyo.nouveau.PageHeader",
kind: enyo.PageHeader,
className: "enyo-page-header enyo-nouveau"
});

