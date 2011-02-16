/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A container for items presented at the bottom of the screen. By default, the
items are instances of <a href="#enyo.MenuButton">MenuButton</a>.

Example command menu with three buttons equally spaced apart:

	{kind: "CommandMenu", components: [
		{caption: "foo"},
		{kind: "Spacer"},
		{caption: "bar"},
		{kind: "Spacer"},
		{caption: "baz"}
	]}

Other controls to put in a CommandMenu are <a href="#enyo.MenuRadioGroup">MenuRadioGroup</a> and <a href="#enyo.MenuToolbar">MenuToolbar</a>.
*/
enyo.kind({
	name: "enyo.CommandMenu",
	kind: enyo.Footer
});
