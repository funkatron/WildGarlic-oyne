/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.RingtonePicker",
	kind: enyo.VFlexBox,
	published: {
		ringtone: null
	},
	events: {
		onRingtoneChange: ""
	},
	chrome: [
		{name: "sound", kind: "enyo.Sound"},
		{name: "ringtoneService", kind: "DbService", method: "find", dbKind: "com.palm.media.audio.file:1", onSuccess: "gotRingtones"},
		{kind: "Pane", name: "pane", flex: 1, components: [
			{kind: "VFlexBox", flex: 1, components: [
				{name: "list", kind: "VirtualList", flex: 1, onSetupRow: "listSetupRow", components: [{
						name: "item",
						kind: "RingtoneItem",
						onclick: "ringtoneClick"
					}]
				},
				{kind: "CommandMenu", components: [{
					name: "image",
					icon: enyo.path.rewrite("$enyo-lib/systemui/images/menu-icon-add-ringtone.png"),
					onclick: "showAudioPicker"
				}, {kind:"Spacer"}]
			}]
			}, 
			{
				kind: "AudioPicker", onAudioFileSelect: "processAudioFileSelect",
			}]
		}
	],
	create: function() {
		this.inherited(arguments);
		this.ringtones = [];
	},
	rendered: function() {
		this.inherited(arguments);
		this.getRingtones();
	},
	renderList: function() {
		this.$.list.refresh();
	},
	getRingtones: function() {
		var params = {
			query: {
				where: [{"prop":"isRingtone","op":"=","val":true}],
				orderBy: "title",
				desc: false
			}
		}
		this.$.ringtoneService.call({params: params});
	},
	gotRingtones: function(inSender, inResponse) {
		this.ringtones = (inResponse && inResponse.results) || [];
		this.renderList();
	},
	listSetupRow: function(inSender, inRow) {
		var r = this.ringtones[inRow];
		if (r) {
			this.$.item.setRingtoneFile(r);
			if(this.isCurrentRingtone(r.path)) {
				this.$.item.setChecked(true);
				this.selected = inRow;
			}
			else {
				this.$.item.setChecked(false);
			}
			return true;
		}
	},
	
	isCurrentRingtone: function(path) {
		return (this.ringtone && this.ringtone.fullPath.indexOf(path) >= 0);
	},
	
	ringtoneClick: function(inSender, inEvent) {
		//TODO: Play the ringtone if it's clicked on the Play preview button. 
		
		if(this.isCurrentRingtone(this.ringtones[inEvent.rowIndex].path))
			return;
		this.setSelected(inEvent.rowIndex);
		
		var curSelected = {};
		curSelected.fullPath = this.ringtones[this.selected].path;
		curSelected.name = this.ringtones[this.selected].title;
		this.doRingtoneChange(curSelected);
	},
	setSelected: function(inIndex) {
		this.lastSelected = this.selected;
		this.selected = (inIndex != this.selected) ? inIndex : null;
		if (this.lastSelected >= 0) {
			this.$.list.controlsToRow(this.lastSelected);
			this.$.item.setChecked(false);
		}
		if (this.selected != null) {
			this.$.list.controlsToRow(this.selected);
			this.$.item.setChecked(true);
		}
	},
	
	showAudioPicker: function() {
		this.$.pane.selectViewByIndex(1);
	},
});
