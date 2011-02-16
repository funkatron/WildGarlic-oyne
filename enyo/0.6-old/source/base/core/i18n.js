/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
$L = function(inText) {
	var v = $L.map[inText];
	if (v === undefined) {
		v = $L.map[inText] = inText;
	}
	return v;
}
//* @protected
$L.map = {};

//* @public
enyo.getLocale = function(inDefaultLocale) {
	var localeNode, locale;
	if (window.PalmSystem) {
		locale = PalmSystem.locale;
	} else {
		var localeNode = document.querySelector('meta[http-equiv="content-language"]');
		locale = (localeNode && localeNode.content) || enyo.args.locale;
	}
	if (!locale) {
		locale = inDefaultLocale || "en_us";
	}
	locale = locale.toLowerCase();
	if (!localeNode) {
		document.write('<meta http-equiv="content-language" content="' + locale +'" />');
	}
	var lang = locale.slice(0, 2);
	var region = locale.length == 5 ? locale.slice(-2) : null;
	enyo.locale = {name: locale, lang: lang, region: region};
	return enyo.locale;
}

/*
enyo.loadLocale = function(inLocale) {
		var l = inLocale;
		console.log("../resources/" + l.lang + "/" + l.region + "/strings.js");
		enyo.depends({nobuild: [
			"resources/" + l.lang + "/strings.js",
			"resources/" + l.lang + "/" + l.region + "/strings.js",
			// load a depends package
			//"resources/" + l.lang + "/" + l.lang
			//"resources/" + l.lang + "/" + l.region + "/" + l.name
		]});
}

enyo.loadLocale(enyo.getLocale());
*/