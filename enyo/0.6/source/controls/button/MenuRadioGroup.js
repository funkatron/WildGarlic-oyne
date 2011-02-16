/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A group of
<a href="#enyo.MenuRadioButton">MenuRadioButton</a> objects with menu styling.

	{kind: "MenuRadioGroup", components: [
		{icon: "images/foo.png"},
		{label: "bar"},
		{icon: "images/baz.png"}
	]}

Also see <a href="#enyo.RadioGroup">RadioGroup</a> for more examples.
*/
enyo.kind({
	name: "enyo.MenuRadioGroup",
	kind: enyo.RadioGroup,
	className: "enyo-menu-radiogroup",
	defaultKind: "MenuRadioButton"
});
