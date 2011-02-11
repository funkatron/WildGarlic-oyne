/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/* Copyright 2009 Palm, Inc.  All rights reserved. */

Formatter = {};

Formatter.numberSizeMax = 3;

Formatter.formatSizeNumber = function(number){
	// use system format method
	// but also here the rule is to have a maximum of 3 significant digit
	// so truncate if necessary
	var wholeDigits = number.toString().lastIndexOf('.');
	return Mojo.Format.formatNumber(number,
		(wholeDigits >= 0 && wholeDigits < Formatter.numberSizeMax) ?
			Formatter.numberSizeMax - wholeDigits : 0);

};

/**
 * @function
 * @description Format a number with maximum 3 digits (hence set a limit to 999 for each range)
 *
 * @param {Number} file size in bytes
 * @returns {String} formatted size (12B, 0.99K, 1.12M, 123G, ...)
 *
 */
Formatter.formatSize = function(fileSize){
    var formattedSize;
    
    // More than 999 GB
    if (fileSize > 1072668082176) {
        fileSize = 1072668082176;
    }
    
    // More than 999 MB
    if (fileSize > 1047527424) {
        formattedSize = Formatter.formatSizeNumber(fileSize / 1073741824) + $L('G');
    }
    else {
        // More than 999 KB
        if (fileSize > 1022976) {
            formattedSize = Formatter.formatSizeNumber(fileSize / 1048576) + $L('M');
        }
        else {
            // More than 999 Bytes
            if (fileSize > 999) {
                formattedSize = Formatter.formatSizeNumber(fileSize / 1024) + $L('K');
            }
            else {
                formattedSize = fileSize + $L('B');
            }
        }
    }
    
    return formattedSize;
};

Formatter.formatTimestamp = function(now, timestamp){
    // Ok for now the formatting is always the same but get ready for various formatting
    var formattedDate;
    if (timestamp.getFullYear() < now.getFullYear()) {
        formattedDate = Mojo.Format.formatDate(timestamp, {date: 'short'});
    }
    else {
        if (timestamp.getMonth() < now.getMonth()) {
            formattedDate = Mojo.Format.formatDate(timestamp, {date: 'short'});
        }
        else {
            if (timestamp.getDate() < now.getDate()) {
                formattedDate = Mojo.Format.formatDate(timestamp, {date: 'short'});
            }
            else {
                formattedDate = Mojo.Format.formatDate(timestamp, {date: 'short'});
            }
        }
    }
    
    return formattedDate;
};

/**
 * Get an icon name from a file type
 *
 * TODO currently fileType has some weird values ("null") for unknown types
 * and is sometimes not specified (for others)
 *
 * @param {Object} fileType
 * @param {Object} fileExt
 */
Formatter.getImageSrc = function(fileType){
    // File type as the following format for now:
    // document.doc
    // but sometimes (null).docx (!)
   // var type = Formatter.splitFile(fileType);
   switch (fileType) {
      case 'doc':
      case 'docx':
      case 'odt':
           return 'icon-doc';
      case 'xls':
      case 'xlsx':
      case 'ods':
           return 'icon-xls';
      case 'pdf':
           return 'icon-pdf-alt';
      case 'txt':
      case 'rtf':
           return 'icon-txt';
      case 'ppt':
      case 'pptx':
      case 'odp':
           return 'icon-ppt';
      default:
           return 'icon-generic';
    }
};