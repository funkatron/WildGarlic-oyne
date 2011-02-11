/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.VideoAlbumList",
	kind: enyo.VFlexBox,
	events: {
		onAlbumClick: ""
	},
	chrome: [
		{name: "albumService", kind: "DbService", method:"find", dbKind: "com.palm.media.video.file:1", onSuccess: "gotAlbums", onFailure: "getAlbumsFailure"},
		{kind: "Scroller", flex:1, components: [
			{name: "list", kind: "VirtualRepeater", onGetItem: "getListItem", maxRow: 0, components: [
				{name: "item", kind: "Item", layoutKind: "HFlexLayout", onclick: "albumClick", components: [
					{name: "albumName", flex: 1, content: $L("Video Roll"), className: "enyo-video-album-list-album-name"},
					{name: "albumThumbnails", kind: "VideoAlbumThumbnails"}
				]}
			]},
			{name: "empty", kind: "VFlexBox", className: "enyo-video-album-list-empty", components: [
				{content: "Your video library is empty."}
			]},
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.albums = [];
	},
	getCapturedVideosAlbum: function() {
		var params = {};
		params.query = {
			where: [{prop: "capturedOnDevice", op: "=", val:true}],
			limit: 3
		};
		params.count = true;
		this.$.albumService.call({params: params});
	},
	gotAlbums: function(inSender, inResponse) {
		this.albums = (inResponse && inResponse.results) || [];
		this.$.list.setShowing(this.albums.length);
		this.$.empty.setShowing(!this.albums.length)
		this.$.list.render();
	},
	getAlbumsFailure: function(inSender, inResponse) {
		console.log("getAlbumsFailure: " + inResponse.errorText);
	},
	getListItem: function(inSender, inIndex) {
		if (inIndex == 0) {
			this.$.albumThumbnails.setAlbum(this.albums);
			return true;
		}
	},
	albumClick: function(inSender) {
		var index = inSender.manager.fetchRowIndex();
		this.doAlbumClick("captured");
	}
});
