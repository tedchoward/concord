(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require("./lib/index");

},{"./lib/index":10}],2:[function(require,module,exports){
function ConcordEditor(root, concordInstance) {
	this.makeNode = function(){
		var node = $("<li></li>");
		node.addClass("concord-node");
		var wrapper = $("<div class='concord-wrapper'></div>");
		var iconName="caret-right";
		var icon = "<i"+" class=\"node-icon icon-"+ iconName +"\"><"+"/i>";
		wrapper.append(icon);
		wrapper.addClass("type-icon");
		var text = $("<div class='concord-text' contenteditable='true'></div>");
		var outline = $("<ol></ol>");
		text.appendTo(wrapper);
		wrapper.appendTo(node);
		outline.appendTo(node);
		return node;
		};
	this.dragMode = function() {
		root.data("draggingChange", root.children().clone(true, true));
		root.addClass("dragging");
		root.data("dragging", true);
		};
	this.dragModeExit = function() {
		if(root.data("dragging")) {
			concordInstance.op.markChanged();
			root.data("change", root.data("draggingChange"));
			root.data("changeTextMode", false);
			root.data("changeRange", undefined);
			}
		root.find(".draggable").removeClass("draggable");
		root.find(".drop-sibling").removeClass("drop-sibling");
		root.find(".drop-child").removeClass("drop-child");
		root.removeClass("dragging");
		root.data("dragging", false);
		root.data("mousedown", false);
		};
	this.edit = function(node, empty) {
		var text = node.children(".concord-wrapper:first").children(".concord-text:first");
		if(empty) {
			text.html("");
			}
		text.focus();
		var el = text.get(0);
		if(el && el.childNodes && el.childNodes[0]){
			if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
				        var range = document.createRange();
				        range.selectNodeContents(el);
				        range.collapse(false);
				        var sel = window.getSelection();
				        sel.removeAllRanges();
				        sel.addRange(range);
				    } else if (typeof document.body.createTextRange != "undefined") {
					var textRange = document.body.createTextRange();
					textRange.moveToElementText(el);
					textRange.collapse(false);
					        textRange.select();
				    }
			}
		text.addClass("editing");
		if(!empty){
			if(root.find(".concord-node.dirty").length>0){
				concordInstance.op.markChanged();
				}
			}
		};
	this.editable = function(target) {
		var editable = false;
		if(!target.hasClass("concord-text")) {
			target = target.parents(".concord-text:first");
			}
		if(target.length == 1) {
			editable = target.hasClass("concord-text") && target.hasClass("editing");
			}
		return editable;
		};
	this.editorMode = function() {
		root.find(".selected").removeClass("selected");
		root.find(".editing").each(function() {
			//$(this).blur();
			$(this).removeClass("editing");
			});
		root.find(".selection-toolbar").remove();
		};
	this.opml = function(_root, flsubsonly) {
		
		if (flsubsonly == undefined) { //8/5/13 by DW
			flsubsonly = false;
			}
		
		if(_root) {
			root = _root;
			}
		var title = root.data("title");
		if(!title) {
			if(root.hasClass("concord-node")) {
				title = root.children(".concord-wrapper:first").children(".concord-text:first").text();
				}
			else {
				title = "";
				}
			}
		var opml = '<?xml version="1.0"?>\n';
		opml += '<opml version="2.0">\n';
		opml += '<head>\n';
		opml += '<title>' + ConcordUtil.escapeXml(title) + '</title>\n';
		opml += '</head>\n';
		opml += '<body>\n';
		if(root.hasClass("concord-cursor")) {
			opml += this.opmlLine(root, 0, flsubsonly);
			} else {
				var editor = this;
				root.children(".concord-node").each(function() {
					opml += editor.opmlLine($(this));
					});
				}
		opml += '</body>\n';
		opml += '</opml>\n';
		return opml;
		};
	this.opmlLine = function(node, indent, flsubsonly) {
		if(indent==undefined){
			indent=0;
			}
		
		if (flsubsonly == undefined) { //8/5/13 by DW
			flsubsonly = false;
			}
		
		var text = this.unescape(node.children(".concord-wrapper:first").children(".concord-text:first").html());
		var textMatches = text.match(/^(.+)<br>\s*$/);
		if(textMatches){
			text = textMatches[1];
			}
		var opml = '';
		for(var i=0; i < indent;i++){
			opml += '\t';
			}
		
		var subheads; 
		if (!flsubsonly) { //8/5/13 by DW
			opml += '<outline text="' + ConcordUtil.escapeXml(text) + '"';
			var attributes = node.data("attributes");
			if(attributes===undefined){
				attributes={};
				}
			for(var name in attributes){
				if((name!==undefined) && (name!="") && (name != "text")) {
					if(attributes[name]!==undefined){
						opml += ' ' + name + '="' + ConcordUtil.escapeXml(attributes[name]) + '"';
						}
					}
				}
			subheads = node.children("ol").children(".concord-node");
			if(subheads.length==0){
				opml+="/>\n";
				return opml;
				}
			opml += ">\n";
			}
		else {
			subheads = node.children("ol").children(".concord-node");
			}
		
		var editor = this;
		indent++;
		subheads.each(function() {
			opml += editor.opmlLine($(this), indent);
			});
		
		if (!flsubsonly) { //8/5/13 by DW
			for(var i=0; i < indent;i++){
				opml += '\t';
				}
			opml += '</outline>\n';
			}
		
		return opml;
		};
	this.textLine = function(node, indent){
		if(!indent){
			indent = 0;
			}
		var text = "";
		for(var i=0; i < indent;i++){
			text += "\t";
			}
		text += this.unescape(node.children(".concord-wrapper:first").children(".concord-text:first").html());
		text += "\n";
		var editor = this;
		node.children("ol").children(".concord-node").each(function() {
			text += editor.textLine($(this), indent+1);
			});
		return text;
		};
	this.select = function(node, multiple, multipleRange) {
		if(multiple == undefined) {
			multiple = false;
			}
		if(multipleRange == undefined) {
			multipleRange = false;
			}
		if(node.length == 1) {
			this.selectionMode(multiple);
			if(multiple){
				node.parents(".concord-node.selected").removeClass("selected");
				node.find(".concord-node.selected").removeClass("selected");
				}
			if(multiple && multipleRange) {
				var prevNodes = node.prevAll(".selected");
				if(prevNodes.length > 0) {
					var stamp = false;
					node.prevAll().reverse().each(function() {
						if($(this).hasClass("selected")) {
							stamp = true;
							} else if(stamp) {
								$(this).addClass("selected");
								}
						});
					} else {
						var nextNodes = node.nextAll(".selected");
						if(nextNodes.length > 0) {
							var stamp = true;
							node.nextAll().each(function() {
								if($(this).hasClass("selected")) {
									stamp = false;
									} else if(stamp) {
										$(this).addClass("selected");
										}
								});
							}
						}
				}
			var text = node.children(".concord-wrapper:first").children(".concord-text:first");
			if(text.hasClass("editing")) {
				text.removeClass("editing");
				}
			//text.blur();
			node.addClass("selected");
			if(text.text().length>0){
				//root.data("currentChange", root.children().clone());
				}
			this.dragModeExit();
			}
		if(root.find(".concord-node.dirty").length>0){
			concordInstance.op.markChanged();
			}
		};
	this.selectionMode = function(multiple) {
		if(multiple == undefined) {
			multiple = false;
			}
		var node = root.find(".concord-cursor");
		if(node.length == 1) {
			var text = node.children(".concord-wrapper:first").children(".concord-text:first");
			if(text.length == 1) {
				//text.blur();
				}
			}
		if(!multiple) {
			root.find(".selected").removeClass("selected");
			}
		root.find(".selection-toolbar").remove();
		};
	this.build = function(outline,collapsed, level) {
		if(!level){
			level = 1;
			}
		var node = $("<li></li>");
		node.addClass("concord-node");
		node.addClass("concord-level-"+level);
		var attributes = {};
		$(outline[0].attributes).each(function() {
			if(this.name != 'text') {
				attributes[this.name] = this.value;
				if(this.name=="type"){
					node.attr("opml-" + this.name, this.value);
					}
				}
			});
		node.data("attributes", attributes);
		var wrapper = $("<div class='concord-wrapper'></div>");
		var nodeIcon = attributes["icon"];
		if(!nodeIcon){
			nodeIcon = attributes["type"];
			}
		var iconName="caret-right";
		if(nodeIcon){
			if((nodeIcon==node.attr("opml-type")) && concordInstance.prefs() && concordInstance.prefs().typeIcons && concordInstance.prefs().typeIcons[nodeIcon]){
				iconName = concordInstance.prefs().typeIcons[nodeIcon];
				}else if (nodeIcon==attributes["icon"]){
					iconName = nodeIcon;
					}
			}
		var icon = "<i"+" class=\"node-icon icon-"+ iconName +"\"><"+"/i>";
		wrapper.append(icon);
		wrapper.addClass("type-icon");
		if(attributes["isComment"]=="true"){
			node.addClass("concord-comment");
			}
		var text = $("<div class='concord-text' contenteditable='true'></div>");
		text.addClass("concord-level-"+level+"-text");
		text.html(this.escape(outline.attr('text')));
		if(attributes["cssTextClass"]!==undefined){
			var cssClasses = attributes["cssTextClass"].split(/\s+/);
			for(var c in cssClasses){
				var newClass = cssClasses[c];
				text.addClass(newClass);
				}
			}
		var children = $("<ol></ol>");
		var editor = this;
		outline.children("outline").each(function() {
			var child = editor.build($(this), collapsed, level+1);
			child.appendTo(children);
			});
		if(collapsed){
			if(outline.children("outline").size()>0){
				node.addClass("collapsed");
				}
			}
		text.appendTo(wrapper);
		wrapper.appendTo(node);
		children.appendTo(node);
		return node;
		};
	this.hideContextMenu = function(){
		if(root.data("dropdown")){
			root.data("dropdown").hide();
			root.data("dropdown").remove();
			root.removeData("dropdown");
			}
		};
	this.showContextMenu = function(x,y){
		if(concordInstance.prefs().contextMenu){
			this.hideContextMenu();
			root.data("dropdown", $(concordInstance.prefs().contextMenu).clone().appendTo(concordInstance.container));
			var editor = this;
			root.data("dropdown").on("click", "a", function(event){
				editor.hideContextMenu();
				});
			root.data("dropdown").css({"position" : "absolute", "top" : y +"px", "left" : x + "px", "cursor" : "default"});
			root.data("dropdown").show();
			}
		};
	this.sanitize = function(){
		var editor = this;
		root.find(".concord-text.paste").each(function(){
			var concordText = $(this);
			if(concordInstance.pasteBin.text()=="..."){
				return;
				}
			var h = concordInstance.pasteBin.html();
			h = h.replace(new RegExp("<(div|p|blockquote|pre|li|br|dd|dt|code|h\\d)[^>]*(/)?>","gi"),"\n");
			h = $("<div/>").html(h).text();
			var clipboardMatch = false;
			if(concordClipboard !== undefined){
				var trimmedClipboardText = concordClipboard.text.replace(/^[\s\r\n]+|[\s\r\n]+$/g,'');
				var trimmedPasteText = h.replace(/^[\s\r\n]+|[\s\r\n]+$/g,'');
				if(trimmedClipboardText==trimmedPasteText){
					var clipboardNodes = concordClipboard.data;
					if(clipboardNodes){
						var collapseNode = function(node){
							node.find("ol").each(function() {
								if($(this).children().length > 0) {
									$(this).parent().addClass("collapsed");
									}
								});
							};
						clipboardNodes.each(function(){
							collapseNode($(this));
							});
						root.data("clipboard", clipboardNodes);
						concordInstance.op.setTextMode(false);
						concordInstance.op.paste();
						clipboardMatch = true;
						}
					}
				}
			if(!clipboardMatch){
				concordClipboard = undefined;
				var numberoflines = 0;
				var lines = h.split("\n");
				for(var i = 0; i < lines.length; i++){
					var line = lines[i];
					if((line!="") && !line.match(/^\s+$/)){
						numberoflines++;
						}
					}
				if(!concordInstance.op.inTextMode() || (numberoflines > 1)){
					concordInstance.op.insertText(h);
					}else{
						concordInstance.op.saveState();
						concordText.focus();
						var range = concordText.parents(".concord-node:first").data("range");
						if(range){
							try{
								var sel = window.getSelection();
								sel.removeAllRanges();
								sel.addRange(range);
								}
							catch(e){
								console.log(e);
								}
							finally {
								concordText.parents(".concord-node:first").removeData("range");
								}
							}
						document.execCommand("insertText",null,h);
						concordInstance.root.removeData("clipboard");
						concordInstance.op.markChanged();
						}
				}
			concordText.removeClass("paste");
			});
		};
	this.escape = function(s){
		var h = $("<div/>").text(s).html();
		h = h.replace(/\u00A0/g, " ");
		if(concordInstance.op.getRenderMode()){ // Render HTML if op.getRenderMode() returns true - 2/17/13 by KS
			var allowedTags = ["b","strong","i","em","a","img","strike","del"];
			for(var tagIndex in allowedTags){
				var tag = allowedTags[tagIndex];
				if (tag == "img"){
					h = h.replace(new RegExp("&lt;"+tag+"((?!&gt;).+)(/)?&gt;","gi"),"<"+tag+"$1"+"/>");
					}
				else if (tag=="a"){
					h = h.replace(new RegExp("&lt;"+tag+"((?!&gt;).*?)&gt;((?!&lt;/"+tag+"&gt;).+?)&lt;/"+tag+"&gt;","gi"),"<"+tag+"$1"+">$2"+"<"+"/"+tag+">");
					}
				else {
					h = h.replace(new RegExp("&lt;"+tag+"&gt;((?!&lt;/"+tag+"&gt;).+?)&lt;/"+tag+"&gt;","gi"),"<"+tag+">$1"+"<"+"/"+tag+">");
					}
				}
			}
		return h;
		};
	this.unescape = function(s){
		var h = s.replace(/</g,"&lt;").replace(/>/g,"&gt;");
		h = $("<div/>").html(h).text();
		return h;
		};
	this.getSelection = function(){
		var range = undefined;
		if(window.getSelection){
			sel = window.getSelection();
			if(sel.getRangeAt && sel.rangeCount){
				range = sel.getRangeAt(0);
				if($(range.startContainer).parents(".concord-node:first").length==0){
					range = undefined;
					}
				}
			}
		return range;
		};
	this.saveSelection = function(){
		var range = this.getSelection();
		if(range !== undefined){
			concordInstance.op.getCursor().data("range", range.cloneRange());
			}
		return range;
		};
	this.restoreSelection = function(range){
		var cursor = concordInstance.op.getCursor();
		if(range===undefined){
			range = cursor.data("range");
			}
		if(range !== undefined){
			if(window.getSelection){
				var concordText = cursor.children(".concord-wrapper").children(".concord-text");
				try{
					var cloneRanger = range.cloneRange();
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(cloneRanger);
					}
				catch(e){
					console.log(e);
					}
				finally {
					cursor.removeData("range");
					}
				}
			}
		return range;
		};
	this.recalculateLevels = function(context){
		if(!context){
			context = root.find(".concord-node");
			}
		context.each(function(){
			var text = $(this).children(".concord-wrapper").children(".concord-text");
			var levelMatch = $(this).attr("class").match(/.*concord-level-(\d+).*/);
			if(levelMatch){
				$(this).removeClass("concord-level-"+levelMatch[1]);
				text.removeClass("concord-level-"+levelMatch[1]+"-text");
				}
			var level = $(this).parents(".concord-node").length+1;
			$(this).addClass("concord-level-"+level);
			text.addClass("concord-level-"+level+"-text");
			});
		};
	}

module.exports = ConcordEditor;

},{}],3:[function(require,module,exports){
var concord = require("./concord");

function ConcordEvents(root, editor, op, concordInstance) {
	var instance = this;
	this.wrapperDoubleClick = function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(root.data("dropdown")){
			editor.hideContextMenu();
			return;
			}
		if(!editor.editable($(event.target))) {
			var wrapper = $(event.target);
			if(wrapper.hasClass("node-icon")){
				wrapper = wrapper.parent();
				}
			if(wrapper.hasClass("concord-wrapper")) {
				event.stopPropagation();
				var node = wrapper.parents(".concord-node:first");
				op.setTextMode(false);
				if(op.subsExpanded()) {
					op.collapse();
					} else {
						op.expand();
						}
				}
			}
		};
	this.clickSelect = function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(root.data("dropdown")){
			event.stopPropagation();
			editor.hideContextMenu();
			return;
			}
		if(concord.mobile){
			var node = $(event.target);
			if(concordInstance.op.getCursor()[0]===node[0]){
				instance.doubleClick(event);
				return;
				}
			}
		if((event.which==1) && !editor.editable($(event.target))) {
			var node = $(event.target);
			if(!node.hasClass("concord-node")){
				return;
				}
			if(node.length==1) {
				event.stopPropagation();
				if(event.shiftKey && (node.parents(".concord-node.selected").length>0)){
					return;
					}
				op.setTextMode(false);
				op.setCursor(node, event.shiftKey || event.metaKey, event.shiftKey);
				}
			}
		};
	this.doubleClick = function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(root.data("dropdown")){
			editor.hideContextMenu();
			return;
			}
		if(!editor.editable($(event.target))) {
			var node = $(event.target);
			if(node.hasClass("concord-node") && node.hasClass("concord-cursor")) {
				event.stopPropagation();
				op.setTextMode(false);
				op.setCursor(node);
				if(op.subsExpanded()) {
					op.collapse();
					} else {
						op.expand();
						}
				}
			}
		};
	this.wrapperClickSelect = function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(root.data("dropdown")){
			editor.hideContextMenu();
			return;
			}
		if(concord.mobile){
			var target = $(event.target);
			var node = target.parents(".concord-node:first");
			if(concordInstance.op.getCursor()[0]===node[0]){
				instance.wrapperDoubleClick(event);
				return;
				}
			}
		if((event.which==1) && !editor.editable($(event.target))) {
			var wrapper = $(event.target);
			if(wrapper.hasClass("node-icon")){
				wrapper = wrapper.parent();
				}
			if(wrapper.hasClass("concord-wrapper")) {
				var node = wrapper.parents(".concord-node:first");
				if(event.shiftKey && (node.parents(".concord-node.selected").length>0)){
					return;
					}
				op.setTextMode(false);
				op.setCursor(node, event.shiftKey || event.metaKey, event.shiftKey);
				}
			}
		};
	this.contextmenu = function(event){
		if(!concord.handleEvents){
			return;
			}
		event.preventDefault();
		event.stopPropagation();
		var node = $(event.target);
		if(node.hasClass("concord-wrapper") || node.hasClass("node-icon")){
			op.setTextMode(false);
			}
		if(!node.hasClass("concord-node")){
			node = node.parents(".concord-node:first");
			}
		concordInstance.fireCallback("opContextMenu", op.setCursorContext(node));
		op.setCursor(node);
		editor.showContextMenu(event.pageX, event.pageY);
		};
	root.on("dblclick", ".concord-wrapper", this.wrapperDoubleClick);
	root.on("dblclick", ".concord-node", this.doubleClick);
	root.on("dblclick", ".concord-text", function(event){
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			event.preventDefault();
			event.stopPropagation();
			var node = $(event.target).parents(".concord-node:first");
			op.setCursor(node);
			if(op.subsExpanded()) {
				op.collapse();
				} else {
					op.expand();
					}
			}
		});
	root.on("click", ".concord-wrapper", this.wrapperClickSelect);
	root.on("click", ".concord-node", this.clickSelect);
	root.on("mouseover", ".concord-wrapper", function(event){
		if(!concord.handleEvents){
			return;
			}
		var node = $(event.target).parents(".concord-node:first");
		concordInstance.fireCallback("opHover", op.setCursorContext(node));
		});
	if(concordInstance.prefs.contextMenu){
		root.on("contextmenu", ".concord-text", this.contextmenu);
		root.on("contextmenu", ".concord-node", this.contextmenu);
		root.on("contextmenu", ".concord-wrapper", this.contextmenu);
		}
	root.on("blur", ".concord-text", function(event){
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		if($(this).html().match(/^\s*<br>\s*$/)){
			$(this).html("");
			}
		var concordText = $(this);
		var node = $(this).parents(".concord-node:first");
		if(concordInstance.op.inTextMode()){
			editor.saveSelection();
			}
		if(concordInstance.op.inTextMode() && node.hasClass("dirty")){
			node.removeClass("dirty");
			}
		});
	root.on("paste", ".concord-text", function(event){
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		$(this).addClass("paste");
		concordInstance.editor.saveSelection();
		concordInstance.pasteBin.html("");
		concordInstance.pasteBin.focus();
		setTimeout(editor.sanitize,10);
		});
	concordInstance.pasteBin.on("copy", function(){
		if(!concord.handleEvents){
			return;
			}
		var copyText = "";
		root.find(".selected").each(function(){
			copyText+= concordInstance.editor.textLine($(this));
			});
		if((copyText!="") && (copyText!="\n")){
			concordClipboard = {text: copyText, data: root.find(".selected").clone(true, true)};
			concordInstance.pasteBin.html("<pre>"+$("<div/>").text(copyText).html()+"</pre>");
			concordInstance.pasteBin.focus();
			document.execCommand("selectAll");
			}
		});
	concordInstance.pasteBin.on("paste", function(event){
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		var concordText = concordInstance.op.getCursor().children(".concord-wrapper").children(".concord-text");
		concordText.addClass("paste");
		concordInstance.pasteBin.html("");
		setTimeout(editor.sanitize,10);
		});
	concordInstance.pasteBin.on("cut", function(){
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		var copyText = "";
		root.find(".selected").each(function(){
			copyText+= concordInstance.editor.textLine($(this));
			});
		if((copyText!="") && (copyText!="\n")){
			concordClipboard = {text: copyText, data: root.find(".selected").clone(true, true)};
			concordInstance.pasteBin.html("<pre>"+$("<div/>").text(copyText).html()+"</pre>");
			concordInstance.pasteBinFocus();
			}
		concordInstance.op.deleteLine();
		setTimeout(function(){concordInstance.pasteBinFocus()}, 200);
		});
	root.on("mousedown", function(event) {
		if(!concord.handleEvents){
			return;
			}
		var target = $(event.target);
		if(target.is("a")){
			if(target.attr("href")){
				event.preventDefault();
				window.open(target.attr("href"));
				}
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			event.preventDefault();
			var target = $(event.target);
			if(target.parents(".concord-text:first").length==1){
				target = target.parents(".concord-text:first");
				}
			if(target.hasClass("concord-text")){
				var node = target.parents(".concord-node:first");
				if(node.length==1){
					op.setCursor(node);
					}
				}
			return;
			}
		if(event.which==1) {
			if(root.data("dropdown")){
				editor.hideContextMenu();
				return;
				}
			if(target.parents(".concord-text:first").length==1){
				target = target.parents(".concord-text:first");
				}
			if(target.hasClass("concord-text")){
				var node = target.parents(".concord-node:first");
				if(node.length==1){
					if(!root.hasClass("textMode")){
						root.find(".selected").removeClass("selected");
						root.addClass("textMode");
						}
					if(node.children(".concord-wrapper").children(".concord-text").hasClass("editing")){
						root.find(".editing").removeClass("editing");
						node.children(".concord-wrapper").children(".concord-text").addClass("editing");
						}
					if(!node.hasClass("concord-cursor")){
						root.find(".concord-cursor").removeClass("concord-cursor");
						node.addClass("concord-cursor");
						concordInstance.fireCallback("opCursorMoved", op.setCursorContext(node));
						}
					}
				}else{
					event.preventDefault();
					root.data("mousedown", true);
					}
			}
		});
	root.on("mousemove", function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		if(!editor.editable($(event.target))) {
			event.preventDefault();
			if(root.data("mousedown") && !root.data("dragging")) {
				var target = $(event.target);
				if(target.hasClass("node-icon")){
					target = target.parent();
					}
				if(target.hasClass("concord-wrapper") && target.parent().hasClass("selected")) {
					editor.dragMode();
					}
				}
			}
		});
	root.on("mouseup", function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		var target = $(event.target);
		if(target.hasClass("concord-node")) {
			target = target.children(".concord-wrapper:first").children(".concord-text:first");
			} else if(target.hasClass("concord-wrapper")) {
				target = target.children(".concord-text:first");
				}
		if(!editor.editable(target)) {
			root.data("mousedown", false);
			if(root.data("dragging")) {
				var target = $(event.target);
				var node = target.parents(".concord-node:first");
				var draggable = root.find(".selected");
				if((node.length == 1) && (draggable.length >= 1)) {
					var isDraggableTarget = false;
					draggable.each(function(){
						if(this==node[0]){
							isDraggableTarget = true;
							}
						});
					if(!isDraggableTarget) {
						var draggableIsTargetParent = false;
						node.parents(".concord-node").each(function() {
							var nodeParent = $(this)[0];
							draggable.each(function(){
								if($(this)[0] == nodeParent) {
									draggableIsTargetParent = true;
									}
								});
							});
						if(!draggableIsTargetParent) {
							if(target.hasClass("concord-wrapper") || target.hasClass("node-icon")) {
								var clonedDraggable = draggable.clone(true, true);
								clonedDraggable.insertAfter(node);
								draggable.remove();
								} else {
									var clonedDraggable = draggable.clone(true, true);
									var outline = node.children("ol");
									clonedDraggable.prependTo(outline);
									node.removeClass("collapsed");
									draggable.remove();
									}
							}
						} else {
							var prev = node.prev();
							if(prev.length == 1) {
								if(prev.hasClass("drop-child")) {
									var clonedDraggable = draggable.clone(true, true);
									var outline = prev.children("ol");
									clonedDraggable.appendTo(outline);
									prev.removeClass("collapsed");
									draggable.remove();
									}
								}
							}
					}
				editor.dragModeExit();
				concordInstance.editor.recalculateLevels();
				}
			}
		});
	root.on("mouseover", function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		if(root.data("dragging")) {
			event.preventDefault();
			var target = $(event.target);
			var node = target.parents(".concord-node:first");
			var draggable = root.find(".selected");
			if((node.length == 1) && (draggable.length>=1)) {
				var isDraggableTarget = false;
				draggable.each(function(){
					if(this==node[0]){
						isDraggableTarget = true;
						}
					});
				if(!isDraggableTarget) {
					var draggableIsTargetParent = false;
					node.parents(".concord-node").each(function() {
						var nodeParent = $(this)[0];
						draggable.each(function(){
							if($(this)[0] == nodeParent) {
								draggableIsTargetParent = true;
								}
							});
						});
					if(!draggableIsTargetParent) {
						node.removeClass("drop-sibling").remove("drop-child");
						if(target.hasClass("concord-wrapper") || target.hasClass("node-icon")) {
							node.addClass("drop-sibling");
							} else {
								node.addClass("drop-child");
								}
						}
					} else if (draggable.length==1){
						var prev = node.prev();
						if(prev.length == 1) {
							prev.removeClass("drop-sibling").remove("drop-child");
							prev.addClass("drop-child");
							}
						}
				}
			}
		});
	root.on("mouseout", function(event) {
		if(!concord.handleEvents){
			return;
			}
		if(concordInstance.prefs()["readonly"]==true){
			return;
			}
		if(root.data("dragging")) {
			root.find(".drop-sibling").removeClass("drop-sibling");
			root.find(".drop-child").removeClass("drop-child");
			}
		});
	}

