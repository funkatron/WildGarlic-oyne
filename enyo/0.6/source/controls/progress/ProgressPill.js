/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.ProgressBar">ProgressBar</a>
styled to show a pill that corresponds to a progress value. It can
potentially have additional controls inside the pill.

	{kind: "ProgressPill"}
	{kind: "ProgressPill", content: "Some text"}
	{kind: "ProgressPill", components: [
		{content: "Page loading..."},
		{control: "CustomButton", caption: "Cancel"}
	]}

See <a href="#enyo.Progress">Progress</a> for usage examples.
*/
enyo.kind({
	name: "enyo.ProgressPill",
	kind: enyo.ProgressBar,
	className: "enyo-progress-pill",
	layoutKind: "VFlexLayout",
	create: function() {
		this.inherited(arguments);
		this.$.bar.setClassName("enyo-progress-pill-inner");
		this.$.client.setLayoutKind("HFlexLayout");
		this.$.client.addClass("enyo-progress-pill-client");
		this.$.client.flex = 1;
		this.$.client.align = "center";
	}
});
