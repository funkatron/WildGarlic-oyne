/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.PickerGroup">PickerGroup</a> that offers selection of the hour and minutes, with an optional AM/PM selector.  The TimePicker uses the JavaScript Date object to represent the chosen time.

	{kind: "TimePicker", label: "start time", onChange: "pickerPick"}

The selected time can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		var startTime = this.$.timePicker.getValue();
	}
	
To enable 24-hour mode, do this:

	{kind: "TimePicker", label: "start time", is24HrMode: true, onChange: "pickerPick"}
*/
enyo.kind({
	name: "enyo.TimePicker",
	kind: enyo.PickerGroup,
	published: {
		label: "time",
		value: null,
		minuteInterval: 1,
		is24HrMode: false
	},
	components: [
		{name: "hour"},
		{name: "minute"},
		{name: "ampm", value: "AM", items: ["AM", "PM"]}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.value = this.value || new Date();
		this.minuteIntervalChanged();
		this.is24HrModeChanged();
	},
	minuteIntervalChanged: function() {
		var items = [];
		for (var i=0; i<60; i+=this.minuteInterval) {
			items.push(i < 10 ? ("0"+i) : String(i));
		}
		this.$.minute.setItems(items);
	},
	is24HrModeChanged: function() {
		this.$.ampm.setShowing(!this.is24HrMode);
		this.setupHour();
		this.valueChanged();
	},
	setupHour: function() {
		var items = [];
		for (var i=(this.is24HrMode ? 0 : 1); i<=(this.is24HrMode ? 23 : 12); i++) {
			items.push(String(i));
		}
		this.$.hour.setItems(items);
	},
	valueChanged: function() {
		var v = this.value;
		var h = v.getHours();
		var m = Math.floor(v.getMinutes()/this.minuteInterval) * this.minuteInterval;
		var ampm = h < 12 ? "AM" : "PM";
		this.$.hour.setValue(this.is24HrMode ? h : h%12 || 12);
		this.$.minute.setValue(m < 10 ? ("0"+m) : String(m));
		this.$.ampm.setValue(ampm);
	},
	pickerChange: function() {
		var h = parseInt(this.$.hour.getValue());
		var m = parseInt(this.$.minute.getValue(), 10);
		var ap = this.$.ampm.getValue();
		h = (ap == "AM" || this.is24HrMode) ? h : h+12;
		this.value.setHours(h);
		this.value.setMinutes(m);
		this.doChange(this.value);
	}
});