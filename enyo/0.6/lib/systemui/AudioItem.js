/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AudioItem",
	kind: enyo.Item,
	className: "enyo-item",
	layoutKind: "HFlexLayout",
	published: {
		audioFile: {},
	},
	create: function() {
		this.inherited(arguments);
	},
	components: [
		{name: "audioGroup", layoutKind: "VFlexLayout", components:[
			{name:"audioTitle", className:"enyo-audiolist-audio-title"},
			{name:"songArtist", className:"enyo-audiolist-audio-artist"},
		]},
		{flex: 1},
		{name:"artworkframe", kind: "enyo.CustomButton", className:"enyo-audiolist-artwork-frame", components:[
			{name:"audioPicture", kind:"Image", className:"enyo-audiolist-artwork"},
		] },
		{name:"audioPlay", className:"enyo-audiolist-music-preview-play"}
		
	],
	processClick: function() {
		this.inherited(arguments);
	},
	audioFileChanged: function() {
		this.$.audioTitle.setContent(this.audioFile.title);
		this.$.songArtist.setContent(this.artistFormatter(this.audioFile.artist));
		this.$.audioPicture.setSrc(this.albumArtUrlFormatter(this.audioFile));
	},
	
	artistFormatter: function(artistName){
		var result = artistName;
		
		if (!artistName || artistName.length == 0) 
			result = $L("Unknown Artist");
		
		return result;
	},
	
	albumArtUrlFormatter: function(artUrl){
		var result = null;
		
		return enyo.path.rewrite("$enyo-lib/systemui/images/thumb-song.png");
		if (artUrl.thumbnail)
			result = "/var/luna/data/extractfs" + artUrl.thumbnail.data + ":74" + ":62" + ":3";
		else
			result = enyo.path.rewrite("$enyo-lib/systemui/images/thumb-song.png");
		
		return result;
	},
});