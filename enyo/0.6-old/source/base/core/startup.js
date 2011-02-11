/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.addOnStart = function(inFunc) {
	if (enyo.isBuiltin) {
		enyo.startTimeTasks.push(inFunc);
	} else {
		inFunc();
	}
};

enyo.startTimeTasks = [];

enyo.started = function() {
	for (var i=0, h; h=enyo.startTimeTasks[i]; i++) {
		h();
	}
};
