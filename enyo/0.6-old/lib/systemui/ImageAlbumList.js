/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ImageAlbumList",
	kind: enyo.VFlexBox,
	events: {
		onAlbumClick: ""
	},
	chrome: [
		{name: "albumService", kind: "DbService", method: "find", dbKind: "com.palm.media.image.album:1", onSuccess: "gotAlbums", onFailure: "getAlbumsFailure"},
		{kind: "Scroller", flex: 1, components: [
			{name: "list", kind: "VirtualRepeater", onGetItem: "getListItem", maxRow: 0, components: [
				{kind: "Item", layoutKind: "HFlexLayout", onclick: "albumClick", components: [
					{name: "albumName", flex: 1, className: "enyo-image-album-list-album-name"},
					{name: "albumThumbnails", kind: "ImageAlbumThumbnails"}
				]}
			]},
			{name: "empty", kind: "VFlexBox", className: "enyo-image-album-list-empty", components: [
				{content: "Your photo library is empty."}
			]},
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.albums = [];
	},
	getAlbums: function() {
		var params = {
			query: {
				orderBy: "sortKey",
				desc: false
			}
		};
		this.$.albumService.call({params: params});
	},
	gotAlbums: function(inSender, inResponse) {
		this.albums = (inResponse && inResponse.results) || [];
		this.$.list.setShowing(this.albums.length);
		this.$.empty.setShowing(!this.albums.length)
		this.$.list.render();
	},
	getAlbumsFailure: function(inSender, inResponse) {
		console.log("getAlbumsFailure: " + (inResponse && inResponse.errorText));
	},
	getListItem: function(inSender, inIndex) {
		if (inIndex < this.albums.length) {
			var album = this.albums[inIndex];
			this.$.albumName.content = album.name;
			this.$.albumThumbnails.setAlbum(album);
			this.$.item.domStyles["border-top"] = inIndex == 0 ? "none" : null;
			this.$.item.domStyles["border-bottom"] = inIndex == this.albums.length-1 ? "none" : null;
			return true;
		}
	},
	albumClick: function(inSender) {
		var index = inSender.manager.fetchRowIndex();
		this.doAlbumClick(this.albums[index]);
	}
});
