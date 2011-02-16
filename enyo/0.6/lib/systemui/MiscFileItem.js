/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.MiscFileItem",
	kind: enyo.Item,
	className: "enyo-item",
	layoutKind: "HFlexLayout",
	published: {
		file: {},
	},
	create: function() {
		this.inherited(arguments);
	},
	components: [
		{ name: "fileicon", className: "filepicker-file-icon", kind: "Image" },
		{ name: "filename", className: "files-file-name"},
		{ name: "fileextension", className:"files-file-ext"},
		{ name: "filedate", className:"files-file-date"},
		{ name: "filesize", className:"files-file-size"}
	],
	processClick: function() {
		this.inherited(arguments);
	},
	fileChanged: function() {
		
		this.$.filename.setContent(this.file.name);
		//this.file.imageSrcFormatted = '/home/sarumugam/workspace_enyo/enyo/trunk/systemui/images/' + Formatter.getImageSrc(this.file.extension ? this.file.extension.toLowerCase() : undefined) + '.png';
		this.file.imageSrcFormatted = enyo.path.rewrite('$enyo-lib/systemui/images/' + Formatter.getImageSrc(this.file.extension ? this.file.extension.toLowerCase() : undefined) + '.png');
		this.$.fileicon.setSrc(this.file.imageSrcFormatted);
		
        /*if (this.file.extension) {
            this.file.name += '.';
            this.file.fileExtensionFormatted = this.file.extension.substr(0, 4);
        }
		
		this.$.fileextension.setContent(this.file.fileExtensionFormatted);
		
        if (this.file.modifiedTime) {
            // Date stored in UTC time in seconds. Covert into MilliSeconds.
            var fileDate = new Date(parseInt(this.file.modifiedTime) * 1000);
            this.file.fileDateFormatted = Formatter.formatTimestamp(new Date(), fileDate);
			this.$.filedate.setContent(this.file.fileDateFormatted);
        }
        
       	if (this.file.size) {
            this.file.fileSizeFormatted = Formatter.formatSize(this.file.size);
			this.$.filesize.setContent(this.file.fileSizeFormatted);
        }*/
	}
});