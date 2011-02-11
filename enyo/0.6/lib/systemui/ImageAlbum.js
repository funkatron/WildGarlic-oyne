/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ImageAlbum",
	kind: enyo.VFlexBox,
	published: {
		albumId: ""
	},
	events: {
		onImageClick: ""
	},
	chrome: [
		{name: "imageService", kind: "DbService", method: "find", dbKind: "com.palm.media.image.file:1", onSuccess: "gotImages"},
		{name: "list", kind: "VirtualList", flex: 1, className: "enyo-image-album", onSetupRow: "listSetupRow", components: [
			{name: "item", className: "enyo-image-album-item", onclick: "imageClick", components: [
				{kind: "CustomButton", className: "enyo-image-album-item-overlay"},
				{kind: "Image", className: "enyo-image-album-item-image"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.images = [];
	},
	albumIdChanged: function() {
		this.getImages();
		this.renderList();
	},
	renderList: function() {
		this.log();
		this.$.list.refresh();
	},
	getImages: function() {
		var params = {
			query: {
				where: [{"prop":"albumId","op":"=","val":this.albumId}],
				orderBy: "createdTime",
				desc: true
			}
		};
		this.$.imageService.call({params: params});
	},
	gotImages: function(inSender, inResponse) {
		this.images = (inResponse && inResponse.results) || [];
		this.renderList();
	},
	listSetupRow: function(inSender, inRow) {
		this.log();
		var img = this.images[inRow];
		if (img) {
			this.$.image.domAttributes.src = img.path;
			return true;
		}
	},
	imageClick: function(inSender) {
		var index = inSender.manager.fetchRowIndex();
		this.doImageClick(this.images, index);
	}
});
