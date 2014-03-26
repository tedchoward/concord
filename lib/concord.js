var ConcordOutline = require("./concord-outline");
var $ = require("jquery/dist/jquery");

var concord = {
	version: "3.0.0",
	mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
	ready: false,
	handleEvents: true,
	resumeCallbacks: [],
	onResume: function(cb){
		this.resumeCallbacks.push(cb);
		},
	resumeListening: function(){
		if(!this.handleEvents){
			this.handleEvents=true;
			var r = this.getFocusRoot();
			if(r!=null){
				var c = new ConcordOutline(r.parent(), null, concord);
				if(c.op.inTextMode()){
					c.op.focusCursor();
					c.editor.restoreSelection();
					}else{
						c.pasteBinFocus();
						}
				for(var i in this.resumeCallbacks){
					var cb = this.resumeCallbacks[i];
					cb();
					}
				this.resumeCallbacks=[];
				}
			}
		},
	stopListening: function(){
		if(this.handleEvents){
			this.handleEvents=false;
			var r = this.getFocusRoot();
			if(r!=null){
				var c = new ConcordOutline(r.parent(), null, concord);
				if(c.op.inTextMode()){
					c.editor.saveSelection();
					}
				}
			}
		},
	focusRoot: null,
	getFocusRoot: function(){
		if($(".concord-root:visible").length==1){
			return this.setFocusRoot($(".concord-root:visible:first"));
			}
		if($(".modal").is(":visible")){
			if($(".modal").find(".concord-root:visible:first").length==1){
				return this.setFocusRoot($(".modal").find(".concord-root:visible:first"));
				}
			}
		if(this.focusRoot==null){
			if($(".concord-root:visible").length>0){
				return this.setFocusRoot($(".concord-root:visible:first"));
				}else{
					return null;
					}
			}
		if(!this.focusRoot.is(":visible")){
			return this.setFocusRoot($(".concord-root:visible:first"));
			}
		return this.focusRoot;
		},
	setFocusRoot: function(root){
		var origRoot = this.focusRoot;
		var concordInstance = new ConcordOutline(root.parent(), null, concord);
		if((origRoot!=null) && !(origRoot[0]===root[0])){
			var origConcordInstance = new ConcordOutline(origRoot.parent(), null, concord);
			origConcordInstance.editor.hideContextMenu();
			origConcordInstance.editor.dragModeExit();
			if(concordInstance.op.inTextMode()){
				concordInstance.op.focusCursor();
				}
			else {
				concordInstance.pasteBinFocus();
				}
			}
		this.focusRoot = root;
		return this.focusRoot;
		},
	updateFocusRootEvent: function(event){
		var root = $(event.target).parents(".concord-root:first");
		if(root.length==1){
			concord.setFocusRoot(root);
			}
		}
	};

module.exports = concord;
