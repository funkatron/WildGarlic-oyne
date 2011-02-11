/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.VideoPicker",
	kind: enyo.VFlexBox,
	events: {
		onVideoSelect: ""
	},
	chrome: [
		{name: "pane", kind: "Pane", flex: 1, components: [
			{name: "albumList", kind: "VideoAlbumList", onAlbumClick: "albumClick"},
			{name: "videoList", kind: "VideoList", onVideoPick: "videoSelect"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.showAlbums();
	},
	showAlbums: function() {
		this.$.albumList.getCapturedVideosAlbum();
		if (this.$.pane.getViewIndex() != 0) {
			this.$.pane.selectViewByIndex(0);
		}
	},
	albumClick: function(inSender, category) {
		this.$.videoList.setVideoParams({
			params: {
				maxVideoSize: 4000000,
				tempVideoFilePath: "/tmp/tempvideo.mp4"
			}
		})
		this.$.videoList.setCategory(category);
		this.$.pane.selectViewByIndex(1);
	},
	
	videoSelect: function(inResponse, selectedFile) {
		this.doVideoSelect(selectedFile);
	},
	
	goToDefaultView: function() {
		this.$.pane.selectViewByIndex(0);
	},
	
	backHandler: function(inEvent) {
		this.$.pane.back();
	}
});