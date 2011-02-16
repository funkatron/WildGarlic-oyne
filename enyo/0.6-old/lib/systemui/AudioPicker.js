/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AudioPicker",
	kind: enyo.VFlexBox,
	published: {
		file: {}
	},
	events: {
		onAudioFileSelect: ""
	},
	components: [
		{name: "audioService", kind: "DbService", method:"find", dbKind: "com.palm.media.audio.file:1", onSuccess: "gotAudioFiles"},
		{kind: "Scroller", flex:1, components: [
			{	name: "list",
				kind: "VirtualRepeater",
				onGetItem: "getListItem",
				maxRow: 0,
				components: [{
					name: "item",
					kind: "AudioItem",
					onclick: "fileClick"
				}]
			},
			{	name: "empty", kind: "VFlexBox", className: "enyo-audio-list-empty", components: [
				{content: $L("Your music library is empty.")}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.files = [];
		this.getAudioFiles();
	},

	getAudioFiles: function() {
		var params = {};
		params.query =  {
			where: [{ prop: "isRingtone",	op: "=", val: false }],
			orderBy: "title",
			desc: false
		};
		this.$.audioService.call({params: params});
	},
	
	gotAudioFiles: function(inSender, inResponse) {
		this.files = (inResponse && inResponse.results) || [];
		this.$.list.setShowing(this.files.length);
		this.$.empty.setShowing(!this.files.length)
		this.$.list.render();
	},
	
	getListItem: function(inSender, inIndex) {
		if (inIndex < this.files.length) {
			var r = this.files[inIndex];
			this.$.item.setAudioFile(r);
			return true;
		}
	},
	
	fileClick: function(inSender) {
		var index = inSender.manager.fetchRowIndex();
		var file = this.files[index];
		file.fullPath = file.path;
		this.doAudioFileSelect(file);
	},

});
