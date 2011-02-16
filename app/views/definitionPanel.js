/*
	definition panel
*/
enyo.kind({
	name:'wg.view.definitionPanel', kind:"Sliding", flex:1, peekWidth: 320, components:[
		{kind: "Item", name:'definition-word', className: "definition-header enyo-first", content:'Definition'},
		{kind: "Scroller",	flex: 1, components:[
			{kind: "Item", name:'definition-container', components:[
				{content:'<h3>Definition</h3>'},
				{name:'definition-definition', className:'definition-definition'}
			]},
			{kind: "Item", name:'example-container', components:[
				{content:'<h3>Example</h3>'},
				{name:'definition-example', className:'definition-example'}
			]}
		]},
		{kind: "CommandMenu", pack: "justify", components: [
			{kind: "MenuButton", name:'back-button', icon: "images/menu-icon-back.png", onclick:'backHandler'},
			{kind: 'Spacer'},
			{kind: "MenuButton", icon: "images/menu-icon-info.png", onclick:'permalinkClick'}
		]}
		
	],
	
	permalink:null,
	
	create: function() {
		this.inherited(arguments); // call the parent
		
		// initially we hide these
		this.$['definition-container'].hide();
		this.$['example-container'].hide();
	},
	
	showDefinition: function(obj) {
		this.$['definition-word'].setContent(obj.word);
		this.$['definition-definition'].setContent(nl2br(obj.definition));
		this.$['definition-example'].setContent(nl2br(obj.example));
        this.permalink = obj.permalink;

		// only show them when we have content
		this.$['definition-container'].show();
		this.$['example-container'].show();
		
	},
	
	permalinkClick: function(inSender, e) {
	    window.open(this.permalink);
	},
	
	backHandler: function(inSender, e) {
		this.owner.backHandler(inSender, e);
	}
	
});