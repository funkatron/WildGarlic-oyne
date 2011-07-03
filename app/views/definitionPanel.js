/*
	definition panel
*/
var lorem_ipsum = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Phasellus nisl dolor, pulvinar id, pharetra a, egestas nec, ante. Duis scelerisque eleifend metus. Sed non odio id odio varius rutrum. Pellentesque congue commodo lacus. In semper pede lacinia felis. Morbi mollis molestie lorem. Morbi suscipit libero. Quisque ut erat sit amet elit aliquam nonummy. Donec tortor. Aliquam gravida ullamcorper pede. Praesent eros. Sed fringilla ligula sed odio pharetra imperdiet. Integer aliquet quam vitae nibh. Nam pretium, neque non congue vulputate, odio odio vehicula augue, sit amet gravida pede massa ac lectus. Curabitur a libero vitae dui sagittis aliquet. Ut suscipit. Curabitur accumsan sem a urna. Ut elit pede, vulputate sed, feugiat quis, congue sed, lacus. ";

enyo.kind({
	name:'WGDefinitionPanel',
	kind: "VFlexBox",
	components:[
		
		{kind: "Scroller",	flex: 1, style:"background-color:white", components:[
			{kind: "Control", flex: 1, name:'definitionContainer', className:"definitionContainer", components:[
				// {kind:"enyo.HtmlContent", content:'<h3>Definition</h3>'},
				{kind: "enyo.HtmlContent", name:'definitionWord', className: "definitionHeader enyo-first", content:'Definition'},
				{kind:"enyo.HtmlContent", name:'definitionDefinition', className:'definitionDefinition', content:lorem_ipsum},
				{kind:"enyo.HtmlContent", name:'definitionExample', className:'definitionExample', content:lorem_ipsum}
			]},
			// {kind: "Item", flex: 1, name:'exampleContainer', components:[
				// {kind:"enyo.HtmlContent", content:'<h3>Example</h3>'},
				
			// ]}
		]},
		{kind: "Toolbar", name:'commandmenuSlider', pack: "center", components: [
			{kind: "GrabButton"},
			{kind: "Spacer", flex:1},
			{kind: "ToolButton", icon: "images/menu-icon-forward-email.png", onclick:'permalinkClick'}
		]}
	],
	
	permalink:null,
	
	create: function() {
	
		this.inherited(arguments); // call the parent
		
		// initially we hide these
		this.$['definitionContainer'].hide();
		this.$['definitionExample'].hide();
	},
	
	showDefinition: function(obj) {
		this.$.scroller.scroll({x:0, y:0});
		this.$['definitionWord'].setContent(obj.word);
		this.$['definitionDefinition'].setContent(nl2br(obj.definition));
		this.$['definitionExample'].setContent(nl2br(obj.example));
				  this.permalink = obj.permalink;
	
		// only show them when we have content
		this.$['definitionContainer'].show();
		if (obj.example) {
			this.$['definitionExample'].show();
		}
	},
	
	permalinkClick: function(inSender, e) {
			  window.open(this.permalink);
	},
	
	backHandler: function(inSender, e) {
		this.owner.backHandler(inSender, e);
	}
	
});