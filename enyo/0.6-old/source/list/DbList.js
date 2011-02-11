/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to display data stored in a mojodb database as a list of rows.
A DbList uses an <a href="#enyo.VirtualList">enyo.VirtualList</a> to manage list rendering.

*/
enyo.kind({
	name: "enyo.DbList",
	kind: enyo.VFlexBox,
	published: {
		pageSize: 20,
		desc: false
	},
	events: {
		/**
		Fires when a database query should be made. DbList maintains a store of database data
		but does not directly interact with the database. Use an
		<a href="#enyo.DbService">enyo.DbService</a> or compatible kind to perform the database query.

		inQuery {Object} Database query to perform.
		*/
		onQuery: "",
		/**
		Fires when a row is rendered. Populates row controls with relevant
		data as needed.

		inRecord {Object} Object containing row data.
		
		inIndex {Integer} Index of the row.
		*/
		onSetupRow: ""
	},
	components: [
		{kind: "DbPages", onQuery: "doQuery"},
		{flex: 1, name: "list", kind: "VirtualList", onSetupRow: "setupRow", onAcquirePage: "acquirePage", onDiscardPage: "discardPage"}
	],
	controlParentName: "list",
	create: function() {
		this.inherited(arguments);
		this.pageSizeChanged();
		this.descChanged();
	},
	descChanged: function() {
		this.$.dbPages.desc = this.desc;
	},
	pageSizeChanged: function() {
		this.$.list.pageSize = this.pageSize;
		this.$.dbPages.size = this.pageSize;
	},
	acquirePage: function(inSender, inPage) {
		//enyo.vizLog.log("DbList: acquirePage: " + inPage);
		this.$.dbPages.require(inPage);
	},
	discardPage: function(inSender, inPage) {
		//enyo.vizLog.log("DbList: discardPage: " + inPage);
		this.$.dbPages.dispose(inPage);
		enyo.viz && enyo.viz.dbListUpdate(this);
	},
	queryResponse: function(inResponse, inRequest) {
		this.$.dbPages.queryResponse(inResponse, inRequest);
		//
		enyo.viz && enyo.viz.dbListUpdate(this);
		//
		var page = inRequest.index;
		var b = this.$.list.$.buffer;
		if (page < b.specTop || page > b.specBottom) {
			enyo.vizLog && enyo.vizLog.log("DbList: no-render queryResponse (page: " + page + ")");
			//this.log("received page out of display range");
			return;
		}
		//
		enyo.vizLog && enyo.vizLog.startFrame("DbList: queryResponse (page: " + page + ")");
		//
		// DomBuffer pages can straddle data pages, so simply
		// pushing new pages with updatePages is not good enough.
		// We have to refresh the entire display buffer to ensure
		// complete DomBuffer pages.
		//var p0 = this.$.list.$.scroller.pageTop;
		this.refresh();
		//this.$.list.$.scroller.updatePages();
		//var p1 = this.$.list.$.scroller.pageTop;
		//if (p0 != p1) {
		//	this.log("pageTop changed: ", p0, p1);
			//debugger;
		//}
		//this.$.list.$.scroller.effectScroll();
		//this.$.list.$.scroller.scroll();
	},
	fetch: function(inRow) {
		return this.$.dbPages.fetch(inRow);
	},
	setupRow: function(inSender, inIndex) {
		var record = this.fetch(inIndex);
		if (record) {
			this.doSetupRow(record, inIndex);
			return true;
		}
		return record;
	},
	updateRow: function(inIndex) {
		this.$.list.updateRow(inIndex);
	},
	update: function() {
		// adjust rendering buffers to fit display
		this.$.list.$.scroller.updatePages();
		//this.$.list.$.scroller.scroll();
		//this.$.list.$.scroller.$.scroll.start();
		enyo.viz && enyo.viz.dbListUpdate(this);
	},
	refresh: function() {
		// dump and rebuild rendering buffers
		this.$.list.refresh();
	},
	reset: function() {
		// db buffer 'live top'
		var b = this.$.list.$.buffer;
		var top = b.specTop === undefined ? b.top : b.specTop;
		// dump db buffer
		this.$.dbPages.reset(top);
		b.flush();
		b.top = top;
		b.bottom = top - 1;
		this.$.list.reset();
	},
	punt: function() {
		// dump data buffer
		this.$.list.$.buffer.flush();
		this.$.list.$.buffer.top = this.$.list.$.buffer.specTop = 0;
		this.$.list.$.buffer.bottom = this.$.list.$.buffer.specBottom = -1;
		this.$.dbPages.reset(0);
		this.$.dbPages.handles = [];
		// dump and rebuild rendering buffers
		this.$.list.punt();
		enyo.viz && enyo.viz.dbListUpdate(this);
	}
});

