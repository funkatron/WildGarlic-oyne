/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.gemstone.Header",
	kind: enyo.Header,
	className: "enyo-gemstone enyo-header",
	chrome: [
		{name: "client", flex: 1, align: "center", className: "enyo-gemstone enyo-header-inner"}
	]
});

enyo.gemstone.PageHeader = enyo.gemstone.Header;