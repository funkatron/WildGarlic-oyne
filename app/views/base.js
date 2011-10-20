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
				]},
				{kind: "ToolButton", className:'searchButton', icon: "images/glyphish/06-magnify@2x.png", name:"searchBtn", onclick: "searchBtnClick"},
				{kind: "Spinner", className:'searchSpinner', name:"searchSpinner", spinning: false}				
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
					{onclick: "randomBtnClick", icon: "images/glyphish/169-8ball@2x.png"}
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
	
	// set this to true when we render
	isRendered: false,

	// functions we will execute once everything is rendered
	onRendered: [],

	// what's this magic method?
	constructor: function() {
		this.inherited(arguments); // call the parent version
		this.pages = [];
		
	},
	
	processLaunchParams: function(inParams) {
		if (!inParams.action) {
			return;
		}

		switch(inParams.action) {
			case 'search':
				if (inParams.query) {
					var searchfunc = _.bind(function() { // bind to this with underscore
						this.$.searchterm.setValue(inParams.query);
						this.searchBtnClick();
					}, this);

					if (this.isRendered === false) {
						this.onRendered.push(searchfunc);
					} else {
						searchfunc();
					}
				}
				break;
			default:
				return;
		}
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
			this.$['searchSpinner'].show();
			this.$['searchSpinner'].spinning = true;
		} else {
			this.$['searchBtn'].show();
			this.$['searchSpinner'].hide();
			this.$['searchSpinner'].spinning = false;
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
	},

	rendered: function() {
		this.inherited(arguments);
		if (this.onRendered.length > 0) {
			for (var i=0; i < this.onRendered.length; i++) {
				this.onRendered[i].call();
			}
			this.onRendered = []; // clear each
		}
		this.isRendered = true; // so we don't try to bind stuff to onRendered again
	}
});