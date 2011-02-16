/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ImageFullView",
	kind: enyo.Control,
	published: {
		imageIndex:'',
		images:[]
	},
	events: {
		onImageSelect:""
	},
	imageViewArr: [],
	chrome: [
		{kind:"Button", onclick:"selectPhoto", components:[
				{name:"icon", className:"enyo-imagepicker-attach-icon"},
				{content: $L("Attach Photo")}
		]},
		{kind: "ImageView", flex: 1, onSnap: "snap", components: []}
	],
	
	create: function() {
		this.inherited(arguments);
	},
	
	imagesChanged: function() {
		this.convertToImageViewArry(this.images);
		this.$.imageView.setImages(this.imageViewArr);
		this.$.imageView.render();
	},
	
	imageIndexChanged: function() {
		this.$.imageView.snapTo(this.imageIndex);
	},
	
	convertToImageViewArry: function() {
		for(var i=0, image; image=this.images[i]; i++) {
			if(image.path) {
				this.imageViewArr.push({src: image.path});
			}
		}
	},
	
	snap: function(inSender, inValue) {
		this.currentImageURL = this.imageViewArr[inValue].src;
		this.log("Now Showing "+ this.currentImageURL);
	},
	
	selectPhoto: function(inSender) {
		var result = 
			{
				fullPath: this.currentImageURL,
				iconPath: "/var/luna/extractfs" + this.currentImageURL + ":0:0:",
				attachmentType: 'image'
			};
		this.doImageSelect(result);
	},
	
	

});