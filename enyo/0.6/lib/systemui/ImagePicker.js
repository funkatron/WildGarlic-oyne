/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ImagePicker",
	kind: enyo.VFlexBox,
	events: {
		onPhotoSelect: ""
	},
	chrome: [
		{name: "pane", kind: "Pane", flex: 1, components: [
			{name: "albumList", kind: "ImageAlbumList", onAlbumClick: "albumClick"},
			{name: "imageAlbum", kind: "ImageAlbum", onImageClick: "doImageClick"},
			{name: "imageFullView", kind: "ImageFullView", onImageSelect: "processImageSelect"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.showAlbums();
	},
	showAlbums: function() {
		this.$.albumList.getAlbums();
		if (this.$.pane.getViewIndex() != 0) {
			this.$.pane.selectViewByIndex(0);
		}
	},
	albumClick: function(inSender, inAlbum) {
		this.$.imageAlbum.setAlbumId(inAlbum._id);
		this.$.pane.selectViewByIndex(1);
	},
	
	doImageClick: function(inSender, images, index) {
		this.$.imageFullView.setImages(images);
		this.$.imageFullView.setImageIndex(index);
		this.$.pane.selectViewByIndex(2);	
	},
	
	processImageSelect: function(inSender, selectedImage) {
		this.doPhotoSelect(selectedImage);
	},
	
	goToDefaultView: function() {
		this.$.pane.selectViewByIndex(0);
	},
	
	backHandler: function(inEvent) {
		this.$.pane.back();
	}
	
});
