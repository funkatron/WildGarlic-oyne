/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.RingtoneItem",
	kind: enyo.Item,
	className: "enyo-item",
	layoutKind: "HFlexLayout",
	published: {
		ringtoneFile:{},
		checked: false
	},
	create: function() {
		this.inherited(arguments);
	},
	chrome: [
		{name: "title", flex: 1},
		{name: "checked", className: "enyo-ringtone-item-checked", domStyles: {"display": "none"}},
		{name:"artworkframe", kind: "enyo.CustomButton", className:"enyo-audiolist-artwork-frame", components:[
			{name:"audioPicture", kind:"Image", className:"enyo-audiolist-artwork"},
		] },
		{name:"audioPlay", className:"enyo-audiolist-music-preview-play"}
	],
	
	ringtoneFileChanged: function() {
		this.$.title.setContent(this.ringtoneFile.title);
		this.$.audioPicture.setSrc(this.pictureUrlFormatter(this.ringtoneFile));
	},
	
	checkedChanged: function() {
		this.$.checked.applyStyle("display", (this.checked ? "inline-block" : "none"));
	},
	pictureUrlFormatter: function(artUrl){
		var result;

		if (artUrl.thumbnail && artUrl.thumbnail.data)
			result = this.pickerAssistant.extractfsPrefix +
				artUrl.thumbnail.data + ":77" + ":65" + ":3";
		else
			result = "images/thumb-song.png";	

		return result;
	},
	
	nameFormatter: function(item){
		if (item != undefined && item.title != undefined 
			&& item.title.length > 0) {	
			return item.title;
		}
		else {		
			return $L("Unknown");
		}
	},
});