/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.MiscFilePicker",
	kind: enyo.VFlexBox,
	published: {
		file: {}
	},
	events: {
		onFileSelect: ""
	},
	components: [
		{name: "fileService", kind: "DbService", method:"find", dbKind: "com.palm.media.misc.file:1", onSuccess: "gotFiles"},
		{kind: "Scroller", flex:1, components: [
			{name: "list",
				kind: "VirtualRepeater",
				onGetItem: "getListItem",
				maxRow: 0,
				components: [{
					name: "item",
					kind: "MiscFileItem",
					onclick: "fileClick"
				}]
			},
			{name: "empty", kind: "VFlexBox", className: "enyo-misc-files-list-empty", components: [
				{content: $L("Your document list is empty.")}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.files = [];
		this.getFiles();
	},

	getFiles: function() {
		var params = {};
		params.query = {
			where: [],
			orderBy: "name",
			desc: false
		};
		this.$.fileService.call({params: params});
	},
	gotFiles: function(inSender, inResponse) {
		this.files = (inResponse && inResponse.results) || [];
		this.$.list.render();
	},
	getListItem: function(inSender, inIndex) {
		if (inIndex < this.files.length) {
			var r = this.files[inIndex];
			this.$.item.setFile(r);
			return true;
		}
	},
	fileClick: function(inSender) {
		var index = inSender.manager.fetchRowIndex();
		var file = this.files[index];
		file.fullPath = file.path;
		this.doFileSelect(file);
	}
});
