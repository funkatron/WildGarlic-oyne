enyo.kind({
	name: "wg.view.base",
	kind: enyo.VFlexBox,
	pageSize: 5,
	components: [
		
		/*
			hidden webservice component
		*/
		{name: "udSearch", kind: "WebService", onSuccess: "gotSearchResults", onFailure: "gotSearchFailure"},
		
		{kind: "SlidingGroup", flex: 1, wideWidth: 800, onSelect: "slidingSelected", components: [
			
			
			/*
				searchlist panel
			*/
			{name:'panel-search', width:'320px', components:[
			
				/*
					page header
				*/
				{kind: "PageHeader", content: "WildGarlic for UrbanDictionary"},

				/*
					search box
				*/
				{className: "enyo-row", components: [
					{kind: "FancyInput", name:'searchterm', hint: "Search for...", components: [
						{kind: "Button", caption: "Search", onclick: "searchBtnClick"}
					]}
				]},

				/*
					divider
				*/
				// {kind: "Divider", caption: "Search Results"},

				/*
					flex box to contain results
				*/
				{kind: enyo.HFlexBox, flex: 1, components: [
					{name: "list", kind: enyo.VirtualList, flex: 1, 
						onSetupRow: "setupRow",
						onAcquirePage: "acquirePage",
						onDiscardPage: "discardPage",
						components: [
							/*
								Item row
							*/
							{kind: "Item", onclick: "itemClick", components: [
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
				]}
			
			]},
			
			
			/*
				definition panel
			*/
			{name:'panel-definition', flex:1, peekWidth: 320, components:[
				{kind: "Item", name:'definition-word', className: "definition-header enyo-first", content:'Definition'},
				{kind: "Scroller",  flex: 1, components:[
					{kind: "Item", components:[
						{content:'<h3>Definition</h3>'},
						{name:'definition-definition', className:'definition-definition'}
					]},
					{kind: "Item", components:[
						{content:'<h3>Example</h3>'},
						{name:'definition-example', className:'definition-example'}
					]}
				]},
				{kind: "Item", name:'definition-permalink', className:'definition-permalink', onclick:'permalinkClick'}
				

			]}
		]}
		

		
	],
	
	// what's this magic method?
	constructor: function() {
		this.inherited(arguments); // call the parent version
		this.pages = [];
	},
	
	// what's this magic method?
	create: function() {
		this.inherited(arguments); // call the parent
		this.$.list.pageSize = this.pageSize;
	},
	
	
	// what's this magic method?
	acquirePage: function(inSender, inPage) {
		console.log('acquirePage inPage', inPage);
		console.log('this.pages', this.pages);
		console.log('inSender', inSender);
		if (this.pages.length == 0) {
			console.dir(this.pages);
		}
		if (inPage >= 0 && !this.pages[inPage]) {
			return this.search(inPage);
		}
	},
	discardPage: function(inSender, inPage) {
	},
	searchBtnClick: function() {
		this.searchterm = this.$.searchterm.getValue();
		if (!this.searchterm) {
			this.searchterm = "funky";
			this.$.searchterm.setValue(this.searchterm);
		}
		this.pages = [];
		this.$.list.punt(); // what's this?
		this.$.list.reset(); // what's this?
		this.$.list.refresh();
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
		console.log('url', url);
		this.$.udSearch.setUrl(url);
		var r = this.$.udSearch.call(null, {pageIndex: inPage});
		return true;
	},
	
	gotSearchResults: function(inSender, inResponse, inRequest) {
		var pageIndex = inRequest.pageIndex;
		console.log('pageIndex', pageIndex);
		
		if (inResponse.result_type == "no_results") {
			console.log('no results');
			return;
		}
		
		this.total = inResponse.total;
		this.total_pages = inResponse.pages;
		this.result_type = inResponse.result_type;
		this.has_related_words = inResponse.has_related_words;
		
		this.pages[pageIndex] = {
			data: inResponse.list
		};
		// after getting the first batch of data, tell the list to render; alternative is to scroll the empty list
		// if (pageIndex == 0) {
			this.$.list.refresh();
		// }
		
	},
	
	gotSearchFailure: function() {
		return;
	},
	
	fetchRow: function(inIndex) {
		console.log('fetchRow:', inIndex);
		var page = Math.floor(inIndex / this.pageSize);
		console.log('fetchRow page:', page);
		var p = this.pages[page];
		if (!p || !p.data) {
			console.log('fetchRow:', 'noPage!');
			// this.$.list.adjustTop(0);
			return null;
		}
		var row = inIndex - (page * this.pageSize);
		if (inIndex < 0) {
			row -= (this.pageSize - p.data.length);
		}
		console.log('fetchRow:', p.data[row]);
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
		console.dir(this.fetchRow(inIndex));
		
		var row = this.fetchRow(inIndex);
		
		this.$['definition-word'].setContent(row.word);
		this.$['definition-definition'].setContent(this.nl2br(row.definition));
		this.$['definition-example'].setContent(this.nl2br(row.example));
		this.$['definition-permalink'].setContent('<a href="'+row.permalink+'">View on web &raquo;</a>');
		
		this.$.slidingGroup.setSelected(this.$['panel-definition']);
	},
	
	permalinkClick: function(inSender, e) {
		inSender.content;
	},
	
	backHandler: function(inSender, e) {
		this.$.slidingGroup.back(e);
	},
	resizeHandler: function() {
		this.$.slidingGroup.resize();
	},
	nl2br:function(str, breaktag) {

		breaktag = breaktag || '<p></p>';

		str = str.replace(/(\r\n|\n\r|\r|\n)/g, breaktag+'$1');
		return str;
	}
	
	
	
});