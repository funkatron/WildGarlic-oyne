/*
	definition panel
*/
enyo.kind({
    name:'wg.view.definitionPanel', kind:"Sliding", flex:1, peekWidth: 320, components:[
    	{kind: "Item", name:'definition-word', className: "definition-header enyo-first", content:'Definition'},
    	{kind: "Scroller",  flex: 1, components:[
    		{kind: "Item", name:'definition-container', components:[
    			{content:'<h3>Definition</h3>'},
    			{name:'definition-definition', className:'definition-definition'}
    		]},
    		{kind: "Item", name:'example-container', components:[
    			{content:'<h3>Example</h3>'},
    			{name:'definition-example', className:'definition-example'}
    		]}
    	]},
    	{kind: "Item", name:'definition-permalink', className:'definition-permalink', onclick:'permalinkClick'}
    ],
    
    create: function() {
		this.inherited(arguments); // call the parent
		this.$['definition-container'].hide();
		this.$['example-container'].hide();
	},
	
    showDefinition: function(obj) {
        this.$['definition-word'].setContent(obj.word);
		this.$['definition-definition'].setContent(nl2br(obj.definition));
		this.$['definition-example'].setContent(nl2br(obj.example));
		this.$['definition-permalink'].setContent('<a href="'+obj.permalink+'">View on web &raquo;</a>');

		this.$['definition-container'].show();
		this.$['example-container'].show();
    },
    
    backHandler: function(inSender, e) {
		this.$.slidingGroup.back(e);
	},
    
});