module.exports = ConcordEvents;

},{"./concord":9}],4:[function(require,module,exports){
function ConcordOpAttributes(concordInstance, cursor) {
	this._cssTextClassName = "cssTextClass";
	this._cssTextClass = function(newValue){
		if(newValue===undefined){
			return;
			}
		var newCssClasses = newValue.split(/\s+/);
		var concordText = cursor.children(".concord-wrapper:first").children(".concord-text:first");
		var currentCssClass = concordText.attr("class");
		if(currentCssClass){
			var cssClassesArray = currentCssClass.split(/\s+/);
			for(var i in cssClassesArray){
				var className = cssClassesArray[i];
				if(className.match(/^concord\-.+$/) == null){
					concordText.removeClass(className);
					}
				}
			}
		for(var j in newCssClasses){
			var newClass = newCssClasses[j];
			concordText.addClass(newClass);
			}
		};
	this.addGroup = function(attributes) {
		if(attributes["type"]){
			cursor.attr("opml-type", attributes["type"]);
			}
		else {
			cursor.removeAttr("opml-type");
			}
		this._cssTextClass(attributes[this._cssTextClassName]);
		var finalAttributes = this.getAll();
		var iconAttribute = "type";
		if(attributes["icon"]){
			iconAttribute = "icon";
			}
		for(var name in attributes){
			finalAttributes[name] = attributes[name];
			if(name==iconAttribute){
				var value = attributes[name];
				var wrapper = cursor.children(".concord-wrapper");
				var iconName = null;
				if((name == "type") && concordInstance.prefs() && concordInstance.prefs().typeIcons && concordInstance.prefs().typeIcons[value]){
					iconName = concordInstance.prefs().typeIcons[value];
					}else if (name=="icon"){
						iconName = value;
						}
				if(iconName){
					var icon = "<i"+" class=\"node-icon icon-"+ iconName +"\"><"+"/i>";
					wrapper.children(".node-icon:first").replaceWith(icon);
					}
				}
			}
		cursor.data("attributes", finalAttributes);
		concordInstance.op.markChanged();
		return finalAttributes;
		};
	this.setGroup = function(attributes) {
		if(attributes[this._cssTextClassName]!==undefined){
			this._cssTextClass(attributes[this._cssTextClassName]);
			}
		else {
			this._cssTextClass("");
			}
		cursor.data("attributes", attributes);
		var wrapper = cursor.children(".concord-wrapper");
		$(cursor[0].attributes).each(function() {
			var matches = this.name.match(/^opml-(.+)$/)
			if(matches) {
				var name = matches[1];
				if(!attributes[name]) {
					cursor.removeAttr(this.name);
					}
				}
			});
		var iconAttribute = "type";
		if(attributes["icon"]){
			iconAttribute = "icon";
			}
		if(name=="type"){
			cursor.attr("opml-" + name, attributes[name]);
			}
		for(var name in attributes) {
			if(name==iconAttribute){
				var value = attributes[name];
				var wrapper = cursor.children(".concord-wrapper");
				var iconName = null;
				if((name == "type") && concordInstance.prefs() && concordInstance.prefs().typeIcons && concordInstance.prefs().typeIcons[value]){
					iconName = concordInstance.prefs().typeIcons[value];
					}else if (name=="icon"){
						iconName = value;
						}
				if(iconName){
					var icon = "<i"+" class=\"node-icon icon-"+ iconName +"\"><"+"/i>";
					wrapper.children(".node-icon:first").replaceWith(icon);
					}
				}
			}
		concordInstance.op.markChanged();
		return attributes;
		};
	this.getAll = function() {
		if(cursor.data("attributes") !== undefined){
			return cursor.data("attributes");
			}
		return {};
		};
	this.getOne = function(name) {
		return this.getAll()[name];
		};
	this.makeEmpty = function() {
		this._cssTextClass("");
		var numAttributes = 0;
		var atts = this.getAll();
		if(atts !== undefined){
			for(var i in atts){
				numAttributes++;
				}
			}
		cursor.removeData("attributes");
		var removedAnyAttributes = (numAttributes > 0);
		var attributes = {};
		$(cursor[0].attributes).each(function() {
			var matches = this.name.match(/^opml-(.+)$/)
			if(matches) {
				cursor.removeAttr(this.name);
				}
			});
		if(removedAnyAttributes){
			concordInstance.op.markChanged();
			}
		return removedAnyAttributes;
		};
	this.setOne = function(name, value) {
		if(name==this._cssTextClassName){
			this._cssTextClass(value);
			}
		var atts = this.getAll();
		atts[name]=value;
		cursor.data("attributes", atts);
		if((name=="type" )|| (name=="icon")){
			cursor.attr("opml-" + name, value);
			var wrapper = cursor.children(".concord-wrapper");
			var iconName = null;
			if((name == "type") && concordInstance.prefs() && concordInstance.prefs().typeIcons && concordInstance.prefs().typeIcons[value]){
				iconName = concordInstance.prefs().typeIcons[value];
				}else if (name=="icon"){
					iconName = value;
					}
			if(iconName){
				var icon = "<i"+" class=\"node-icon icon-"+ iconName +"\"><"+"/i>";
				wrapper.children(".node-icon:first").replaceWith(icon);
				}
			}
		concordInstance.op.markChanged();
		return true;
		};
	this.exists = function(name){
		if(this.getOne(name) !== undefined){
			return true;
			}else{
				return false;
				}
		};
	this.removeOne = function(name){
		if(this.getAll()[name]){
			if(name == this._cssTextClassName){
				this._cssTextClass("");
				}
			delete this.getAll()[name];
			concordInstance.op.markChanged();
			return true;
			}
		return false;
		};
	}

module.exports = ConcordOpAttributes;

},{}],5:[function(require,module,exports){
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

},{"./concord-op-attributes":4}],6:[function(require,module,exports){
var ConcordEditor = require("./concord-editor");
var ConcordOp = require("./concord-op");
var ConcordScript = require("./concord-script");
var ConcordEvents = require("./concord-events");

function ConcordOutline(container, options, concord) {
	this.container = container;
	this.options = options;
	this.id = null;
	this.root = null;
	this.editor = null;
	this.op = null;
	this.script = null;
	this.pasteBin = null;
	this.pasteBinFocus = function(){
		if(!concord.ready){
			return;
			}
		if(concord.mobile){
			return;
			}
		if(this.root.is(":visible")){
			var node = this.op.getCursor();
			var nodeOffset = node.offset();
			this.pasteBin.offset(nodeOffset);
			this.pasteBin.css("z-index","1000");
			if((this.pasteBin.text()=="")||(this.pasteBin.text()=="\n")){
				this.pasteBin.text("...");
				}
			this.op.focusCursor();
			this.pasteBin.focus();
			if(this.pasteBin[0] === document.activeElement){
				document.execCommand("selectAll");
				}
			}
		};
	this.callbacks = function(callbacks) {
		if(callbacks) {
			this.root.data("callbacks", callbacks);
			return callbacks;
		} else {
			if(this.root.data("callbacks")) {
				return this.root.data("callbacks");
				} else {
					return {};
					}
			}
		};
	this.fireCallback = function(name, value) {
		var cb = this.callbacks()[name]
		if(cb) {
			cb(value);
			}
		};
	this.prefs = function(newprefs) {
		var prefs = this.root.data("prefs");
		if(prefs == undefined){
			prefs = {};
			}
		if(newprefs) {
			for(var key in newprefs){
				prefs[key] = newprefs[key];
				}
			this.root.data("prefs", prefs);
			if(prefs.readonly){
				this.root.addClass("readonly");
				}
			if(prefs.renderMode!==undefined){
				this.root.data("renderMode", prefs.renderMode);
				}
			if(prefs.contextMenu){
				$(prefs.contextMenu).hide();
				}
			var style = {};
			if(prefs.outlineFont) {
				style["font-family"] = prefs.outlineFont;
				}
			if(prefs.outlineFontSize) {
				prefs.outlineFontSize = parseInt(prefs.outlineFontSize);
				style["font-size"] = prefs.outlineFontSize + "px";
				style["min-height"] = (prefs.outlineFontSize + 6) + "px";
				style["line-height"] = (prefs.outlineFontSize + 6) + "px";
				}
			if(prefs.outlineLineHeight) {
				prefs.outlineLineHeight = parseInt(prefs.outlineLineHeight);
				style["min-height"] = prefs.outlineLineHeight + "px";
				style["line-height"] = prefs.outlineLineHeight + "px";
				}
			this.root.parent().find("style.prefsStyle").remove();
			var css = '<style type="text/css" class="prefsStyle">\n';
			var cssId="";
			if(this.root.parent().attr("id")){
				cssId="#"+this.root.parent().attr("id");
				}
			css += cssId + ' .concord .concord-node .concord-wrapper .concord-text {';
			for(var attribute in style) {
				css += attribute + ': ' + style[attribute] + ';';
				}
			css += '}\n';
			css += cssId + ' .concord .concord-node .concord-wrapper .node-icon {';
			for(var attribute in style) {
				if(attribute!="font-family"){
					css += attribute + ': ' + style[attribute] + ';';
					}
				}
			css += '}\n'
			var wrapperPaddingLeft = prefs.outlineLineHeight;
			if(wrapperPaddingLeft===undefined){
				wrapperPaddingLeft = prefs.outlineFontSize;
				}
			if(wrapperPaddingLeft!== undefined){
				css += cssId + ' .concord .concord-node .concord-wrapper {';
				css += "padding-left: " + wrapperPaddingLeft + "px";
				css += "}\n";
				css += cssId + ' .concord ol {';
				css += "padding-left: " + wrapperPaddingLeft + "px";
				css += "}\n";
				}
			css += '</style>\n';
			this.root.before(css);
			if(newprefs.css){
				this.op.setStyle(newprefs.css);
				}
			}
		return prefs;
		};
	this.afterInit = function() {
		this.editor = new ConcordEditor(this.root, this);
		this.op = new ConcordOp(this.root, this);
		this.script = new ConcordScript(this.root, this);
		if(options) {
			if(options.prefs) {
				this.prefs(options.prefs);
				}
			if(options.open) {
				this.root.data("open", options.open);
				}
			if(options.save) {
				this.root.data("save", options.save);
				}
			if(options.callbacks) {
				this.callbacks(options.callbacks);
				}
			if(options.id) {
				this.root.data("id", options.id);
				this.open();
				}
			}
		};
	this.init = function() {
		if($(container).find(".concord-root:first").length > 0) {
			this.root = $(container).find(".concord-root:first");
			this.pasteBin = $(container).find(".pasteBin:first");
			this.afterInit();
			return;
			}
		var root = $("<ol></ol>");
		root.addClass("concord concord-root");
		root.appendTo(container);
		this.root = root;
		var pasteBin = $('<div class="pasteBin" contenteditable="true" style="position: absolute; height: 1px; width:1px; outline:none; overflow:hidden;"></div>');
		pasteBin.appendTo(container);
		this.pasteBin = pasteBin;
		this.afterInit();
		this.events = new ConcordEvents(this.root, this.editor, this.op, this);
		};
	this["new"] = function() {
		this.op.wipe();
		};
	this.open = function(cb) {
		var opmlId = this.root.data("id");
		if(!opmlId) {
			return;
			}
		var root = this.root;
		var editor = this.editor;
		var op = this.op;
		var openUrl = "http://concord.smallpicture.com/open";
		if(root.data("open")) {
			openUrl = root.data("open");
			}
		params = {}
		if(opmlId.match(/^http.+$/)) {
			params["url"] = opmlId
			} else {
				params["id"] = opmlId
				}
		$.ajax({
			type: 'POST',
			url: openUrl,
			data: params,
			dataType: "xml",
			success: function(opml) {
				if(opml) {
					op.xmlToOutline(opml);
					if(cb) {
						cb();
						}
					}
				},
			error: function() {
				if(root.find(".concord-node").length == 0) {
					op.wipe();
					}
				}
			});
		};
	this.save = function(cb) {
		var opmlId = this.root.data("id");
		if(opmlId && this.op.changed()) {
			var saveUrl = "http://concord.smallpicture.com/save";
			if(this.root.data("save")) {
				saveUrl = this.root.data("save");
				}
			var concordInstance = this;
			var opml = this.op.outlineToXml();
			$.ajax({
				type: 'POST',
				url: saveUrl,
				data: {
					"opml": opml,
					"id": opmlId
					},
				dataType: "json",
				success: function(json) {
					concordInstance.op.clearChanged();
					if(cb) {
						cb(json);
						}
					}
				});
			}
		};
	this["import"] = function(opmlId, cb) {
		var openUrl = "http://concordold.smallpicture.com/open";
		var root = this.root;
		var concordInstance = this;
		if(root.data("open")) {
			openUrl = root.data("open");
			}
		params = {}
		if(opmlId.match(/^http.+$/)) {
			params["url"] = opmlId;
			} else {
				params["id"] = opmlId;
				}
		$.ajax({
			type: 'POST',
			url: openUrl,
			data: params,
			dataType: "xml",
			success: function(opml) {
				if(opml) {
					var cursor = root.find(".concord-cursor:first");
					$(opml).find("body").children("outline").each(function() {
						var node = concordInstance.editor.build($(this));
						cursor.after(node);
						cursor = node;
						});
					concordInstance.op.markChanged();
					if(cb) {
						cb();
						}
					}
				},
			error: function() {
				}
			});
		};
	this["export"] = function() {
		var context = this.root.find(".concord-cursor:first");
		if(context.length == 0) {
			context = this.root.find(".concord-root:first");
			}
		return this.editor.opml(context);
		};
	this.init();
	}

module.exports = ConcordOutline;

},{"./concord-editor":2,"./concord-events":3,"./concord-op":5,"./concord-script":7}],7:[function(require,module,exports){
function ConcordScript(root, concordInstance){
	this.isComment = function(){
		if(concordInstance.op.attributes.getOne("isComment")!== undefined){
			return concordInstance.op.attributes.getOne("isComment")=="true";
			}
		var parentIsAComment=false;
		concordInstance.op.getCursor().parents(".concord-node").each(function(){
			if(concordInstance.op.setCursorContext($(this)).attributes.getOne("isComment") == "true"){
				parentIsAComment = true;
				return;
				}
			});
		return parentIsAComment;
		};
	this.makeComment = function(){
		concordInstance.op.attributes.setOne("isComment", "true");
		concordInstance.op.getCursor().addClass("concord-comment");
		return true;
		};
	this.unComment = function(){
		concordInstance.op.attributes.setOne("isComment", "false");
		concordInstance.op.getCursor().removeClass("concord-comment");
		return true;
		};
	}

module.exports = ConcordScript;

},{}],8:[function(require,module,exports){
var XML_CHAR_MAP = {
  "<" : "&lt;",
  ">" : "&gt;",
  "&" : "&amp;",
  "\"": "&quot;"
};

module.exports = {
  escapeXml: function (s) {
    s = s.toString();
    s = s.replace(/\u00A0/g, " ");
    var escaped = s.replace(/[<>&"]/g, function (ch) {
      return XML_CHAR_MAP[ch];
    });

    return escaped;
  }
};

},{}],9:[function(require,module,exports){
var ConcordOutline = require("./concord-outline");

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

},{"./concord-outline":6}],10:[function(require,module,exports){
// Copyright 2013, Small Picture, Inc.
var ConcordUtil = require("./concord-util");
var concord = require("./concord");
var ConcordOutline = require("./concord-outline");
$(function () {
	if($.fn.tooltip !== undefined){
		$("a[rel=tooltip]").tooltip({
			live: true
			})
		}
	})
$(function () { 
	if($.fn.popover !== undefined){
		$("a[rel=popover]").on("mouseenter mouseleave", function(){$(this).popover("toggle")})
		}
	})
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
			}
		return -1;
		}
	}

var concordEnvironment = {
	"version" : concord.version
	};
var concordClipboard = undefined;
jQuery.fn.reverse = [].reverse;
//Constants
	var nil = null;
	var infinity = Number.MAX_VALUE;
	var down = "down";
	var left = "left";
	var right = "right";
	var up = "up";
	var flatup = "flatup";
	var flatdown = "flatdown";
	var nodirection = "nodirection";

function Op(opmltext){
	var fakeDom = $("<div></div>");
	fakeDom.concord().op.xmlToOutline(opmltext);
	return fakeDom.concord().op;
	}
