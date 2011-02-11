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