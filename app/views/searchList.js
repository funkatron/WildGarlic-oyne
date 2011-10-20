/*
	flex box to contain results
*/
enyo.kind({
	kind: enyo.HFlexBox,
	name:'wg.searchList',
	components: [
		/*
			hidden webservice component
		*/
		{name: "udSearch", kind: "WebService", onSuccess: "gotSearchResults", onFailure: "gotSearchFailure"},
		
		
		{name: "list", kind: enyo.VirtualList, flex: 1, 
			onSetupRow: "setupRow",
			onAcquirePage: "acquirePage",
			onDiscardPage: "discardPage",
			components: [
				/*
					Item row
				*/
				{kind: "Item", className:"wgItem", onclick: "itemClick", components: [
					{kind:enyo.HFlexBox, flex:1, components: [
							{name: "item-word", className:'item-word', flex:1},
							{kind:enyo.HFlexBox, components: [
									{name: "item-thumbs_up", className:'item-thumbs-up'},
									{content:'/'},
									{name: "item-thumbs_down", className:'item-thumbs-down', flex:1, style:'align:right'}
								]
							}
						]
					},
					{name: "item-definition", className:'item-definition', flex:1}
				]}
			]
		}
	],
	pageSize: 5,
	pages: [],
	// what's this magic method?
	constructor: function() {
		this.inherited(arguments); // call the parent version
	},
	
	startSearch: function(searchterm) {
		this.searchterm = searchterm;
		
		if (searchterm) {
			this.pages = [];
			this.$.list.punt(); // what's this?
			this.$.list.reset(); // what's this?
			this.$.list.refresh();	
		}
	},
	
	// what's this magic method?
	acquirePage: function(inSender, inPage) {
		// enyo.log('acquirePage inPage', inPage);
		// enyo.log('this.pages', this.pages);
		// enyo.log('inSender', inSender);
		// if (this.pages.length == 0) {
		// 	console.dir(this.pages);
		// }
		if (inPage >= 0 && !this.pages[inPage]) {
			return this.search(inPage);
		}
	},
	discardPage: function(inSender, inPage) {
	},
	
	// called by acquirePage
	search: function(inPage) {
		if (!this.searchterm) {return false;}
		
		if (this.lastsearchterm != this.searchterm) {
			inPage = 0;
			this.lastsearchterm = this.searchterm;
		}
		
		var url = 'http://www.urbandictionary.com/iphone/search/define?term='+
					encodeURIComponent(this.searchterm)+
					'&page='+encodeURIComponent(inPage+1);
		// enyo.log('url', url);
		this.$.udSearch.setUrl(url);
		var r = this.$.udSearch.call(null, {pageIndex: inPage});

		this.owner.showSpinner(true);
		
		return true;
	},
	
	gotSearchResults: function(inSender, inResponse, inRequest) {
		var pageIndex = inRequest.pageIndex;
		// enyo.log('pageIndex', pageIndex);
		
		if (inResponse.result_type == "no_results") {
			// enyo.log('no results');
			return;
		}
		
		this.total = inResponse.total;
		this.total_pages = inResponse.pages;
		this.result_type = inResponse.result_type;
		this.has_related_words = inResponse.has_related_words;
		
		this.pages[pageIndex] = {
			data: inResponse.list
		};
		
		this.owner.showSpinner(false);
		
		this.$.list.refresh();
	},
	
	gotSearchFailure: function(inSender, inResponse, inRequest) {
		this.owner.showSpinner(false);
		alert('Error getting results');
	},
	
	
	
	fetchRow: function(inIndex) {
		// enyo.log('fetchRow:', inIndex);
		var page = Math.floor(inIndex / this.pageSize);
		// enyo.log('fetchRow page:', page);
		var p = this.pages[page];
		if (!p || !p.data) {
			// enyo.log('fetchRow:', 'noPage!');
			return null;
		}
		var row = inIndex - (page * this.pageSize);
		if (inIndex < 0) {
			row -= (this.pageSize - p.data.length);
		}
		// enyo.log('fetchRow:', p.data[row]);
		return p.data[row];
	},
	
	// formats the row
	setupRow: function(inSender, inRow) {
		var data = this.fetchRow(inRow);
		if (data) {
			this.$['item-word'].setContent(data.word);
			this.$['item-definition'].setContent(data.definition);
			this.$['item-thumbs_up'].setContent(data.thumbs_up);
			this.$['item-thumbs_down'].setContent(data.thumbs_down);
			return true;
		} else {
			return false;
		}
	},
	
	itemClick: function(inSender, inEvent, inIndex) {
		// console.dir(this.fetchRow(inIndex));
		
		var row = this.fetchRow(inIndex);
		
		this.owner.showDefinition(row);
	}
	
});