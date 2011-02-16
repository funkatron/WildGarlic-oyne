/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A container for a group of buttons designed to go inside a
<a href="#enyo.CommandMenu">CommandMenu</a>. The buttons are laid out
horizontally.

By default, the components in a menu toolbar are instances of
<a href="#enyo.MenuToolButton">MenuToolButton</a>.

	{kind: "CommandMenu", components: [
		{kind: "MenuToolbar", components: [
			{icon: "images/menu-icon-back.png", onclick: "goBack"},
			{icon: "images/menu-icon-forward.png", onclick: "goForward"},
			{icon: "images/menu-icon-refresh.png", onclick: "refresh"}
		]}
	]}
*/
enyo.kind({
	name: "enyo.MenuToolbar",
	kind: enyo.OrderedContainer,
	className: "enyo-menu-toolbar",
	defaultKind: "MenuToolButton"
});
