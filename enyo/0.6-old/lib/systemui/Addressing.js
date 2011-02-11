/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Addressing",
	kind: enyo.Control,
	published: {
		propName: "emails", // eg. phoneNumbers, ims...
		hint: "",
		offsetBottom: 52,
		inputType: "email"
	},
	events: {
		onGetPropValue: ""
	},
	chrome: [
		{name: "client", kind: "FancierInput", insetClass: "", onkeyup: "inputKeyup"},
		{name: "list", kind: "FilteredContactList", className: "enyo-addressing-list", height: "300px", width: "100%", showing: false, onItemClick: "itemClick", onGetPropValue: "doGetPropValue", onFormatData: "formatListData"}
	],
	create: function() {
		this.inherited(arguments);
		this.setDefaultData(this.defaultData);
		this.hintChanged();
		this.propNameChanged();
		this.inputTypeChanged();
		this.offsetBottomChanged();
	},
	getValue: function() {
		return this.$.client.getValue();
	},
	setValue: function(inValue) {
		this.$.client.setValue(inValue);
	},
	inputTypeChanged: function() {
		this.$.client.setInputType(this.inputType);
	},
	propNameChanged: function() {
		this.$.list.setPropName(this.propName);
	},
	hintChanged: function() {
		this.$.client.setHint(this.hint);
	},
	offsetBottomChanged: function() {
		this.$.list.offsetBottom = this.offsetBottom;
	},
	setDefaultData: function(inDefaultData) {
		this.$.list.defaultData = inDefaultData;
	},
	formatListData: function(inSender, inResults) {
		if (!inResults.length) {
			// to hide the top and bottom borders
			this.showList(false);
		}
		return inResults;
	},
	listShowing: function() {
		return this.$.list.showing;
	},
	showList: function(inShowing, inFilter) {
		this.$.list.setShowing(inShowing);
		enyo.dispatcher[inShowing ? "capture" : "release"](this, true);
		if (inShowing) {
			if (inFilter == undefined) {
				this.$.list.getContacts();
			} else{
				this.$.list.setFilter(inFilter);
			}
		}
	},
	toggleShowList: function(inFilter) {
		this.showList(!this.listShowing(), inFilter);
	},
	mousedownHandler: function(inSender, e) {
		if (e && e.dispatchTarget != this && !e.dispatchTarget.isDescendantOf(this)) {
			this.showList(false);
		}
	},
	inputKeyup: function(inSender, e) {
		switch (e.keyCode) {
			case 27: //ESCAPE
			case 13: //RETURN
				this.showList(false);
				break;
			default:
				this.showList(true, this.getValue());
		}
	},
	itemClick: function(inSender, inProp) {
		this.setValue(inProp[0].value);
		this.doGetPropValue(inProp[1]);
		this.showList(false);
	}
});
