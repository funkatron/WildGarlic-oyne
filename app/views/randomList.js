enyo.kind(
    {
        kind: enyo.HFlexBox, name:'wg.view.randomList', flex: 1, components: [

        // @see udRandom.js
        {name: "udRandom", kind: "wg.models.udRandom", onSuccess:'gotRandomResults', onFailure:'gotRandomFailure' },
        
        {
            name: "list",
            kind: enyo.VirtualList,
            flex: 1, 
        	onSetupRow: "setupRow",
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
    ],

	create: function() {
		this.data = [];
		this.inherited(arguments);
	},

	loadData: function(inSender) {
		this.$.udRandom.call();
		this.owner.showSpinner(true);
	},

	setupRow: function(inSender, inIndex) {
		var record = this.data[inIndex];
		if (record) {
			this.$['item-word'].setContent(record.word);
			this.$['item-definition'].setContent(record.definition);
			this.$['item-thumbs_up'].setContent(record.thumbs_up);
			this.$['item-thumbs_down'].setContent(record.thumbs_down);
			return true;
		} else {
			return false;
		}
	},
    gotRandomResults: function(inSender, inResponse, inRequest) {
		this.data = inResponse.list;
		this.owner.showSpinner(false);
		this.$.list.refresh();
    },
    gotRandomFailure: function(inSender, inResponse, inRequest) {
        // stuff
        this.owner.showSpinner(false);
    },
	itemClick: function(inSender, inEvent, inIndex) {
		var row = this.data[inIndex];
        this.owner.showDefinition(row);
	}

});