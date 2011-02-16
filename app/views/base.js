enyo.kind({
	name: "wg.view.base",
	kind: enyo.VFlexBox,
	components: [
		
		/*
			page header
		*/
		{kind: "PageHeader", content: "WildGarlic for UrbanDictionary"},
		
		
		{kind: "SlidingGroup", name:'sliding-group', flex: 1, wideWidth: 800, components: [
			
			
			/*
				search panel
			*/
			{name:'panel-search', width:'320px', components:[

		        // search box
				{className: "enyo-row", components: [
					{kind: "FancyInput", name:'searchterm', hint: "Search for...", components: [
					    {kind: "MenuButton", className:'search-button', icon: "images/menu-icon-search.png", name:"searchBtn", onclick: "searchBtnClick"},
						{kind: "Spinner", className:'search-spinner', name:"searchSpnr", spinning: false}
					]}
				]},
                
                // searchlist component
                {kind:'wg.view.searchList', name:'search-flexbox'},
                
                // randomlist component
                {kind:'wg.view.randomList', name:'random-flexbox'},
				
				
				{kind: "CommandMenu", name:'commandmenu-slider', pack: "center", components: [
    				// random button
    				{kind: "MenuToolbar", components: [
        				{caption:"Load random entries", onclick: "randomBtnClick"}
        			]}
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
		
		this.showSpinner(false);
		
		this.$['search-flexbox'].show();
		this.$['random-flexbox'].hide();
		
		this.setBackButtonState();
		this.showRandomButton(true);
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
	
	
	showSpinner: function(on) {
	    if (!!on) {
            this.$['searchBtn'].hide();
            this.$['searchSpnr'].show();
    		this.$['searchSpnr'].spinning = true;
	    } else {
	        this.$['searchBtn'].show();
    		this.$['searchSpnr'].hide();
    		this.$['searchSpnr'].spinning = false;
	    }
		
	},

	
	showDefinition: function(row) {
		this.$['panel-definition'].showDefinition(row);
		this.$['sliding-group'].setSelected(this.$['panel-definition']);
		this.setBackButtonState();
		this.showRandomButton(false);
	},
	
	backHandler: function(inSender, e) {
		this.$['sliding-group'].back(e);
		this.$['commandmenu-slider'].show();
	},
	
	resizeHandler: function() {
		this.$['sliding-group'].resize();
		this.setBackButtonState();
	},
	
	
	showRandomButton: function(on) {

	    if (document.width < this.$['sliding-group'].wideWidth) {
	        if (!!on) {
                this.$['commandmenu-slider'].show();
            } else {
                this.$['commandmenu-slider'].hide();
            }
		} else { // always show if wide
            this.$['commandmenu-slider'].show();
		}
	},
	
	setBackButtonState: function() {
	    if (document.width < this.$['sliding-group'].wideWidth) {
		    this.$['panel-definition'].$['back-button'].show();
		} else {
	        this.$['panel-definition'].$['back-button'].hide();		
		}
	}
	
	
	
});