(function($) {
	$.fn.concord = function(options) {
		return new ConcordOutline($(this), options, concord);
		};
	$(document).on("keydown", function(event) {
		if(!concord.handleEvents){
			return;
			}
		if($(event.target).is("input")||$(event.target).is("textarea")){
			return;
			}
		var focusRoot = concord.getFocusRoot();
		if(focusRoot==null){
			return;
			}
		var context = focusRoot;
		context.data("keydownEvent", event);
		var concordInstance = new ConcordOutline(context.parent(), null, concord);
		var readonly = concordInstance.prefs()["readonly"];
		if(readonly==undefined){
			readonly=false;
			}
		// Readonly exceptions for arrow keys and cmd-comma
		if(readonly){
			if( (event.which>=37) && (event.which <=40) ){
				readonly = false;
				}
			else if( (event.metaKey || event.ctrlKey) && (event.which==188) ){
				readonly = false;
				}
			}
		if(!readonly){
			concordInstance.fireCallback("opKeystroke", event);
			var keyCaptured = false;
			var commandKey = event.metaKey || event.ctrlKey;
			switch(event.which) {
				case 8:
					//Backspace
					if(concord.mobile){
						if((concordInstance.op.getLineText()=="") || (concordInstance.op.getLineText()=="<br>")){
							event.preventDefault();
							concordInstance.op.deleteLine();
							}
						}
					else {
						if(concordInstance.op.inTextMode()) {
							if(!concordInstance.op.getCursor().hasClass("dirty")){
								concordInstance.op.saveState();
								concordInstance.op.getCursor().addClass("dirty");
								}
							}else{
								keyCaptured = true;
								event.preventDefault();
								concordInstance.op.deleteLine();
								}
						}
					break;
				case 9:
					keyCaptured = true;
					event.preventDefault();
					event.stopPropagation();
					if(event.shiftKey) {
						concordInstance.op.reorg(left)
						} else {
							concordInstance.op.reorg(right);
							}
					break;
				case 65:
					//CMD+A
						if(commandKey) {
							keyCaptured = true;
							event.preventDefault();
							var cursor = concordInstance.op.getCursor();
							if(concordInstance.op.inTextMode()){
								concordInstance.op.focusCursor();
								document.execCommand('selectAll',false,null);
								}else{
									concordInstance.editor.selectionMode();
									cursor.parent().children().addClass("selected");
									}
							}
						break;
				case 85:
					//CMD+U
						if(commandKey) {
							keyCaptured = true;
							event.preventDefault();
							concordInstance.op.reorg(up);
							}
						break;
				case 68:
					//CMD+D
						if(commandKey) {
							keyCaptured = true;
							event.preventDefault();
							concordInstance.op.reorg(down);
						}
						break;
				case 76:
					//CMD+L
						if(commandKey) {
							keyCaptured = true;
							event.preventDefault();
							concordInstance.op.reorg(left);
							}
						break;
				case 82:
					//CMD+R
						if(commandKey) {
							keyCaptured = true;
							event.preventDefault();
							concordInstance.op.reorg(right);
							}
						break;
				case 219:
					//CMD+[
						if(commandKey) {
							keyCaptured = true;
							event.preventDefault();
							concordInstance.op.promote();
							}
						break;
				case 221:
					//CMD+]
						if(commandKey) {
							keyCaptured = true;
							event.preventDefault();
							concordInstance.op.demote();
							}
						break;
				case 13:
					if(concord.mobile){
						//Mobile
						event.preventDefault();
						keyCaptured=true;
						var cursor = concordInstance.op.getCursor();
						var clonedCursor = cursor.clone(true, true);
						clonedCursor.removeClass("concord-cursor");
						cursor.removeClass("selected");
						cursor.removeClass("dirty");
						cursor.removeClass("collapsed");
						concordInstance.op.setLineText("");
						var icon = "<i"+" class=\"node-icon icon-caret-right\"><"+"/i>";
						cursor.children(".concord-wrapper").children(".node-icon").replaceWith(icon);
						clonedCursor.insertBefore(cursor);
						concordInstance.op.attributes.makeEmpty();
						concordInstance.op.deleteSubs();
						concordInstance.op.focusCursor();
						concordInstance.fireCallback("opInsert", concordInstance.op.setCursorContext(cursor));
						}
					else{
						event.preventDefault();
						keyCaptured=true;
						if(event.originalEvent && ((event.originalEvent.keyLocation && (event.originalEvent.keyLocation != 0)) || (event.originalEvent.location && (event.originalEvent.location != 0))) ){
							concordInstance.op.setTextMode(!concordInstance.op.inTextMode());
							}else{
								var direction = down;
								if(concordInstance.op.subsExpanded()){
									direction=right;
									}
								var node = concordInstance.op.insert("", direction);
								concordInstance.op.setTextMode(true);
								concordInstance.op.focusCursor();
								}
						}
					break;
				case 37:
					// left
						var active = false;
						if($(event.target).hasClass("concord-text")) {
							if(event.target.selectionStart > 0) {
								active = false;
								}
							}
						if(context.find(".concord-cursor.selected").length == 1) {
							active = true;
							}
						if(active) {
							keyCaptured = true;
							event.preventDefault();
							var cursor = concordInstance.op.getCursor();
							var prev = concordInstance.op._walk_up(cursor);
							if(prev) {
								concordInstance.op.setCursor(prev);
								}
							}
						break;
				case 38:
					// up
						keyCaptured = true;
						event.preventDefault();
						if(concordInstance.op.inTextMode()){
							var cursor = concordInstance.op.getCursor();
							var prev = concordInstance.op._walk_up(cursor);
							if(prev) {
								concordInstance.op.setCursor(prev);
								}
							}else{
								concordInstance.op.go(up,1,event.shiftKey, concordInstance.op.inTextMode());
								}
						break;
				case 39:
					// right
						var active = false;
						if(context.find(".concord-cursor.selected").length == 1) {
							active = true;
							}
						if(active) {
							keyCaptured = true;
							event.preventDefault();
							var next = null;
							var cursor = concordInstance.op.getCursor();
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
								next = concordInstance.op._walk_down(cursor);
							}
							if(next) {
								concordInstance.op.setCursor(next);
								}
							}
						break;
				case 40:
					// down
						keyCaptured = true;
						event.preventDefault();
						if(concordInstance.op.inTextMode()){
							var next = null;
							var cursor = concordInstance.op.getCursor();
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
								next = concordInstance.op._walk_down(cursor);
							}
							if(next) {
								concordInstance.op.setCursor(next);
								}
							}else{
								concordInstance.op.go(down,1, event.shiftKey, concordInstance.op.inTextMode());
								}
						break;
				case 46:
					// delete
						if(concordInstance.op.inTextMode()) {
							if(!concordInstance.op.getCursor().hasClass("dirty")){
								concordInstance.op.saveState();
								concordInstance.op.getCursor().addClass("dirty");
								}
							}else{
								keyCaptured = true;
								event.preventDefault();
								concordInstance.op.deleteLine();
								}
						break;
				case 90:
					//CMD+Z
					if(commandKey){
						keyCaptured=true;
						event.preventDefault();
						concordInstance.op.undo();
						}
					break;
				case 88:
					//CMD+X
					if(commandKey){
						if(concordInstance.op.inTextMode()){
							if(concordInstance.op.getLineText()==""){
								keyCaptured=true;
								event.preventDefault();
								concordInstance.op.deleteLine();
								}
							else {
								concordInstance.op.saveState();
								}
							}
						}
					break;
				case 67:
					//CMD+C
					if(false&&commandKey){
						if(concordInstance.op.inTextMode()){
							if(concordInstance.op.getLineText()!=""){
								concordInstance.root.removeData("clipboard");
								}
							}else{
								keyCaptured=true;
								event.preventDefault();
								concordInstance.op.copy();
								}
						}
					break;
				case 86:
					//CMD+V
					break;
				case 220:
					// CMD+Backslash
					if(commandKey){
						if(concordInstance.script.isComment()){
							concordInstance.script.unComment();
							}else{
								concordInstance.script.makeComment();
								}
						}
					break;
				case 73:
					//CMD+I
					if(commandKey){
						keyCaptured=true;
						event.preventDefault();
						concordInstance.op.italic();
						}
					break;
				case 66:
					//CMD+B
					if(commandKey){
						keyCaptured=true;
						event.preventDefault();
						concordInstance.op.bold();
						}
					break;
				case 192:
					//CMD+`
					if(commandKey){
						keyCaptured=true;
						event.preventDefault();
						concordInstance.op.setRenderMode(!concordInstance.op.getRenderMode());
						}
					break;
				case 188:
					//CMD+,
					if(commandKey){
						keyCaptured=true;
						event.preventDefault();
						if(concordInstance.op.subsExpanded()){
							concordInstance.op.collapse();
							}else{
								concordInstance.op.expand();
								}
						}
					break;
				case 191:
					//CMD+/
					if(commandKey){
						keyCaptured=true;
						event.preventDefault();
						concordInstance.op.runSelection();
						}
					break;
				default:
					keyCaptured = false;
				}
			if(!keyCaptured) {
				if((event.which >= 32) && ((event.which < 112) || (event.which > 123)) && (event.which < 1000) && !commandKey) {
					var node = concordInstance.op.getCursor();
					if(concordInstance.op.inTextMode()) {
						if(!node.hasClass("dirty")){
							concordInstance.op.saveState();
							}
						node.addClass("dirty");
						} else {
							concordInstance.op.setTextMode(true);
							concordInstance.op.saveState();
							concordInstance.editor.edit(node, true);
							node.addClass("dirty");
							}
					concordInstance.op.markChanged();
					}
				}
			}
		});
	$(document).on("mouseup", function(event) {
		if(!concord.handleEvents){
			return;
			}
		if($(".concord-root").length==0){
			return;
			}
		if( $(event.target).is("a") || $(event.target).is("input") || $(event.target).is("textarea") || ($(event.target).parents("a:first").length==1) || $(event.target).hasClass("dropdown-menu") || ($(event.target).parents(".dropdown-menu:first").length>0)){
			return;
			}
		var context = $(event.target).parents(".concord-root:first");
		if(context.length == 0) {
			$(".concord-root").each(function() {
				var concordInstance = new ConcordOutline($(this).parent(), null, concord);
				concordInstance.editor.hideContextMenu();
				concordInstance.editor.dragModeExit();
				});
			var focusRoot = concord.getFocusRoot();
			}
		});
	$(document).on("click", concord.updateFocusRootEvent);
	$(document).on("dblclick", concord.updateFocusRootEvent);
	$(document).on('show', function(e){
		if($(e.target).is(".modal")){
			if($(e.target).attr("concord-events") != "true"){
				concord.stopListening();
				}
			}
		});
	$(document).on('hidden', function(e){
		if($(e.target).is(".modal")){
			if($(e.target).attr("concord-events") != "true"){
				concord.resumeListening();
				}
			}
		});
	concord.ready=true;
	})(jQuery);

},{"./concord":9,"./concord-outline":6,"./concord-util":8}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvdGVkL1dvcmsvY29uY29yZC9jb25jb3JkL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdGVkL1dvcmsvY29uY29yZC9jb25jb3JkL2NvbmNvcmQuanMiLCIvVXNlcnMvdGVkL1dvcmsvY29uY29yZC9jb25jb3JkL2xpYi9jb25jb3JkLWVkaXRvci5qcyIsIi9Vc2Vycy90ZWQvV29yay9jb25jb3JkL2NvbmNvcmQvbGliL2NvbmNvcmQtZXZlbnRzLmpzIiwiL1VzZXJzL3RlZC9Xb3JrL2NvbmNvcmQvY29uY29yZC9saWIvY29uY29yZC1vcC1hdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL3RlZC9Xb3JrL2NvbmNvcmQvY29uY29yZC9saWIvY29uY29yZC1vcC5qcyIsIi9Vc2Vycy90ZWQvV29yay9jb25jb3JkL2NvbmNvcmQvbGliL2NvbmNvcmQtb3V0bGluZS5qcyIsIi9Vc2Vycy90ZWQvV29yay9jb25jb3JkL2NvbmNvcmQvbGliL2NvbmNvcmQtc2NyaXB0LmpzIiwiL1VzZXJzL3RlZC9Xb3JrL2NvbmNvcmQvY29uY29yZC9saWIvY29uY29yZC11dGlsLmpzIiwiL1VzZXJzL3RlZC9Xb3JrL2NvbmNvcmQvY29uY29yZC9saWIvY29uY29yZC5qcyIsIi9Vc2Vycy90ZWQvV29yay9jb25jb3JkL2NvbmNvcmQvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKFwiLi9saWIvaW5kZXhcIik7XG4iLCJmdW5jdGlvbiBDb25jb3JkRWRpdG9yKHJvb3QsIGNvbmNvcmRJbnN0YW5jZSkge1xuXHR0aGlzLm1ha2VOb2RlID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgbm9kZSA9ICQoXCI8bGk+PC9saT5cIik7XG5cdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtbm9kZVwiKTtcblx0XHR2YXIgd3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXdyYXBwZXInPjwvZGl2PlwiKTtcblx0XHR2YXIgaWNvbk5hbWU9XCJjYXJldC1yaWdodFwiO1xuXHRcdHZhciBpY29uID0gXCI8aVwiK1wiIGNsYXNzPVxcXCJub2RlLWljb24gaWNvbi1cIisgaWNvbk5hbWUgK1wiXFxcIj48XCIrXCIvaT5cIjtcblx0XHR3cmFwcGVyLmFwcGVuZChpY29uKTtcblx0XHR3cmFwcGVyLmFkZENsYXNzKFwidHlwZS1pY29uXCIpO1xuXHRcdHZhciB0ZXh0ID0gJChcIjxkaXYgY2xhc3M9J2NvbmNvcmQtdGV4dCcgY29udGVudGVkaXRhYmxlPSd0cnVlJz48L2Rpdj5cIik7XG5cdFx0dmFyIG91dGxpbmUgPSAkKFwiPG9sPjwvb2w+XCIpO1xuXHRcdHRleHQuYXBwZW5kVG8od3JhcHBlcik7XG5cdFx0d3JhcHBlci5hcHBlbmRUbyhub2RlKTtcblx0XHRvdXRsaW5lLmFwcGVuZFRvKG5vZGUpO1xuXHRcdHJldHVybiBub2RlO1xuXHRcdH07XG5cdHRoaXMuZHJhZ01vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRyb290LmRhdGEoXCJkcmFnZ2luZ0NoYW5nZVwiLCByb290LmNoaWxkcmVuKCkuY2xvbmUodHJ1ZSwgdHJ1ZSkpO1xuXHRcdHJvb3QuYWRkQ2xhc3MoXCJkcmFnZ2luZ1wiKTtcblx0XHRyb290LmRhdGEoXCJkcmFnZ2luZ1wiLCB0cnVlKTtcblx0XHR9O1xuXHR0aGlzLmRyYWdNb2RlRXhpdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmKHJvb3QuZGF0YShcImRyYWdnaW5nXCIpKSB7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVwiLCByb290LmRhdGEoXCJkcmFnZ2luZ0NoYW5nZVwiKSk7XG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VUZXh0TW9kZVwiLCBmYWxzZSk7XG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VSYW5nZVwiLCB1bmRlZmluZWQpO1xuXHRcdFx0fVxuXHRcdHJvb3QuZmluZChcIi5kcmFnZ2FibGVcIikucmVtb3ZlQ2xhc3MoXCJkcmFnZ2FibGVcIik7XG5cdFx0cm9vdC5maW5kKFwiLmRyb3Atc2libGluZ1wiKS5yZW1vdmVDbGFzcyhcImRyb3Atc2libGluZ1wiKTtcblx0XHRyb290LmZpbmQoXCIuZHJvcC1jaGlsZFwiKS5yZW1vdmVDbGFzcyhcImRyb3AtY2hpbGRcIik7XG5cdFx0cm9vdC5yZW1vdmVDbGFzcyhcImRyYWdnaW5nXCIpO1xuXHRcdHJvb3QuZGF0YShcImRyYWdnaW5nXCIsIGZhbHNlKTtcblx0XHRyb290LmRhdGEoXCJtb3VzZWRvd25cIiwgZmFsc2UpO1xuXHRcdH07XG5cdHRoaXMuZWRpdCA9IGZ1bmN0aW9uKG5vZGUsIGVtcHR5KSB7XG5cdFx0dmFyIHRleHQgPSBub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XG5cdFx0aWYoZW1wdHkpIHtcblx0XHRcdHRleHQuaHRtbChcIlwiKTtcblx0XHRcdH1cblx0XHR0ZXh0LmZvY3VzKCk7XG5cdFx0dmFyIGVsID0gdGV4dC5nZXQoMCk7XG5cdFx0aWYoZWwgJiYgZWwuY2hpbGROb2RlcyAmJiBlbC5jaGlsZE5vZGVzWzBdKXtcblx0XHRcdGlmICh0eXBlb2Ygd2luZG93LmdldFNlbGVjdGlvbiAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVSYW5nZSAhPSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdCAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcblx0XHRcdFx0ICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWwpO1xuXHRcdFx0XHQgICAgICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcblx0XHRcdFx0ICAgICAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdFx0XHQgICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcblx0XHRcdFx0ICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuXHRcdFx0XHQgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UgIT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRcdHZhciB0ZXh0UmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xuXHRcdFx0XHRcdHRleHRSYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChlbCk7XG5cdFx0XHRcdFx0dGV4dFJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcblx0XHRcdFx0XHQgICAgICAgIHRleHRSYW5nZS5zZWxlY3QoKTtcblx0XHRcdFx0ICAgIH1cblx0XHRcdH1cblx0XHR0ZXh0LmFkZENsYXNzKFwiZWRpdGluZ1wiKTtcblx0XHRpZighZW1wdHkpe1xuXHRcdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZS5kaXJ0eVwiKS5sZW5ndGg+MCl7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5lZGl0YWJsZSA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdHZhciBlZGl0YWJsZSA9IGZhbHNlO1xuXHRcdGlmKCF0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXRleHRcIikpIHtcblx0XHRcdHRhcmdldCA9IHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKTtcblx0XHRcdH1cblx0XHRpZih0YXJnZXQubGVuZ3RoID09IDEpIHtcblx0XHRcdGVkaXRhYmxlID0gdGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC10ZXh0XCIpICYmIHRhcmdldC5oYXNDbGFzcyhcImVkaXRpbmdcIik7XG5cdFx0XHR9XG5cdFx0cmV0dXJuIGVkaXRhYmxlO1xuXHRcdH07XG5cdHRoaXMuZWRpdG9yTW9kZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdHJvb3QuZmluZChcIi5lZGl0aW5nXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyQodGhpcykuYmx1cigpO1xuXHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcyhcImVkaXRpbmdcIik7XG5cdFx0XHR9KTtcblx0XHRyb290LmZpbmQoXCIuc2VsZWN0aW9uLXRvb2xiYXJcIikucmVtb3ZlKCk7XG5cdFx0fTtcblx0dGhpcy5vcG1sID0gZnVuY3Rpb24oX3Jvb3QsIGZsc3Vic29ubHkpIHtcblx0XHRcblx0XHRpZiAoZmxzdWJzb25seSA9PSB1bmRlZmluZWQpIHsgLy84LzUvMTMgYnkgRFdcblx0XHRcdGZsc3Vic29ubHkgPSBmYWxzZTtcblx0XHRcdH1cblx0XHRcblx0XHRpZihfcm9vdCkge1xuXHRcdFx0cm9vdCA9IF9yb290O1xuXHRcdFx0fVxuXHRcdHZhciB0aXRsZSA9IHJvb3QuZGF0YShcInRpdGxlXCIpO1xuXHRcdGlmKCF0aXRsZSkge1xuXHRcdFx0aWYocm9vdC5oYXNDbGFzcyhcImNvbmNvcmQtbm9kZVwiKSkge1xuXHRcdFx0XHR0aXRsZSA9IHJvb3QuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS50ZXh0KCk7XG5cdFx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aXRsZSA9IFwiXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR2YXIgb3BtbCA9ICc8P3htbCB2ZXJzaW9uPVwiMS4wXCI/Plxcbic7XG5cdFx0b3BtbCArPSAnPG9wbWwgdmVyc2lvbj1cIjIuMFwiPlxcbic7XG5cdFx0b3BtbCArPSAnPGhlYWQ+XFxuJztcblx0XHRvcG1sICs9ICc8dGl0bGU+JyArIENvbmNvcmRVdGlsLmVzY2FwZVhtbCh0aXRsZSkgKyAnPC90aXRsZT5cXG4nO1xuXHRcdG9wbWwgKz0gJzwvaGVhZD5cXG4nO1xuXHRcdG9wbWwgKz0gJzxib2R5Plxcbic7XG5cdFx0aWYocm9vdC5oYXNDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpKSB7XG5cdFx0XHRvcG1sICs9IHRoaXMub3BtbExpbmUocm9vdCwgMCwgZmxzdWJzb25seSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgZWRpdG9yID0gdGhpcztcblx0XHRcdFx0cm9vdC5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRvcG1sICs9IGVkaXRvci5vcG1sTGluZSgkKHRoaXMpKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdG9wbWwgKz0gJzwvYm9keT5cXG4nO1xuXHRcdG9wbWwgKz0gJzwvb3BtbD5cXG4nO1xuXHRcdHJldHVybiBvcG1sO1xuXHRcdH07XG5cdHRoaXMub3BtbExpbmUgPSBmdW5jdGlvbihub2RlLCBpbmRlbnQsIGZsc3Vic29ubHkpIHtcblx0XHRpZihpbmRlbnQ9PXVuZGVmaW5lZCl7XG5cdFx0XHRpbmRlbnQ9MDtcblx0XHRcdH1cblx0XHRcblx0XHRpZiAoZmxzdWJzb25seSA9PSB1bmRlZmluZWQpIHsgLy84LzUvMTMgYnkgRFdcblx0XHRcdGZsc3Vic29ubHkgPSBmYWxzZTtcblx0XHRcdH1cblx0XHRcblx0XHR2YXIgdGV4dCA9IHRoaXMudW5lc2NhcGUobm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLmh0bWwoKSk7XG5cdFx0dmFyIHRleHRNYXRjaGVzID0gdGV4dC5tYXRjaCgvXiguKyk8YnI+XFxzKiQvKTtcblx0XHRpZih0ZXh0TWF0Y2hlcyl7XG5cdFx0XHR0ZXh0ID0gdGV4dE1hdGNoZXNbMV07XG5cdFx0XHR9XG5cdFx0dmFyIG9wbWwgPSAnJztcblx0XHRmb3IodmFyIGk9MDsgaSA8IGluZGVudDtpKyspe1xuXHRcdFx0b3BtbCArPSAnXFx0Jztcblx0XHRcdH1cblx0XHRcblx0XHR2YXIgc3ViaGVhZHM7IFxuXHRcdGlmICghZmxzdWJzb25seSkgeyAvLzgvNS8xMyBieSBEV1xuXHRcdFx0b3BtbCArPSAnPG91dGxpbmUgdGV4dD1cIicgKyBDb25jb3JkVXRpbC5lc2NhcGVYbWwodGV4dCkgKyAnXCInO1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBub2RlLmRhdGEoXCJhdHRyaWJ1dGVzXCIpO1xuXHRcdFx0aWYoYXR0cmlidXRlcz09PXVuZGVmaW5lZCl7XG5cdFx0XHRcdGF0dHJpYnV0ZXM9e307XG5cdFx0XHRcdH1cblx0XHRcdGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVzKXtcblx0XHRcdFx0aWYoKG5hbWUhPT11bmRlZmluZWQpICYmIChuYW1lIT1cIlwiKSAmJiAobmFtZSAhPSBcInRleHRcIikpIHtcblx0XHRcdFx0XHRpZihhdHRyaWJ1dGVzW25hbWVdIT09dW5kZWZpbmVkKXtcblx0XHRcdFx0XHRcdG9wbWwgKz0gJyAnICsgbmFtZSArICc9XCInICsgQ29uY29yZFV0aWwuZXNjYXBlWG1sKGF0dHJpYnV0ZXNbbmFtZV0pICsgJ1wiJztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdHN1YmhlYWRzID0gbm9kZS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtbm9kZVwiKTtcblx0XHRcdGlmKHN1YmhlYWRzLmxlbmd0aD09MCl7XG5cdFx0XHRcdG9wbWwrPVwiLz5cXG5cIjtcblx0XHRcdFx0cmV0dXJuIG9wbWw7XG5cdFx0XHRcdH1cblx0XHRcdG9wbWwgKz0gXCI+XFxuXCI7XG5cdFx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRzdWJoZWFkcyA9IG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIik7XG5cdFx0XHR9XG5cdFx0XG5cdFx0dmFyIGVkaXRvciA9IHRoaXM7XG5cdFx0aW5kZW50Kys7XG5cdFx0c3ViaGVhZHMuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdG9wbWwgKz0gZWRpdG9yLm9wbWxMaW5lKCQodGhpcyksIGluZGVudCk7XG5cdFx0XHR9KTtcblx0XHRcblx0XHRpZiAoIWZsc3Vic29ubHkpIHsgLy84LzUvMTMgYnkgRFdcblx0XHRcdGZvcih2YXIgaT0wOyBpIDwgaW5kZW50O2krKyl7XG5cdFx0XHRcdG9wbWwgKz0gJ1xcdCc7XG5cdFx0XHRcdH1cblx0XHRcdG9wbWwgKz0gJzwvb3V0bGluZT5cXG4nO1xuXHRcdFx0fVxuXHRcdFxuXHRcdHJldHVybiBvcG1sO1xuXHRcdH07XG5cdHRoaXMudGV4dExpbmUgPSBmdW5jdGlvbihub2RlLCBpbmRlbnQpe1xuXHRcdGlmKCFpbmRlbnQpe1xuXHRcdFx0aW5kZW50ID0gMDtcblx0XHRcdH1cblx0XHR2YXIgdGV4dCA9IFwiXCI7XG5cdFx0Zm9yKHZhciBpPTA7IGkgPCBpbmRlbnQ7aSsrKXtcblx0XHRcdHRleHQgKz0gXCJcXHRcIjtcblx0XHRcdH1cblx0XHR0ZXh0ICs9IHRoaXMudW5lc2NhcGUobm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLmh0bWwoKSk7XG5cdFx0dGV4dCArPSBcIlxcblwiO1xuXHRcdHZhciBlZGl0b3IgPSB0aGlzO1xuXHRcdG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHRleHQgKz0gZWRpdG9yLnRleHRMaW5lKCQodGhpcyksIGluZGVudCsxKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiB0ZXh0O1xuXHRcdH07XG5cdHRoaXMuc2VsZWN0ID0gZnVuY3Rpb24obm9kZSwgbXVsdGlwbGUsIG11bHRpcGxlUmFuZ2UpIHtcblx0XHRpZihtdWx0aXBsZSA9PSB1bmRlZmluZWQpIHtcblx0XHRcdG11bHRpcGxlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0aWYobXVsdGlwbGVSYW5nZSA9PSB1bmRlZmluZWQpIHtcblx0XHRcdG11bHRpcGxlUmFuZ2UgPSBmYWxzZTtcblx0XHRcdH1cblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHR0aGlzLnNlbGVjdGlvbk1vZGUobXVsdGlwbGUpO1xuXHRcdFx0aWYobXVsdGlwbGUpe1xuXHRcdFx0XHRub2RlLnBhcmVudHMoXCIuY29uY29yZC1ub2RlLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XG5cdFx0XHRcdG5vZGUuZmluZChcIi5jb25jb3JkLW5vZGUuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYobXVsdGlwbGUgJiYgbXVsdGlwbGVSYW5nZSkge1xuXHRcdFx0XHR2YXIgcHJldk5vZGVzID0gbm9kZS5wcmV2QWxsKFwiLnNlbGVjdGVkXCIpO1xuXHRcdFx0XHRpZihwcmV2Tm9kZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHZhciBzdGFtcCA9IGZhbHNlO1xuXHRcdFx0XHRcdG5vZGUucHJldkFsbCgpLnJldmVyc2UoKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoJCh0aGlzKS5oYXNDbGFzcyhcInNlbGVjdGVkXCIpKSB7XG5cdFx0XHRcdFx0XHRcdHN0YW1wID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmKHN0YW1wKSB7XG5cdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgbmV4dE5vZGVzID0gbm9kZS5uZXh0QWxsKFwiLnNlbGVjdGVkXCIpO1xuXHRcdFx0XHRcdFx0aWYobmV4dE5vZGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0dmFyIHN0YW1wID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0bm9kZS5uZXh0QWxsKCkuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRpZigkKHRoaXMpLmhhc0NsYXNzKFwic2VsZWN0ZWRcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHN0YW1wID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYoc3RhbXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0dmFyIHRleHQgPSBub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XG5cdFx0XHRpZih0ZXh0Lmhhc0NsYXNzKFwiZWRpdGluZ1wiKSkge1xuXHRcdFx0XHR0ZXh0LnJlbW92ZUNsYXNzKFwiZWRpdGluZ1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0Ly90ZXh0LmJsdXIoKTtcblx0XHRcdG5vZGUuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRcdGlmKHRleHQudGV4dCgpLmxlbmd0aD4wKXtcblx0XHRcdFx0Ly9yb290LmRhdGEoXCJjdXJyZW50Q2hhbmdlXCIsIHJvb3QuY2hpbGRyZW4oKS5jbG9uZSgpKTtcblx0XHRcdFx0fVxuXHRcdFx0dGhpcy5kcmFnTW9kZUV4aXQoKTtcblx0XHRcdH1cblx0XHRpZihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlLmRpcnR5XCIpLmxlbmd0aD4wKXtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuc2VsZWN0aW9uTW9kZSA9IGZ1bmN0aW9uKG11bHRpcGxlKSB7XG5cdFx0aWYobXVsdGlwbGUgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtdWx0aXBsZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdHZhciBub2RlID0gcm9vdC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yXCIpO1xuXHRcdGlmKG5vZGUubGVuZ3RoID09IDEpIHtcblx0XHRcdHZhciB0ZXh0ID0gbm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdFx0aWYodGV4dC5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHQvL3RleHQuYmx1cigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0aWYoIW11bHRpcGxlKSB7XG5cdFx0XHRyb290LmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRcdH1cblx0XHRyb290LmZpbmQoXCIuc2VsZWN0aW9uLXRvb2xiYXJcIikucmVtb3ZlKCk7XG5cdFx0fTtcblx0dGhpcy5idWlsZCA9IGZ1bmN0aW9uKG91dGxpbmUsY29sbGFwc2VkLCBsZXZlbCkge1xuXHRcdGlmKCFsZXZlbCl7XG5cdFx0XHRsZXZlbCA9IDE7XG5cdFx0XHR9XG5cdFx0dmFyIG5vZGUgPSAkKFwiPGxpPjwvbGk+XCIpO1xuXHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLW5vZGVcIik7XG5cdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtbGV2ZWwtXCIrbGV2ZWwpO1xuXHRcdHZhciBhdHRyaWJ1dGVzID0ge307XG5cdFx0JChvdXRsaW5lWzBdLmF0dHJpYnV0ZXMpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRpZih0aGlzLm5hbWUgIT0gJ3RleHQnKSB7XG5cdFx0XHRcdGF0dHJpYnV0ZXNbdGhpcy5uYW1lXSA9IHRoaXMudmFsdWU7XG5cdFx0XHRcdGlmKHRoaXMubmFtZT09XCJ0eXBlXCIpe1xuXHRcdFx0XHRcdG5vZGUuYXR0cihcIm9wbWwtXCIgKyB0aGlzLm5hbWUsIHRoaXMudmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0bm9kZS5kYXRhKFwiYXR0cmlidXRlc1wiLCBhdHRyaWJ1dGVzKTtcblx0XHR2YXIgd3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXdyYXBwZXInPjwvZGl2PlwiKTtcblx0XHR2YXIgbm9kZUljb24gPSBhdHRyaWJ1dGVzW1wiaWNvblwiXTtcblx0XHRpZighbm9kZUljb24pe1xuXHRcdFx0bm9kZUljb24gPSBhdHRyaWJ1dGVzW1widHlwZVwiXTtcblx0XHRcdH1cblx0XHR2YXIgaWNvbk5hbWU9XCJjYXJldC1yaWdodFwiO1xuXHRcdGlmKG5vZGVJY29uKXtcblx0XHRcdGlmKChub2RlSWNvbj09bm9kZS5hdHRyKFwib3BtbC10eXBlXCIpKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnMgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW25vZGVJY29uXSl7XG5cdFx0XHRcdGljb25OYW1lID0gY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW25vZGVJY29uXTtcblx0XHRcdFx0fWVsc2UgaWYgKG5vZGVJY29uPT1hdHRyaWJ1dGVzW1wiaWNvblwiXSl7XG5cdFx0XHRcdFx0aWNvbk5hbWUgPSBub2RlSWNvbjtcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0dmFyIGljb24gPSBcIjxpXCIrXCIgY2xhc3M9XFxcIm5vZGUtaWNvbiBpY29uLVwiKyBpY29uTmFtZSArXCJcXFwiPjxcIitcIi9pPlwiO1xuXHRcdHdyYXBwZXIuYXBwZW5kKGljb24pO1xuXHRcdHdyYXBwZXIuYWRkQ2xhc3MoXCJ0eXBlLWljb25cIik7XG5cdFx0aWYoYXR0cmlidXRlc1tcImlzQ29tbWVudFwiXT09XCJ0cnVlXCIpe1xuXHRcdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtY29tbWVudFwiKTtcblx0XHRcdH1cblx0XHR2YXIgdGV4dCA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXRleHQnIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+PC9kaXY+XCIpO1xuXHRcdHRleHQuYWRkQ2xhc3MoXCJjb25jb3JkLWxldmVsLVwiK2xldmVsK1wiLXRleHRcIik7XG5cdFx0dGV4dC5odG1sKHRoaXMuZXNjYXBlKG91dGxpbmUuYXR0cigndGV4dCcpKSk7XG5cdFx0aWYoYXR0cmlidXRlc1tcImNzc1RleHRDbGFzc1wiXSE9PXVuZGVmaW5lZCl7XG5cdFx0XHR2YXIgY3NzQ2xhc3NlcyA9IGF0dHJpYnV0ZXNbXCJjc3NUZXh0Q2xhc3NcIl0uc3BsaXQoL1xccysvKTtcblx0XHRcdGZvcih2YXIgYyBpbiBjc3NDbGFzc2VzKXtcblx0XHRcdFx0dmFyIG5ld0NsYXNzID0gY3NzQ2xhc3Nlc1tjXTtcblx0XHRcdFx0dGV4dC5hZGRDbGFzcyhuZXdDbGFzcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR2YXIgY2hpbGRyZW4gPSAkKFwiPG9sPjwvb2w+XCIpO1xuXHRcdHZhciBlZGl0b3IgPSB0aGlzO1xuXHRcdG91dGxpbmUuY2hpbGRyZW4oXCJvdXRsaW5lXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgY2hpbGQgPSBlZGl0b3IuYnVpbGQoJCh0aGlzKSwgY29sbGFwc2VkLCBsZXZlbCsxKTtcblx0XHRcdGNoaWxkLmFwcGVuZFRvKGNoaWxkcmVuKTtcblx0XHRcdH0pO1xuXHRcdGlmKGNvbGxhcHNlZCl7XG5cdFx0XHRpZihvdXRsaW5lLmNoaWxkcmVuKFwib3V0bGluZVwiKS5zaXplKCk+MCl7XG5cdFx0XHRcdG5vZGUuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR0ZXh0LmFwcGVuZFRvKHdyYXBwZXIpO1xuXHRcdHdyYXBwZXIuYXBwZW5kVG8obm9kZSk7XG5cdFx0Y2hpbGRyZW4uYXBwZW5kVG8obm9kZSk7XG5cdFx0cmV0dXJuIG5vZGU7XG5cdFx0fTtcblx0dGhpcy5oaWRlQ29udGV4dE1lbnUgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHJvb3QuZGF0YShcImRyb3Bkb3duXCIpKXtcblx0XHRcdHJvb3QuZGF0YShcImRyb3Bkb3duXCIpLmhpZGUoKTtcblx0XHRcdHJvb3QuZGF0YShcImRyb3Bkb3duXCIpLnJlbW92ZSgpO1xuXHRcdFx0cm9vdC5yZW1vdmVEYXRhKFwiZHJvcGRvd25cIik7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5zaG93Q29udGV4dE1lbnUgPSBmdW5jdGlvbih4LHkpe1xuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLmNvbnRleHRNZW51KXtcblx0XHRcdHRoaXMuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRyb290LmRhdGEoXCJkcm9wZG93blwiLCAkKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLmNvbnRleHRNZW51KS5jbG9uZSgpLmFwcGVuZFRvKGNvbmNvcmRJbnN0YW5jZS5jb250YWluZXIpKTtcblx0XHRcdHZhciBlZGl0b3IgPSB0aGlzO1xuXHRcdFx0cm9vdC5kYXRhKFwiZHJvcGRvd25cIikub24oXCJjbGlja1wiLCBcImFcIiwgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0cm9vdC5kYXRhKFwiZHJvcGRvd25cIikuY3NzKHtcInBvc2l0aW9uXCIgOiBcImFic29sdXRlXCIsIFwidG9wXCIgOiB5ICtcInB4XCIsIFwibGVmdFwiIDogeCArIFwicHhcIiwgXCJjdXJzb3JcIiA6IFwiZGVmYXVsdFwifSk7XG5cdFx0XHRyb290LmRhdGEoXCJkcm9wZG93blwiKS5zaG93KCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5zYW5pdGl6ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGVkaXRvciA9IHRoaXM7XG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtdGV4dC5wYXN0ZVwiKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgY29uY29yZFRleHQgPSAkKHRoaXMpO1xuXHRcdFx0aWYoY29uY29yZEluc3RhbmNlLnBhc3RlQmluLnRleHQoKT09XCIuLi5cIil7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0dmFyIGggPSBjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uaHRtbCgpO1xuXHRcdFx0aCA9IGgucmVwbGFjZShuZXcgUmVnRXhwKFwiPChkaXZ8cHxibG9ja3F1b3RlfHByZXxsaXxicnxkZHxkdHxjb2RlfGhcXFxcZClbXj5dKigvKT8+XCIsXCJnaVwiKSxcIlxcblwiKTtcblx0XHRcdGggPSAkKFwiPGRpdi8+XCIpLmh0bWwoaCkudGV4dCgpO1xuXHRcdFx0dmFyIGNsaXBib2FyZE1hdGNoID0gZmFsc2U7XG5cdFx0XHRpZihjb25jb3JkQ2xpcGJvYXJkICE9PSB1bmRlZmluZWQpe1xuXHRcdFx0XHR2YXIgdHJpbW1lZENsaXBib2FyZFRleHQgPSBjb25jb3JkQ2xpcGJvYXJkLnRleHQucmVwbGFjZSgvXltcXHNcXHJcXG5dK3xbXFxzXFxyXFxuXSskL2csJycpO1xuXHRcdFx0XHR2YXIgdHJpbW1lZFBhc3RlVGV4dCA9IGgucmVwbGFjZSgvXltcXHNcXHJcXG5dK3xbXFxzXFxyXFxuXSskL2csJycpO1xuXHRcdFx0XHRpZih0cmltbWVkQ2xpcGJvYXJkVGV4dD09dHJpbW1lZFBhc3RlVGV4dCl7XG5cdFx0XHRcdFx0dmFyIGNsaXBib2FyZE5vZGVzID0gY29uY29yZENsaXBib2FyZC5kYXRhO1xuXHRcdFx0XHRcdGlmKGNsaXBib2FyZE5vZGVzKXtcblx0XHRcdFx0XHRcdHZhciBjb2xsYXBzZU5vZGUgPSBmdW5jdGlvbihub2RlKXtcblx0XHRcdFx0XHRcdFx0bm9kZS5maW5kKFwib2xcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRpZigkKHRoaXMpLmNoaWxkcmVuKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGNsaXBib2FyZE5vZGVzLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdFx0Y29sbGFwc2VOb2RlKCQodGhpcykpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHJvb3QuZGF0YShcImNsaXBib2FyZFwiLCBjbGlwYm9hcmROb2Rlcyk7XG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnBhc3RlKCk7XG5cdFx0XHRcdFx0XHRjbGlwYm9hcmRNYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRpZighY2xpcGJvYXJkTWF0Y2gpe1xuXHRcdFx0XHRjb25jb3JkQ2xpcGJvYXJkID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR2YXIgbnVtYmVyb2ZsaW5lcyA9IDA7XG5cdFx0XHRcdHZhciBsaW5lcyA9IGguc3BsaXQoXCJcXG5cIik7XG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHRcdFx0dmFyIGxpbmUgPSBsaW5lc1tpXTtcblx0XHRcdFx0XHRpZigobGluZSE9XCJcIikgJiYgIWxpbmUubWF0Y2goL15cXHMrJC8pKXtcblx0XHRcdFx0XHRcdG51bWJlcm9mbGluZXMrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpIHx8IChudW1iZXJvZmxpbmVzID4gMSkpe1xuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5pbnNlcnRUZXh0KGgpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xuXHRcdFx0XHRcdFx0Y29uY29yZFRleHQuZm9jdXMoKTtcblx0XHRcdFx0XHRcdHZhciByYW5nZSA9IGNvbmNvcmRUZXh0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpLmRhdGEoXCJyYW5nZVwiKTtcblx0XHRcdFx0XHRcdGlmKHJhbmdlKXtcblx0XHRcdFx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdFx0XHRcdHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0XHRcdFx0XHRcdFx0c2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdFx0XHRcdFx0XHRcdHNlbC5hZGRSYW5nZShyYW5nZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjYXRjaChlKXtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRUZXh0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpLnJlbW92ZURhdGEoXCJyYW5nZVwiKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0VGV4dFwiLG51bGwsaCk7XG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uucm9vdC5yZW1vdmVEYXRhKFwiY2xpcGJvYXJkXCIpO1xuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdGNvbmNvcmRUZXh0LnJlbW92ZUNsYXNzKFwicGFzdGVcIik7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR0aGlzLmVzY2FwZSA9IGZ1bmN0aW9uKHMpe1xuXHRcdHZhciBoID0gJChcIjxkaXYvPlwiKS50ZXh0KHMpLmh0bWwoKTtcblx0XHRoID0gaC5yZXBsYWNlKC9cXHUwMEEwL2csIFwiIFwiKTtcblx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuZ2V0UmVuZGVyTW9kZSgpKXsgLy8gUmVuZGVyIEhUTUwgaWYgb3AuZ2V0UmVuZGVyTW9kZSgpIHJldHVybnMgdHJ1ZSAtIDIvMTcvMTMgYnkgS1Ncblx0XHRcdHZhciBhbGxvd2VkVGFncyA9IFtcImJcIixcInN0cm9uZ1wiLFwiaVwiLFwiZW1cIixcImFcIixcImltZ1wiLFwic3RyaWtlXCIsXCJkZWxcIl07XG5cdFx0XHRmb3IodmFyIHRhZ0luZGV4IGluIGFsbG93ZWRUYWdzKXtcblx0XHRcdFx0dmFyIHRhZyA9IGFsbG93ZWRUYWdzW3RhZ0luZGV4XTtcblx0XHRcdFx0aWYgKHRhZyA9PSBcImltZ1wiKXtcblx0XHRcdFx0XHRoID0gaC5yZXBsYWNlKG5ldyBSZWdFeHAoXCImbHQ7XCIrdGFnK1wiKCg/ISZndDspLispKC8pPyZndDtcIixcImdpXCIpLFwiPFwiK3RhZytcIiQxXCIrXCIvPlwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHRhZz09XCJhXCIpe1xuXHRcdFx0XHRcdGggPSBoLnJlcGxhY2UobmV3IFJlZ0V4cChcIiZsdDtcIit0YWcrXCIoKD8hJmd0OykuKj8pJmd0OygoPyEmbHQ7L1wiK3RhZytcIiZndDspLis/KSZsdDsvXCIrdGFnK1wiJmd0O1wiLFwiZ2lcIiksXCI8XCIrdGFnK1wiJDFcIitcIj4kMlwiK1wiPFwiK1wiL1wiK3RhZytcIj5cIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRoID0gaC5yZXBsYWNlKG5ldyBSZWdFeHAoXCImbHQ7XCIrdGFnK1wiJmd0OygoPyEmbHQ7L1wiK3RhZytcIiZndDspLis/KSZsdDsvXCIrdGFnK1wiJmd0O1wiLFwiZ2lcIiksXCI8XCIrdGFnK1wiPiQxXCIrXCI8XCIrXCIvXCIrdGFnK1wiPlwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRyZXR1cm4gaDtcblx0XHR9O1xuXHR0aGlzLnVuZXNjYXBlID0gZnVuY3Rpb24ocyl7XG5cdFx0dmFyIGggPSBzLnJlcGxhY2UoLzwvZyxcIiZsdDtcIikucmVwbGFjZSgvPi9nLFwiJmd0O1wiKTtcblx0XHRoID0gJChcIjxkaXYvPlwiKS5odG1sKGgpLnRleHQoKTtcblx0XHRyZXR1cm4gaDtcblx0XHR9O1xuXHR0aGlzLmdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHJhbmdlID0gdW5kZWZpbmVkO1xuXHRcdGlmKHdpbmRvdy5nZXRTZWxlY3Rpb24pe1xuXHRcdFx0c2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdFx0aWYoc2VsLmdldFJhbmdlQXQgJiYgc2VsLnJhbmdlQ291bnQpe1xuXHRcdFx0XHRyYW5nZSA9IHNlbC5nZXRSYW5nZUF0KDApO1xuXHRcdFx0XHRpZigkKHJhbmdlLnN0YXJ0Q29udGFpbmVyKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKS5sZW5ndGg9PTApe1xuXHRcdFx0XHRcdHJhbmdlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdHJldHVybiByYW5nZTtcblx0XHR9O1xuXHR0aGlzLnNhdmVTZWxlY3Rpb24gPSBmdW5jdGlvbigpe1xuXHRcdHZhciByYW5nZSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0aWYocmFuZ2UgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkuZGF0YShcInJhbmdlXCIsIHJhbmdlLmNsb25lUmFuZ2UoKSk7XG5cdFx0XHR9XG5cdFx0cmV0dXJuIHJhbmdlO1xuXHRcdH07XG5cdHRoaXMucmVzdG9yZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKHJhbmdlKXtcblx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xuXHRcdGlmKHJhbmdlPT09dW5kZWZpbmVkKXtcblx0XHRcdHJhbmdlID0gY3Vyc29yLmRhdGEoXCJyYW5nZVwiKTtcblx0XHRcdH1cblx0XHRpZihyYW5nZSAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGlmKHdpbmRvdy5nZXRTZWxlY3Rpb24pe1xuXHRcdFx0XHR2YXIgY29uY29yZFRleHQgPSBjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKTtcblx0XHRcdFx0dHJ5e1xuXHRcdFx0XHRcdHZhciBjbG9uZVJhbmdlciA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcblx0XHRcdFx0XHR2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdFx0XHRcdHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcblx0XHRcdFx0XHRzZWwuYWRkUmFuZ2UoY2xvbmVSYW5nZXIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRmaW5hbGx5IHtcblx0XHRcdFx0XHRjdXJzb3IucmVtb3ZlRGF0YShcInJhbmdlXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdHJldHVybiByYW5nZTtcblx0XHR9O1xuXHR0aGlzLnJlY2FsY3VsYXRlTGV2ZWxzID0gZnVuY3Rpb24oY29udGV4dCl7XG5cdFx0aWYoIWNvbnRleHQpe1xuXHRcdFx0Y29udGV4dCA9IHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGVcIik7XG5cdFx0XHR9XG5cdFx0Y29udGV4dC5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdGV4dCA9ICQodGhpcykuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKTtcblx0XHRcdHZhciBsZXZlbE1hdGNoID0gJCh0aGlzKS5hdHRyKFwiY2xhc3NcIikubWF0Y2goLy4qY29uY29yZC1sZXZlbC0oXFxkKykuKi8pO1xuXHRcdFx0aWYobGV2ZWxNYXRjaCl7XG5cdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoXCJjb25jb3JkLWxldmVsLVwiK2xldmVsTWF0Y2hbMV0pO1xuXHRcdFx0XHR0ZXh0LnJlbW92ZUNsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbE1hdGNoWzFdK1wiLXRleHRcIik7XG5cdFx0XHRcdH1cblx0XHRcdHZhciBsZXZlbCA9ICQodGhpcykucGFyZW50cyhcIi5jb25jb3JkLW5vZGVcIikubGVuZ3RoKzE7XG5cdFx0XHQkKHRoaXMpLmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCk7XG5cdFx0XHR0ZXh0LmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCtcIi10ZXh0XCIpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmNvcmRFZGl0b3I7XG4iLCJ2YXIgY29uY29yZCA9IHJlcXVpcmUoXCIuL2NvbmNvcmRcIik7XG5cbmZ1bmN0aW9uIENvbmNvcmRFdmVudHMocm9vdCwgZWRpdG9yLCBvcCwgY29uY29yZEluc3RhbmNlKSB7XG5cdHZhciBpbnN0YW5jZSA9IHRoaXM7XG5cdHRoaXMud3JhcHBlckRvdWJsZUNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKHJvb3QuZGF0YShcImRyb3Bkb3duXCIpKXtcblx0XHRcdGVkaXRvci5oaWRlQ29udGV4dE1lbnUoKTtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZighZWRpdG9yLmVkaXRhYmxlKCQoZXZlbnQudGFyZ2V0KSkpIHtcblx0XHRcdHZhciB3cmFwcGVyID0gJChldmVudC50YXJnZXQpO1xuXHRcdFx0aWYod3JhcHBlci5oYXNDbGFzcyhcIm5vZGUtaWNvblwiKSl7XG5cdFx0XHRcdHdyYXBwZXIgPSB3cmFwcGVyLnBhcmVudCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZih3cmFwcGVyLmhhc0NsYXNzKFwiY29uY29yZC13cmFwcGVyXCIpKSB7XG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHR2YXIgbm9kZSA9IHdyYXBwZXIucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcblx0XHRcdFx0aWYob3Auc3Vic0V4cGFuZGVkKCkpIHtcblx0XHRcdFx0XHRvcC5jb2xsYXBzZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvcC5leHBhbmQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuY2xpY2tTZWxlY3QgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYocm9vdC5kYXRhKFwiZHJvcGRvd25cIikpe1xuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZC5tb2JpbGUpe1xuXHRcdFx0dmFyIG5vZGUgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKClbMF09PT1ub2RlWzBdKXtcblx0XHRcdFx0aW5zdGFuY2UuZG91YmxlQ2xpY2soZXZlbnQpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRpZigoZXZlbnQud2hpY2g9PTEpICYmICFlZGl0b3IuZWRpdGFibGUoJChldmVudC50YXJnZXQpKSkge1xuXHRcdFx0dmFyIG5vZGUgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImNvbmNvcmQtbm9kZVwiKSl7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0aWYobm9kZS5sZW5ndGg9PTEpIHtcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdGlmKGV2ZW50LnNoaWZ0S2V5ICYmIChub2RlLnBhcmVudHMoXCIuY29uY29yZC1ub2RlLnNlbGVjdGVkXCIpLmxlbmd0aD4wKSl7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0b3Auc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQubWV0YUtleSwgZXZlbnQuc2hpZnRLZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5kb3VibGVDbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihyb290LmRhdGEoXCJkcm9wZG93blwiKSl7XG5cdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoIWVkaXRvci5lZGl0YWJsZSgkKGV2ZW50LnRhcmdldCkpKSB7XG5cdFx0XHR2YXIgbm9kZSA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdGlmKG5vZGUuaGFzQ2xhc3MoXCJjb25jb3JkLW5vZGVcIikgJiYgbm9kZS5oYXNDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpKSB7XG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRvcC5zZXRUZXh0TW9kZShmYWxzZSk7XG5cdFx0XHRcdG9wLnNldEN1cnNvcihub2RlKTtcblx0XHRcdFx0aWYob3Auc3Vic0V4cGFuZGVkKCkpIHtcblx0XHRcdFx0XHRvcC5jb2xsYXBzZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvcC5leHBhbmQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMud3JhcHBlckNsaWNrU2VsZWN0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKHJvb3QuZGF0YShcImRyb3Bkb3duXCIpKXtcblx0XHRcdGVkaXRvci5oaWRlQ29udGV4dE1lbnUoKTtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihjb25jb3JkLm1vYmlsZSl7XG5cdFx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXHRcdFx0dmFyIG5vZGUgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKClbMF09PT1ub2RlWzBdKXtcblx0XHRcdFx0aW5zdGFuY2Uud3JhcHBlckRvdWJsZUNsaWNrKGV2ZW50KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0aWYoKGV2ZW50LndoaWNoPT0xKSAmJiAhZWRpdG9yLmVkaXRhYmxlKCQoZXZlbnQudGFyZ2V0KSkpIHtcblx0XHRcdHZhciB3cmFwcGVyID0gJChldmVudC50YXJnZXQpO1xuXHRcdFx0aWYod3JhcHBlci5oYXNDbGFzcyhcIm5vZGUtaWNvblwiKSl7XG5cdFx0XHRcdHdyYXBwZXIgPSB3cmFwcGVyLnBhcmVudCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZih3cmFwcGVyLmhhc0NsYXNzKFwiY29uY29yZC13cmFwcGVyXCIpKSB7XG5cdFx0XHRcdHZhciBub2RlID0gd3JhcHBlci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0aWYoZXZlbnQuc2hpZnRLZXkgJiYgKG5vZGUucGFyZW50cyhcIi5jb25jb3JkLW5vZGUuc2VsZWN0ZWRcIikubGVuZ3RoPjApKXtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRvcC5zZXRUZXh0TW9kZShmYWxzZSk7XG5cdFx0XHRcdG9wLnNldEN1cnNvcihub2RlLCBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5LCBldmVudC5zaGlmdEtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmNvbnRleHRtZW51ID0gZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR2YXIgbm9kZSA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRpZihub2RlLmhhc0NsYXNzKFwiY29uY29yZC13cmFwcGVyXCIpIHx8IG5vZGUuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpe1xuXHRcdFx0b3Auc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdGlmKCFub2RlLmhhc0NsYXNzKFwiY29uY29yZC1ub2RlXCIpKXtcblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0fVxuXHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcENvbnRleHRNZW51XCIsIG9wLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xuXHRcdG9wLnNldEN1cnNvcihub2RlKTtcblx0XHRlZGl0b3Iuc2hvd0NvbnRleHRNZW51KGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSk7XG5cdFx0fTtcblx0cm9vdC5vbihcImRibGNsaWNrXCIsIFwiLmNvbmNvcmQtd3JhcHBlclwiLCB0aGlzLndyYXBwZXJEb3VibGVDbGljayk7XG5cdHJvb3Qub24oXCJkYmxjbGlja1wiLCBcIi5jb25jb3JkLW5vZGVcIiwgdGhpcy5kb3VibGVDbGljayk7XG5cdHJvb3Qub24oXCJkYmxjbGlja1wiLCBcIi5jb25jb3JkLXRleHRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHR2YXIgbm9kZSA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdG9wLnNldEN1cnNvcihub2RlKTtcblx0XHRcdGlmKG9wLnN1YnNFeHBhbmRlZCgpKSB7XG5cdFx0XHRcdG9wLmNvbGxhcHNlKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b3AuZXhwYW5kKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRyb290Lm9uKFwiY2xpY2tcIiwgXCIuY29uY29yZC13cmFwcGVyXCIsIHRoaXMud3JhcHBlckNsaWNrU2VsZWN0KTtcblx0cm9vdC5vbihcImNsaWNrXCIsIFwiLmNvbmNvcmQtbm9kZVwiLCB0aGlzLmNsaWNrU2VsZWN0KTtcblx0cm9vdC5vbihcIm1vdXNlb3ZlclwiLCBcIi5jb25jb3JkLXdyYXBwZXJcIiwgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIG5vZGUgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0Y29uY29yZEluc3RhbmNlLmZpcmVDYWxsYmFjayhcIm9wSG92ZXJcIiwgb3Auc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XG5cdFx0fSk7XG5cdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcy5jb250ZXh0TWVudSl7XG5cdFx0cm9vdC5vbihcImNvbnRleHRtZW51XCIsIFwiLmNvbmNvcmQtdGV4dFwiLCB0aGlzLmNvbnRleHRtZW51KTtcblx0XHRyb290Lm9uKFwiY29udGV4dG1lbnVcIiwgXCIuY29uY29yZC1ub2RlXCIsIHRoaXMuY29udGV4dG1lbnUpO1xuXHRcdHJvb3Qub24oXCJjb250ZXh0bWVudVwiLCBcIi5jb25jb3JkLXdyYXBwZXJcIiwgdGhpcy5jb250ZXh0bWVudSk7XG5cdFx0fVxuXHRyb290Lm9uKFwiYmx1clwiLCBcIi5jb25jb3JkLXRleHRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoJCh0aGlzKS5odG1sKCkubWF0Y2goL15cXHMqPGJyPlxccyokLykpe1xuXHRcdFx0JCh0aGlzKS5odG1sKFwiXCIpO1xuXHRcdFx0fVxuXHRcdHZhciBjb25jb3JkVGV4dCA9ICQodGhpcyk7XG5cdFx0dmFyIG5vZGUgPSAkKHRoaXMpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpe1xuXHRcdFx0ZWRpdG9yLnNhdmVTZWxlY3Rpb24oKTtcblx0XHRcdH1cblx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpICYmIG5vZGUuaGFzQ2xhc3MoXCJkaXJ0eVwiKSl7XG5cdFx0XHRub2RlLnJlbW92ZUNsYXNzKFwiZGlydHlcIik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdHJvb3Qub24oXCJwYXN0ZVwiLCBcIi5jb25jb3JkLXRleHRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0JCh0aGlzKS5hZGRDbGFzcyhcInBhc3RlXCIpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iuc2F2ZVNlbGVjdGlvbigpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5odG1sKFwiXCIpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5mb2N1cygpO1xuXHRcdHNldFRpbWVvdXQoZWRpdG9yLnNhbml0aXplLDEwKTtcblx0XHR9KTtcblx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLm9uKFwiY29weVwiLCBmdW5jdGlvbigpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIGNvcHlUZXh0ID0gXCJcIjtcblx0XHRyb290LmZpbmQoXCIuc2VsZWN0ZWRcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0Y29weVRleHQrPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnRleHRMaW5lKCQodGhpcykpO1xuXHRcdFx0fSk7XG5cdFx0aWYoKGNvcHlUZXh0IT1cIlwiKSAmJiAoY29weVRleHQhPVwiXFxuXCIpKXtcblx0XHRcdGNvbmNvcmRDbGlwYm9hcmQgPSB7dGV4dDogY29weVRleHQsIGRhdGE6IHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5jbG9uZSh0cnVlLCB0cnVlKX07XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uaHRtbChcIjxwcmU+XCIrJChcIjxkaXYvPlwiKS50ZXh0KGNvcHlUZXh0KS5odG1sKCkrXCI8L3ByZT5cIik7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uZm9jdXMoKTtcblx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwic2VsZWN0QWxsXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4ub24oXCJwYXN0ZVwiLCBmdW5jdGlvbihldmVudCl7XG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKVtcInJlYWRvbmx5XCJdPT10cnVlKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR2YXIgY29uY29yZFRleHQgPSBjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKTtcblx0XHRjb25jb3JkVGV4dC5hZGRDbGFzcyhcInBhc3RlXCIpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5odG1sKFwiXCIpO1xuXHRcdHNldFRpbWVvdXQoZWRpdG9yLnNhbml0aXplLDEwKTtcblx0XHR9KTtcblx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLm9uKFwiY3V0XCIsIGZ1bmN0aW9uKCl7XG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKVtcInJlYWRvbmx5XCJdPT10cnVlKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR2YXIgY29weVRleHQgPSBcIlwiO1xuXHRcdHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRjb3B5VGV4dCs9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IudGV4dExpbmUoJCh0aGlzKSk7XG5cdFx0XHR9KTtcblx0XHRpZigoY29weVRleHQhPVwiXCIpICYmIChjb3B5VGV4dCE9XCJcXG5cIikpe1xuXHRcdFx0Y29uY29yZENsaXBib2FyZCA9IHt0ZXh0OiBjb3B5VGV4dCwgZGF0YTogcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLmNsb25lKHRydWUsIHRydWUpfTtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5odG1sKFwiPHByZT5cIiskKFwiPGRpdi8+XCIpLnRleHQoY29weVRleHQpLmh0bWwoKStcIjwvcHJlPlwiKTtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZUxpbmUoKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKX0sIDIwMCk7XG5cdFx0fSk7XG5cdHJvb3Qub24oXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0aWYodGFyZ2V0LmlzKFwiYVwiKSl7XG5cdFx0XHRpZih0YXJnZXQuYXR0cihcImhyZWZcIikpe1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR3aW5kb3cub3Blbih0YXJnZXQuYXR0cihcImhyZWZcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdGlmKHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS5sZW5ndGg9PTEpe1xuXHRcdFx0XHR0YXJnZXQgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XG5cdFx0XHRcdH1cblx0XHRcdGlmKHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtdGV4dFwiKSl7XG5cdFx0XHRcdHZhciBub2RlID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRpZihub2RlLmxlbmd0aD09MSl7XG5cdFx0XHRcdFx0b3Auc2V0Q3Vyc29yKG5vZGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGV2ZW50LndoaWNoPT0xKSB7XG5cdFx0XHRpZihyb290LmRhdGEoXCJkcm9wZG93blwiKSl7XG5cdFx0XHRcdGVkaXRvci5oaWRlQ29udGV4dE1lbnUoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRpZih0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIikubGVuZ3RoPT0xKXtcblx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZih0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXRleHRcIikpe1xuXHRcdFx0XHR2YXIgbm9kZSA9IHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0aWYobm9kZS5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdGlmKCFyb290Lmhhc0NsYXNzKFwidGV4dE1vZGVcIikpe1xuXHRcdFx0XHRcdFx0cm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XG5cdFx0XHRcdFx0XHRyb290LmFkZENsYXNzKFwidGV4dE1vZGVcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYobm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmhhc0NsYXNzKFwiZWRpdGluZ1wiKSl7XG5cdFx0XHRcdFx0XHRyb290LmZpbmQoXCIuZWRpdGluZ1wiKS5yZW1vdmVDbGFzcyhcImVkaXRpbmdcIik7XG5cdFx0XHRcdFx0XHRub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIikuYWRkQ2xhc3MoXCJlZGl0aW5nXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKCFub2RlLmhhc0NsYXNzKFwiY29uY29yZC1jdXJzb3JcIikpe1xuXHRcdFx0XHRcdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yXCIpLnJlbW92ZUNsYXNzKFwiY29uY29yZC1jdXJzb3JcIik7XG5cdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiY29uY29yZC1jdXJzb3JcIik7XG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BDdXJzb3JNb3ZlZFwiLCBvcC5zZXRDdXJzb3JDb250ZXh0KG5vZGUpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0cm9vdC5kYXRhKFwibW91c2Vkb3duXCIsIHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0cm9vdC5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoIWVkaXRvci5lZGl0YWJsZSgkKGV2ZW50LnRhcmdldCkpKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYocm9vdC5kYXRhKFwibW91c2Vkb3duXCIpICYmICFyb290LmRhdGEoXCJkcmFnZ2luZ1wiKSkge1xuXHRcdFx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXHRcdFx0XHRpZih0YXJnZXQuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpe1xuXHRcdFx0XHRcdHRhcmdldCA9IHRhcmdldC5wYXJlbnQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGlmKHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSAmJiB0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoXCJzZWxlY3RlZFwiKSkge1xuXHRcdFx0XHRcdGVkaXRvci5kcmFnTW9kZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRyb290Lm9uKFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRpZih0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLW5vZGVcIikpIHtcblx0XHRcdHRhcmdldCA9IHRhcmdldC5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdFx0fSBlbHNlIGlmKHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSkge1xuXHRcdFx0XHR0YXJnZXQgPSB0YXJnZXQuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdFx0XHR9XG5cdFx0aWYoIWVkaXRvci5lZGl0YWJsZSh0YXJnZXQpKSB7XG5cdFx0XHRyb290LmRhdGEoXCJtb3VzZWRvd25cIiwgZmFsc2UpO1xuXHRcdFx0aWYocm9vdC5kYXRhKFwiZHJhZ2dpbmdcIikpIHtcblx0XHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdFx0dmFyIG5vZGUgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdHZhciBkcmFnZ2FibGUgPSByb290LmZpbmQoXCIuc2VsZWN0ZWRcIik7XG5cdFx0XHRcdGlmKChub2RlLmxlbmd0aCA9PSAxKSAmJiAoZHJhZ2dhYmxlLmxlbmd0aCA+PSAxKSkge1xuXHRcdFx0XHRcdHZhciBpc0RyYWdnYWJsZVRhcmdldCA9IGZhbHNlO1xuXHRcdFx0XHRcdGRyYWdnYWJsZS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRpZih0aGlzPT1ub2RlWzBdKXtcblx0XHRcdFx0XHRcdFx0aXNEcmFnZ2FibGVUYXJnZXQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZighaXNEcmFnZ2FibGVUYXJnZXQpIHtcblx0XHRcdFx0XHRcdHZhciBkcmFnZ2FibGVJc1RhcmdldFBhcmVudCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0bm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgbm9kZVBhcmVudCA9ICQodGhpcylbMF07XG5cdFx0XHRcdFx0XHRcdGRyYWdnYWJsZS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRcdFx0aWYoJCh0aGlzKVswXSA9PSBub2RlUGFyZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRkcmFnZ2FibGVJc1RhcmdldFBhcmVudCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0aWYoIWRyYWdnYWJsZUlzVGFyZ2V0UGFyZW50KSB7XG5cdFx0XHRcdFx0XHRcdGlmKHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSB8fCB0YXJnZXQuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgY2xvbmVkRHJhZ2dhYmxlID0gZHJhZ2dhYmxlLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdGNsb25lZERyYWdnYWJsZS5pbnNlcnRBZnRlcihub2RlKTtcblx0XHRcdFx0XHRcdFx0XHRkcmFnZ2FibGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBjbG9uZWREcmFnZ2FibGUgPSBkcmFnZ2FibGUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgb3V0bGluZSA9IG5vZGUuY2hpbGRyZW4oXCJvbFwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdGNsb25lZERyYWdnYWJsZS5wcmVwZW5kVG8ob3V0bGluZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRub2RlLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZHJhZ2dhYmxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR2YXIgcHJldiA9IG5vZGUucHJldigpO1xuXHRcdFx0XHRcdFx0XHRpZihwcmV2Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYocHJldi5oYXNDbGFzcyhcImRyb3AtY2hpbGRcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBjbG9uZWREcmFnZ2FibGUgPSBkcmFnZ2FibGUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgb3V0bGluZSA9IHByZXYuY2hpbGRyZW4oXCJvbFwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdGNsb25lZERyYWdnYWJsZS5hcHBlbmRUbyhvdXRsaW5lKTtcblx0XHRcdFx0XHRcdFx0XHRcdHByZXYucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRkcmFnZ2FibGUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRlZGl0b3IuZHJhZ01vZGVFeGl0KCk7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVjYWxjdWxhdGVMZXZlbHMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRyb290Lm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKVtcInJlYWRvbmx5XCJdPT10cnVlKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihyb290LmRhdGEoXCJkcmFnZ2luZ1wiKSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0XHR2YXIgbm9kZSA9IHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdHZhciBkcmFnZ2FibGUgPSByb290LmZpbmQoXCIuc2VsZWN0ZWRcIik7XG5cdFx0XHRpZigobm9kZS5sZW5ndGggPT0gMSkgJiYgKGRyYWdnYWJsZS5sZW5ndGg+PTEpKSB7XG5cdFx0XHRcdHZhciBpc0RyYWdnYWJsZVRhcmdldCA9IGZhbHNlO1xuXHRcdFx0XHRkcmFnZ2FibGUuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGlmKHRoaXM9PW5vZGVbMF0pe1xuXHRcdFx0XHRcdFx0aXNEcmFnZ2FibGVUYXJnZXQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZighaXNEcmFnZ2FibGVUYXJnZXQpIHtcblx0XHRcdFx0XHR2YXIgZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQgPSBmYWxzZTtcblx0XHRcdFx0XHRub2RlLnBhcmVudHMoXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgbm9kZVBhcmVudCA9ICQodGhpcylbMF07XG5cdFx0XHRcdFx0XHRkcmFnZ2FibGUuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0XHRpZigkKHRoaXMpWzBdID09IG5vZGVQYXJlbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRkcmFnZ2FibGVJc1RhcmdldFBhcmVudCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmKCFkcmFnZ2FibGVJc1RhcmdldFBhcmVudCkge1xuXHRcdFx0XHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImRyb3Atc2libGluZ1wiKS5yZW1vdmUoXCJkcm9wLWNoaWxkXCIpO1xuXHRcdFx0XHRcdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC13cmFwcGVyXCIpIHx8IHRhcmdldC5oYXNDbGFzcyhcIm5vZGUtaWNvblwiKSkge1xuXHRcdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiZHJvcC1zaWJsaW5nXCIpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG5vZGUuYWRkQ2xhc3MoXCJkcm9wLWNoaWxkXCIpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKGRyYWdnYWJsZS5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdFx0dmFyIHByZXYgPSBub2RlLnByZXYoKTtcblx0XHRcdFx0XHRcdGlmKHByZXYubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRcdFx0cHJldi5yZW1vdmVDbGFzcyhcImRyb3Atc2libGluZ1wiKS5yZW1vdmUoXCJkcm9wLWNoaWxkXCIpO1xuXHRcdFx0XHRcdFx0XHRwcmV2LmFkZENsYXNzKFwiZHJvcC1jaGlsZFwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdHJvb3Qub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYocm9vdC5kYXRhKFwiZHJhZ2dpbmdcIikpIHtcblx0XHRcdHJvb3QuZmluZChcIi5kcm9wLXNpYmxpbmdcIikucmVtb3ZlQ2xhc3MoXCJkcm9wLXNpYmxpbmdcIik7XG5cdFx0XHRyb290LmZpbmQoXCIuZHJvcC1jaGlsZFwiKS5yZW1vdmVDbGFzcyhcImRyb3AtY2hpbGRcIik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxubW9kdWxlLmV4cG9ydHMgPSBDb25jb3JkRXZlbnRzO1xuIiwiZnVuY3Rpb24gQ29uY29yZE9wQXR0cmlidXRlcyhjb25jb3JkSW5zdGFuY2UsIGN1cnNvcikge1xuXHR0aGlzLl9jc3NUZXh0Q2xhc3NOYW1lID0gXCJjc3NUZXh0Q2xhc3NcIjtcblx0dGhpcy5fY3NzVGV4dENsYXNzID0gZnVuY3Rpb24obmV3VmFsdWUpe1xuXHRcdGlmKG5ld1ZhbHVlPT09dW5kZWZpbmVkKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR2YXIgbmV3Q3NzQ2xhc3NlcyA9IG5ld1ZhbHVlLnNwbGl0KC9cXHMrLyk7XG5cdFx0dmFyIGNvbmNvcmRUZXh0ID0gY3Vyc29yLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XG5cdFx0dmFyIGN1cnJlbnRDc3NDbGFzcyA9IGNvbmNvcmRUZXh0LmF0dHIoXCJjbGFzc1wiKTtcblx0XHRpZihjdXJyZW50Q3NzQ2xhc3Mpe1xuXHRcdFx0dmFyIGNzc0NsYXNzZXNBcnJheSA9IGN1cnJlbnRDc3NDbGFzcy5zcGxpdCgvXFxzKy8pO1xuXHRcdFx0Zm9yKHZhciBpIGluIGNzc0NsYXNzZXNBcnJheSl7XG5cdFx0XHRcdHZhciBjbGFzc05hbWUgPSBjc3NDbGFzc2VzQXJyYXlbaV07XG5cdFx0XHRcdGlmKGNsYXNzTmFtZS5tYXRjaCgvXmNvbmNvcmRcXC0uKyQvKSA9PSBudWxsKXtcblx0XHRcdFx0XHRjb25jb3JkVGV4dC5yZW1vdmVDbGFzcyhjbGFzc05hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGZvcih2YXIgaiBpbiBuZXdDc3NDbGFzc2VzKXtcblx0XHRcdHZhciBuZXdDbGFzcyA9IG5ld0Nzc0NsYXNzZXNbal07XG5cdFx0XHRjb25jb3JkVGV4dC5hZGRDbGFzcyhuZXdDbGFzcyk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5hZGRHcm91cCA9IGZ1bmN0aW9uKGF0dHJpYnV0ZXMpIHtcblx0XHRpZihhdHRyaWJ1dGVzW1widHlwZVwiXSl7XG5cdFx0XHRjdXJzb3IuYXR0cihcIm9wbWwtdHlwZVwiLCBhdHRyaWJ1dGVzW1widHlwZVwiXSk7XG5cdFx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRjdXJzb3IucmVtb3ZlQXR0cihcIm9wbWwtdHlwZVwiKTtcblx0XHRcdH1cblx0XHR0aGlzLl9jc3NUZXh0Q2xhc3MoYXR0cmlidXRlc1t0aGlzLl9jc3NUZXh0Q2xhc3NOYW1lXSk7XG5cdFx0dmFyIGZpbmFsQXR0cmlidXRlcyA9IHRoaXMuZ2V0QWxsKCk7XG5cdFx0dmFyIGljb25BdHRyaWJ1dGUgPSBcInR5cGVcIjtcblx0XHRpZihhdHRyaWJ1dGVzW1wiaWNvblwiXSl7XG5cdFx0XHRpY29uQXR0cmlidXRlID0gXCJpY29uXCI7XG5cdFx0XHR9XG5cdFx0Zm9yKHZhciBuYW1lIGluIGF0dHJpYnV0ZXMpe1xuXHRcdFx0ZmluYWxBdHRyaWJ1dGVzW25hbWVdID0gYXR0cmlidXRlc1tuYW1lXTtcblx0XHRcdGlmKG5hbWU9PWljb25BdHRyaWJ1dGUpe1xuXHRcdFx0XHR2YXIgdmFsdWUgPSBhdHRyaWJ1dGVzW25hbWVdO1xuXHRcdFx0XHR2YXIgd3JhcHBlciA9IGN1cnNvci5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIik7XG5cdFx0XHRcdHZhciBpY29uTmFtZSA9IG51bGw7XG5cdFx0XHRcdGlmKChuYW1lID09IFwidHlwZVwiKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnMgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW3ZhbHVlXSl7XG5cdFx0XHRcdFx0aWNvbk5hbWUgPSBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbdmFsdWVdO1xuXHRcdFx0XHRcdH1lbHNlIGlmIChuYW1lPT1cImljb25cIil7XG5cdFx0XHRcdFx0XHRpY29uTmFtZSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRpZihpY29uTmFtZSl7XG5cdFx0XHRcdFx0dmFyIGljb24gPSBcIjxpXCIrXCIgY2xhc3M9XFxcIm5vZGUtaWNvbiBpY29uLVwiKyBpY29uTmFtZSArXCJcXFwiPjxcIitcIi9pPlwiO1xuXHRcdFx0XHRcdHdyYXBwZXIuY2hpbGRyZW4oXCIubm9kZS1pY29uOmZpcnN0XCIpLnJlcGxhY2VXaXRoKGljb24pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGN1cnNvci5kYXRhKFwiYXR0cmlidXRlc1wiLCBmaW5hbEF0dHJpYnV0ZXMpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdHJldHVybiBmaW5hbEF0dHJpYnV0ZXM7XG5cdFx0fTtcblx0dGhpcy5zZXRHcm91cCA9IGZ1bmN0aW9uKGF0dHJpYnV0ZXMpIHtcblx0XHRpZihhdHRyaWJ1dGVzW3RoaXMuX2Nzc1RleHRDbGFzc05hbWVdIT09dW5kZWZpbmVkKXtcblx0XHRcdHRoaXMuX2Nzc1RleHRDbGFzcyhhdHRyaWJ1dGVzW3RoaXMuX2Nzc1RleHRDbGFzc05hbWVdKTtcblx0XHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuX2Nzc1RleHRDbGFzcyhcIlwiKTtcblx0XHRcdH1cblx0XHRjdXJzb3IuZGF0YShcImF0dHJpYnV0ZXNcIiwgYXR0cmlidXRlcyk7XG5cdFx0dmFyIHdyYXBwZXIgPSBjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpO1xuXHRcdCQoY3Vyc29yWzBdLmF0dHJpYnV0ZXMpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbWF0Y2hlcyA9IHRoaXMubmFtZS5tYXRjaCgvXm9wbWwtKC4rKSQvKVxuXHRcdFx0aWYobWF0Y2hlcykge1xuXHRcdFx0XHR2YXIgbmFtZSA9IG1hdGNoZXNbMV07XG5cdFx0XHRcdGlmKCFhdHRyaWJ1dGVzW25hbWVdKSB7XG5cdFx0XHRcdFx0Y3Vyc29yLnJlbW92ZUF0dHIodGhpcy5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdHZhciBpY29uQXR0cmlidXRlID0gXCJ0eXBlXCI7XG5cdFx0aWYoYXR0cmlidXRlc1tcImljb25cIl0pe1xuXHRcdFx0aWNvbkF0dHJpYnV0ZSA9IFwiaWNvblwiO1xuXHRcdFx0fVxuXHRcdGlmKG5hbWU9PVwidHlwZVwiKXtcblx0XHRcdGN1cnNvci5hdHRyKFwib3BtbC1cIiArIG5hbWUsIGF0dHJpYnV0ZXNbbmFtZV0pO1xuXHRcdFx0fVxuXHRcdGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRpZihuYW1lPT1pY29uQXR0cmlidXRlKXtcblx0XHRcdFx0dmFyIHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcblx0XHRcdFx0dmFyIHdyYXBwZXIgPSBjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpO1xuXHRcdFx0XHR2YXIgaWNvbk5hbWUgPSBudWxsO1xuXHRcdFx0XHRpZigobmFtZSA9PSBcInR5cGVcIikgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29uc1t2YWx1ZV0pe1xuXHRcdFx0XHRcdGljb25OYW1lID0gY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW3ZhbHVlXTtcblx0XHRcdFx0XHR9ZWxzZSBpZiAobmFtZT09XCJpY29uXCIpe1xuXHRcdFx0XHRcdFx0aWNvbk5hbWUgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0aWYoaWNvbk5hbWUpe1xuXHRcdFx0XHRcdHZhciBpY29uID0gXCI8aVwiK1wiIGNsYXNzPVxcXCJub2RlLWljb24gaWNvbi1cIisgaWNvbk5hbWUgK1wiXFxcIj48XCIrXCIvaT5cIjtcblx0XHRcdFx0XHR3cmFwcGVyLmNoaWxkcmVuKFwiLm5vZGUtaWNvbjpmaXJzdFwiKS5yZXBsYWNlV2l0aChpY29uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcblx0XHRyZXR1cm4gYXR0cmlidXRlcztcblx0XHR9O1xuXHR0aGlzLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmKGN1cnNvci5kYXRhKFwiYXR0cmlidXRlc1wiKSAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdHJldHVybiBjdXJzb3IuZGF0YShcImF0dHJpYnV0ZXNcIik7XG5cdFx0XHR9XG5cdFx0cmV0dXJuIHt9O1xuXHRcdH07XG5cdHRoaXMuZ2V0T25lID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdHJldHVybiB0aGlzLmdldEFsbCgpW25hbWVdO1xuXHRcdH07XG5cdHRoaXMubWFrZUVtcHR5ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fY3NzVGV4dENsYXNzKFwiXCIpO1xuXHRcdHZhciBudW1BdHRyaWJ1dGVzID0gMDtcblx0XHR2YXIgYXR0cyA9IHRoaXMuZ2V0QWxsKCk7XG5cdFx0aWYoYXR0cyAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdGZvcih2YXIgaSBpbiBhdHRzKXtcblx0XHRcdFx0bnVtQXR0cmlidXRlcysrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0Y3Vyc29yLnJlbW92ZURhdGEoXCJhdHRyaWJ1dGVzXCIpO1xuXHRcdHZhciByZW1vdmVkQW55QXR0cmlidXRlcyA9IChudW1BdHRyaWJ1dGVzID4gMCk7XG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSB7fTtcblx0XHQkKGN1cnNvclswXS5hdHRyaWJ1dGVzKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG1hdGNoZXMgPSB0aGlzLm5hbWUubWF0Y2goL15vcG1sLSguKykkLylcblx0XHRcdGlmKG1hdGNoZXMpIHtcblx0XHRcdFx0Y3Vyc29yLnJlbW92ZUF0dHIodGhpcy5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0aWYocmVtb3ZlZEFueUF0dHJpYnV0ZXMpe1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHR9XG5cdFx0cmV0dXJuIHJlbW92ZWRBbnlBdHRyaWJ1dGVzO1xuXHRcdH07XG5cdHRoaXMuc2V0T25lID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcblx0XHRpZihuYW1lPT10aGlzLl9jc3NUZXh0Q2xhc3NOYW1lKXtcblx0XHRcdHRoaXMuX2Nzc1RleHRDbGFzcyh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0dmFyIGF0dHMgPSB0aGlzLmdldEFsbCgpO1xuXHRcdGF0dHNbbmFtZV09dmFsdWU7XG5cdFx0Y3Vyc29yLmRhdGEoXCJhdHRyaWJ1dGVzXCIsIGF0dHMpO1xuXHRcdGlmKChuYW1lPT1cInR5cGVcIiApfHwgKG5hbWU9PVwiaWNvblwiKSl7XG5cdFx0XHRjdXJzb3IuYXR0cihcIm9wbWwtXCIgKyBuYW1lLCB2YWx1ZSk7XG5cdFx0XHR2YXIgd3JhcHBlciA9IGN1cnNvci5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIik7XG5cdFx0XHR2YXIgaWNvbk5hbWUgPSBudWxsO1xuXHRcdFx0aWYoKG5hbWUgPT0gXCJ0eXBlXCIpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29ucyAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbdmFsdWVdKXtcblx0XHRcdFx0aWNvbk5hbWUgPSBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbdmFsdWVdO1xuXHRcdFx0XHR9ZWxzZSBpZiAobmFtZT09XCJpY29uXCIpe1xuXHRcdFx0XHRcdGljb25OYW1lID0gdmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0aWYoaWNvbk5hbWUpe1xuXHRcdFx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tXCIrIGljb25OYW1lICtcIlxcXCI+PFwiK1wiL2k+XCI7XG5cdFx0XHRcdHdyYXBwZXIuY2hpbGRyZW4oXCIubm9kZS1pY29uOmZpcnN0XCIpLnJlcGxhY2VXaXRoKGljb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy5leGlzdHMgPSBmdW5jdGlvbihuYW1lKXtcblx0XHRpZih0aGlzLmdldE9uZShuYW1lKSAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdHRoaXMucmVtb3ZlT25lID0gZnVuY3Rpb24obmFtZSl7XG5cdFx0aWYodGhpcy5nZXRBbGwoKVtuYW1lXSl7XG5cdFx0XHRpZihuYW1lID09IHRoaXMuX2Nzc1RleHRDbGFzc05hbWUpe1xuXHRcdFx0XHR0aGlzLl9jc3NUZXh0Q2xhc3MoXCJcIik7XG5cdFx0XHRcdH1cblx0XHRcdGRlbGV0ZSB0aGlzLmdldEFsbCgpW25hbWVdO1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblx0fVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmNvcmRPcEF0dHJpYnV0ZXM7XG4iLCJ2YXIgQ29uY29yZE9wQXR0cmlidXRlcyA9IHJlcXVpcmUoXCIuL2NvbmNvcmQtb3AtYXR0cmlidXRlc1wiKTtcblxudmFyIG5pbCA9IG51bGw7XG52YXIgaW5maW5pdHkgPSBOdW1iZXIuTUFYX1ZBTFVFO1xudmFyIGRvd24gPSBcImRvd25cIjtcbnZhciBsZWZ0ID0gXCJsZWZ0XCI7XG52YXIgcmlnaHQgPSBcInJpZ2h0XCI7XG52YXIgdXAgPSBcInVwXCI7XG52YXIgZmxhdHVwID0gXCJmbGF0dXBcIjtcbnZhciBmbGF0ZG93biA9IFwiZmxhdGRvd25cIjtcbnZhciBub2RpcmVjdGlvbiA9IFwibm9kaXJlY3Rpb25cIjtcblxuZnVuY3Rpb24gQ29uY29yZE9wKHJvb3QsIGNvbmNvcmRJbnN0YW5jZSwgX2N1cnNvcikge1xuXHR0aGlzLl93YWxrX3VwID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRcdHZhciBwcmV2ID0gY29udGV4dC5wcmV2KCk7XG5cdFx0aWYocHJldi5sZW5ndGggPT0gMCkge1xuXHRcdFx0dmFyIHBhcmVudCA9IGNvbnRleHQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRpZihwYXJlbnQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0cmV0dXJuIHBhcmVudDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fbGFzdF9jaGlsZChwcmV2KTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuX3dhbGtfZG93biA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHR2YXIgbmV4dCA9IGNvbnRleHQubmV4dCgpO1xuXHRcdGlmKG5leHQubGVuZ3RoID09IDEpIHtcblx0XHRcdHJldHVybiBuZXh0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIHBhcmVudCA9IGNvbnRleHQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdGlmKHBhcmVudC5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLl93YWxrX2Rvd24ocGFyZW50KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLl9sYXN0X2NoaWxkID0gZnVuY3Rpb24oY29udGV4dCkge1xuXHRcdGlmKGNvbnRleHQuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcblx0XHRcdHJldHVybiBjb250ZXh0O1xuXHRcdFx0fVxuXHRcdHZhciBvdXRsaW5lID0gY29udGV4dC5jaGlsZHJlbihcIm9sXCIpO1xuXHRcdGlmKG91dGxpbmUubGVuZ3RoID09IDApIHtcblx0XHRcdHJldHVybiBjb250ZXh0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGxhc3RDaGlsZCA9IG91dGxpbmUuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmxhc3RcIik7XG5cdFx0XHRcdGlmKGxhc3RDaGlsZC5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9sYXN0X2NoaWxkKGxhc3RDaGlsZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNvbnRleHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuYm9sZCA9IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcImJvbGRcIik7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dGhpcy5mb2N1c0N1cnNvcigpO1xuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInNlbGVjdEFsbFwiKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJib2xkXCIpO1xuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInVuc2VsZWN0XCIpO1xuXHRcdFx0XHR0aGlzLmJsdXJDdXJzb3IoKTtcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHR9O1xuXHR0aGlzLmNoYW5nZWQgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gcm9vdC5kYXRhKFwiY2hhbmdlZFwiKSA9PSB0cnVlO1xuXHRcdH07XG5cdHRoaXMuY2xlYXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XG5cdFx0cm9vdC5kYXRhKFwiY2hhbmdlZFwiLCBmYWxzZSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy5jb2xsYXBzZSA9IGZ1bmN0aW9uKHRyaWdnZXJDYWxsYmFja3MpIHtcblx0XHRpZih0cmlnZ2VyQ2FsbGJhY2tzID09IHVuZGVmaW5lZCl7XG5cdFx0XHR0cmlnZ2VyQ2FsbGJhY2tzID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0aWYodHJpZ2dlckNhbGxiYWNrcyl7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcENvbGxhcHNlXCIsIHRoaXMuc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XG5cdFx0XHRcdH1cblx0XHRcdG5vZGUuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRub2RlLmZpbmQoXCJvbFwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZigkKHRoaXMpLmNoaWxkcmVuKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdCQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmNvcHkgPSBmdW5jdGlvbigpe1xuXHRcdGlmKCF0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRyb290LmRhdGEoXCJjbGlwYm9hcmRcIiwgcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLmNsb25lKHRydWUsIHRydWUpKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmNvdW50U3VicyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRyZXR1cm4gbm9kZS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkuc2l6ZSgpO1xuXHRcdFx0fVxuXHRcdHJldHVybiAwO1xuXHRcdH07XG5cdHRoaXMuY3Vyc29yVG9YbWwgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLm9wbWwodGhpcy5nZXRDdXJzb3IoKSk7XG5cdFx0fTtcblx0dGhpcy5jdXJzb3JUb1htbFN1YnNPbmx5ID0gZnVuY3Rpb24oKXsgLy84LzUvMTMgYnkgRFdcblx0XHRyZXR1cm4gY29uY29yZEluc3RhbmNlLmVkaXRvci5vcG1sKHRoaXMuZ2V0Q3Vyc29yKCksIHRydWUpO1xuXHRcdH07XG5cdHRoaXMuY3V0ID0gZnVuY3Rpb24oKXtcblx0XHRpZighdGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0dGhpcy5jb3B5KCk7XG5cdFx0XHR0aGlzLmRlbGV0ZUxpbmUoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmRlbGV0ZUxpbmUgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdFx0dmFyIHAgPSBjdXJzb3IucHJldigpO1xuXHRcdFx0aWYocC5sZW5ndGg9PTApe1xuXHRcdFx0XHRwID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRjdXJzb3IucmVtb3ZlKCk7XG5cdFx0XHRpZihwLmxlbmd0aD09MSkge1xuXHRcdFx0XHR0aGlzLnNldEN1cnNvcihwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpLmxlbmd0aD09MSkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3Iocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0aGlzLndpcGUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdH1lbHNle1xuXHRcdFx0XHR2YXIgc2VsZWN0ZWQgPSByb290LmZpbmQoXCIuc2VsZWN0ZWRcIik7XG5cdFx0XHRcdGlmKHNlbGVjdGVkLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0dmFyIHAgPSBzZWxlY3RlZC5wcmV2KCk7XG5cdFx0XHRcdFx0aWYocC5sZW5ndGg9PTApe1xuXHRcdFx0XHRcdFx0cCA9IHNlbGVjdGVkLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNlbGVjdGVkLnJlbW92ZSgpO1xuXHRcdFx0XHRcdGlmKHAubGVuZ3RoPT0xKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnNldEN1cnNvcihwKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikubGVuZ3RoPT0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3Iocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKSk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMud2lwZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmKHNlbGVjdGVkLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdHZhciBmaXJzdCA9IHJvb3QuZmluZChcIi5zZWxlY3RlZDpmaXJzdFwiKTtcblx0XHRcdFx0XHRcdHZhciBwID0gZmlyc3QucHJldigpO1xuXHRcdFx0XHRcdFx0aWYocC5sZW5ndGg9PTApe1xuXHRcdFx0XHRcdFx0XHRwID0gZmlyc3QucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNlbGVjdGVkLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0aWYocC5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdFx0XHR0aGlzLnNldEN1cnNvcihwKTtcblx0XHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKS5sZW5ndGg9PTEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy53aXBlKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRpZihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCA9PSAwKSB7XG5cdFx0XHR2YXIgbm9kZSA9IHRoaXMuaW5zZXJ0KFwiXCIsIGRvd24pO1xuXHRcdFx0dGhpcy5zZXRDdXJzb3Iobm9kZSk7XG5cdFx0XHR9XG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdH07XG5cdHRoaXMuZGVsZXRlU3VicyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRpZihub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5sZW5ndGggPiAwKXtcblx0XHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdFx0bm9kZS5jaGlsZHJlbihcIm9sXCIpLmVtcHR5KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0fTtcblx0dGhpcy5kZW1vdGUgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0dmFyIG1vdmVkU2libGluZ3MgPSBmYWxzZTtcblx0XHRpZihub2RlLm5leHRBbGwoKS5sZW5ndGg+MCl7XG5cdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0bm9kZS5uZXh0QWxsKCkuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNpYmxpbmcgPSAkKHRoaXMpLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0XHRzaWJsaW5nLmFwcGVuZFRvKG5vZGUuY2hpbGRyZW4oXCJvbFwiKSk7XG5cdFx0XHRcdG5vZGUucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5yZWNhbGN1bGF0ZUxldmVscyhub2RlLmZpbmQoXCIuY29uY29yZC1ub2RlXCIpKTtcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmV4cGFuZCA9IGZ1bmN0aW9uKHRyaWdnZXJDYWxsYmFja3MpIHtcblx0XHRpZih0cmlnZ2VyQ2FsbGJhY2tzID09IHVuZGVmaW5lZCl7XG5cdFx0XHR0cmlnZ2VyQ2FsbGJhY2tzID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0aWYodHJpZ2dlckNhbGxiYWNrcyl7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEV4cGFuZFwiLCB0aGlzLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSl7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdHZhciBjdXJzb3JQb3NpdGlvbiA9IG5vZGUub2Zmc2V0KCkudG9wO1xuXHRcdFx0dmFyIGN1cnNvckhlaWdodCA9bm9kZS5oZWlnaHQoKTtcblx0XHRcdHZhciB3aW5kb3dQb3NpdGlvbiA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciB3aW5kb3dIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cdFx0XHRpZiggKCBjdXJzb3JQb3NpdGlvbiA8IHdpbmRvd1Bvc2l0aW9uICkgfHwgKCAoY3Vyc29yUG9zaXRpb24rY3Vyc29ySGVpZ2h0KSA+ICh3aW5kb3dQb3NpdGlvbit3aW5kb3dIZWlnaHQpICkgKXtcblx0XHRcdFx0aWYoY3Vyc29yUG9zaXRpb24gPCB3aW5kb3dQb3NpdGlvbil7XG5cdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbFRvcChjdXJzb3JQb3NpdGlvbik7XG5cdFx0XHRcdFx0fWVsc2UgaWYgKChjdXJzb3JQb3NpdGlvbitjdXJzb3JIZWlnaHQpID4gKHdpbmRvd1Bvc2l0aW9uK3dpbmRvd0hlaWdodCkpe1xuXHRcdFx0XHRcdFx0dmFyIGxpbmVIZWlnaHQgPSBwYXJzZUludChub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIikuY3NzKFwibGluZS1oZWlnaHRcIikpICsgNjtcblx0XHRcdFx0XHRcdGlmKChjdXJzb3JIZWlnaHQrbGluZUhlaWdodCkgPCB3aW5kb3dIZWlnaHQpe1xuXHRcdFx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKGN1cnNvclBvc2l0aW9uIC0gKHdpbmRvd0hlaWdodC1jdXJzb3JIZWlnaHQpK2xpbmVIZWlnaHQpO1xuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKGN1cnNvclBvc2l0aW9uKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmV4cGFuZEFsbExldmVscyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRub2RlLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0bm9kZS5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmZvY3VzQ3Vyc29yID0gZnVuY3Rpb24oKXtcblx0XHR0aGlzLmdldEN1cnNvcigpLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIikuZm9jdXMoKTtcblx0XHR9O1xuXHR0aGlzLmJsdXJDdXJzb3IgPSBmdW5jdGlvbigpe1xuXHRcdHRoaXMuZ2V0Q3Vyc29yKCkuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKS5ibHVyKCk7XG5cdFx0fTtcblx0dGhpcy5mdWxsQ29sbGFwc2UgPSBmdW5jdGlvbigpIHtcblx0XHRyb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRpZigkKHRoaXMpLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5zaXplKCkgPiAwKSB7XG5cdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdHZhciB0b3BQYXJlbnQgPSBjdXJzb3IucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6bGFzdFwiKTtcblx0XHRpZih0b3BQYXJlbnQubGVuZ3RoID09IDEpIHtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iuc2VsZWN0KHRvcFBhcmVudCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5mdWxsRXhwYW5kID0gZnVuY3Rpb24oKSB7XG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHR9O1xuXHR0aGlzLmdldEN1cnNvciA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoX2N1cnNvcil7XG5cdFx0XHRyZXR1cm4gX2N1cnNvcjtcblx0XHRcdH1cblx0XHRyZXR1cm4gcm9vdC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yOmZpcnN0XCIpO1xuXHRcdH07XG5cdHRoaXMuZ2V0Q3Vyc29yUmVmID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy5zZXRDdXJzb3JDb250ZXh0KHRoaXMuZ2V0Q3Vyc29yKCkpO1xuXHRcdH07XG5cdHRoaXMuZ2V0SGVhZGVycyA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGhlYWRlcnMgPSB7fTtcblx0XHRpZihyb290LmRhdGEoXCJoZWFkXCIpKXtcblx0XHRcdGhlYWRlcnMgPSByb290LmRhdGEoXCJoZWFkXCIpO1xuXHRcdFx0fVxuXHRcdGhlYWRlcnNbXCJ0aXRsZVwiXSA9IHRoaXMuZ2V0VGl0bGUoKTtcblx0XHRyZXR1cm4gaGVhZGVycztcblx0XHR9LFxuXHR0aGlzLmdldExpbmVUZXh0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdGlmKG5vZGUubGVuZ3RoID09IDEpIHtcblx0XHRcdHZhciB0ZXh0ID0gbm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLmh0bWwoKTtcblx0XHRcdHZhciB0ZXh0TWF0Y2hlcyA9IHRleHQubWF0Y2goL14oLispPGJyPlxccyokLyk7XG5cdFx0XHRpZih0ZXh0TWF0Y2hlcyl7XG5cdFx0XHRcdHRleHQgPSB0ZXh0TWF0Y2hlc1sxXTtcblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IudW5lc2NhcGUodGV4dCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuZ2V0UmVuZGVyTW9kZSA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYocm9vdC5kYXRhKFwicmVuZGVyTW9kZVwiKSE9PXVuZGVmaW5lZCl7XG5cdFx0XHRyZXR1cm4gKHJvb3QuZGF0YShcInJlbmRlck1vZGVcIik9PT10cnVlKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuZ2V0VGl0bGUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gcm9vdC5kYXRhKFwidGl0bGVcIik7XG5cdFx0fTtcblx0dGhpcy5nbyA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgY291bnQsIG11bHRpcGxlLCB0ZXh0TW9kZSkge1xuXHRcdGlmKGNvdW50PT09dW5kZWZpbmVkKSB7XG5cdFx0XHRjb3VudCA9IDE7XG5cdFx0XHR9XG5cdFx0dmFyIGN1cnNvciA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYodGV4dE1vZGU9PXVuZGVmaW5lZCl7XG5cdFx0XHR0ZXh0TW9kZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdHRoaXMuc2V0VGV4dE1vZGUodGV4dE1vZGUpO1xuXHRcdHZhciBhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSBmYWxzZTtcblx0XHRzd2l0Y2goZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlIHVwOlxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXHRcdFx0XHRcdHZhciBwcmV2ID0gY3Vyc29yLnByZXYoKTtcblx0XHRcdFx0XHRpZihwcmV2Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRjdXJzb3IgPSBwcmV2O1xuXHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoY3Vyc29yLCBtdWx0aXBsZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBkb3duOlxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXHRcdFx0XHRcdHZhciBuZXh0ID0gY3Vyc29yLm5leHQoKTtcblx0XHRcdFx0XHRpZihuZXh0Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRjdXJzb3IgPSBuZXh0O1xuXHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoY3Vyc29yLCBtdWx0aXBsZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBsZWZ0OlxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBjdXJzb3IucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdFx0aWYocGFyZW50Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRjdXJzb3IgPSBwYXJlbnQ7XG5cdFx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IsIG11bHRpcGxlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHJpZ2h0OlxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuXHRcdFx0XHRcdHZhciBmaXJzdFNpYmxpbmcgPSBjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdFx0aWYoZmlyc3RTaWJsaW5nLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRjdXJzb3IgPSBmaXJzdFNpYmxpbmc7XG5cdFx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IsIG11bHRpcGxlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGZsYXR1cDpcblx0XHRcdFx0dmFyIG5vZGVDb3VudCA9IDA7XG5cdFx0XHRcdHdoaWxlKGN1cnNvciAmJiAobm9kZUNvdW50IDwgY291bnQpKSB7XG5cdFx0XHRcdFx0dmFyIGN1cnNvciA9IHRoaXMuX3dhbGtfdXAoY3Vyc29yKTtcblx0XHRcdFx0XHRpZihjdXJzb3IpIHtcblx0XHRcdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikgJiYgKGN1cnNvci5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkuc2l6ZSgpID4gMCkpIHtcblx0XHRcdFx0XHRcdFx0bm9kZUNvdW50Kys7XG5cdFx0XHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdGlmKG5vZGVDb3VudCA9PSBjb3VudCkge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKGN1cnNvciwgbXVsdGlwbGUpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBmbGF0ZG93bjpcblx0XHRcdFx0dmFyIG5vZGVDb3VudCA9IDA7XG5cdFx0XHRcdHdoaWxlKGN1cnNvciAmJiAobm9kZUNvdW50IDwgY291bnQpKSB7XG5cdFx0XHRcdFx0dmFyIG5leHQgPSBudWxsO1xuXHRcdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcblx0XHRcdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XG5cdFx0XHRcdFx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBmaXJzdENoaWxkID0gb3V0bGluZS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRuZXh0ID0gZmlyc3RDaGlsZDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZighbmV4dCkge1xuXHRcdFx0XHRcdFx0bmV4dCA9IHRoaXMuX3dhbGtfZG93bihjdXJzb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGN1cnNvciA9IG5leHQ7XG5cdFx0XHRcdFx0aWYoY3Vyc29yKSB7XG5cdFx0XHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpICYmIChjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLnNpemUoKSA+IDApKSB7XG5cdFx0XHRcdFx0XHRcdG5vZGVDb3VudCsrO1xuXHRcdFx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpZihub2RlQ291bnQgPT0gY291bnQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IsIG11bHRpcGxlKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRyZXR1cm4gYWJsZVRvTW92ZUluRGlyZWN0aW9uO1xuXHRcdH07XG5cdHRoaXMuaW5zZXJ0ID0gZnVuY3Rpb24oaW5zZXJ0VGV4dCwgaW5zZXJ0RGlyZWN0aW9uKSB7XG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHR2YXIgbGV2ZWwgPSB0aGlzLmdldEN1cnNvcigpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCsxO1xuXHRcdHZhciBub2RlID0gJChcIjxsaT48L2xpPlwiKTtcblx0XHRub2RlLmFkZENsYXNzKFwiY29uY29yZC1ub2RlXCIpO1xuXHRcdHN3aXRjaChpbnNlcnREaXJlY3Rpb24pe1xuXHRcdFx0Y2FzZSByaWdodDpcblx0XHRcdFx0bGV2ZWwrPTE7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBsZWZ0OlxuXHRcdFx0XHRsZXZlbC09MTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtbGV2ZWwtXCIrbGV2ZWwpO1xuXHRcdHZhciB3cmFwcGVyID0gJChcIjxkaXYgY2xhc3M9J2NvbmNvcmQtd3JhcHBlcic+PC9kaXY+XCIpO1xuXHRcdHZhciBpY29uTmFtZT1cImNhcmV0LXJpZ2h0XCI7XG5cdFx0dmFyIGljb24gPSBcIjxpXCIrXCIgY2xhc3M9XFxcIm5vZGUtaWNvbiBpY29uLVwiKyBpY29uTmFtZSArXCJcXFwiPjxcIitcIi9pPlwiO1xuXHRcdHdyYXBwZXIuYXBwZW5kKGljb24pO1xuXHRcdHdyYXBwZXIuYWRkQ2xhc3MoXCJ0eXBlLWljb25cIik7XG5cdFx0dmFyIHRleHQgPSAkKFwiPGRpdiBjbGFzcz0nY29uY29yZC10ZXh0JyBjb250ZW50ZWRpdGFibGU9J3RydWUnPjwvZGl2PlwiKTtcblx0XHR0ZXh0LmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCtcIi10ZXh0XCIpO1xuXHRcdHZhciBvdXRsaW5lID0gJChcIjxvbD48L29sPlwiKTtcblx0XHR0ZXh0LmFwcGVuZFRvKHdyYXBwZXIpO1xuXHRcdHdyYXBwZXIuYXBwZW5kVG8obm9kZSk7XG5cdFx0b3V0bGluZS5hcHBlbmRUbyhub2RlKTtcblx0XHRpZihpbnNlcnRUZXh0ICYmIChpbnNlcnRUZXh0IT1cIlwiKSl7XG5cdFx0XHR0ZXh0Lmh0bWwoY29uY29yZEluc3RhbmNlLmVkaXRvci5lc2NhcGUoaW5zZXJ0VGV4dCkpO1xuXHRcdFx0fVxuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdGlmKCFpbnNlcnREaXJlY3Rpb24pIHtcblx0XHRcdGluc2VydERpcmVjdGlvbiA9IGRvd247XG5cdFx0XHR9XG5cdFx0c3dpdGNoKGluc2VydERpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSBkb3duOlxuXHRcdFx0XHRjdXJzb3IuYWZ0ZXIobm9kZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSByaWdodDpcblx0XHRcdFx0Y3Vyc29yLmNoaWxkcmVuKFwib2xcIikucHJlcGVuZChub2RlKTtcblx0XHRcdFx0dGhpcy5leHBhbmQoZmFsc2UpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdXA6XG5cdFx0XHRcdGN1cnNvci5iZWZvcmUobm9kZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBsZWZ0OlxuXHRcdFx0XHR2YXIgcGFyZW50ID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRpZihwYXJlbnQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRwYXJlbnQuYWZ0ZXIobm9kZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR0aGlzLnNldEN1cnNvcihub2RlKTtcblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0Y29uY29yZEluc3RhbmNlLmZpcmVDYWxsYmFjayhcIm9wSW5zZXJ0XCIsIHRoaXMuc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XG5cdFx0cmV0dXJuIG5vZGU7XG5cdFx0fTtcblx0dGhpcy5pbnNlcnRJbWFnZSA9IGZ1bmN0aW9uKHVybCl7XG5cdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpbnNlcnRJbWFnZVwiLCBudWxsLCB1cmwpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHRoaXMuaW5zZXJ0KCc8aW1nIHNyYz1cIicrdXJsKydcIj4nLCBkb3duKTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuaW5zZXJ0VGV4dCA9IGZ1bmN0aW9uKHRleHQpe1xuXHRcdHZhciBub2RlcyA9ICQoXCI8b2w+PC9vbD5cIik7XG5cdFx0dmFyIGxhc3RMZXZlbCA9IDA7XG5cdFx0dmFyIHN0YXJ0aW5nbGluZSA9IDA7XG5cdFx0dmFyIHN0YXJ0aW5nbGV2ZWwgPSAwO1xuXHRcdHZhciBsYXN0Tm9kZSA9IG51bGw7XG5cdFx0dmFyIHBhcmVudCA9IG51bGw7XG5cdFx0dmFyIHBhcmVudHMgPSB7fTtcblx0XHR2YXIgbGluZXMgPSB0ZXh0LnNwbGl0KFwiXFxuXCIpO1xuXHRcdHZhciB3b3JrZmxvd3k9dHJ1ZTtcblx0XHR2YXIgd29ya2Zsb3d5UGFyZW50ID0gbnVsbDtcblx0XHR2YXIgZmlyc3RsaW5ld2l0aGNvbnRlbnQgPSAwO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgbGluZSA9IGxpbmVzW2ldO1xuXHRcdFx0aWYoIWxpbmUubWF0Y2goL15cXHMqJC8pKXtcblx0XHRcdFx0Zmlyc3RsaW5ld2l0aGNvbnRlbnQgPSBpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGlmKGxpbmVzLmxlbmd0aD4oZmlyc3RsaW5ld2l0aGNvbnRlbnQrMikpe1xuXHRcdFx0aWYoKGxpbmVzW2ZpcnN0bGluZXdpdGhjb250ZW50XS5tYXRjaCgvXihbXFx0XFxzXSopXFwtLiokLyk9PW51bGwpICYmIGxpbmVzW2ZpcnN0bGluZXdpdGhjb250ZW50XS5tYXRjaCgvXi4rJC8pICYmIChsaW5lc1tmaXJzdGxpbmV3aXRoY29udGVudCsxXT09XCJcIikpe1xuXHRcdFx0XHRzdGFydGluZ2xpbmUgPSBmaXJzdGxpbmV3aXRoY29udGVudCsyO1xuXHRcdFx0XHR2YXIgd29ya2Zsb3d5UGFyZW50ID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5tYWtlTm9kZSgpO1xuXHRcdFx0XHR3b3JrZmxvd3lQYXJlbnQuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKS5odG1sKGxpbmVzW2ZpcnN0bGluZXdpdGhjb250ZW50XSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRmb3IodmFyIGkgPSBzdGFydGluZ2xpbmU7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgbGluZSA9IGxpbmVzW2ldO1xuXHRcdFx0aWYoKGxpbmUhPVwiXCIpICYmICFsaW5lLm1hdGNoKC9eXFxzKyQvKSAmJiAobGluZS5tYXRjaCgvXihbXFx0XFxzXSopXFwtLiokLyk9PW51bGwpKXtcblx0XHRcdFx0d29ya2Zsb3d5PWZhbHNlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGlmKCF3b3JrZmxvd3kpe1xuXHRcdFx0c3RhcnRpbmdsaW5lID0gMDtcblx0XHRcdHdvcmtmbG93eVBhcmVudD1udWxsO1xuXHRcdFx0fVxuXHRcdGZvcih2YXIgaSA9IHN0YXJ0aW5nbGluZTsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKXtcblx0XHRcdHZhciBsaW5lID0gbGluZXNbaV07XG5cdFx0XHRpZigobGluZSE9XCJcIikgJiYgIWxpbmUubWF0Y2goL15cXHMrJC8pKXtcblx0XHRcdFx0dmFyIG1hdGNoZXMgPSBsaW5lLm1hdGNoKC9eKFtcXHRcXHNdKikoLispJC8pO1xuXHRcdFx0XHR2YXIgbm9kZSA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IubWFrZU5vZGUoKTtcblx0XHRcdFx0dmFyIG5vZGVUZXh0ID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5lc2NhcGUobWF0Y2hlc1syXSk7XG5cdFx0XHRcdGlmKHdvcmtmbG93eSl7XG5cdFx0XHRcdFx0dmFyIG5vZGVUZXh0TWF0Y2hlcyA9IG5vZGVUZXh0Lm1hdGNoKC9eKFtcXHRcXHNdKilcXC1cXHMqKC4rKSQvKVxuXHRcdFx0XHRcdGlmKG5vZGVUZXh0TWF0Y2hlcyE9bnVsbCl7XG5cdFx0XHRcdFx0XHRub2RlVGV4dCA9IG5vZGVUZXh0TWF0Y2hlc1syXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKS5odG1sKG5vZGVUZXh0KTtcblx0XHRcdFx0dmFyIGxldmVsID0gc3RhcnRpbmdsZXZlbDtcblx0XHRcdFx0aWYobWF0Y2hlc1sxXSl7XG5cdFx0XHRcdFx0aWYod29ya2Zsb3d5KXtcblx0XHRcdFx0XHRcdGxldmVsID0gKG1hdGNoZXNbMV0ubGVuZ3RoIC8gMikgKyBzdGFydGluZ2xldmVsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0bGV2ZWwgPSBtYXRjaGVzWzFdLmxlbmd0aCArIHN0YXJ0aW5nbGV2ZWw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYobGV2ZWw+bGFzdExldmVsKXtcblx0XHRcdFx0XHRcdHBhcmVudHNbbGFzdExldmVsXT1sYXN0Tm9kZTtcblx0XHRcdFx0XHRcdHBhcmVudCA9IGxhc3ROb2RlO1xuXHRcdFx0XHRcdFx0fWVsc2UgaWYgKChsZXZlbD4wKSAmJiAobGV2ZWwgPCBsYXN0TGV2ZWwpKXtcblx0XHRcdFx0XHRcdFx0cGFyZW50ID0gcGFyZW50c1tsZXZlbC0xXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0aWYocGFyZW50ICYmIChsZXZlbCA+IDApKXtcblx0XHRcdFx0XHRwYXJlbnQuY2hpbGRyZW4oXCJvbFwiKS5hcHBlbmQobm9kZSk7XG5cdFx0XHRcdFx0cGFyZW50LmFkZENsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0cGFyZW50cyA9IHt9O1xuXHRcdFx0XHRcdFx0bm9kZXMuYXBwZW5kKG5vZGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRsYXN0Tm9kZSA9IG5vZGU7XG5cdFx0XHRcdGxhc3RMZXZlbCA9IGxldmVsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0aWYod29ya2Zsb3d5UGFyZW50KXtcblx0XHRcdGlmKG5vZGVzLmNoaWxkcmVuKCkubGVuZ3RoID4gMCl7XG5cdFx0XHRcdHdvcmtmbG93eVBhcmVudC5hZGRDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0dmFyIGNsb25lZE5vZGVzID0gbm9kZXMuY2xvbmUoKTtcblx0XHRcdGNsb25lZE5vZGVzLmNoaWxkcmVuKCkuYXBwZW5kVG8od29ya2Zsb3d5UGFyZW50LmNoaWxkcmVuKFwib2xcIikpO1xuXHRcdFx0bm9kZXMgPSAkKFwiPG9sPjwvb2w+XCIpO1xuXHRcdFx0bm9kZXMuYXBwZW5kKHdvcmtmbG93eVBhcmVudCk7XG5cdFx0XHR9XG5cdFx0aWYobm9kZXMuY2hpbGRyZW4oKS5sZW5ndGg+MCl7XG5cdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0dGhpcy5zZXRUZXh0TW9kZShmYWxzZSk7XG5cdFx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRcdG5vZGVzLmNoaWxkcmVuKCkuaW5zZXJ0QWZ0ZXIoY3Vyc29yKTtcblx0XHRcdHRoaXMuc2V0Q3Vyc29yKGN1cnNvci5uZXh0KCkpO1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLnJvb3QucmVtb3ZlRGF0YShcImNsaXBib2FyZFwiKTtcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVjYWxjdWxhdGVMZXZlbHMoKTtcblx0XHRcdH1cblx0XHR9LFxuXHR0aGlzLmluc2VydFhtbCA9IGZ1bmN0aW9uKG9wbWx0ZXh0LGRpcil7XG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHR2YXIgZG9jID0gbnVsbDtcblx0XHR2YXIgbm9kZXMgPSAkKFwiPG9sPjwvb2w+XCIpO1xuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdHZhciBsZXZlbCA9IGN1cnNvci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGgrMTtcblx0XHRpZighZGlyKXtcblx0XHRcdGRpciA9IGRvd247XG5cdFx0XHR9XG5cdFx0c3dpdGNoKGRpcil7XG5cdFx0XHRjYXNlIHJpZ2h0OlxuXHRcdFx0XHRsZXZlbCs9MTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGxlZnQ6XG5cdFx0XHRcdGxldmVsLT0xO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRpZih0eXBlb2Ygb3BtbHRleHQgPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0ZG9jID0gJCgkLnBhcnNlWE1MKG9wbWx0ZXh0KSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2MgPSAkKG9wbWx0ZXh0KTtcblx0XHRcdFx0fVxuXHRcdGRvYy5maW5kKFwiYm9keVwiKS5jaGlsZHJlbihcIm91dGxpbmVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdG5vZGVzLmFwcGVuZChjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmJ1aWxkKCQodGhpcyksIHRydWUsIGxldmVsKSk7XG5cdFx0XHR9KTtcblx0XHR2YXIgZXhwYW5zaW9uU3RhdGUgPSBkb2MuZmluZChcImV4cGFuc2lvblN0YXRlXCIpO1xuXHRcdGlmKGV4cGFuc2lvblN0YXRlICYmIGV4cGFuc2lvblN0YXRlLnRleHQoKSAmJiAoZXhwYW5zaW9uU3RhdGUudGV4dCgpIT1cIlwiKSl7XG5cdFx0XHR2YXIgZXhwYW5zaW9uU3RhdGVzID0gZXhwYW5zaW9uU3RhdGUudGV4dCgpLnNwbGl0KFwiLFwiKTtcblx0XHRcdHZhciBub2RlSWQ9MTtcblx0XHRcdG5vZGVzLmZpbmQoXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0aWYoZXhwYW5zaW9uU3RhdGVzLmluZGV4T2YoXCJcIitub2RlSWQpID49IDApe1xuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRub2RlSWQrKztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0c3dpdGNoKGRpcikge1xuXHRcdFx0Y2FzZSBkb3duOlxuXHRcdFx0XHRub2Rlcy5jaGlsZHJlbigpLmluc2VydEFmdGVyKGN1cnNvcik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSByaWdodDpcblx0XHRcdFx0bm9kZXMuY2hpbGRyZW4oKS5wcmVwZW5kVG8oY3Vyc29yLmNoaWxkcmVuKFwib2xcIikpO1xuXHRcdFx0XHR0aGlzLmV4cGFuZChmYWxzZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSB1cDpcblx0XHRcdFx0bm9kZXMuY2hpbGRyZW4oKS5pbnNlcnRCZWZvcmUoY3Vyc29yKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGxlZnQ6XG5cdFx0XHRcdHZhciBwYXJlbnQgPSBjdXJzb3IucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdGlmKHBhcmVudC5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdG5vZGVzLmNoaWxkcmVuKCkuaW5zZXJ0QWZ0ZXIocGFyZW50KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHR0aGlzLmluVGV4dE1vZGUgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiByb290Lmhhc0NsYXNzKFwidGV4dE1vZGVcIik7XG5cdFx0fTtcblx0dGhpcy5pdGFsaWMgPSBmdW5jdGlvbigpe1xuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpdGFsaWNcIik7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dGhpcy5mb2N1c0N1cnNvcigpO1xuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInNlbGVjdEFsbFwiKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpdGFsaWNcIik7XG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwidW5zZWxlY3RcIik7XG5cdFx0XHRcdHRoaXMuYmx1ckN1cnNvcigpO1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW5Gb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdH07XG5cdHRoaXMubGV2ZWwgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiB0aGlzLmdldEN1cnNvcigpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCsxO1xuXHRcdH0sXG5cdHRoaXMubGluayA9IGZ1bmN0aW9uKHVybCl7XG5cdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdFx0dmFyIGluc3RhbmNlID0gdGhpcztcblx0XHRcdFx0Y29uY29yZC5vblJlc3VtZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGluc3RhbmNlLmxpbmsodXJsKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR2YXIgcmFuZ2UgPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuXHRcdFx0aWYocmFuZ2U9PT11bmRlZmluZWQpe1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlc3RvcmVTZWxlY3Rpb24oKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYoY29uY29yZEluc3RhbmNlLmVkaXRvci5nZXRTZWxlY3Rpb24oKSl7XG5cdFx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY3JlYXRlTGlua1wiLCBudWxsLCB1cmwpO1xuXHRcdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLm1hcmtDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XG5cdFx0cm9vdC5kYXRhKFwiY2hhbmdlZFwiLCB0cnVlKTtcblx0XHRpZighdGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZS5kaXJ0eVwiKS5yZW1vdmVDbGFzcyhcImRpcnR5XCIpO1xuXHRcdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMucGFzdGUgPSBmdW5jdGlvbigpe1xuXHRcdGlmKCF0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRpZihyb290LmRhdGEoXCJjbGlwYm9hcmRcIikhPW51bGwpe1xuXHRcdFx0XHR2YXIgcGFzdGVOb2RlcyA9IHJvb3QuZGF0YShcImNsaXBib2FyZFwiKS5jbG9uZSh0cnVlLHRydWUpO1xuXHRcdFx0XHRpZihwYXN0ZU5vZGVzLmxlbmd0aD4wKXtcblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0XHRcdHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdFx0XHRcdHBhc3RlTm9kZXMuaW5zZXJ0QWZ0ZXIodGhpcy5nZXRDdXJzb3IoKSk7XG5cdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoJChwYXN0ZU5vZGVzWzBdKSwgKHBhc3RlTm9kZXMubGVuZ3RoPjEpKTtcblx0XHRcdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5wcm9tb3RlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdGlmKG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLmxlbmd0aCA+IDApe1xuXHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLnJldmVyc2UoKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgY2hpbGQgPSAkKHRoaXMpLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0XHRub2RlLmFmdGVyKGNoaWxkKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlY2FsY3VsYXRlTGV2ZWxzKG5vZGUucGFyZW50KCkuZmluZChcIi5jb25jb3JkLW5vZGVcIikpO1xuXHRcdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMucmVkcmF3ID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgY3QgPSAxO1xuXHRcdHZhciBjdXJzb3JJbmRleCA9IDE7XG5cdFx0dmFyIHdhc0NoYW5nZWQgPSB0aGlzLmNoYW5nZWQoKTtcblx0XHRyb290LmZpbmQoXCIuY29uY29yZC1ub2RlOnZpc2libGVcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0aWYoJCh0aGlzKS5oYXNDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpKXtcblx0XHRcdFx0Y3Vyc29ySW5kZXg9Y3Q7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0Y3QrKztcblx0XHRcdH0pO1xuXHRcdHRoaXMueG1sVG9PdXRsaW5lKHRoaXMub3V0bGluZVRvWG1sKCkpO1xuXHRcdGN0PTE7XG5cdFx0dmFyIHRoaXNPcCA9IHRoaXM7XG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTp2aXNpYmxlXCIpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdGlmKGN1cnNvckluZGV4PT1jdCl7XG5cdFx0XHRcdHRoaXNPcC5zZXRDdXJzb3IoJCh0aGlzKSk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0Y3QrKztcblx0XHRcdH0pO1xuXHRcdGlmKHdhc0NoYW5nZWQpe1xuXHRcdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMucmVvcmcgPSBmdW5jdGlvbihkaXJlY3Rpb24sIGNvdW50KSB7XG5cdFx0aWYoY291bnQ9PT11bmRlZmluZWQpIHtcblx0XHRcdGNvdW50ID0gMTtcblx0XHRcdH1cblx0XHR2YXIgYWJsZVRvTW92ZUluRGlyZWN0aW9uID0gZmFsc2U7XG5cdFx0dmFyIGN1cnNvciA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0dmFyIHJhbmdlID0gdW5kZWZpbmVkO1xuXHRcdHZhciB0b01vdmUgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdHZhciBzZWxlY3RlZCA9IHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKTtcblx0XHR2YXIgaXRlcmF0aW9uID0gMTtcblx0XHRpZihzZWxlY3RlZC5sZW5ndGg+MSl7XG5cdFx0XHRjdXJzb3IgPSByb290LmZpbmQoXCIuc2VsZWN0ZWQ6Zmlyc3RcIik7XG5cdFx0XHR0b01vdmUgPSByb290LmZpbmQoXCIuc2VsZWN0ZWRcIik7XG5cdFx0XHR9XG5cdFx0c3dpdGNoKGRpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSB1cDpcblx0XHRcdFx0dmFyIHByZXYgPSBjdXJzb3IucHJldigpO1xuXHRcdFx0XHRpZihwcmV2Lmxlbmd0aD09MSkge1xuXHRcdFx0XHRcdHdoaWxlKGl0ZXJhdGlvbiA8IGNvdW50KXtcblx0XHRcdFx0XHRcdGlmKHByZXYucHJldigpLmxlbmd0aD09MSl7XG5cdFx0XHRcdFx0XHRcdHByZXYgPSBwcmV2LnByZXYoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGl0ZXJhdGlvbisrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0XHRcdFx0dmFyIGNsb25lZE1vdmUgPSB0b01vdmUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0dG9Nb3ZlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdGNsb25lZE1vdmUuaW5zZXJ0QmVmb3JlKHByZXYpO1xuXHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgZG93bjpcblx0XHRcdFx0aWYoIXRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdFx0XHRjdXJzb3IgPSByb290LmZpbmQoXCIuc2VsZWN0ZWQ6bGFzdFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdHZhciBuZXh0ID0gY3Vyc29yLm5leHQoKTtcblx0XHRcdFx0aWYobmV4dC5sZW5ndGg9PTEpIHtcblx0XHRcdFx0XHR3aGlsZShpdGVyYXRpb24gPCBjb3VudCl7XG5cdFx0XHRcdFx0XHRpZihuZXh0Lm5leHQoKS5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdFx0XHRuZXh0ID0gbmV4dC5uZXh0KCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpdGVyYXRpb24rKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0XHRcdHZhciBjbG9uZWRNb3ZlID0gdG9Nb3ZlLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdHRvTW92ZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRjbG9uZWRNb3ZlLmluc2VydEFmdGVyKG5leHQpO1xuXHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgbGVmdDpcblx0XHRcdFx0dmFyIG91dGxpbmUgPSBjdXJzb3IucGFyZW50KCk7XG5cdFx0XHRcdGlmKCFvdXRsaW5lLmhhc0NsYXNzKFwiY29uY29yZC1yb290XCIpKSB7XG5cdFx0XHRcdFx0dmFyIHBhcmVudCA9IG91dGxpbmUucGFyZW50KCk7XG5cdFx0XHRcdFx0d2hpbGUoaXRlcmF0aW9uIDwgY291bnQpe1xuXHRcdFx0XHRcdFx0dmFyIHBhcmVudFBhcmVudCA9IHBhcmVudC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0XHRcdGlmKHBhcmVudFBhcmVudC5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdFx0XHRwYXJlbnQgPSBwYXJlbnRQYXJlbnQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpdGVyYXRpb24rKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0XHRcdHZhciBjbG9uZWRNb3ZlID0gdG9Nb3ZlLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdHRvTW92ZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRjbG9uZWRNb3ZlLmluc2VydEFmdGVyKHBhcmVudCk7XG5cdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5yZWNhbGN1bGF0ZUxldmVscyhwYXJlbnQubmV4dEFsbChcIi5jb25jb3JkLW5vZGVcIikpO1xuXHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgcmlnaHQ6XG5cdFx0XHRcdHZhciBwcmV2ID0gY3Vyc29yLnByZXYoKTtcblx0XHRcdFx0aWYocHJldi5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0XHRcdFx0d2hpbGUoaXRlcmF0aW9uIDwgY291bnQpe1xuXHRcdFx0XHRcdFx0aWYocHJldi5jaGlsZHJlbihcIm9sXCIpLmxlbmd0aD09MSl7XG5cdFx0XHRcdFx0XHRcdHZhciBwcmV2Tm9kZSA9IHByZXYuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6bGFzdFwiKTtcblx0XHRcdFx0XHRcdFx0aWYocHJldk5vZGUubGVuZ3RoPT0xKXtcblx0XHRcdFx0XHRcdFx0XHRwcmV2ID0gcHJldk5vZGU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGl0ZXJhdGlvbisrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZhciBwcmV2T3V0bGluZSA9IHByZXYuY2hpbGRyZW4oXCJvbFwiKTtcblx0XHRcdFx0XHRpZihwcmV2T3V0bGluZS5sZW5ndGggPT0gMCkge1xuXHRcdFx0XHRcdFx0cHJldk91dGxpbmUgPSAkKFwiPG9sPjwvb2w+XCIpO1xuXHRcdFx0XHRcdFx0cHJldk91dGxpbmUuYXBwZW5kVG8ocHJldik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIGNsb25lZE1vdmUgPSB0b01vdmUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0dG9Nb3ZlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdGNsb25lZE1vdmUuYXBwZW5kVG8ocHJldk91dGxpbmUpO1xuXHRcdFx0XHRcdHByZXYucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5yZWNhbGN1bGF0ZUxldmVscyhwcmV2LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpKTtcblx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0aWYoYWJsZVRvTW92ZUluRGlyZWN0aW9uKXtcblx0XHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdFx0dGhpcy5zZXRDdXJzb3IodGhpcy5nZXRDdXJzb3IoKSk7XG5cdFx0XHRcdH1cblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRcdH1cblx0XHRyZXR1cm4gYWJsZVRvTW92ZUluRGlyZWN0aW9uO1xuXHRcdH07XG5cdHRoaXMucnVuU2VsZWN0aW9uID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgdmFsdWUgPSBldmFsICh0aGlzLmdldExpbmVUZXh0KCkpO1xuXHRcdHRoaXMuZGVsZXRlU3VicygpO1xuXHRcdHRoaXMuaW5zZXJ0KHZhbHVlLCBcInJpZ2h0XCIpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5zY3JpcHQubWFrZUNvbW1lbnQoKTtcblx0XHR0aGlzLmdvKFwibGVmdFwiLCAxKTtcblx0XHR9O1xuXHR0aGlzLnNhdmVTdGF0ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0cm9vdC5kYXRhKFwiY2hhbmdlXCIsIHJvb3QuY2hpbGRyZW4oKS5jbG9uZSh0cnVlLCB0cnVlKSk7XG5cdFx0cm9vdC5kYXRhKFwiY2hhbmdlVGV4dE1vZGVcIiwgdGhpcy5pblRleHRNb2RlKCkpO1xuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdHZhciByYW5nZSA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0XHRpZiggcmFuZ2Upe1xuXHRcdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VSYW5nZVwiLHJhbmdlLmNsb25lUmFuZ2UoKSk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVJhbmdlXCIsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVJhbmdlXCIsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHR0aGlzLnNldEN1cnNvciA9IGZ1bmN0aW9uKG5vZGUsIG11bHRpcGxlLCBtdWx0aXBsZVJhbmdlKXtcblx0XHRyb290LmZpbmQoXCIuY29uY29yZC1jdXJzb3JcIikucmVtb3ZlQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKTtcblx0XHRub2RlLmFkZENsYXNzKFwiY29uY29yZC1jdXJzb3JcIik7XG5cdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5lZGl0KG5vZGUpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iuc2VsZWN0KG5vZGUsIG11bHRpcGxlLCBtdWx0aXBsZVJhbmdlKTtcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEN1cnNvck1vdmVkXCIsIHRoaXMuc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XG5cdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5oaWRlQ29udGV4dE1lbnUoKTtcblx0XHR9O1xuXHR0aGlzLnNldEN1cnNvckNvbnRleHQgPSBmdW5jdGlvbihjdXJzb3Ipe1xuXHRcdHJldHVybiBuZXcgQ29uY29yZE9wKHJvb3QsY29uY29yZEluc3RhbmNlLGN1cnNvcik7XG5cdFx0fTtcblx0dGhpcy5zZXRIZWFkZXJzID0gZnVuY3Rpb24oaGVhZGVycyl7XG5cdFx0cm9vdC5kYXRhKFwiaGVhZFwiLCBoZWFkZXJzKTtcblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0fSxcblx0dGhpcy5zZXRMaW5lVGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcblx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIikuaHRtbChjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmVzY2FwZSh0ZXh0KSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHR9O1xuXHR0aGlzLnNldFJlbmRlck1vZGUgPSBmdW5jdGlvbihtb2RlKXtcblx0XHRyb290LmRhdGEoXCJyZW5kZXJNb2RlXCIsIG1vZGUpO1xuXHRcdHRoaXMucmVkcmF3KCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy5zZXRTdHlsZSA9IGZ1bmN0aW9uKGNzcyl7XG5cdFx0cm9vdC5wYXJlbnQoKS5maW5kKFwic3R5bGUuY3VzdG9tU3R5bGVcIikucmVtb3ZlKCk7XG5cdFx0cm9vdC5iZWZvcmUoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIiBjbGFzcz1cImN1c3RvbVN0eWxlXCI+JysgY3NzICsgJzwvc3R5bGU+Jyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy5zZXRUZXh0TW9kZSA9IGZ1bmN0aW9uKHRleHRNb2RlKXtcblx0XHR2YXIgcmVhZG9ubHkgPSBjb25jb3JkSW5zdGFuY2UucHJlZnMoKVtcInJlYWRvbmx5XCJdO1xuXHRcdGlmKHJlYWRvbmx5PT11bmRlZmluZWQpe1xuXHRcdFx0cmVhZG9ubHkgPSBmYWxzZTtcblx0XHRcdH1cblx0XHRpZihyZWFkb25seSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYocm9vdC5oYXNDbGFzcyhcInRleHRNb2RlXCIpID09IHRleHRNb2RlKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZih0ZXh0TW9kZT09dHJ1ZSl7XG5cdFx0XHRyb290LmFkZENsYXNzKFwidGV4dE1vZGVcIik7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmVkaXRvck1vZGUoKTtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZWRpdCh0aGlzLmdldEN1cnNvcigpKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRyb290LnJlbW92ZUNsYXNzKFwidGV4dE1vZGVcIik7XG5cdFx0XHRcdHJvb3QuZmluZChcIi5lZGl0aW5nXCIpLnJlbW92ZUNsYXNzKFwiZWRpdGluZ1wiKTtcblx0XHRcdFx0dGhpcy5ibHVyQ3Vyc29yKCk7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iuc2VsZWN0KHRoaXMuZ2V0Q3Vyc29yKCkpO1xuXHRcdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5zZXRUaXRsZSA9IGZ1bmN0aW9uKHRpdGxlKSB7XG5cdFx0cm9vdC5kYXRhKFwidGl0bGVcIiwgdGl0bGUpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMuc3RyaWtldGhyb3VnaCA9IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInN0cmlrZVRocm91Z2hcIik7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dGhpcy5mb2N1c0N1cnNvcigpO1xuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInNlbGVjdEFsbFwiKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzdHJpa2VUaHJvdWdoXCIpO1xuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInVuc2VsZWN0XCIpO1xuXHRcdFx0XHR0aGlzLmJsdXJDdXJzb3IoKTtcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHR9O1xuXHR0aGlzLnN1YnNFeHBhbmRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSAmJiAobm9kZS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkuc2l6ZSgpID4gMCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblx0dGhpcy5vdXRsaW5lVG9UZXh0ID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgdGV4dCA9IFwiXCI7XG5cdFx0cm9vdC5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHRleHQrPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnRleHRMaW5lKCQodGhpcykpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdFx0fTtcblx0dGhpcy5vdXRsaW5lVG9YbWwgPSBmdW5jdGlvbihvd25lck5hbWUsIG93bmVyRW1haWwsIG93bmVySWQpIHtcblx0XHR2YXIgaGVhZCA9IHRoaXMuZ2V0SGVhZGVycygpO1xuXHRcdGlmKG93bmVyTmFtZSkge1xuXHRcdFx0aGVhZFtcIm93bmVyTmFtZVwiXSA9IG93bmVyTmFtZTtcblx0XHRcdH1cblx0XHRpZihvd25lckVtYWlsKSB7XG5cdFx0XHRoZWFkW1wib3duZXJFbWFpbFwiXSA9IG93bmVyRW1haWw7XG5cdFx0XHR9XG5cdFx0aWYob3duZXJJZCkge1xuXHRcdFx0aGVhZFtcIm93bmVySWRcIl0gPSBvd25lcklkO1xuXHRcdFx0fVxuXHRcdHZhciB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKTtcblx0XHRpZighdGl0bGUpIHtcblx0XHRcdHRpdGxlID0gXCJcIjtcblx0XHRcdH1cblx0XHRoZWFkW1widGl0bGVcIl0gPSB0aXRsZTtcblx0XHRoZWFkW1wiZGF0ZU1vZGlmaWVkXCJdID0gKG5ldyBEYXRlKCkpLnRvR01UU3RyaW5nKCk7XG5cdFx0dmFyIGV4cGFuc2lvblN0YXRlcyA9IFtdO1xuXHRcdHZhciBub2RlSWQgPSAxO1xuXHRcdHZhciBjdXJzb3IgPSByb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdGRvIHtcblx0XHRcdGlmKGN1cnNvcikge1xuXHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpICYmIChjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLnNpemUoKSA+IDApKSB7XG5cdFx0XHRcdFx0ZXhwYW5zaW9uU3RhdGVzLnB1c2gobm9kZUlkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdG5vZGVJZCsrO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHR2YXIgbmV4dCA9IG51bGw7XG5cdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpKSB7XG5cdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XG5cdFx0XHRcdGlmKG91dGxpbmUubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHR2YXIgZmlyc3RDaGlsZCA9IG91dGxpbmUuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRcdG5leHQgPSBmaXJzdENoaWxkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0aWYoIW5leHQpIHtcblx0XHRcdFx0bmV4dCA9IHRoaXMuX3dhbGtfZG93bihjdXJzb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHRjdXJzb3IgPSBuZXh0O1xuXHRcdFx0fSB3aGlsZShjdXJzb3IhPW51bGwpO1xuXHRcdGhlYWRbXCJleHBhbnNpb25TdGF0ZVwiXSA9IGV4cGFuc2lvblN0YXRlcy5qb2luKFwiLFwiKTtcblx0XHR2YXIgb3BtbCA9ICcnO1xuXHRcdHZhciBpbmRlbnQ9MDtcblx0XHR2YXIgYWRkID0gZnVuY3Rpb24ocyl7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgaW5kZW50OyBpKyspe1xuXHRcdFx0XHRvcG1sKz0nXFx0Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRvcG1sKz1zKydcXG4nO1xuXHRcdFx0fTtcblx0XHRhZGQoJzw/eG1sIHZlcnNpb249XCIxLjBcIj8+Jyk7XG5cdFx0YWRkKCc8b3BtbCB2ZXJzaW9uPVwiMi4wXCI+Jyk7XG5cdFx0aW5kZW50Kys7XG5cdFx0YWRkKCc8aGVhZD4nKTtcblx0XHRpbmRlbnQrKztcblx0XHRmb3IodmFyIGhlYWROYW1lIGluIGhlYWQpe1xuXHRcdFx0aWYoaGVhZFtoZWFkTmFtZV0hPT11bmRlZmluZWQpe1xuXHRcdFx0XHRhZGQoJzwnK2hlYWROYW1lKyc+JyArIENvbmNvcmRVdGlsLmVzY2FwZVhtbChoZWFkW2hlYWROYW1lXSkgKyAnPC8nICsgaGVhZE5hbWUgKyAnPicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0YWRkKCc8L2hlYWQ+Jyk7XG5cdFx0aW5kZW50LS07XG5cdFx0YWRkKCc8Ym9keT4nKTtcblx0XHRpbmRlbnQrKztcblx0XHRyb290LmNoaWxkcmVuKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0b3BtbCArPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLm9wbWxMaW5lKCQodGhpcyksIGluZGVudCk7XG5cdFx0XHR9KTtcblx0XHRhZGQoJzwvYm9keT4nKTtcblx0XHRpbmRlbnQtLTtcblx0XHRhZGQoJzwvb3BtbD4nKTtcblx0XHRyZXR1cm4gb3BtbDtcblx0XHR9O1xuXHR0aGlzLnVuZG8gPSBmdW5jdGlvbigpe1xuXHRcdHZhciBzdGF0ZUJlZm9yZUNoYW5nZSA9IHJvb3QuY2hpbGRyZW4oKS5jbG9uZSh0cnVlLCB0cnVlKTtcblx0XHR2YXIgdGV4dE1vZGVCZWZvcmVDaGFuZ2UgPSB0aGlzLmluVGV4dE1vZGUoKTtcblx0XHR2YXIgYmVmb3JlUmFuZ2UgPSB1bmRlZmluZWQ7XG5cdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0dmFyIHJhbmdlID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdGlmKHJhbmdlKXtcblx0XHRcdFx0YmVmb3JlUmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRpZihyb290LmRhdGEoXCJjaGFuZ2VcIikpe1xuXHRcdFx0cm9vdC5lbXB0eSgpO1xuXHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlXCIpLmFwcGVuZFRvKHJvb3QpO1xuXHRcdFx0dGhpcy5zZXRUZXh0TW9kZShyb290LmRhdGEoXCJjaGFuZ2VUZXh0TW9kZVwiKSk7XG5cdFx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRcdHRoaXMuZm9jdXNDdXJzb3IoKTtcblx0XHRcdFx0dmFyIHJhbmdlID0gcm9vdC5kYXRhKFwiY2hhbmdlUmFuZ2VcIik7XG5cdFx0XHRcdGlmKHJhbmdlKXtcblx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlc3RvcmVTZWxlY3Rpb24ocmFuZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlXCIsIHN0YXRlQmVmb3JlQ2hhbmdlKTtcblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVRleHRNb2RlXCIsIHRleHRNb2RlQmVmb3JlQ2hhbmdlKTtcblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVJhbmdlXCIsIGJlZm9yZVJhbmdlKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0XHR9O1xuXHR0aGlzLnZpc2l0TGV2ZWwgPSBmdW5jdGlvbihjYil7XG5cdFx0dmFyIGN1cnNvciA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0dmFyIG9wID0gdGhpcztcblx0XHRjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdHZhciBzdWJDdXJzb3JDb250ZXh0ID0gb3Auc2V0Q3Vyc29yQ29udGV4dCgkKHRoaXMpKTtcblx0XHRcdGNiKHN1YkN1cnNvckNvbnRleHQpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy52aXNpdFRvU3VtbWl0ID0gZnVuY3Rpb24oY2Ipe1xuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdHdoaWxlKGNiKHRoaXMuc2V0Q3Vyc29yQ29udGV4dChjdXJzb3IpKSl7XG5cdFx0XHR2YXIgcGFyZW50ID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0aWYocGFyZW50Lmxlbmd0aD09MSl7XG5cdFx0XHRcdGN1cnNvcj1wYXJlbnQ7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHR0aGlzLnZpc2l0QWxsID0gZnVuY3Rpb24oY2Ipe1xuXHRcdHZhciBvcCA9IHRoaXM7XG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgc3ViQ3Vyc29yQ29udGV4dCA9IG9wLnNldEN1cnNvckNvbnRleHQoJCh0aGlzKSk7XG5cdFx0XHR2YXIgcmV0VmFsID0gY2Ioc3ViQ3Vyc29yQ29udGV4dCk7XG5cdFx0XHRpZigocmV0VmFsIT09dW5kZWZpbmVkKSAmJiAocmV0VmFsPT09ZmFsc2UpKXtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LFxuXHR0aGlzLndpcGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCA+IDApe1xuXHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdH1cblx0XHRyb290LmVtcHR5KCk7XG5cdFx0dmFyIG5vZGUgPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLm1ha2VOb2RlKCk7XG5cdFx0cm9vdC5hcHBlbmQobm9kZSk7XG5cdFx0dGhpcy5zZXRUZXh0TW9kZShmYWxzZSk7XG5cdFx0dGhpcy5zZXRDdXJzb3Iobm9kZSk7XG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdH07XG5cdHRoaXMueG1sVG9PdXRsaW5lID0gZnVuY3Rpb24oeG1sVGV4dCwgZmxTZXRGb2N1cykgeyAvLzIvMjIvMTQgYnkgRFcgLS0gbmV3IHBhcmFtLCBmbFNldEZvY3VzXG5cdFx0XG5cdFx0aWYgKGZsU2V0Rm9jdXMgPT0gdW5kZWZpbmVkKSB7IC8vMi8yMi8xNCBieSBEV1xuXHRcdFx0ZmxTZXRGb2N1cyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XG5cdFx0dmFyIGRvYyA9IG51bGw7XG5cdFx0aWYodHlwZW9mIHhtbFRleHQgPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0ZG9jID0gJCgkLnBhcnNlWE1MKHhtbFRleHQpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGRvYyA9ICQoeG1sVGV4dCk7XG5cdFx0XHRcdH1cblx0XHRyb290LmVtcHR5KCk7XG5cdFx0dmFyIHRpdGxlID0gXCJcIjtcblx0XHRpZihkb2MuZmluZChcInRpdGxlOmZpcnN0XCIpLmxlbmd0aD09MSl7XG5cdFx0XHR0aXRsZSA9IGRvYy5maW5kKFwidGl0bGU6Zmlyc3RcIikudGV4dCgpO1xuXHRcdFx0fVxuXHRcdHRoaXMuc2V0VGl0bGUodGl0bGUpO1xuXHRcdHZhciBoZWFkZXJzID0ge307XG5cdFx0ZG9jLmZpbmQoXCJoZWFkXCIpLmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0aGVhZGVyc1skKHRoaXMpLnByb3AoXCJ0YWdOYW1lXCIpXSA9ICQodGhpcykudGV4dCgpO1xuXHRcdFx0fSk7XG5cdFx0cm9vdC5kYXRhKFwiaGVhZFwiLCBoZWFkZXJzKTtcblx0XHRkb2MuZmluZChcImJvZHlcIikuY2hpbGRyZW4oXCJvdXRsaW5lXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRyb290LmFwcGVuZChjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmJ1aWxkKCQodGhpcyksIHRydWUpKTtcblx0XHRcdH0pO1xuXHRcdHJvb3QuZGF0YShcImNoYW5nZWRcIiwgZmFsc2UpO1xuXHRcdHJvb3QucmVtb3ZlRGF0YShcInByZXZpb3VzQ2hhbmdlXCIpO1xuXHRcdHZhciBleHBhbnNpb25TdGF0ZSA9IGRvYy5maW5kKFwiZXhwYW5zaW9uU3RhdGVcIik7XG5cdFx0aWYoZXhwYW5zaW9uU3RhdGUgJiYgZXhwYW5zaW9uU3RhdGUudGV4dCgpICYmIChleHBhbnNpb25TdGF0ZS50ZXh0KCkhPVwiXCIpKXtcblx0XHRcdHZhciBleHBhbnNpb25TdGF0ZXMgPSBleHBhbnNpb25TdGF0ZS50ZXh0KCkuc3BsaXQoL1xccyosXFxzKi8pO1xuXHRcdFx0dmFyIG5vZGVJZCA9IDE7XG5cdFx0XHR2YXIgY3Vyc29yID0gcm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdGRvIHtcblx0XHRcdFx0aWYoY3Vyc29yKSB7XG5cdFx0XHRcdFx0aWYoZXhwYW5zaW9uU3RhdGVzLmluZGV4T2YoXCJcIitub2RlSWQpID49IDApe1xuXHRcdFx0XHRcdFx0Y3Vyc29yLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG5vZGVJZCsrO1xuXHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdHZhciBuZXh0ID0gbnVsbDtcblx0XHRcdFx0aWYoIWN1cnNvci5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSkge1xuXHRcdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XG5cdFx0XHRcdFx0aWYob3V0bGluZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdFx0dmFyIGZpcnN0Q2hpbGQgPSBvdXRsaW5lLmNoaWxkcmVuKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRcdFx0bmV4dCA9IGZpcnN0Q2hpbGQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFuZXh0KSB7XG5cdFx0XHRcdFx0bmV4dCA9IHRoaXMuX3dhbGtfZG93bihjdXJzb3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0Y3Vyc29yID0gbmV4dDtcblx0XHRcdFx0fSB3aGlsZShjdXJzb3IhPW51bGwpO1xuXHRcdFx0fVxuXHRcdHRoaXMuc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdFxuXHRcdGlmIChmbFNldEZvY3VzKSB7XG5cdFx0XHR0aGlzLnNldEN1cnNvcihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpKTtcblx0XHRcdH1cblx0XHRcblx0XHRyb290LmRhdGEoXCJjdXJyZW50Q2hhbmdlXCIsIHJvb3QuY2hpbGRyZW4oKS5jbG9uZSh0cnVlLCB0cnVlKSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy5hdHRyaWJ1dGVzID0gbmV3IENvbmNvcmRPcEF0dHJpYnV0ZXMoY29uY29yZEluc3RhbmNlLCB0aGlzLmdldEN1cnNvcigpKTtcblx0fVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmNvcmRPcDtcbiIsInZhciBDb25jb3JkRWRpdG9yID0gcmVxdWlyZShcIi4vY29uY29yZC1lZGl0b3JcIik7XG52YXIgQ29uY29yZE9wID0gcmVxdWlyZShcIi4vY29uY29yZC1vcFwiKTtcbnZhciBDb25jb3JkU2NyaXB0ID0gcmVxdWlyZShcIi4vY29uY29yZC1zY3JpcHRcIik7XG52YXIgQ29uY29yZEV2ZW50cyA9IHJlcXVpcmUoXCIuL2NvbmNvcmQtZXZlbnRzXCIpO1xuXG5mdW5jdGlvbiBDb25jb3JkT3V0bGluZShjb250YWluZXIsIG9wdGlvbnMsIGNvbmNvcmQpIHtcblx0dGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG5cdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdHRoaXMuaWQgPSBudWxsO1xuXHR0aGlzLnJvb3QgPSBudWxsO1xuXHR0aGlzLmVkaXRvciA9IG51bGw7XG5cdHRoaXMub3AgPSBudWxsO1xuXHR0aGlzLnNjcmlwdCA9IG51bGw7XG5cdHRoaXMucGFzdGVCaW4gPSBudWxsO1xuXHR0aGlzLnBhc3RlQmluRm9jdXMgPSBmdW5jdGlvbigpe1xuXHRcdGlmKCFjb25jb3JkLnJlYWR5KXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihjb25jb3JkLm1vYmlsZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYodGhpcy5yb290LmlzKFwiOnZpc2libGVcIikpe1xuXHRcdFx0dmFyIG5vZGUgPSB0aGlzLm9wLmdldEN1cnNvcigpO1xuXHRcdFx0dmFyIG5vZGVPZmZzZXQgPSBub2RlLm9mZnNldCgpO1xuXHRcdFx0dGhpcy5wYXN0ZUJpbi5vZmZzZXQobm9kZU9mZnNldCk7XG5cdFx0XHR0aGlzLnBhc3RlQmluLmNzcyhcInotaW5kZXhcIixcIjEwMDBcIik7XG5cdFx0XHRpZigodGhpcy5wYXN0ZUJpbi50ZXh0KCk9PVwiXCIpfHwodGhpcy5wYXN0ZUJpbi50ZXh0KCk9PVwiXFxuXCIpKXtcblx0XHRcdFx0dGhpcy5wYXN0ZUJpbi50ZXh0KFwiLi4uXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR0aGlzLm9wLmZvY3VzQ3Vyc29yKCk7XG5cdFx0XHR0aGlzLnBhc3RlQmluLmZvY3VzKCk7XG5cdFx0XHRpZih0aGlzLnBhc3RlQmluWzBdID09PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50KXtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmNhbGxiYWNrcyA9IGZ1bmN0aW9uKGNhbGxiYWNrcykge1xuXHRcdGlmKGNhbGxiYWNrcykge1xuXHRcdFx0dGhpcy5yb290LmRhdGEoXCJjYWxsYmFja3NcIiwgY2FsbGJhY2tzKTtcblx0XHRcdHJldHVybiBjYWxsYmFja3M7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKHRoaXMucm9vdC5kYXRhKFwiY2FsbGJhY2tzXCIpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnJvb3QuZGF0YShcImNhbGxiYWNrc1wiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuZmlyZUNhbGxiYWNrID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcblx0XHR2YXIgY2IgPSB0aGlzLmNhbGxiYWNrcygpW25hbWVdXG5cdFx0aWYoY2IpIHtcblx0XHRcdGNiKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLnByZWZzID0gZnVuY3Rpb24obmV3cHJlZnMpIHtcblx0XHR2YXIgcHJlZnMgPSB0aGlzLnJvb3QuZGF0YShcInByZWZzXCIpO1xuXHRcdGlmKHByZWZzID09IHVuZGVmaW5lZCl7XG5cdFx0XHRwcmVmcyA9IHt9O1xuXHRcdFx0fVxuXHRcdGlmKG5ld3ByZWZzKSB7XG5cdFx0XHRmb3IodmFyIGtleSBpbiBuZXdwcmVmcyl7XG5cdFx0XHRcdHByZWZzW2tleV0gPSBuZXdwcmVmc1trZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR0aGlzLnJvb3QuZGF0YShcInByZWZzXCIsIHByZWZzKTtcblx0XHRcdGlmKHByZWZzLnJlYWRvbmx5KXtcblx0XHRcdFx0dGhpcy5yb290LmFkZENsYXNzKFwicmVhZG9ubHlcIik7XG5cdFx0XHRcdH1cblx0XHRcdGlmKHByZWZzLnJlbmRlck1vZGUhPT11bmRlZmluZWQpe1xuXHRcdFx0XHR0aGlzLnJvb3QuZGF0YShcInJlbmRlck1vZGVcIiwgcHJlZnMucmVuZGVyTW9kZSk7XG5cdFx0XHRcdH1cblx0XHRcdGlmKHByZWZzLmNvbnRleHRNZW51KXtcblx0XHRcdFx0JChwcmVmcy5jb250ZXh0TWVudSkuaGlkZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR2YXIgc3R5bGUgPSB7fTtcblx0XHRcdGlmKHByZWZzLm91dGxpbmVGb250KSB7XG5cdFx0XHRcdHN0eWxlW1wiZm9udC1mYW1pbHlcIl0gPSBwcmVmcy5vdXRsaW5lRm9udDtcblx0XHRcdFx0fVxuXHRcdFx0aWYocHJlZnMub3V0bGluZUZvbnRTaXplKSB7XG5cdFx0XHRcdHByZWZzLm91dGxpbmVGb250U2l6ZSA9IHBhcnNlSW50KHByZWZzLm91dGxpbmVGb250U2l6ZSk7XG5cdFx0XHRcdHN0eWxlW1wiZm9udC1zaXplXCJdID0gcHJlZnMub3V0bGluZUZvbnRTaXplICsgXCJweFwiO1xuXHRcdFx0XHRzdHlsZVtcIm1pbi1oZWlnaHRcIl0gPSAocHJlZnMub3V0bGluZUZvbnRTaXplICsgNikgKyBcInB4XCI7XG5cdFx0XHRcdHN0eWxlW1wibGluZS1oZWlnaHRcIl0gPSAocHJlZnMub3V0bGluZUZvbnRTaXplICsgNikgKyBcInB4XCI7XG5cdFx0XHRcdH1cblx0XHRcdGlmKHByZWZzLm91dGxpbmVMaW5lSGVpZ2h0KSB7XG5cdFx0XHRcdHByZWZzLm91dGxpbmVMaW5lSGVpZ2h0ID0gcGFyc2VJbnQocHJlZnMub3V0bGluZUxpbmVIZWlnaHQpO1xuXHRcdFx0XHRzdHlsZVtcIm1pbi1oZWlnaHRcIl0gPSBwcmVmcy5vdXRsaW5lTGluZUhlaWdodCArIFwicHhcIjtcblx0XHRcdFx0c3R5bGVbXCJsaW5lLWhlaWdodFwiXSA9IHByZWZzLm91dGxpbmVMaW5lSGVpZ2h0ICsgXCJweFwiO1xuXHRcdFx0XHR9XG5cdFx0XHR0aGlzLnJvb3QucGFyZW50KCkuZmluZChcInN0eWxlLnByZWZzU3R5bGVcIikucmVtb3ZlKCk7XG5cdFx0XHR2YXIgY3NzID0gJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIiBjbGFzcz1cInByZWZzU3R5bGVcIj5cXG4nO1xuXHRcdFx0dmFyIGNzc0lkPVwiXCI7XG5cdFx0XHRpZih0aGlzLnJvb3QucGFyZW50KCkuYXR0cihcImlkXCIpKXtcblx0XHRcdFx0Y3NzSWQ9XCIjXCIrdGhpcy5yb290LnBhcmVudCgpLmF0dHIoXCJpZFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0Y3NzICs9IGNzc0lkICsgJyAuY29uY29yZCAuY29uY29yZC1ub2RlIC5jb25jb3JkLXdyYXBwZXIgLmNvbmNvcmQtdGV4dCB7Jztcblx0XHRcdGZvcih2YXIgYXR0cmlidXRlIGluIHN0eWxlKSB7XG5cdFx0XHRcdGNzcyArPSBhdHRyaWJ1dGUgKyAnOiAnICsgc3R5bGVbYXR0cmlidXRlXSArICc7Jztcblx0XHRcdFx0fVxuXHRcdFx0Y3NzICs9ICd9XFxuJztcblx0XHRcdGNzcyArPSBjc3NJZCArICcgLmNvbmNvcmQgLmNvbmNvcmQtbm9kZSAuY29uY29yZC13cmFwcGVyIC5ub2RlLWljb24geyc7XG5cdFx0XHRmb3IodmFyIGF0dHJpYnV0ZSBpbiBzdHlsZSkge1xuXHRcdFx0XHRpZihhdHRyaWJ1dGUhPVwiZm9udC1mYW1pbHlcIil7XG5cdFx0XHRcdFx0Y3NzICs9IGF0dHJpYnV0ZSArICc6ICcgKyBzdHlsZVthdHRyaWJ1dGVdICsgJzsnO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0Y3NzICs9ICd9XFxuJ1xuXHRcdFx0dmFyIHdyYXBwZXJQYWRkaW5nTGVmdCA9IHByZWZzLm91dGxpbmVMaW5lSGVpZ2h0O1xuXHRcdFx0aWYod3JhcHBlclBhZGRpbmdMZWZ0PT09dW5kZWZpbmVkKXtcblx0XHRcdFx0d3JhcHBlclBhZGRpbmdMZWZ0ID0gcHJlZnMub3V0bGluZUZvbnRTaXplO1xuXHRcdFx0XHR9XG5cdFx0XHRpZih3cmFwcGVyUGFkZGluZ0xlZnQhPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0Y3NzICs9IGNzc0lkICsgJyAuY29uY29yZCAuY29uY29yZC1ub2RlIC5jb25jb3JkLXdyYXBwZXIgeyc7XG5cdFx0XHRcdGNzcyArPSBcInBhZGRpbmctbGVmdDogXCIgKyB3cmFwcGVyUGFkZGluZ0xlZnQgKyBcInB4XCI7XG5cdFx0XHRcdGNzcyArPSBcIn1cXG5cIjtcblx0XHRcdFx0Y3NzICs9IGNzc0lkICsgJyAuY29uY29yZCBvbCB7Jztcblx0XHRcdFx0Y3NzICs9IFwicGFkZGluZy1sZWZ0OiBcIiArIHdyYXBwZXJQYWRkaW5nTGVmdCArIFwicHhcIjtcblx0XHRcdFx0Y3NzICs9IFwifVxcblwiO1xuXHRcdFx0XHR9XG5cdFx0XHRjc3MgKz0gJzwvc3R5bGU+XFxuJztcblx0XHRcdHRoaXMucm9vdC5iZWZvcmUoY3NzKTtcblx0XHRcdGlmKG5ld3ByZWZzLmNzcyl7XG5cdFx0XHRcdHRoaXMub3Auc2V0U3R5bGUobmV3cHJlZnMuY3NzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdHJldHVybiBwcmVmcztcblx0XHR9O1xuXHR0aGlzLmFmdGVySW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWRpdG9yID0gbmV3IENvbmNvcmRFZGl0b3IodGhpcy5yb290LCB0aGlzKTtcblx0XHR0aGlzLm9wID0gbmV3IENvbmNvcmRPcCh0aGlzLnJvb3QsIHRoaXMpO1xuXHRcdHRoaXMuc2NyaXB0ID0gbmV3IENvbmNvcmRTY3JpcHQodGhpcy5yb290LCB0aGlzKTtcblx0XHRpZihvcHRpb25zKSB7XG5cdFx0XHRpZihvcHRpb25zLnByZWZzKSB7XG5cdFx0XHRcdHRoaXMucHJlZnMob3B0aW9ucy5wcmVmcyk7XG5cdFx0XHRcdH1cblx0XHRcdGlmKG9wdGlvbnMub3Blbikge1xuXHRcdFx0XHR0aGlzLnJvb3QuZGF0YShcIm9wZW5cIiwgb3B0aW9ucy5vcGVuKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYob3B0aW9ucy5zYXZlKSB7XG5cdFx0XHRcdHRoaXMucm9vdC5kYXRhKFwic2F2ZVwiLCBvcHRpb25zLnNhdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZihvcHRpb25zLmNhbGxiYWNrcykge1xuXHRcdFx0XHR0aGlzLmNhbGxiYWNrcyhvcHRpb25zLmNhbGxiYWNrcyk7XG5cdFx0XHRcdH1cblx0XHRcdGlmKG9wdGlvbnMuaWQpIHtcblx0XHRcdFx0dGhpcy5yb290LmRhdGEoXCJpZFwiLCBvcHRpb25zLmlkKTtcblx0XHRcdFx0dGhpcy5vcGVuKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRpZigkKGNvbnRhaW5lcikuZmluZChcIi5jb25jb3JkLXJvb3Q6Zmlyc3RcIikubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5yb290ID0gJChjb250YWluZXIpLmZpbmQoXCIuY29uY29yZC1yb290OmZpcnN0XCIpO1xuXHRcdFx0dGhpcy5wYXN0ZUJpbiA9ICQoY29udGFpbmVyKS5maW5kKFwiLnBhc3RlQmluOmZpcnN0XCIpO1xuXHRcdFx0dGhpcy5hZnRlckluaXQoKTtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR2YXIgcm9vdCA9ICQoXCI8b2w+PC9vbD5cIik7XG5cdFx0cm9vdC5hZGRDbGFzcyhcImNvbmNvcmQgY29uY29yZC1yb290XCIpO1xuXHRcdHJvb3QuYXBwZW5kVG8oY29udGFpbmVyKTtcblx0XHR0aGlzLnJvb3QgPSByb290O1xuXHRcdHZhciBwYXN0ZUJpbiA9ICQoJzxkaXYgY2xhc3M9XCJwYXN0ZUJpblwiIGNvbnRlbnRlZGl0YWJsZT1cInRydWVcIiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgaGVpZ2h0OiAxcHg7IHdpZHRoOjFweDsgb3V0bGluZTpub25lOyBvdmVyZmxvdzpoaWRkZW47XCI+PC9kaXY+Jyk7XG5cdFx0cGFzdGVCaW4uYXBwZW5kVG8oY29udGFpbmVyKTtcblx0XHR0aGlzLnBhc3RlQmluID0gcGFzdGVCaW47XG5cdFx0dGhpcy5hZnRlckluaXQoKTtcblx0XHR0aGlzLmV2ZW50cyA9IG5ldyBDb25jb3JkRXZlbnRzKHRoaXMucm9vdCwgdGhpcy5lZGl0b3IsIHRoaXMub3AsIHRoaXMpO1xuXHRcdH07XG5cdHRoaXNbXCJuZXdcIl0gPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9wLndpcGUoKTtcblx0XHR9O1xuXHR0aGlzLm9wZW4gPSBmdW5jdGlvbihjYikge1xuXHRcdHZhciBvcG1sSWQgPSB0aGlzLnJvb3QuZGF0YShcImlkXCIpO1xuXHRcdGlmKCFvcG1sSWQpIHtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR2YXIgcm9vdCA9IHRoaXMucm9vdDtcblx0XHR2YXIgZWRpdG9yID0gdGhpcy5lZGl0b3I7XG5cdFx0dmFyIG9wID0gdGhpcy5vcDtcblx0XHR2YXIgb3BlblVybCA9IFwiaHR0cDovL2NvbmNvcmQuc21hbGxwaWN0dXJlLmNvbS9vcGVuXCI7XG5cdFx0aWYocm9vdC5kYXRhKFwib3BlblwiKSkge1xuXHRcdFx0b3BlblVybCA9IHJvb3QuZGF0YShcIm9wZW5cIik7XG5cdFx0XHR9XG5cdFx0cGFyYW1zID0ge31cblx0XHRpZihvcG1sSWQubWF0Y2goL15odHRwLiskLykpIHtcblx0XHRcdHBhcmFtc1tcInVybFwiXSA9IG9wbWxJZFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cGFyYW1zW1wiaWRcIl0gPSBvcG1sSWRcblx0XHRcdFx0fVxuXHRcdCQuYWpheCh7XG5cdFx0XHR0eXBlOiAnUE9TVCcsXG5cdFx0XHR1cmw6IG9wZW5VcmwsXG5cdFx0XHRkYXRhOiBwYXJhbXMsXG5cdFx0XHRkYXRhVHlwZTogXCJ4bWxcIixcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKG9wbWwpIHtcblx0XHRcdFx0aWYob3BtbCkge1xuXHRcdFx0XHRcdG9wLnhtbFRvT3V0bGluZShvcG1sKTtcblx0XHRcdFx0XHRpZihjYikge1xuXHRcdFx0XHRcdFx0Y2IoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGVcIikubGVuZ3RoID09IDApIHtcblx0XHRcdFx0XHRvcC53aXBlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR0aGlzLnNhdmUgPSBmdW5jdGlvbihjYikge1xuXHRcdHZhciBvcG1sSWQgPSB0aGlzLnJvb3QuZGF0YShcImlkXCIpO1xuXHRcdGlmKG9wbWxJZCAmJiB0aGlzLm9wLmNoYW5nZWQoKSkge1xuXHRcdFx0dmFyIHNhdmVVcmwgPSBcImh0dHA6Ly9jb25jb3JkLnNtYWxscGljdHVyZS5jb20vc2F2ZVwiO1xuXHRcdFx0aWYodGhpcy5yb290LmRhdGEoXCJzYXZlXCIpKSB7XG5cdFx0XHRcdHNhdmVVcmwgPSB0aGlzLnJvb3QuZGF0YShcInNhdmVcIik7XG5cdFx0XHRcdH1cblx0XHRcdHZhciBjb25jb3JkSW5zdGFuY2UgPSB0aGlzO1xuXHRcdFx0dmFyIG9wbWwgPSB0aGlzLm9wLm91dGxpbmVUb1htbCgpO1xuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0XHR1cmw6IHNhdmVVcmwsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcIm9wbWxcIjogb3BtbCxcblx0XHRcdFx0XHRcImlkXCI6IG9wbWxJZFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdGRhdGFUeXBlOiBcImpzb25cIixcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oanNvbikge1xuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5jbGVhckNoYW5nZWQoKTtcblx0XHRcdFx0XHRpZihjYikge1xuXHRcdFx0XHRcdFx0Y2IoanNvbik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzW1wiaW1wb3J0XCJdID0gZnVuY3Rpb24ob3BtbElkLCBjYikge1xuXHRcdHZhciBvcGVuVXJsID0gXCJodHRwOi8vY29uY29yZG9sZC5zbWFsbHBpY3R1cmUuY29tL29wZW5cIjtcblx0XHR2YXIgcm9vdCA9IHRoaXMucm9vdDtcblx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gdGhpcztcblx0XHRpZihyb290LmRhdGEoXCJvcGVuXCIpKSB7XG5cdFx0XHRvcGVuVXJsID0gcm9vdC5kYXRhKFwib3BlblwiKTtcblx0XHRcdH1cblx0XHRwYXJhbXMgPSB7fVxuXHRcdGlmKG9wbWxJZC5tYXRjaCgvXmh0dHAuKyQvKSkge1xuXHRcdFx0cGFyYW1zW1widXJsXCJdID0gb3BtbElkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cGFyYW1zW1wiaWRcIl0gPSBvcG1sSWQ7XG5cdFx0XHRcdH1cblx0XHQkLmFqYXgoe1xuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0dXJsOiBvcGVuVXJsLFxuXHRcdFx0ZGF0YTogcGFyYW1zLFxuXHRcdFx0ZGF0YVR5cGU6IFwieG1sXCIsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihvcG1sKSB7XG5cdFx0XHRcdGlmKG9wbWwpIHtcblx0XHRcdFx0XHR2YXIgY3Vyc29yID0gcm9vdC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yOmZpcnN0XCIpO1xuXHRcdFx0XHRcdCQob3BtbCkuZmluZChcImJvZHlcIikuY2hpbGRyZW4oXCJvdXRsaW5lXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgbm9kZSA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuYnVpbGQoJCh0aGlzKSk7XG5cdFx0XHRcdFx0XHRjdXJzb3IuYWZ0ZXIobm9kZSk7XG5cdFx0XHRcdFx0XHRjdXJzb3IgPSBub2RlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHRcdFx0aWYoY2IpIHtcblx0XHRcdFx0XHRcdGNiKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR0aGlzW1wiZXhwb3J0XCJdID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvbnRleHQgPSB0aGlzLnJvb3QuZmluZChcIi5jb25jb3JkLWN1cnNvcjpmaXJzdFwiKTtcblx0XHRpZihjb250ZXh0Lmxlbmd0aCA9PSAwKSB7XG5cdFx0XHRjb250ZXh0ID0gdGhpcy5yb290LmZpbmQoXCIuY29uY29yZC1yb290OmZpcnN0XCIpO1xuXHRcdFx0fVxuXHRcdHJldHVybiB0aGlzLmVkaXRvci5vcG1sKGNvbnRleHQpO1xuXHRcdH07XG5cdHRoaXMuaW5pdCgpO1xuXHR9XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uY29yZE91dGxpbmU7XG4iLCJmdW5jdGlvbiBDb25jb3JkU2NyaXB0KHJvb3QsIGNvbmNvcmRJbnN0YW5jZSl7XG5cdHRoaXMuaXNDb21tZW50ID0gZnVuY3Rpb24oKXtcblx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuYXR0cmlidXRlcy5nZXRPbmUoXCJpc0NvbW1lbnRcIikhPT0gdW5kZWZpbmVkKXtcblx0XHRcdHJldHVybiBjb25jb3JkSW5zdGFuY2Uub3AuYXR0cmlidXRlcy5nZXRPbmUoXCJpc0NvbW1lbnRcIik9PVwidHJ1ZVwiO1xuXHRcdFx0fVxuXHRcdHZhciBwYXJlbnRJc0FDb21tZW50PWZhbHNlO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3Auc2V0Q3Vyc29yQ29udGV4dCgkKHRoaXMpKS5hdHRyaWJ1dGVzLmdldE9uZShcImlzQ29tbWVudFwiKSA9PSBcInRydWVcIil7XG5cdFx0XHRcdHBhcmVudElzQUNvbW1lbnQgPSB0cnVlO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdHJldHVybiBwYXJlbnRJc0FDb21tZW50O1xuXHRcdH07XG5cdHRoaXMubWFrZUNvbW1lbnQgPSBmdW5jdGlvbigpe1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5hdHRyaWJ1dGVzLnNldE9uZShcImlzQ29tbWVudFwiLCBcInRydWVcIik7XG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmFkZENsYXNzKFwiY29uY29yZC1jb21tZW50XCIpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMudW5Db21tZW50ID0gZnVuY3Rpb24oKXtcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AuYXR0cmlidXRlcy5zZXRPbmUoXCJpc0NvbW1lbnRcIiwgXCJmYWxzZVwiKTtcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkucmVtb3ZlQ2xhc3MoXCJjb25jb3JkLWNvbW1lbnRcIik7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0fVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmNvcmRTY3JpcHQ7XG4iLCJ2YXIgWE1MX0NIQVJfTUFQID0ge1xuICBcIjxcIiA6IFwiJmx0O1wiLFxuICBcIj5cIiA6IFwiJmd0O1wiLFxuICBcIiZcIiA6IFwiJmFtcDtcIixcbiAgXCJcXFwiXCI6IFwiJnF1b3Q7XCJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlc2NhcGVYbWw6IGZ1bmN0aW9uIChzKSB7XG4gICAgcyA9IHMudG9TdHJpbmcoKTtcbiAgICBzID0gcy5yZXBsYWNlKC9cXHUwMEEwL2csIFwiIFwiKTtcbiAgICB2YXIgZXNjYXBlZCA9IHMucmVwbGFjZSgvWzw+JlwiXS9nLCBmdW5jdGlvbiAoY2gpIHtcbiAgICAgIHJldHVybiBYTUxfQ0hBUl9NQVBbY2hdO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGVzY2FwZWQ7XG4gIH1cbn07XG4iLCJ2YXIgQ29uY29yZE91dGxpbmUgPSByZXF1aXJlKFwiLi9jb25jb3JkLW91dGxpbmVcIik7XG5cbnZhciBjb25jb3JkID0ge1xuXHR2ZXJzaW9uOiBcIjMuMC4wXCIsXG5cdG1vYmlsZTogL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSxcblx0cmVhZHk6IGZhbHNlLFxuXHRoYW5kbGVFdmVudHM6IHRydWUsXG5cdHJlc3VtZUNhbGxiYWNrczogW10sXG5cdG9uUmVzdW1lOiBmdW5jdGlvbihjYil7XG5cdFx0dGhpcy5yZXN1bWVDYWxsYmFja3MucHVzaChjYik7XG5cdFx0fSxcblx0cmVzdW1lTGlzdGVuaW5nOiBmdW5jdGlvbigpe1xuXHRcdGlmKCF0aGlzLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHR0aGlzLmhhbmRsZUV2ZW50cz10cnVlO1xuXHRcdFx0dmFyIHIgPSB0aGlzLmdldEZvY3VzUm9vdCgpO1xuXHRcdFx0aWYociE9bnVsbCl7XG5cdFx0XHRcdHZhciBjID0gbmV3IENvbmNvcmRPdXRsaW5lKHIucGFyZW50KCksIG51bGwsIGNvbmNvcmQpO1xuXHRcdFx0XHRpZihjLm9wLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRcdFx0Yy5vcC5mb2N1c0N1cnNvcigpO1xuXHRcdFx0XHRcdGMuZWRpdG9yLnJlc3RvcmVTZWxlY3Rpb24oKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGMucGFzdGVCaW5Gb2N1cygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRmb3IodmFyIGkgaW4gdGhpcy5yZXN1bWVDYWxsYmFja3Mpe1xuXHRcdFx0XHRcdHZhciBjYiA9IHRoaXMucmVzdW1lQ2FsbGJhY2tzW2ldO1xuXHRcdFx0XHRcdGNiKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnJlc3VtZUNhbGxiYWNrcz1bXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKCl7XG5cdFx0aWYodGhpcy5oYW5kbGVFdmVudHMpe1xuXHRcdFx0dGhpcy5oYW5kbGVFdmVudHM9ZmFsc2U7XG5cdFx0XHR2YXIgciA9IHRoaXMuZ2V0Rm9jdXNSb290KCk7XG5cdFx0XHRpZihyIT1udWxsKXtcblx0XHRcdFx0dmFyIGMgPSBuZXcgQ29uY29yZE91dGxpbmUoci5wYXJlbnQoKSwgbnVsbCwgY29uY29yZCk7XG5cdFx0XHRcdGlmKGMub3AuaW5UZXh0TW9kZSgpKXtcblx0XHRcdFx0XHRjLmVkaXRvci5zYXZlU2VsZWN0aW9uKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0Zm9jdXNSb290OiBudWxsLFxuXHRnZXRGb2N1c1Jvb3Q6IGZ1bmN0aW9uKCl7XG5cdFx0aWYoJChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZVwiKS5sZW5ndGg9PTEpe1xuXHRcdFx0cmV0dXJuIHRoaXMuc2V0Rm9jdXNSb290KCQoXCIuY29uY29yZC1yb290OnZpc2libGU6Zmlyc3RcIikpO1xuXHRcdFx0fVxuXHRcdGlmKCQoXCIubW9kYWxcIikuaXMoXCI6dmlzaWJsZVwiKSl7XG5cdFx0XHRpZigkKFwiLm1vZGFsXCIpLmZpbmQoXCIuY29uY29yZC1yb290OnZpc2libGU6Zmlyc3RcIikubGVuZ3RoPT0xKXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0Rm9jdXNSb290KCQoXCIubW9kYWxcIikuZmluZChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZTpmaXJzdFwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRpZih0aGlzLmZvY3VzUm9vdD09bnVsbCl7XG5cdFx0XHRpZigkKFwiLmNvbmNvcmQtcm9vdDp2aXNpYmxlXCIpLmxlbmd0aD4wKXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0Rm9jdXNSb290KCQoXCIuY29uY29yZC1yb290OnZpc2libGU6Zmlyc3RcIikpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0aWYoIXRoaXMuZm9jdXNSb290LmlzKFwiOnZpc2libGVcIikpe1xuXHRcdFx0cmV0dXJuIHRoaXMuc2V0Rm9jdXNSb290KCQoXCIuY29uY29yZC1yb290OnZpc2libGU6Zmlyc3RcIikpO1xuXHRcdFx0fVxuXHRcdHJldHVybiB0aGlzLmZvY3VzUm9vdDtcblx0XHR9LFxuXHRzZXRGb2N1c1Jvb3Q6IGZ1bmN0aW9uKHJvb3Qpe1xuXHRcdHZhciBvcmlnUm9vdCA9IHRoaXMuZm9jdXNSb290O1xuXHRcdHZhciBjb25jb3JkSW5zdGFuY2UgPSBuZXcgQ29uY29yZE91dGxpbmUocm9vdC5wYXJlbnQoKSwgbnVsbCwgY29uY29yZCk7XG5cdFx0aWYoKG9yaWdSb290IT1udWxsKSAmJiAhKG9yaWdSb290WzBdPT09cm9vdFswXSkpe1xuXHRcdFx0dmFyIG9yaWdDb25jb3JkSW5zdGFuY2UgPSBuZXcgQ29uY29yZE91dGxpbmUob3JpZ1Jvb3QucGFyZW50KCksIG51bGwsIGNvbmNvcmQpO1xuXHRcdFx0b3JpZ0NvbmNvcmRJbnN0YW5jZS5lZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRvcmlnQ29uY29yZEluc3RhbmNlLmVkaXRvci5kcmFnTW9kZUV4aXQoKTtcblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpe1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZm9jdXNDdXJzb3IoKTtcblx0XHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR0aGlzLmZvY3VzUm9vdCA9IHJvb3Q7XG5cdFx0cmV0dXJuIHRoaXMuZm9jdXNSb290O1xuXHRcdH0sXG5cdHVwZGF0ZUZvY3VzUm9vdEV2ZW50OiBmdW5jdGlvbihldmVudCl7XG5cdFx0dmFyIHJvb3QgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50cyhcIi5jb25jb3JkLXJvb3Q6Zmlyc3RcIik7XG5cdFx0aWYocm9vdC5sZW5ndGg9PTEpe1xuXHRcdFx0Y29uY29yZC5zZXRGb2N1c1Jvb3Qocm9vdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbmNvcmQ7XG4iLCIvLyBDb3B5cmlnaHQgMjAxMywgU21hbGwgUGljdHVyZSwgSW5jLlxyXG52YXIgQ29uY29yZFV0aWwgPSByZXF1aXJlKFwiLi9jb25jb3JkLXV0aWxcIik7XHJcbnZhciBjb25jb3JkID0gcmVxdWlyZShcIi4vY29uY29yZFwiKTtcclxudmFyIENvbmNvcmRPdXRsaW5lID0gcmVxdWlyZShcIi4vY29uY29yZC1vdXRsaW5lXCIpO1xyXG4kKGZ1bmN0aW9uICgpIHtcclxuXHRpZigkLmZuLnRvb2x0aXAgIT09IHVuZGVmaW5lZCl7XHJcblx0XHQkKFwiYVtyZWw9dG9vbHRpcF1cIikudG9vbHRpcCh7XHJcblx0XHRcdGxpdmU6IHRydWVcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9KVxyXG4kKGZ1bmN0aW9uICgpIHsgXHJcblx0aWYoJC5mbi5wb3BvdmVyICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0JChcImFbcmVsPXBvcG92ZXJdXCIpLm9uKFwibW91c2VlbnRlciBtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCl7JCh0aGlzKS5wb3BvdmVyKFwidG9nZ2xlXCIpfSlcclxuXHRcdH1cclxuXHR9KVxyXG5pZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XHJcblx0QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihvYmosIHN0YXJ0KSB7XHJcblx0XHRmb3IgKHZhciBpID0gKHN0YXJ0IHx8IDApLCBqID0gdGhpcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuXHRcdFx0aWYgKHRoaXNbaV0gPT09IG9iaikgeyByZXR1cm4gaTsgfVxyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gLTE7XHJcblx0XHR9XHJcblx0fVxyXG5cclxudmFyIGNvbmNvcmRFbnZpcm9ubWVudCA9IHtcclxuXHRcInZlcnNpb25cIiA6IGNvbmNvcmQudmVyc2lvblxyXG5cdH07XHJcbnZhciBjb25jb3JkQ2xpcGJvYXJkID0gdW5kZWZpbmVkO1xyXG5qUXVlcnkuZm4ucmV2ZXJzZSA9IFtdLnJldmVyc2U7XHJcbi8vQ29uc3RhbnRzXHJcblx0dmFyIG5pbCA9IG51bGw7XHJcblx0dmFyIGluZmluaXR5ID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuXHR2YXIgZG93biA9IFwiZG93blwiO1xyXG5cdHZhciBsZWZ0ID0gXCJsZWZ0XCI7XHJcblx0dmFyIHJpZ2h0ID0gXCJyaWdodFwiO1xyXG5cdHZhciB1cCA9IFwidXBcIjtcclxuXHR2YXIgZmxhdHVwID0gXCJmbGF0dXBcIjtcclxuXHR2YXIgZmxhdGRvd24gPSBcImZsYXRkb3duXCI7XHJcblx0dmFyIG5vZGlyZWN0aW9uID0gXCJub2RpcmVjdGlvblwiO1xyXG5cclxuZnVuY3Rpb24gT3Aob3BtbHRleHQpe1xyXG5cdHZhciBmYWtlRG9tID0gJChcIjxkaXY+PC9kaXY+XCIpO1xyXG5cdGZha2VEb20uY29uY29yZCgpLm9wLnhtbFRvT3V0bGluZShvcG1sdGV4dCk7XHJcblx0cmV0dXJuIGZha2VEb20uY29uY29yZCgpLm9wO1xyXG5cdH1cclxuKGZ1bmN0aW9uKCQpIHtcclxuXHQkLmZuLmNvbmNvcmQgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblx0XHRyZXR1cm4gbmV3IENvbmNvcmRPdXRsaW5lKCQodGhpcyksIG9wdGlvbnMsIGNvbmNvcmQpO1xyXG5cdFx0fTtcclxuXHQkKGRvY3VtZW50KS5vbihcImtleWRvd25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYoJChldmVudC50YXJnZXQpLmlzKFwiaW5wdXRcIil8fCQoZXZlbnQudGFyZ2V0KS5pcyhcInRleHRhcmVhXCIpKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgZm9jdXNSb290ID0gY29uY29yZC5nZXRGb2N1c1Jvb3QoKTtcclxuXHRcdGlmKGZvY3VzUm9vdD09bnVsbCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIGNvbnRleHQgPSBmb2N1c1Jvb3Q7XHJcblx0XHRjb250ZXh0LmRhdGEoXCJrZXlkb3duRXZlbnRcIiwgZXZlbnQpO1xyXG5cdFx0dmFyIGNvbmNvcmRJbnN0YW5jZSA9IG5ldyBDb25jb3JkT3V0bGluZShjb250ZXh0LnBhcmVudCgpLCBudWxsLCBjb25jb3JkKTtcclxuXHRcdHZhciByZWFkb25seSA9IGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl07XHJcblx0XHRpZihyZWFkb25seT09dW5kZWZpbmVkKXtcclxuXHRcdFx0cmVhZG9ubHk9ZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdC8vIFJlYWRvbmx5IGV4Y2VwdGlvbnMgZm9yIGFycm93IGtleXMgYW5kIGNtZC1jb21tYVxyXG5cdFx0aWYocmVhZG9ubHkpe1xyXG5cdFx0XHRpZiggKGV2ZW50LndoaWNoPj0zNykgJiYgKGV2ZW50LndoaWNoIDw9NDApICl7XHJcblx0XHRcdFx0cmVhZG9ubHkgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYoIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpICYmIChldmVudC53aGljaD09MTg4KSApe1xyXG5cdFx0XHRcdHJlYWRvbmx5ID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRpZighcmVhZG9ubHkpe1xyXG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BLZXlzdHJva2VcIiwgZXZlbnQpO1xyXG5cdFx0XHR2YXIga2V5Q2FwdHVyZWQgPSBmYWxzZTtcclxuXHRcdFx0dmFyIGNvbW1hbmRLZXkgPSBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXk7XHJcblx0XHRcdHN3aXRjaChldmVudC53aGljaCkge1xyXG5cdFx0XHRcdGNhc2UgODpcclxuXHRcdFx0XHRcdC8vQmFja3NwYWNlXHJcblx0XHRcdFx0XHRpZihjb25jb3JkLm1vYmlsZSl7XHJcblx0XHRcdFx0XHRcdGlmKChjb25jb3JkSW5zdGFuY2Uub3AuZ2V0TGluZVRleHQoKT09XCJcIikgfHwgKGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRMaW5lVGV4dCgpPT1cIjxicj5cIikpe1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZUxpbmUoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYoIWNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKS5oYXNDbGFzcyhcImRpcnR5XCIpKXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zYXZlU3RhdGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKS5hZGRDbGFzcyhcImRpcnR5XCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5kZWxldGVMaW5lKCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgOTpcclxuXHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHRcdFx0XHRcdGlmKGV2ZW50LnNoaWZ0S2V5KSB7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5yZW9yZyhsZWZ0KVxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5yZW9yZyhyaWdodCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA2NTpcclxuXHRcdFx0XHRcdC8vQ01EK0FcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBjdXJzb3IgPSBjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZm9jdXNDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKCdzZWxlY3RBbGwnLGZhbHNlLG51bGwpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iuc2VsZWN0aW9uTW9kZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjdXJzb3IucGFyZW50KCkuY2hpbGRyZW4oKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDg1OlxyXG5cdFx0XHRcdFx0Ly9DTUQrVVxyXG5cdFx0XHRcdFx0XHRpZihjb21tYW5kS2V5KSB7XHJcblx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJlb3JnKHVwKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNjg6XHJcblx0XHRcdFx0XHQvL0NNRCtEXHJcblx0XHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AucmVvcmcoZG93bik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA3NjpcclxuXHRcdFx0XHRcdC8vQ01EK0xcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5yZW9yZyhsZWZ0KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgODI6XHJcblx0XHRcdFx0XHQvL0NNRCtSXHJcblx0XHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AucmVvcmcocmlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAyMTk6XHJcblx0XHRcdFx0XHQvL0NNRCtbXHJcblx0XHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AucHJvbW90ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAyMjE6XHJcblx0XHRcdFx0XHQvL0NNRCtdXHJcblx0XHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVtb3RlKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDEzOlxyXG5cdFx0XHRcdFx0aWYoY29uY29yZC5tb2JpbGUpe1xyXG5cdFx0XHRcdFx0XHQvL01vYmlsZVxyXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRrZXlDYXB0dXJlZD10cnVlO1xyXG5cdFx0XHRcdFx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHR2YXIgY2xvbmVkQ3Vyc29yID0gY3Vyc29yLmNsb25lKHRydWUsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRjbG9uZWRDdXJzb3IucmVtb3ZlQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKTtcclxuXHRcdFx0XHRcdFx0Y3Vyc29yLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XHJcblx0XHRcdFx0XHRcdGN1cnNvci5yZW1vdmVDbGFzcyhcImRpcnR5XCIpO1xyXG5cdFx0XHRcdFx0XHRjdXJzb3IucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRMaW5lVGV4dChcIlwiKTtcclxuXHRcdFx0XHRcdFx0dmFyIGljb24gPSBcIjxpXCIrXCIgY2xhc3M9XFxcIm5vZGUtaWNvbiBpY29uLWNhcmV0LXJpZ2h0XFxcIj48XCIrXCIvaT5cIjtcclxuXHRcdFx0XHRcdFx0Y3Vyc29yLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5ub2RlLWljb25cIikucmVwbGFjZVdpdGgoaWNvbik7XHJcblx0XHRcdFx0XHRcdGNsb25lZEN1cnNvci5pbnNlcnRCZWZvcmUoY3Vyc29yKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmF0dHJpYnV0ZXMubWFrZUVtcHR5KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5kZWxldGVTdWJzKCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BJbnNlcnRcIiwgY29uY29yZEluc3RhbmNlLm9wLnNldEN1cnNvckNvbnRleHQoY3Vyc29yKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2V7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGlmKGV2ZW50Lm9yaWdpbmFsRXZlbnQgJiYgKChldmVudC5vcmlnaW5hbEV2ZW50LmtleUxvY2F0aW9uICYmIChldmVudC5vcmlnaW5hbEV2ZW50LmtleUxvY2F0aW9uICE9IDApKSB8fCAoZXZlbnQub3JpZ2luYWxFdmVudC5sb2NhdGlvbiAmJiAoZXZlbnQub3JpZ2luYWxFdmVudC5sb2NhdGlvbiAhPSAwKSkpICl7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldFRleHRNb2RlKCFjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKTtcclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBkb3duO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLnN1YnNFeHBhbmRlZCgpKXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZGlyZWN0aW9uPXJpZ2h0O1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgbm9kZSA9IGNvbmNvcmRJbnN0YW5jZS5vcC5pbnNlcnQoXCJcIiwgZGlyZWN0aW9uKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRUZXh0TW9kZSh0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM3OlxyXG5cdFx0XHRcdFx0Ly8gbGVmdFxyXG5cdFx0XHRcdFx0XHR2YXIgYWN0aXZlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKCQoZXZlbnQudGFyZ2V0KS5oYXNDbGFzcyhcImNvbmNvcmQtdGV4dFwiKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmKGV2ZW50LnRhcmdldC5zZWxlY3Rpb25TdGFydCA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYoY29udGV4dC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yLnNlbGVjdGVkXCIpLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0YWN0aXZlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmKGFjdGl2ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBjdXJzb3IgPSBjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHByZXYgPSBjb25jb3JkSW5zdGFuY2Uub3AuX3dhbGtfdXAoY3Vyc29yKTtcclxuXHRcdFx0XHRcdFx0XHRpZihwcmV2KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2V0Q3Vyc29yKHByZXYpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzODpcclxuXHRcdFx0XHRcdC8vIHVwXHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgcHJldiA9IGNvbmNvcmRJbnN0YW5jZS5vcC5fd2Fsa191cChjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKHByZXYpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3IocHJldik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ28odXAsMSxldmVudC5zaGlmdEtleSwgY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzk6XHJcblx0XHRcdFx0XHQvLyByaWdodFxyXG5cdFx0XHRcdFx0XHR2YXIgYWN0aXZlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdGlmKGNvbnRleHQuZmluZChcIi5jb25jb3JkLWN1cnNvci5zZWxlY3RlZFwiKS5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZihhY3RpdmUpIHtcclxuXHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbmV4dCA9IG51bGw7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgb3V0bGluZSA9IGN1cnNvci5jaGlsZHJlbihcIm9sXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYob3V0bGluZS5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZmlyc3RDaGlsZCA9IG91dGxpbmUuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZihmaXJzdENoaWxkLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGZpcnN0Q2hpbGQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0aWYoIW5leHQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdG5leHQgPSBjb25jb3JkSW5zdGFuY2Uub3AuX3dhbGtfZG93bihjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZihuZXh0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2V0Q3Vyc29yKG5leHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA0MDpcclxuXHRcdFx0XHRcdC8vIGRvd25cclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgbmV4dCA9IG51bGw7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgb3V0bGluZSA9IGN1cnNvci5jaGlsZHJlbihcIm9sXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYob3V0bGluZS5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgZmlyc3RDaGlsZCA9IG91dGxpbmUuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZihmaXJzdENoaWxkLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGZpcnN0Q2hpbGQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0aWYoIW5leHQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdG5leHQgPSBjb25jb3JkSW5zdGFuY2Uub3AuX3dhbGtfZG93bihjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZihuZXh0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2V0Q3Vyc29yKG5leHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmdvKGRvd24sMSwgZXZlbnQuc2hpZnRLZXksIGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQ2OlxyXG5cdFx0XHRcdFx0Ly8gZGVsZXRlXHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZighY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmhhc0NsYXNzKFwiZGlydHlcIikpe1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmFkZENsYXNzKFwiZGlydHlcIik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZUxpbmUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA5MDpcclxuXHRcdFx0XHRcdC8vQ01EK1pcclxuXHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpe1xyXG5cdFx0XHRcdFx0XHRrZXlDYXB0dXJlZD10cnVlO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AudW5kbygpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDg4OlxyXG5cdFx0XHRcdFx0Ly9DTUQrWFxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRMaW5lVGV4dCgpPT1cIlwiKXtcclxuXHRcdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZUxpbmUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zYXZlU3RhdGUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNjc6XHJcblx0XHRcdFx0XHQvL0NNRCtDXHJcblx0XHRcdFx0XHRpZihmYWxzZSYmY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRMaW5lVGV4dCgpIT1cIlwiKXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5yb290LnJlbW92ZURhdGEoXCJjbGlwYm9hcmRcIik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZD10cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5jb3B5KCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgODY6XHJcblx0XHRcdFx0XHQvL0NNRCtWXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDIyMDpcclxuXHRcdFx0XHRcdC8vIENNRCtCYWNrc2xhc2hcclxuXHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpe1xyXG5cdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uuc2NyaXB0LmlzQ29tbWVudCgpKXtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uuc2NyaXB0LnVuQ29tbWVudCgpO1xyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnNjcmlwdC5tYWtlQ29tbWVudCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDczOlxyXG5cdFx0XHRcdFx0Ly9DTUQrSVxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5pdGFsaWMoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA2NjpcclxuXHRcdFx0XHRcdC8vQ01EK0JcclxuXHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpe1xyXG5cdFx0XHRcdFx0XHRrZXlDYXB0dXJlZD10cnVlO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuYm9sZCgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDE5MjpcclxuXHRcdFx0XHRcdC8vQ01EK2BcclxuXHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpe1xyXG5cdFx0XHRcdFx0XHRrZXlDYXB0dXJlZD10cnVlO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2V0UmVuZGVyTW9kZSghY29uY29yZEluc3RhbmNlLm9wLmdldFJlbmRlck1vZGUoKSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTg4OlxyXG5cdFx0XHRcdFx0Ly9DTUQrLFxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5zdWJzRXhwYW5kZWQoKSl7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmNvbGxhcHNlKCk7XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZXhwYW5kKCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTkxOlxyXG5cdFx0XHRcdFx0Ly9DTUQrL1xyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5ydW5TZWxlY3Rpb24oKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdGtleUNhcHR1cmVkID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZigha2V5Q2FwdHVyZWQpIHtcclxuXHRcdFx0XHRpZigoZXZlbnQud2hpY2ggPj0gMzIpICYmICgoZXZlbnQud2hpY2ggPCAxMTIpIHx8IChldmVudC53aGljaCA+IDEyMykpICYmIChldmVudC53aGljaCA8IDEwMDApICYmICFjb21tYW5kS2V5KSB7XHJcblx0XHRcdFx0XHR2YXIgbm9kZSA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpIHtcclxuXHRcdFx0XHRcdFx0aWYoIW5vZGUuaGFzQ2xhc3MoXCJkaXJ0eVwiKSl7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0bm9kZS5hZGRDbGFzcyhcImRpcnR5XCIpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRUZXh0TW9kZSh0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2F2ZVN0YXRlKCk7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5lZGl0KG5vZGUsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdG5vZGUuYWRkQ2xhc3MoXCJkaXJ0eVwiKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdCQoZG9jdW1lbnQpLm9uKFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZigkKFwiLmNvbmNvcmQtcm9vdFwiKS5sZW5ndGg9PTApe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKCAkKGV2ZW50LnRhcmdldCkuaXMoXCJhXCIpIHx8ICQoZXZlbnQudGFyZ2V0KS5pcyhcImlucHV0XCIpIHx8ICQoZXZlbnQudGFyZ2V0KS5pcyhcInRleHRhcmVhXCIpIHx8ICgkKGV2ZW50LnRhcmdldCkucGFyZW50cyhcImE6Zmlyc3RcIikubGVuZ3RoPT0xKSB8fCAkKGV2ZW50LnRhcmdldCkuaGFzQ2xhc3MoXCJkcm9wZG93bi1tZW51XCIpIHx8ICgkKGV2ZW50LnRhcmdldCkucGFyZW50cyhcIi5kcm9wZG93bi1tZW51OmZpcnN0XCIpLmxlbmd0aD4wKSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIGNvbnRleHQgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50cyhcIi5jb25jb3JkLXJvb3Q6Zmlyc3RcIik7XHJcblx0XHRpZihjb250ZXh0Lmxlbmd0aCA9PSAwKSB7XHJcblx0XHRcdCQoXCIuY29uY29yZC1yb290XCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIGNvbmNvcmRJbnN0YW5jZSA9IG5ldyBDb25jb3JkT3V0bGluZSgkKHRoaXMpLnBhcmVudCgpLCBudWxsLCBjb25jb3JkKTtcclxuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmhpZGVDb250ZXh0TWVudSgpO1xyXG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZHJhZ01vZGVFeGl0KCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdHZhciBmb2N1c1Jvb3QgPSBjb25jb3JkLmdldEZvY3VzUm9vdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHQkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIGNvbmNvcmQudXBkYXRlRm9jdXNSb290RXZlbnQpO1xyXG5cdCQoZG9jdW1lbnQpLm9uKFwiZGJsY2xpY2tcIiwgY29uY29yZC51cGRhdGVGb2N1c1Jvb3RFdmVudCk7XHJcblx0JChkb2N1bWVudCkub24oJ3Nob3cnLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmKCQoZS50YXJnZXQpLmlzKFwiLm1vZGFsXCIpKXtcclxuXHRcdFx0aWYoJChlLnRhcmdldCkuYXR0cihcImNvbmNvcmQtZXZlbnRzXCIpICE9IFwidHJ1ZVwiKXtcclxuXHRcdFx0XHRjb25jb3JkLnN0b3BMaXN0ZW5pbmcoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdCQoZG9jdW1lbnQpLm9uKCdoaWRkZW4nLCBmdW5jdGlvbihlKXtcclxuXHRcdGlmKCQoZS50YXJnZXQpLmlzKFwiLm1vZGFsXCIpKXtcclxuXHRcdFx0aWYoJChlLnRhcmdldCkuYXR0cihcImNvbmNvcmQtZXZlbnRzXCIpICE9IFwidHJ1ZVwiKXtcclxuXHRcdFx0XHRjb25jb3JkLnJlc3VtZUxpc3RlbmluZygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0Y29uY29yZC5yZWFkeT10cnVlO1xyXG5cdH0pKGpRdWVyeSk7XHJcbiJdfQ==
