var ConcordOpAttributes = require("./concord-op-attributes");

var nil = null;
var infinity = Number.MAX_VALUE;
var down = "down";
var left = "left";
var right = "right";
var up = "up";
var flatup = "flatup";
var flatdown = "flatdown";
var nodirection = "nodirection";

function ConcordOp(root, concordInstance, _cursor) {
	this._walk_up = function(context) {
		var prev = context.prev();
		if(prev.length == 0) {
			var parent = context.parents(".concord-node:first");
			if(parent.length == 1) {
				return parent;
				} else {
					return null;
					}
			} else {
				return this._last_child(prev);
				}
		};
	this._walk_down = function(context) {
		var next = context.next();
		if(next.length == 1) {
			return next;
			} else {
				var parent = context.parents(".concord-node:first");
				if(parent.length == 1) {
					return this._walk_down(parent);
					} else {
						return null;
						}
				}
		};
	this._last_child = function(context) {
		if(context.hasClass("collapsed")) {
			return context;
			}
		var outline = context.children("ol");
		if(outline.length == 0) {
			return context;
			} else {
				var lastChild = outline.children(".concord-node:last");
				if(lastChild.length == 1) {
					return this._last_child(lastChild);
				} else {
					return context;
				}
				}
		};
	this.bold = function(){
		this.saveState();
		if(this.inTextMode()){
			document.execCommand("bold");
			}else{
				this.focusCursor();
				document.execCommand("selectAll");
				document.execCommand("bold");
				document.execCommand("unselect");
				this.blurCursor();
				concordInstance.pasteBinFocus();
				}
		this.markChanged();
		};
	this.changed = function() {
		return root.data("changed") == true;
		};
	this.clearChanged = function() {
		root.data("changed", false);
		return true;
		};
	this.collapse = function(triggerCallbacks) {
		if(triggerCallbacks == undefined){
			triggerCallbacks = true;
			}
		var node = this.getCursor();
		if(node.length == 1) {
			if(triggerCallbacks){
				concordInstance.fireCallback("opCollapse", this.setCursorContext(node));
				}
			node.addClass("collapsed");
			node.find("ol").each(function() {
				if($(this).children().length > 0) {
					$(this).parent().addClass("collapsed");
					}
				});
			this.markChanged();
			}
		};
	this.copy = function(){
		if(!this.inTextMode()){
			root.data("clipboard", root.find(".selected").clone(true, true));
			}
		};
	this.countSubs = function() {
		var node = this.getCursor();
		if(node.length == 1) {
			return node.children("ol").children().size();
			}
		return 0;
		};
	this.cursorToXml = function(){
		return concordInstance.editor.opml(this.getCursor());
		};
	this.cursorToXmlSubsOnly = function(){ //8/5/13 by DW
		return concordInstance.editor.opml(this.getCursor(), true);
		};
	this.cut = function(){
		if(!this.inTextMode()){
			this.copy();
			this.deleteLine();
			}
		};
	this.deleteLine = function() {
		this.saveState();
		if(this.inTextMode()){
			var cursor = this.getCursor();
			var p = cursor.prev();
			if(p.length==0){
				p = cursor.parents(".concord-node:first");
				}
			cursor.remove();
			if(p.length==1) {
				this.setCursor(p);
				} else {
					if(root.find(".concord-node:first").length==1) {
						this.setCursor(root.find(".concord-node:first"));
						} else {
							this.wipe();
							}
					}
			}else{
				var selected = root.find(".selected");
				if(selected.length == 1) {
					var p = selected.prev();
					if(p.length==0){
						p = selected.parents(".concord-node:first");
						}
					selected.remove();
					if(p.length==1) {
						this.setCursor(p);
						} else {
							if(root.find(".concord-node:first").length==1) {
								this.setCursor(root.find(".concord-node:first"));
								} else {
									this.wipe();
									}
							}
					} else if(selected.length > 1) {
						var first = root.find(".selected:first");
						var p = first.prev();
						if(p.length==0){
							p = first.parents(".concord-node:first");
							}
						selected.each(function() {
							$(this).remove();
							});
						if(p.length==1){
							this.setCursor(p);
							}else{
								if(root.find(".concord-node:first").length==1) {
									this.setCursor(root.find(".concord-node:first"));
									} else {
										this.wipe();
										}
								}
						}
				}
		if(root.find(".concord-node").length == 0) {
			var node = this.insert("", down);
			this.setCursor(node);
			}
		this.markChanged();
		};
	this.deleteSubs = function() {
		var node = this.getCursor();
		if(node.length == 1) {
			if(node.children("ol").children().length > 0){
				this.saveState();
				node.children("ol").empty();
				}
			}
		this.markChanged();
		};
	this.demote = function() {
		var node = this.getCursor();
		var movedSiblings = false;
		if(node.nextAll().length>0){
			this.saveState();
			node.nextAll().each(function() {
				var sibling = $(this).clone(true, true);
				$(this).remove();
				sibling.appendTo(node.children("ol"));
				node.removeClass("collapsed");
				});
			concordInstance.editor.recalculateLevels(node.find(".concord-node"));
			this.markChanged();
			}
		};
	this.expand = function(triggerCallbacks) {
		if(triggerCallbacks == undefined){
			triggerCallbacks = true;
			}
		var node = this.getCursor();
		if(node.length == 1) {
			if(triggerCallbacks){
				concordInstance.fireCallback("opExpand", this.setCursorContext(node));
				}
			if(!node.hasClass("collapsed")){
				return;
				}
			node.removeClass("collapsed");
			var cursorPosition = node.offset().top;
			var cursorHeight =node.height();
			var windowPosition = $(window).scrollTop();
			var windowHeight = $(window).height();
			if( ( cursorPosition < windowPosition ) || ( (cursorPosition+cursorHeight) > (windowPosition+windowHeight) ) ){
				if(cursorPosition < windowPosition){
					$(window).scrollTop(cursorPosition);
					}else if ((cursorPosition+cursorHeight) > (windowPosition+windowHeight)){
						var lineHeight = parseInt(node.children(".concord-wrapper").children(".concord-text").css("line-height")) + 6;
						if((cursorHeight+lineHeight) < windowHeight){
							$(window).scrollTop(cursorPosition - (windowHeight-cursorHeight)+lineHeight);
							}else{
								$(window).scrollTop(cursorPosition);
								}
						}
				}
			this.markChanged();
			}
		};
	this.expandAllLevels = function() {
		var node = this.getCursor();
		if(node.length == 1) {
			node.removeClass("collapsed");
			node.find(".concord-node").removeClass("collapsed");
			}
		};
	this.focusCursor = function(){
		this.getCursor().children(".concord-wrapper").children(".concord-text").focus();
		};
	this.blurCursor = function(){
		this.getCursor().children(".concord-wrapper").children(".concord-text").blur();
		};
	this.fullCollapse = function() {
		root.find(".concord-node").each(function() {
			if($(this).children("ol").children().size() > 0) {
				$(this).addClass("collapsed");
				}
			});
		var cursor = this.getCursor();
		var topParent = cursor.parents(".concord-node:last");
		if(topParent.length == 1) {
			concordInstance.editor.select(topParent);
			}
		};
	this.fullExpand = function() {
		root.find(".concord-node").removeClass("collapsed");
		};
	this.getCursor = function(){
		if(_cursor){
			return _cursor;
			}
		return root.find(".concord-cursor:first");
		};
	this.getCursorRef = function(){
		return this.setCursorContext(this.getCursor());
		};
	this.getHeaders = function(){
		var headers = {};
		if(root.data("head")){
			headers = root.data("head");
			}
		headers["title"] = this.getTitle();
		return headers;
		},
	this.getLineText = function() {
		var node = this.getCursor();
		if(node.length == 1) {
			var text = node.children(".concord-wrapper:first").children(".concord-text:first").html();
			var textMatches = text.match(/^(.+)<br>\s*$/);
			if(textMatches){
				text = textMatches[1];
				}
			return concordInstance.editor.unescape(text);
			} else {
				return null;
				}
		};
	this.getRenderMode = function(){
		if(root.data("renderMode")!==undefined){
			return (root.data("renderMode")===true);
			}else{
				return true;
				}
		};
	this.getTitle = function() {
		return root.data("title");
		};
	this.go = function(direction, count, multiple, textMode) {
		if(count===undefined) {
			count = 1;
			}
		var cursor = this.getCursor();
		if(textMode==undefined){
			textMode = false;
			}
		this.setTextMode(textMode);
		var ableToMoveInDirection = false;
		switch(direction) {
			case up:
				for(var i = 0; i < count; i++) {
					var prev = cursor.prev();
					if(prev.length == 1) {
						cursor = prev;
						ableToMoveInDirection = true;
						}else{
							break;
							}
					}
				this.setCursor(cursor, multiple);
				break;
			case down:
				for(var i = 0; i < count; i++) {
					var next = cursor.next();
					if(next.length == 1) {
						cursor = next;
						ableToMoveInDirection = true;
						}else{
							break;
							}
					}
				this.setCursor(cursor, multiple);
				break;
			case left:
				for(var i = 0; i < count; i++) {
					var parent = cursor.parents(".concord-node:first");
					if(parent.length == 1) {
						cursor = parent;
						ableToMoveInDirection = true;
						}else{
							break;
							}
					}
				this.setCursor(cursor, multiple);
				break;
			case right:
				for(var i = 0; i < count; i++) {
					var firstSibling = cursor.children("ol").children(".concord-node:first");
					if(firstSibling.length == 1) {
						cursor = firstSibling;
						ableToMoveInDirection = true;
						}else{
							break;
							}
					}
				this.setCursor(cursor, multiple);
				break;
			case flatup:
				var nodeCount = 0;
				while(cursor && (nodeCount < count)) {
					var cursor = this._walk_up(cursor);
					if(cursor) {
						if(!cursor.hasClass("collapsed") && (cursor.children("ol").children().size() > 0)) {
							nodeCount++;
							ableToMoveInDirection = true;
							if(nodeCount == count) {
								this.setCursor(cursor, multiple);
								break;
							}
						}
					}
				}
				break;
			case flatdown:
				var nodeCount = 0;
				while(cursor && (nodeCount < count)) {
					var next = null;
					if(!cursor.hasClass("collapsed")) {
						var outline = cursor.children("ol");
						if(outline.length == 1) {
							var firstChild = outline.children(".concord-node:first");
							if(firstChild.length == 1) {
								next = firstChild;
								}
							}
						}
					if(!next) {
						next = this._walk_down(cursor);
						}
					cursor = next;
					if(cursor) {
						if(!cursor.hasClass("collapsed") && (cursor.children("ol").children().size() > 0)) {
							nodeCount++;
							ableToMoveInDirection = true;
							if(nodeCount == count) {
								this.setCursor(cursor, multiple);
								}
							}
						}
					}
				break;
			}
		this.markChanged();
		return ableToMoveInDirection;
		};
	this.insert = function(insertText, insertDirection) {
		this.saveState();
		var level = this.getCursor().parents(".concord-node").length+1;
		var node = $("<li></li>");
		node.addClass("concord-node");
		switch(insertDirection){
			case right:
				level+=1;
				break;
			case left:
				level-=1;
				break;
			}
		node.addClass("concord-level-"+level);
		var wrapper = $("<div class='concord-wrapper'></div>");
		var iconName="caret-right";
		var icon = "<i"+" class=\"node-icon icon-"+ iconName +"\"><"+"/i>";
		wrapper.append(icon);
		wrapper.addClass("type-icon");
		var text = $("<div class='concord-text' contenteditable='true'></div>");
		text.addClass("concord-level-"+level+"-text");
		var outline = $("<ol></ol>");
		text.appendTo(wrapper);
		wrapper.appendTo(node);
		outline.appendTo(node);
		if(insertText && (insertText!="")){
			text.html(concordInstance.editor.escape(insertText));
			}
		var cursor = this.getCursor();
		if(!insertDirection) {
			insertDirection = down;
			}
		switch(insertDirection) {
			case down:
				cursor.after(node);
				break;
			case right:
				cursor.children("ol").prepend(node);
				this.expand(false);
				break;
			case up:
				cursor.before(node);
				break;
			case left:
				var parent = cursor.parents(".concord-node:first");
				if(parent.length == 1) {
					parent.after(node);
					}
				break;
			}
		this.setCursor(node);
		this.markChanged();
		concordInstance.fireCallback("opInsert", this.setCursorContext(node));
		return node;
		};
	this.insertImage = function(url){
		if(this.inTextMode()){
			document.execCommand("insertImage", null, url);
			}else{
				this.insert('<img src="'+url+'">', down);
				}
		};
	this.insertText = function(text){
		var nodes = $("<ol></ol>");
		var lastLevel = 0;
		var startingline = 0;
		var startinglevel = 0;
		var lastNode = null;
		var parent = null;
		var parents = {};
		var lines = text.split("\n");
		var workflowy=true;
		var workflowyParent = null;
		var firstlinewithcontent = 0;
		for(var i = 0; i < lines.length; i++){
			var line = lines[i];
			if(!line.match(/^\s*$/)){
				firstlinewithcontent = i;
				break;
				}
			}
		if(lines.length>(firstlinewithcontent+2)){
			if((lines[firstlinewithcontent].match(/^([\t\s]*)\-.*$/)==null) && lines[firstlinewithcontent].match(/^.+$/) && (lines[firstlinewithcontent+1]=="")){
				startingline = firstlinewithcontent+2;
				var workflowyParent = concordInstance.editor.makeNode();
				workflowyParent.children(".concord-wrapper").children(".concord-text").html(lines[firstlinewithcontent]);
				}
			}
		for(var i = startingline; i < lines.length; i++){
			var line = lines[i];
			if((line!="") && !line.match(/^\s+$/) && (line.match(/^([\t\s]*)\-.*$/)==null)){
				workflowy=false;
				break;
				}
			}
		if(!workflowy){
			startingline = 0;
			workflowyParent=null;
			}
		for(var i = startingline; i < lines.length; i++){
			var line = lines[i];
			if((line!="") && !line.match(/^\s+$/)){
				var matches = line.match(/^([\t\s]*)(.+)$/);
				var node = concordInstance.editor.makeNode();
				var nodeText = concordInstance.editor.escape(matches[2]);
				if(workflowy){
					var nodeTextMatches = nodeText.match(/^([\t\s]*)\-\s*(.+)$/)
					if(nodeTextMatches!=null){
						nodeText = nodeTextMatches[2];
						}
					}
				node.children(".concord-wrapper").children(".concord-text").html(nodeText);
				var level = startinglevel;
				if(matches[1]){
					if(workflowy){
						level = (matches[1].length / 2) + startinglevel;
						}
					else {
						level = matches[1].length + startinglevel;
						}
					if(level>lastLevel){
						parents[lastLevel]=lastNode;
						parent = lastNode;
						}else if ((level>0) && (level < lastLevel)){
							parent = parents[level-1];
							}
					}
				if(parent && (level > 0)){
					parent.children("ol").append(node);
					parent.addClass("collapsed");
					}else{
						parents = {};
						nodes.append(node);
						}
				lastNode = node;
				lastLevel = level;
				}
			}
		if(workflowyParent){
			if(nodes.children().length > 0){
				workflowyParent.addClass("collapsed");
				}
			var clonedNodes = nodes.clone();
			clonedNodes.children().appendTo(workflowyParent.children("ol"));
			nodes = $("<ol></ol>");
			nodes.append(workflowyParent);
			}
		if(nodes.children().length>0){
			this.saveState();
			this.setTextMode(false);
			var cursor = this.getCursor();
			nodes.children().insertAfter(cursor);
			this.setCursor(cursor.next());
			concordInstance.root.removeData("clipboard");
			this.markChanged();
			concordInstance.editor.recalculateLevels();
			}
		},
	this.insertXml = function(opmltext,dir){
		this.saveState();
		var doc = null;
		var nodes = $("<ol></ol>");
		var cursor = this.getCursor();
		var level = cursor.parents(".concord-node").length+1;
		if(!dir){
			dir = down;
			}
		switch(dir){
			case right:
				level+=1;
				break;
			case left:
				level-=1;
				break;
			}
		if(typeof opmltext == "string") {
			doc = $($.parseXML(opmltext));
			} else {
				doc = $(opmltext);
				}
		doc.find("body").children("outline").each(function() {
			nodes.append(concordInstance.editor.build($(this), true, level));
			});
		var expansionState = doc.find("expansionState");
		if(expansionState && expansionState.text() && (expansionState.text()!="")){
			var expansionStates = expansionState.text().split(",");
			var nodeId=1;
			nodes.find(".concord-node").each(function(){
				if(expansionStates.indexOf(""+nodeId) >= 0){
					$(this).removeClass("collapsed");
					}
				nodeId++;
				});
			}
		switch(dir) {
			case down:
				nodes.children().insertAfter(cursor);
				break;
			case right:
				nodes.children().prependTo(cursor.children("ol"));
				this.expand(false);
				break;
			case up:
				nodes.children().insertBefore(cursor);
				break;
			case left:
				var parent = cursor.parents(".concord-node:first");
				if(parent.length == 1) {
					nodes.children().insertAfter(parent);
					}
				break;
			}
		this.markChanged();
		return true;
		};
	this.inTextMode = function(){
		return root.hasClass("textMode");
		};
	this.italic = function(){
		this.saveState();
		if(this.inTextMode()){
			document.execCommand("italic");
			}else{
				this.focusCursor();
				document.execCommand("selectAll");
				document.execCommand("italic");
				document.execCommand("unselect");
				this.blurCursor();
				concordInstance.pasteBinFocus();
				}
		this.markChanged();
		};
	this.level = function(){
		return this.getCursor().parents(".concord-node").length+1;
		},
	this.link = function(url){
		if(this.inTextMode()){
			if(!concord.handleEvents){
				var instance = this;
				concord.onResume(function(){
					instance.link(url);
					});
				return;
				}
			var range = concordInstance.editor.getSelection();
			if(range===undefined){
				concordInstance.editor.restoreSelection();
				}
			if(concordInstance.editor.getSelection()){
				this.saveState();
				document.execCommand("createLink", null, url);
				this.markChanged();
				}
			}
		};
	this.markChanged = function() {
		root.data("changed", true);
		if(!this.inTextMode()){
			root.find(".concord-node.dirty").removeClass("dirty");
			}
		return true;
		};
	this.paste = function(){
		if(!this.inTextMode()){
			if(root.data("clipboard")!=null){
				var pasteNodes = root.data("clipboard").clone(true,true);
				if(pasteNodes.length>0){
					this.saveState();
					root.find(".selected").removeClass("selected");
					pasteNodes.insertAfter(this.getCursor());
					this.setCursor($(pasteNodes[0]), (pasteNodes.length>1));
					this.markChanged();
					}
				}
			}
		};
	this.promote = function() {
		var node = this.getCursor();
		if(node.children("ol").children().length > 0){
			this.saveState();
			node.children("ol").children().reverse().each(function() {
				var child = $(this).clone(true, true);
				$(this).remove();
				node.after(child);
				});
			concordInstance.editor.recalculateLevels(node.parent().find(".concord-node"));
			this.markChanged();
			}
		};
	this.redraw = function(){
		var ct = 1;
		var cursorIndex = 1;
		var wasChanged = this.changed();
		root.find(".concord-node:visible").each(function(){
			if($(this).hasClass("concord-cursor")){
				cursorIndex=ct;
				return false;
				}
			ct++;
			});
		this.xmlToOutline(this.outlineToXml());
		ct=1;
		var thisOp = this;
		root.find(".concord-node:visible").each(function(){
			if(cursorIndex==ct){
				thisOp.setCursor($(this));
				return false;
				}
			ct++;
			});
		if(wasChanged){
			this.markChanged();
			}
		};
	this.reorg = function(direction, count) {
		if(count===undefined) {
			count = 1;
			}
		var ableToMoveInDirection = false;
		var cursor = this.getCursor();
		var range = undefined;
		var toMove = this.getCursor();
		var selected = root.find(".selected");
		var iteration = 1;
		if(selected.length>1){
			cursor = root.find(".selected:first");
			toMove = root.find(".selected");
			}
		switch(direction) {
			case up:
				var prev = cursor.prev();
				if(prev.length==1) {
					while(iteration < count){
						if(prev.prev().length==1){
							prev = prev.prev();
							}
						else{
							break;
							}
						iteration++;
						}
					this.saveState();
					var clonedMove = toMove.clone(true, true);
					toMove.remove();
					clonedMove.insertBefore(prev);
					ableToMoveInDirection = true;
					}
				break;
			case down:
				if(!this.inTextMode()){
					cursor = root.find(".selected:last");
					}
				var next = cursor.next();
				if(next.length==1) {
					while(iteration < count){
						if(next.next().length==1){
							next = next.next();
							}
						else{
							break;
							}
						iteration++;
						}
					this.saveState();
					var clonedMove = toMove.clone(true, true);
					toMove.remove();
					clonedMove.insertAfter(next);
					ableToMoveInDirection = true;
					}
				break;
			case left:
				var outline = cursor.parent();
				if(!outline.hasClass("concord-root")) {
					var parent = outline.parent();
					while(iteration < count){
						var parentParent = parent.parents(".concord-node:first");
						if(parentParent.length==1){
							parent = parentParent;
							}
						else{
							break;
							}
						iteration++;
						}
					this.saveState();
					var clonedMove = toMove.clone(true, true);
					toMove.remove();
					clonedMove.insertAfter(parent);
					concordInstance.editor.recalculateLevels(parent.nextAll(".concord-node"));
					ableToMoveInDirection = true;
					}
				break;
			case right:
				var prev = cursor.prev();
				if(prev.length == 1) {
					this.saveState();
					while(iteration < count){
						if(prev.children("ol").length==1){
							var prevNode = prev.children("ol").children(".concord-node:last");
							if(prevNode.length==1){
								prev = prevNode;
								}
							else{
								break;
								}
							}
						else{
							break;
							}
						iteration++;
						}
					var prevOutline = prev.children("ol");
					if(prevOutline.length == 0) {
						prevOutline = $("<ol></ol>");
						prevOutline.appendTo(prev);
						}
					var clonedMove = toMove.clone(true, true);
					toMove.remove();
					clonedMove.appendTo(prevOutline);
					prev.removeClass("collapsed");
					concordInstance.editor.recalculateLevels(prev.find(".concord-node"));
					ableToMoveInDirection = true;
					}
				break;
			}
		if(ableToMoveInDirection){
			if(this.inTextMode()){
				this.setCursor(this.getCursor());
				}
			this.markChanged();
			}
		return ableToMoveInDirection;
		};
	this.runSelection = function(){
		var value = eval (this.getLineText());
		this.deleteSubs();
		this.insert(value, "right");
		concordInstance.script.makeComment();
		this.go("left", 1);
		};
	this.saveState = function(){
		root.data("change", root.children().clone(true, true));
		root.data("changeTextMode", this.inTextMode());
		if(this.inTextMode()){
			var range = concordInstance.editor.getSelection();
			if( range){
				root.data("changeRange",range.cloneRange());
				}else{
					root.data("changeRange", undefined);
					}
			}else{
				root.data("changeRange", undefined);
				}
		return true;
		};
	this.setCursor = function(node, multiple, multipleRange){
		root.find(".concord-cursor").removeClass("concord-cursor");
		node.addClass("concord-cursor");
		if(this.inTextMode()){
			concordInstance.editor.edit(node);
			}else{
				concordInstance.editor.select(node, multiple, multipleRange);
				concordInstance.pasteBinFocus();
				}
		concordInstance.fireCallback("opCursorMoved", this.setCursorContext(node));
		concordInstance.editor.hideContextMenu();
		};
	this.setCursorContext = function(cursor){
		return new ConcordOp(root,concordInstance,cursor);
		};
	this.setHeaders = function(headers){
		root.data("head", headers);
		this.markChanged();
		},
	this.setLineText = function(text) {
		this.saveState();
		var node = this.getCursor();
		if(node.length == 1) {
			node.children(".concord-wrapper:first").children(".concord-text:first").html(concordInstance.editor.escape(text));
			return true;
			} else {
				return false;
				}
		this.markChanged();
		};
	this.setRenderMode = function(mode){
		root.data("renderMode", mode);
		this.redraw();
		return true;
		};
	this.setStyle = function(css){
		root.parent().find("style.customStyle").remove();
		root.before('<style type="text/css" class="customStyle">'+ css + '</style>');
		return true;
		};
	this.setTextMode = function(textMode){
		var readonly = concordInstance.prefs()["readonly"];
		if(readonly==undefined){
			readonly = false;
			}
		if(readonly){
			return;
			}
		if(root.hasClass("textMode") == textMode){
			return;
			}
		if(textMode==true){
			root.addClass("textMode");
			concordInstance.editor.editorMode();
			concordInstance.editor.edit(this.getCursor());
			}else{
				root.removeClass("textMode");
				root.find(".editing").removeClass("editing");
				this.blurCursor();
				concordInstance.editor.select(this.getCursor());
				}
		};
	this.setTitle = function(title) {
		root.data("title", title);
		return true;
		};
	this.strikethrough = function(){
		this.saveState();
		if(this.inTextMode()){
			document.execCommand("strikeThrough");
			}else{
				this.focusCursor();
				document.execCommand("selectAll");
				document.execCommand("strikeThrough");
				document.execCommand("unselect");
				this.blurCursor();
				concordInstance.pasteBinFocus();
				}
		this.markChanged();
		};
	this.subsExpanded = function() {
		var node = this.getCursor();
		if(node.length == 1) {
			if(!node.hasClass("collapsed") && (node.children("ol").children().size() > 0)) {
				return true;
				} else {
					return false;
					}
			}
		return false;
		};
	this.outlineToText = function(){
		var text = "";
		root.children(".concord-node").each(function() {
			text+= concordInstance.editor.textLine($(this));
			});
		return text;
		};
	this.outlineToXml = function(ownerName, ownerEmail, ownerId) {
		var head = this.getHeaders();
		if(ownerName) {
			head["ownerName"] = ownerName;
			}
		if(ownerEmail) {
			head["ownerEmail"] = ownerEmail;
			}
		if(ownerId) {
			head["ownerId"] = ownerId;
			}
		var title = this.getTitle();
		if(!title) {
			title = "";
			}
		head["title"] = title;
		head["dateModified"] = (new Date()).toGMTString();
		var expansionStates = [];
		var nodeId = 1;
		var cursor = root.find(".concord-node:first");
		do {
			if(cursor) {
				if(!cursor.hasClass("collapsed") && (cursor.children("ol").children().size() > 0)) {
					expansionStates.push(nodeId);
					}
				nodeId++;
				}else{
					break;
					}
			var next = null;
			if(!cursor.hasClass("collapsed")) {
				var outline = cursor.children("ol");
				if(outline.length == 1) {
					var firstChild = outline.children(".concord-node:first");
					if(firstChild.length == 1) {
						next = firstChild;
						}
					}
				}
			if(!next) {
				next = this._walk_down(cursor);
				}
			cursor = next;
			} while(cursor!=null);
		head["expansionState"] = expansionStates.join(",");
		var opml = '';
		var indent=0;
		var add = function(s){
			for(var i = 0; i < indent; i++){
				opml+='\t';
				}
				opml+=s+'\n';
			};
		add('<?xml version="1.0"?>');
		add('<opml version="2.0">');
		indent++;
		add('<head>');
		indent++;
		for(var headName in head){
			if(head[headName]!==undefined){
				add('<'+headName+'>' + ConcordUtil.escapeXml(head[headName]) + '</' + headName + '>');
				}
			}
		add('</head>');
		indent--;
		add('<body>');
		indent++;
		root.children(".concord-node").each(function() {
			opml += concordInstance.editor.opmlLine($(this), indent);
			});
		add('</body>');
		indent--;
		add('</opml>');
		return opml;
		};
	this.undo = function(){
		var stateBeforeChange = root.children().clone(true, true);
		var textModeBeforeChange = this.inTextMode();
		var beforeRange = undefined;
		if(this.inTextMode()){
			var range = concordInstance.editor.getSelection();
			if(range){
				beforeRange = range.cloneRange();
				}
			}
		if(root.data("change")){
			root.empty();
			root.data("change").appendTo(root);
			this.setTextMode(root.data("changeTextMode"));
			if(this.inTextMode()){
				this.focusCursor();
				var range = root.data("changeRange");
				if(range){
					concordInstance.editor.restoreSelection(range);
					}
				}
			root.data("change", stateBeforeChange);
			root.data("changeTextMode", textModeBeforeChange);
			root.data("changeRange", beforeRange);
			return true;
			}
		return false;
		};
	this.visitLevel = function(cb){
		var cursor = this.getCursor();
		var op = this;
		cursor.children("ol").children().each(function(){
			var subCursorContext = op.setCursorContext($(this));
			cb(subCursorContext);
			});
		return true;
		};
	this.visitToSummit = function(cb){
		var cursor = this.getCursor();
		while(cb(this.setCursorContext(cursor))){
			var parent = cursor.parents(".concord-node:first");
			if(parent.length==1){
				cursor=parent;
				}else{
					break;
					}
			}
		return true;
		};
	this.visitAll = function(cb){
		var op = this;
		root.find(".concord-node").each(function(){
			var subCursorContext = op.setCursorContext($(this));
			var retVal = cb(subCursorContext);
			if((retVal!==undefined) && (retVal===false)){
				return false;
				}
			});
		},
	this.wipe = function() {
		if(root.find(".concord-node").length > 0){
			this.saveState();
			}
		root.empty();
		var node = concordInstance.editor.makeNode();
		root.append(node);
		this.setTextMode(false);
		this.setCursor(node);
		this.markChanged();
		};
	this.xmlToOutline = function(xmlText, flSetFocus) { //2/22/14 by DW -- new param, flSetFocus
		
		if (flSetFocus == undefined) { //2/22/14 by DW
			flSetFocus = true;
			}
		
		var doc = null;
		if(typeof xmlText == "string") {
			doc = $($.parseXML(xmlText));
			} else {
				doc = $(xmlText);
				}
		root.empty();
		var title = "";
		if(doc.find("title:first").length==1){
			title = doc.find("title:first").text();
			}
		this.setTitle(title);
		var headers = {};
		doc.find("head").children().each(function(){
			headers[$(this).prop("tagName")] = $(this).text();
			});
		root.data("head", headers);
		doc.find("body").children("outline").each(function() {
			root.append(concordInstance.editor.build($(this), true));
			});
		root.data("changed", false);
		root.removeData("previousChange");
		var expansionState = doc.find("expansionState");
		if(expansionState && expansionState.text() && (expansionState.text()!="")){
			var expansionStates = expansionState.text().split(/\s*,\s*/);
			var nodeId = 1;
			var cursor = root.find(".concord-node:first");
			do {
				if(cursor) {
					if(expansionStates.indexOf(""+nodeId) >= 0){
						cursor.removeClass("collapsed");
						}
					nodeId++;
					}else{
						break;
						}
				var next = null;
				if(!cursor.hasClass("collapsed")) {
					var outline = cursor.children("ol");
					if(outline.length == 1) {
						var firstChild = outline.children(".concord-node:first");
						if(firstChild.length == 1) {
							next = firstChild;
							}
						}
					}
				if(!next) {
					next = this._walk_down(cursor);
					}
				cursor = next;
				} while(cursor!=null);
			}
		this.setTextMode(false);
		
		if (flSetFocus) {
			this.setCursor(root.find(".concord-node:first"));
			}
		
		root.data("currentChange", root.children().clone(true, true));
		return true;
		};
	this.attributes = new ConcordOpAttributes(concordInstance, this.getCursor());
	}

module.exports = ConcordOp;
