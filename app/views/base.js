enyo.kind({
	name: "wg.view.base",
	kind: enyo.VFlexBox,
	components: [
		
		/*
			page header
		*/
		{kind: "PageHeader", content: "WildGarlic for UrbanDictionary"},
		
		
		{kind: "SlidingGroup", flex: 1, wideWidth: 800, components: [
			
			
			/*
				search panel
			*/
			{name:'panel-search', width:'320px', components:[

			        // search box
    				{className: "enyo-row", components: [
    					{kind: "FancyInput", name:'searchterm', hint: "Search for...", components: [
    						{kind: "Button", caption: "Search", onclick: "searchBtnClick"}
    					]}
    				]},
                    
                    // searchlist component
                    {kind:'wg.view.searchList', name:'search-flexbox'},
                    
                    // randomlist component
                    {kind:'wg.view.randomList', name:'random-flexbox'},
    				
    				// random button
					{className: "enyo-row", components: [
        				{kind: "Button", caption: "Get Random Entries", onclick: "randomBtnClick"}
        			]}
        	
			]},

            /*
                definition panel
            */
            {kind:'wg.view.definitionPanel', name:"panel-definition"}
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
        // this.$['search-list'].pageSize = this.pageSize;
		
		this.$['search-flexbox'].show();
		this.$['random-flexbox'].hide();
	},
	

	searchBtnClick: function() {
		this.searchterm = this.$.searchterm.getValue();
		if (!this.searchterm) {
			this.searchterm = "funky";
			this.$.searchterm.setValue(this.searchterm);
		}
		this.pages = [];
		this.$['search-flexbox'].show();
		this.$['random-flexbox'].hide();

		this.$['search-flexbox'].startSearch(this.searchterm);
	},
	
	
	randomBtnClick: function() {
		this.pages = [];
		this.$['search-flexbox'].hide();
		this.$['random-flexbox'].show();
		this.$['random-flexbox'].loadData();
	},
	

	
	permalinkClick: function(inSender, e) {
		inSender.content;
	},
	
	backHandler: function(inSender, e) {
		this.$.slidingGroup.back(e);
	},
	resizeHandler: function() {
		this.$.slidingGroup.resize();
	}
	
	
	
});