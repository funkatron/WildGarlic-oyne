enyo.kind({
	name: "wg.base",
	kind: enyo.VFlexBox,
	components: [
		/*
			page header
		*/
		{name: "header", kind: "PageHeader", className:"enyo-header-dark", components: [
			{kind: "HFlexBox", flex:1, components: [
				{className:"pageHeaderText", content:"WildGarlic"},
				{kind:"Spacer", flex:1},
				{kind: "ToolInput", alwaysLooksFocused: true, name:'searchterm', hint: "Search for...", components: [
					{kind: "Spinner", className:'search-spinner', name:"searchSpnr", spinning: false}
				]},
				{kind: "ToolButton", className:'searchButton', icon: "images/menu-icon-forward.png", name:"searchBtn", onclick: "searchBtnClick"},
				
			]}
		]},
		{kind: "SlidingPane", name:'slidingPane', flex:1, components: [
			/******************
				search panel
			******************/
			{name:'panel-search', width:'320px', components:[
				// searchlist component
				{kind:'wg.searchList', name:'searchFlexbox', flex:1},
				// randomlist component
				{kind:'wg.randomList', name:'randomFlexbox', flex:1},
				{kind: "Toolbar", name:'commandmenuSlider', pack: "center", components: [
					// random button
					{kind: "GrabButton"},
					{caption: "Load random entries", onclick: "randomBtnClick"}
				]}
			]},

			/******************
				search panel
			******************/		
			{name: 'panel-right', flex:1, components: [
				{
					flex:1,
					name:"panelDefinition",
					kind:"WGDefinitionPanel"
				}
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
	// this.$.searchList.pageSize = this.pageSize;
		
		this.render();
		
		this.showSpinner(false);
	
		this.$['searchFlexbox'].show();
		this.$['randomFlexbox'].hide();
	
			
		this.showRandomButton(true);
	},
	

	searchBtnClick: function() {
		this.searchterm = this.$.searchterm.getValue();
		if (!this.searchterm) {
			this.searchterm = "funky";
			this.$.searchterm.setValue(this.searchterm);
		}
		this.pages = [];
		this.$['searchFlexbox'].show();
		this.$['randomFlexbox'].hide();
	
		this.$['searchFlexbox'].startSearch(this.searchterm);
	},
	
	
	randomBtnClick: function() {
		this.pages = [];
		this.$['searchFlexbox'].hide();
		this.$['randomFlexbox'].show();
		this.$['randomFlexbox'].loadData();
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
		this.$.panelDefinition.showDefinition(row);
		if (window.innerWidth < this.$.slidingPane.multiViewMinWidth) {
			this.$.slidingPane.selectView(this.$['panel-right']);
		}
		this.showRandomButton(false);
	},
	
	backHandler: function(inSender, e) {
		this.$['slidingPane'].back(e);
		this.$['commandmenuSlider'].show();
	},
	
	resizeHandler: function() {
		this.$['slidingPane'].resize();
	},
	
	
	showRandomButton: function(on) {
	
		if (document.width < this.$['slidingPane'].wideWidth) {
			if (!!on) {
					this.$['commandmenuSlider'].show();
				} else {
					this.$['commandmenuSlider'].hide();
				}
		} else { // always show if wide
				this.$['commandmenuSlider'].show();
		}
	}
});