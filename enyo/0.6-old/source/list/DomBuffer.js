/* Enyo JavaScript framework -- Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.DomBuffer",
	kind: enyo.Buffer,
	rowsPerPage: 3,
	lastPage: 0,
	//* @protected
	constructor: function() {
		this.inherited(arguments);
		this.pool = [];
	},
	generateRows: function(inPage) {
		var h = [];
		var ri = this.rowsPerPage * inPage;
		for (var i=0, r; i<this.rowsPerPage; i++, ri++) {
			r = "";
			if (false) {
				if (ri >= 0 && ri < 200) {
					r = '<div id="canonVirtualList_list_list_client" rowindex="0"><div class="enyo-item item" id="canonVirtualList_item"><div id="canonVirtualList_hFlexBox" class="enyo-hflexbox" style="-webkit-box-pack:start;-webkit-box-align:stretch;"><div id="canonVirtualList_itemColor" class="item-color"></div><div id="canonVirtualList_itemName" style="-webkit-box-flex:1;width:0px;">Rose Lucas</div><div id="canonVirtualList_itemIndex" class="item-index">(' + ri + ')</div></div><div id="canonVirtualList_itemSubject" class="item-subject">Uxumplo acriss buon lurgo griut. </div></div></div>'
				} 
			} else {
				r = this.generateRow(ri);
			}
			if (r) {
				h.push(r);
			}
		}
		if (!h.length) {
			return false;
		}
		return h.join('');
	},
	preparePage: function(inPage) {
		//this.log(inPage);
		var div = this.pages[inPage] = this.pages[inPage] || (this.pool.length ? this.pool.pop() : document.createElement('div'));
		div.style.display = "none";
		div.className = "page";
		div.id = "page-" + inPage;
		return div;
	},
	installPage: function(inNode, inPage) {
		if (!inNode.parentNode) {
			var parentNode = this.pagesNode;
			if (inPage < this.bottom) {
				parentNode.insertBefore(inNode, parentNode.firstChild);
			} else {
				parentNode.appendChild(inNode);
			}
		}
	},
	//* @public
	acquirePage: function(inPage) {
		//this.log(inPage);
		var h = this.generateRows(inPage);
		if (h === false) {
			return false;
		}
		var node = this.preparePage(inPage);
		node.innerHTML = h;
		this.installPage(node, inPage);
	},
	discardPage: function(inPage) {
		//this.log(inPage);
		var n = this.pages[inPage];
		if (!n) {
			enyo.vizLog && enyo.vizLog.log("DomBuffer.discardPage: bad page: " + inPage + " " + this.top + "/" + this.bottom, "background-color: orange;");
			this.warn("bad page:", inPage);
		} else {
			n.parentNode.removeChild(n);
			this.pool.push(n);
			this.pages[inPage] = null;
		}
	}
});
