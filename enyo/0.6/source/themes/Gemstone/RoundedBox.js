/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.gemstone.RoundedBox",
	kind: "VFlexBox",
	className: "enyo-gemstone enyo-rounded-box",
	chrome: [
		{name: "client", kind: "HFlexBox", align: "center", className: "enyo-gemstone enyo-rounded-box-inner"}
	]
});