/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ImageAlbumThumbnails",
	kind: enyo.Control,
	published: {
		album: null
	},
	chrome: [
		{name: "client", className: "enyo-image-album-thumbnails-client"},
		{name: "frame"},
		{name: "counterHolder", components: [
			{name: "counter", className: "enyo-image-album-thumbnails-counter"}
		]}
	],
	createThumbnailImage: function(inPath) {
		return this.createComponent({
			kind: "Image",
			src: inPath,
			className: "enyo-image-album-thumbnails-image"
		});
	},
	albumChanged: function() {
		this.destroyControls();
		var tn = this.album.thumbnails;
		this.$.counter.setContent(this.album.total.images);
		this.$.frame.setClassName("enyo-image-album-thumbnails-frame enyo-image-album-thumbnails-show-thumb-" + tn.length);
		this.$.counterHolder.setClassName("enyo-image-album-thumbnails-counter-holder enyo-image-album-thumbnails-counter-holder-show-thumb-" + tn.length);
		for (var i=0, t; i<3 && (t=tn[i]); i++) {
			var c = this.createThumbnailImage(t.data.path);
		}
	}
});
