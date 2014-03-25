(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require("./lib/index");

},{"./lib/index":9}],2:[function(require,module,exports){
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

},{"./concord":8}],4:[function(require,module,exports){
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

},{"./concord-outline":6}],9:[function(require,module,exports){
// Copyright 2013, Small Picture, Inc.
var ConcordUtil = require("./util");
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

},{"./concord":8,"./concord-outline":6,"./util":10}],10:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS90ZWQvV29yay9jb25jb3JkL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90ZWQvV29yay9jb25jb3JkL2NvbmNvcmQuanMiLCIvaG9tZS90ZWQvV29yay9jb25jb3JkL2xpYi9jb25jb3JkLWVkaXRvci5qcyIsIi9ob21lL3RlZC9Xb3JrL2NvbmNvcmQvbGliL2NvbmNvcmQtZXZlbnRzLmpzIiwiL2hvbWUvdGVkL1dvcmsvY29uY29yZC9saWIvY29uY29yZC1vcC1hdHRyaWJ1dGVzLmpzIiwiL2hvbWUvdGVkL1dvcmsvY29uY29yZC9saWIvY29uY29yZC1vcC5qcyIsIi9ob21lL3RlZC9Xb3JrL2NvbmNvcmQvbGliL2NvbmNvcmQtb3V0bGluZS5qcyIsIi9ob21lL3RlZC9Xb3JrL2NvbmNvcmQvbGliL2NvbmNvcmQtc2NyaXB0LmpzIiwiL2hvbWUvdGVkL1dvcmsvY29uY29yZC9saWIvY29uY29yZC5qcyIsIi9ob21lL3RlZC9Xb3JrL2NvbmNvcmQvbGliL2luZGV4LmpzIiwiL2hvbWUvdGVkL1dvcmsvY29uY29yZC9saWIvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzliQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZShcIi4vbGliL2luZGV4XCIpO1xuIiwiZnVuY3Rpb24gQ29uY29yZEVkaXRvcihyb290LCBjb25jb3JkSW5zdGFuY2UpIHtcblx0dGhpcy5tYWtlTm9kZSA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5vZGUgPSAkKFwiPGxpPjwvbGk+XCIpO1xuXHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLW5vZGVcIik7XG5cdFx0dmFyIHdyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz0nY29uY29yZC13cmFwcGVyJz48L2Rpdj5cIik7XG5cdFx0dmFyIGljb25OYW1lPVwiY2FyZXQtcmlnaHRcIjtcblx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tXCIrIGljb25OYW1lICtcIlxcXCI+PFwiK1wiL2k+XCI7XG5cdFx0d3JhcHBlci5hcHBlbmQoaWNvbik7XG5cdFx0d3JhcHBlci5hZGRDbGFzcyhcInR5cGUtaWNvblwiKTtcblx0XHR2YXIgdGV4dCA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXRleHQnIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+PC9kaXY+XCIpO1xuXHRcdHZhciBvdXRsaW5lID0gJChcIjxvbD48L29sPlwiKTtcblx0XHR0ZXh0LmFwcGVuZFRvKHdyYXBwZXIpO1xuXHRcdHdyYXBwZXIuYXBwZW5kVG8obm9kZSk7XG5cdFx0b3V0bGluZS5hcHBlbmRUbyhub2RlKTtcblx0XHRyZXR1cm4gbm9kZTtcblx0XHR9O1xuXHR0aGlzLmRyYWdNb2RlID0gZnVuY3Rpb24oKSB7XG5cdFx0cm9vdC5kYXRhKFwiZHJhZ2dpbmdDaGFuZ2VcIiwgcm9vdC5jaGlsZHJlbigpLmNsb25lKHRydWUsIHRydWUpKTtcblx0XHRyb290LmFkZENsYXNzKFwiZHJhZ2dpbmdcIik7XG5cdFx0cm9vdC5kYXRhKFwiZHJhZ2dpbmdcIiwgdHJ1ZSk7XG5cdFx0fTtcblx0dGhpcy5kcmFnTW9kZUV4aXQgPSBmdW5jdGlvbigpIHtcblx0XHRpZihyb290LmRhdGEoXCJkcmFnZ2luZ1wiKSkge1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VcIiwgcm9vdC5kYXRhKFwiZHJhZ2dpbmdDaGFuZ2VcIikpO1xuXHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlVGV4dE1vZGVcIiwgZmFsc2UpO1xuXHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlUmFuZ2VcIiwgdW5kZWZpbmVkKTtcblx0XHRcdH1cblx0XHRyb290LmZpbmQoXCIuZHJhZ2dhYmxlXCIpLnJlbW92ZUNsYXNzKFwiZHJhZ2dhYmxlXCIpO1xuXHRcdHJvb3QuZmluZChcIi5kcm9wLXNpYmxpbmdcIikucmVtb3ZlQ2xhc3MoXCJkcm9wLXNpYmxpbmdcIik7XG5cdFx0cm9vdC5maW5kKFwiLmRyb3AtY2hpbGRcIikucmVtb3ZlQ2xhc3MoXCJkcm9wLWNoaWxkXCIpO1xuXHRcdHJvb3QucmVtb3ZlQ2xhc3MoXCJkcmFnZ2luZ1wiKTtcblx0XHRyb290LmRhdGEoXCJkcmFnZ2luZ1wiLCBmYWxzZSk7XG5cdFx0cm9vdC5kYXRhKFwibW91c2Vkb3duXCIsIGZhbHNlKTtcblx0XHR9O1xuXHR0aGlzLmVkaXQgPSBmdW5jdGlvbihub2RlLCBlbXB0eSkge1xuXHRcdHZhciB0ZXh0ID0gbm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdGlmKGVtcHR5KSB7XG5cdFx0XHR0ZXh0Lmh0bWwoXCJcIik7XG5cdFx0XHR9XG5cdFx0dGV4dC5mb2N1cygpO1xuXHRcdHZhciBlbCA9IHRleHQuZ2V0KDApO1xuXHRcdGlmKGVsICYmIGVsLmNoaWxkTm9kZXMgJiYgZWwuY2hpbGROb2Rlc1swXSl7XG5cdFx0XHRpZiAodHlwZW9mIHdpbmRvdy5nZXRTZWxlY3Rpb24gIT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlUmFuZ2UgIT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHQgICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG5cdFx0XHRcdCAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsKTtcblx0XHRcdFx0ICAgICAgICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cdFx0XHRcdCAgICAgICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdFx0ICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cdFx0XHRcdCAgICAgICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcblx0XHRcdFx0ICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlICE9IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHR2YXIgdGV4dFJhbmdlID0gZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcblx0XHRcdFx0XHR0ZXh0UmFuZ2UubW92ZVRvRWxlbWVudFRleHQoZWwpO1xuXHRcdFx0XHRcdHRleHRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cdFx0XHRcdFx0ICAgICAgICB0ZXh0UmFuZ2Uuc2VsZWN0KCk7XG5cdFx0XHRcdCAgICB9XG5cdFx0XHR9XG5cdFx0dGV4dC5hZGRDbGFzcyhcImVkaXRpbmdcIik7XG5cdFx0aWYoIWVtcHR5KXtcblx0XHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGUuZGlydHlcIikubGVuZ3RoPjApe1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuZWRpdGFibGUgPSBmdW5jdGlvbih0YXJnZXQpIHtcblx0XHR2YXIgZWRpdGFibGUgPSBmYWxzZTtcblx0XHRpZighdGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC10ZXh0XCIpKSB7XG5cdFx0XHR0YXJnZXQgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XG5cdFx0XHR9XG5cdFx0aWYodGFyZ2V0Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRlZGl0YWJsZSA9IHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtdGV4dFwiKSAmJiB0YXJnZXQuaGFzQ2xhc3MoXCJlZGl0aW5nXCIpO1xuXHRcdFx0fVxuXHRcdHJldHVybiBlZGl0YWJsZTtcblx0XHR9O1xuXHR0aGlzLmVkaXRvck1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRyb290LmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRyb290LmZpbmQoXCIuZWRpdGluZ1wiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8kKHRoaXMpLmJsdXIoKTtcblx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoXCJlZGl0aW5nXCIpO1xuXHRcdFx0fSk7XG5cdFx0cm9vdC5maW5kKFwiLnNlbGVjdGlvbi10b29sYmFyXCIpLnJlbW92ZSgpO1xuXHRcdH07XG5cdHRoaXMub3BtbCA9IGZ1bmN0aW9uKF9yb290LCBmbHN1YnNvbmx5KSB7XG5cdFx0XG5cdFx0aWYgKGZsc3Vic29ubHkgPT0gdW5kZWZpbmVkKSB7IC8vOC81LzEzIGJ5IERXXG5cdFx0XHRmbHN1YnNvbmx5ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XG5cdFx0aWYoX3Jvb3QpIHtcblx0XHRcdHJvb3QgPSBfcm9vdDtcblx0XHRcdH1cblx0XHR2YXIgdGl0bGUgPSByb290LmRhdGEoXCJ0aXRsZVwiKTtcblx0XHRpZighdGl0bGUpIHtcblx0XHRcdGlmKHJvb3QuaGFzQ2xhc3MoXCJjb25jb3JkLW5vZGVcIikpIHtcblx0XHRcdFx0dGl0bGUgPSByb290LmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIikudGV4dCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGl0bGUgPSBcIlwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0dmFyIG9wbWwgPSAnPD94bWwgdmVyc2lvbj1cIjEuMFwiPz5cXG4nO1xuXHRcdG9wbWwgKz0gJzxvcG1sIHZlcnNpb249XCIyLjBcIj5cXG4nO1xuXHRcdG9wbWwgKz0gJzxoZWFkPlxcbic7XG5cdFx0b3BtbCArPSAnPHRpdGxlPicgKyBDb25jb3JkVXRpbC5lc2NhcGVYbWwodGl0bGUpICsgJzwvdGl0bGU+XFxuJztcblx0XHRvcG1sICs9ICc8L2hlYWQ+XFxuJztcblx0XHRvcG1sICs9ICc8Ym9keT5cXG4nO1xuXHRcdGlmKHJvb3QuaGFzQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKSkge1xuXHRcdFx0b3BtbCArPSB0aGlzLm9wbWxMaW5lKHJvb3QsIDAsIGZsc3Vic29ubHkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGVkaXRvciA9IHRoaXM7XG5cdFx0XHRcdHJvb3QuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0b3BtbCArPSBlZGl0b3Iub3BtbExpbmUoJCh0aGlzKSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRvcG1sICs9ICc8L2JvZHk+XFxuJztcblx0XHRvcG1sICs9ICc8L29wbWw+XFxuJztcblx0XHRyZXR1cm4gb3BtbDtcblx0XHR9O1xuXHR0aGlzLm9wbWxMaW5lID0gZnVuY3Rpb24obm9kZSwgaW5kZW50LCBmbHN1YnNvbmx5KSB7XG5cdFx0aWYoaW5kZW50PT11bmRlZmluZWQpe1xuXHRcdFx0aW5kZW50PTA7XG5cdFx0XHR9XG5cdFx0XG5cdFx0aWYgKGZsc3Vic29ubHkgPT0gdW5kZWZpbmVkKSB7IC8vOC81LzEzIGJ5IERXXG5cdFx0XHRmbHN1YnNvbmx5ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XG5cdFx0dmFyIHRleHQgPSB0aGlzLnVuZXNjYXBlKG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS5odG1sKCkpO1xuXHRcdHZhciB0ZXh0TWF0Y2hlcyA9IHRleHQubWF0Y2goL14oLispPGJyPlxccyokLyk7XG5cdFx0aWYodGV4dE1hdGNoZXMpe1xuXHRcdFx0dGV4dCA9IHRleHRNYXRjaGVzWzFdO1xuXHRcdFx0fVxuXHRcdHZhciBvcG1sID0gJyc7XG5cdFx0Zm9yKHZhciBpPTA7IGkgPCBpbmRlbnQ7aSsrKXtcblx0XHRcdG9wbWwgKz0gJ1xcdCc7XG5cdFx0XHR9XG5cdFx0XG5cdFx0dmFyIHN1YmhlYWRzOyBcblx0XHRpZiAoIWZsc3Vic29ubHkpIHsgLy84LzUvMTMgYnkgRFdcblx0XHRcdG9wbWwgKz0gJzxvdXRsaW5lIHRleHQ9XCInICsgQ29uY29yZFV0aWwuZXNjYXBlWG1sKHRleHQpICsgJ1wiJztcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gbm9kZS5kYXRhKFwiYXR0cmlidXRlc1wiKTtcblx0XHRcdGlmKGF0dHJpYnV0ZXM9PT11bmRlZmluZWQpe1xuXHRcdFx0XHRhdHRyaWJ1dGVzPXt9O1xuXHRcdFx0XHR9XG5cdFx0XHRmb3IodmFyIG5hbWUgaW4gYXR0cmlidXRlcyl7XG5cdFx0XHRcdGlmKChuYW1lIT09dW5kZWZpbmVkKSAmJiAobmFtZSE9XCJcIikgJiYgKG5hbWUgIT0gXCJ0ZXh0XCIpKSB7XG5cdFx0XHRcdFx0aWYoYXR0cmlidXRlc1tuYW1lXSE9PXVuZGVmaW5lZCl7XG5cdFx0XHRcdFx0XHRvcG1sICs9ICcgJyArIG5hbWUgKyAnPVwiJyArIENvbmNvcmRVdGlsLmVzY2FwZVhtbChhdHRyaWJ1dGVzW25hbWVdKSArICdcIic7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRzdWJoZWFkcyA9IG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIik7XG5cdFx0XHRpZihzdWJoZWFkcy5sZW5ndGg9PTApe1xuXHRcdFx0XHRvcG1sKz1cIi8+XFxuXCI7XG5cdFx0XHRcdHJldHVybiBvcG1sO1xuXHRcdFx0XHR9XG5cdFx0XHRvcG1sICs9IFwiPlxcblwiO1xuXHRcdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0c3ViaGVhZHMgPSBub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpO1xuXHRcdFx0fVxuXHRcdFxuXHRcdHZhciBlZGl0b3IgPSB0aGlzO1xuXHRcdGluZGVudCsrO1xuXHRcdHN1YmhlYWRzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRvcG1sICs9IGVkaXRvci5vcG1sTGluZSgkKHRoaXMpLCBpbmRlbnQpO1xuXHRcdFx0fSk7XG5cdFx0XG5cdFx0aWYgKCFmbHN1YnNvbmx5KSB7IC8vOC81LzEzIGJ5IERXXG5cdFx0XHRmb3IodmFyIGk9MDsgaSA8IGluZGVudDtpKyspe1xuXHRcdFx0XHRvcG1sICs9ICdcXHQnO1xuXHRcdFx0XHR9XG5cdFx0XHRvcG1sICs9ICc8L291dGxpbmU+XFxuJztcblx0XHRcdH1cblx0XHRcblx0XHRyZXR1cm4gb3BtbDtcblx0XHR9O1xuXHR0aGlzLnRleHRMaW5lID0gZnVuY3Rpb24obm9kZSwgaW5kZW50KXtcblx0XHRpZighaW5kZW50KXtcblx0XHRcdGluZGVudCA9IDA7XG5cdFx0XHR9XG5cdFx0dmFyIHRleHQgPSBcIlwiO1xuXHRcdGZvcih2YXIgaT0wOyBpIDwgaW5kZW50O2krKyl7XG5cdFx0XHR0ZXh0ICs9IFwiXFx0XCI7XG5cdFx0XHR9XG5cdFx0dGV4dCArPSB0aGlzLnVuZXNjYXBlKG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS5odG1sKCkpO1xuXHRcdHRleHQgKz0gXCJcXG5cIjtcblx0XHR2YXIgZWRpdG9yID0gdGhpcztcblx0XHRub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR0ZXh0ICs9IGVkaXRvci50ZXh0TGluZSgkKHRoaXMpLCBpbmRlbnQrMSk7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gdGV4dDtcblx0XHR9O1xuXHR0aGlzLnNlbGVjdCA9IGZ1bmN0aW9uKG5vZGUsIG11bHRpcGxlLCBtdWx0aXBsZVJhbmdlKSB7XG5cdFx0aWYobXVsdGlwbGUgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtdWx0aXBsZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdGlmKG11bHRpcGxlUmFuZ2UgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtdWx0aXBsZVJhbmdlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0dGhpcy5zZWxlY3Rpb25Nb2RlKG11bHRpcGxlKTtcblx0XHRcdGlmKG11bHRpcGxlKXtcblx0XHRcdFx0bm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZS5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdFx0XHRub2RlLmZpbmQoXCIuY29uY29yZC1ub2RlLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdGlmKG11bHRpcGxlICYmIG11bHRpcGxlUmFuZ2UpIHtcblx0XHRcdFx0dmFyIHByZXZOb2RlcyA9IG5vZGUucHJldkFsbChcIi5zZWxlY3RlZFwiKTtcblx0XHRcdFx0aWYocHJldk5vZGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHR2YXIgc3RhbXAgPSBmYWxzZTtcblx0XHRcdFx0XHRub2RlLnByZXZBbGwoKS5yZXZlcnNlKCkuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmKCQodGhpcykuaGFzQ2xhc3MoXCJzZWxlY3RlZFwiKSkge1xuXHRcdFx0XHRcdFx0XHRzdGFtcCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZihzdGFtcCkge1xuXHRcdFx0XHRcdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIG5leHROb2RlcyA9IG5vZGUubmV4dEFsbChcIi5zZWxlY3RlZFwiKTtcblx0XHRcdFx0XHRcdGlmKG5leHROb2Rlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBzdGFtcCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdG5vZGUubmV4dEFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYoJCh0aGlzKS5oYXNDbGFzcyhcInNlbGVjdGVkXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdGFtcCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmKHN0YW1wKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdHZhciB0ZXh0ID0gbm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdFx0aWYodGV4dC5oYXNDbGFzcyhcImVkaXRpbmdcIikpIHtcblx0XHRcdFx0dGV4dC5yZW1vdmVDbGFzcyhcImVkaXRpbmdcIik7XG5cdFx0XHRcdH1cblx0XHRcdC8vdGV4dC5ibHVyKCk7XG5cdFx0XHRub2RlLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XG5cdFx0XHRpZih0ZXh0LnRleHQoKS5sZW5ndGg+MCl7XG5cdFx0XHRcdC8vcm9vdC5kYXRhKFwiY3VycmVudENoYW5nZVwiLCByb290LmNoaWxkcmVuKCkuY2xvbmUoKSk7XG5cdFx0XHRcdH1cblx0XHRcdHRoaXMuZHJhZ01vZGVFeGl0KCk7XG5cdFx0XHR9XG5cdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZS5kaXJ0eVwiKS5sZW5ndGg+MCl7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLnNlbGVjdGlvbk1vZGUgPSBmdW5jdGlvbihtdWx0aXBsZSkge1xuXHRcdGlmKG11bHRpcGxlID09IHVuZGVmaW5lZCkge1xuXHRcdFx0bXVsdGlwbGUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR2YXIgbm9kZSA9IHJvb3QuZmluZChcIi5jb25jb3JkLWN1cnNvclwiKTtcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHR2YXIgdGV4dCA9IG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKTtcblx0XHRcdGlmKHRleHQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0Ly90ZXh0LmJsdXIoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGlmKCFtdWx0aXBsZSkge1xuXHRcdFx0cm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XG5cdFx0XHR9XG5cdFx0cm9vdC5maW5kKFwiLnNlbGVjdGlvbi10b29sYmFyXCIpLnJlbW92ZSgpO1xuXHRcdH07XG5cdHRoaXMuYnVpbGQgPSBmdW5jdGlvbihvdXRsaW5lLGNvbGxhcHNlZCwgbGV2ZWwpIHtcblx0XHRpZighbGV2ZWwpe1xuXHRcdFx0bGV2ZWwgPSAxO1xuXHRcdFx0fVxuXHRcdHZhciBub2RlID0gJChcIjxsaT48L2xpPlwiKTtcblx0XHRub2RlLmFkZENsYXNzKFwiY29uY29yZC1ub2RlXCIpO1xuXHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLWxldmVsLVwiK2xldmVsKTtcblx0XHR2YXIgYXR0cmlidXRlcyA9IHt9O1xuXHRcdCQob3V0bGluZVswXS5hdHRyaWJ1dGVzKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYodGhpcy5uYW1lICE9ICd0ZXh0Jykge1xuXHRcdFx0XHRhdHRyaWJ1dGVzW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlO1xuXHRcdFx0XHRpZih0aGlzLm5hbWU9PVwidHlwZVwiKXtcblx0XHRcdFx0XHRub2RlLmF0dHIoXCJvcG1sLVwiICsgdGhpcy5uYW1lLCB0aGlzLnZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdG5vZGUuZGF0YShcImF0dHJpYnV0ZXNcIiwgYXR0cmlidXRlcyk7XG5cdFx0dmFyIHdyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz0nY29uY29yZC13cmFwcGVyJz48L2Rpdj5cIik7XG5cdFx0dmFyIG5vZGVJY29uID0gYXR0cmlidXRlc1tcImljb25cIl07XG5cdFx0aWYoIW5vZGVJY29uKXtcblx0XHRcdG5vZGVJY29uID0gYXR0cmlidXRlc1tcInR5cGVcIl07XG5cdFx0XHR9XG5cdFx0dmFyIGljb25OYW1lPVwiY2FyZXQtcmlnaHRcIjtcblx0XHRpZihub2RlSWNvbil7XG5cdFx0XHRpZigobm9kZUljb249PW5vZGUuYXR0cihcIm9wbWwtdHlwZVwiKSkgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29uc1tub2RlSWNvbl0pe1xuXHRcdFx0XHRpY29uTmFtZSA9IGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29uc1tub2RlSWNvbl07XG5cdFx0XHRcdH1lbHNlIGlmIChub2RlSWNvbj09YXR0cmlidXRlc1tcImljb25cIl0pe1xuXHRcdFx0XHRcdGljb25OYW1lID0gbm9kZUljb247XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdHZhciBpY29uID0gXCI8aVwiK1wiIGNsYXNzPVxcXCJub2RlLWljb24gaWNvbi1cIisgaWNvbk5hbWUgK1wiXFxcIj48XCIrXCIvaT5cIjtcblx0XHR3cmFwcGVyLmFwcGVuZChpY29uKTtcblx0XHR3cmFwcGVyLmFkZENsYXNzKFwidHlwZS1pY29uXCIpO1xuXHRcdGlmKGF0dHJpYnV0ZXNbXCJpc0NvbW1lbnRcIl09PVwidHJ1ZVwiKXtcblx0XHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLWNvbW1lbnRcIik7XG5cdFx0XHR9XG5cdFx0dmFyIHRleHQgPSAkKFwiPGRpdiBjbGFzcz0nY29uY29yZC10ZXh0JyBjb250ZW50ZWRpdGFibGU9J3RydWUnPjwvZGl2PlwiKTtcblx0XHR0ZXh0LmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCtcIi10ZXh0XCIpO1xuXHRcdHRleHQuaHRtbCh0aGlzLmVzY2FwZShvdXRsaW5lLmF0dHIoJ3RleHQnKSkpO1xuXHRcdGlmKGF0dHJpYnV0ZXNbXCJjc3NUZXh0Q2xhc3NcIl0hPT11bmRlZmluZWQpe1xuXHRcdFx0dmFyIGNzc0NsYXNzZXMgPSBhdHRyaWJ1dGVzW1wiY3NzVGV4dENsYXNzXCJdLnNwbGl0KC9cXHMrLyk7XG5cdFx0XHRmb3IodmFyIGMgaW4gY3NzQ2xhc3Nlcyl7XG5cdFx0XHRcdHZhciBuZXdDbGFzcyA9IGNzc0NsYXNzZXNbY107XG5cdFx0XHRcdHRleHQuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0dmFyIGNoaWxkcmVuID0gJChcIjxvbD48L29sPlwiKTtcblx0XHR2YXIgZWRpdG9yID0gdGhpcztcblx0XHRvdXRsaW5lLmNoaWxkcmVuKFwib3V0bGluZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGNoaWxkID0gZWRpdG9yLmJ1aWxkKCQodGhpcyksIGNvbGxhcHNlZCwgbGV2ZWwrMSk7XG5cdFx0XHRjaGlsZC5hcHBlbmRUbyhjaGlsZHJlbik7XG5cdFx0XHR9KTtcblx0XHRpZihjb2xsYXBzZWQpe1xuXHRcdFx0aWYob3V0bGluZS5jaGlsZHJlbihcIm91dGxpbmVcIikuc2l6ZSgpPjApe1xuXHRcdFx0XHRub2RlLmFkZENsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0dGV4dC5hcHBlbmRUbyh3cmFwcGVyKTtcblx0XHR3cmFwcGVyLmFwcGVuZFRvKG5vZGUpO1xuXHRcdGNoaWxkcmVuLmFwcGVuZFRvKG5vZGUpO1xuXHRcdHJldHVybiBub2RlO1xuXHRcdH07XG5cdHRoaXMuaGlkZUNvbnRleHRNZW51ID0gZnVuY3Rpb24oKXtcblx0XHRpZihyb290LmRhdGEoXCJkcm9wZG93blwiKSl7XG5cdFx0XHRyb290LmRhdGEoXCJkcm9wZG93blwiKS5oaWRlKCk7XG5cdFx0XHRyb290LmRhdGEoXCJkcm9wZG93blwiKS5yZW1vdmUoKTtcblx0XHRcdHJvb3QucmVtb3ZlRGF0YShcImRyb3Bkb3duXCIpO1xuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuc2hvd0NvbnRleHRNZW51ID0gZnVuY3Rpb24oeCx5KXtcblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKS5jb250ZXh0TWVudSl7XG5cdFx0XHR0aGlzLmhpZGVDb250ZXh0TWVudSgpO1xuXHRcdFx0cm9vdC5kYXRhKFwiZHJvcGRvd25cIiwgJChjb25jb3JkSW5zdGFuY2UucHJlZnMoKS5jb250ZXh0TWVudSkuY2xvbmUoKS5hcHBlbmRUbyhjb25jb3JkSW5zdGFuY2UuY29udGFpbmVyKSk7XG5cdFx0XHR2YXIgZWRpdG9yID0gdGhpcztcblx0XHRcdHJvb3QuZGF0YShcImRyb3Bkb3duXCIpLm9uKFwiY2xpY2tcIiwgXCJhXCIsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRcdFx0ZWRpdG9yLmhpZGVDb250ZXh0TWVudSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdHJvb3QuZGF0YShcImRyb3Bkb3duXCIpLmNzcyh7XCJwb3NpdGlvblwiIDogXCJhYnNvbHV0ZVwiLCBcInRvcFwiIDogeSArXCJweFwiLCBcImxlZnRcIiA6IHggKyBcInB4XCIsIFwiY3Vyc29yXCIgOiBcImRlZmF1bHRcIn0pO1xuXHRcdFx0cm9vdC5kYXRhKFwiZHJvcGRvd25cIikuc2hvdygpO1xuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuc2FuaXRpemUgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBlZGl0b3IgPSB0aGlzO1xuXHRcdHJvb3QuZmluZChcIi5jb25jb3JkLXRleHQucGFzdGVcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGNvbmNvcmRUZXh0ID0gJCh0aGlzKTtcblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi50ZXh0KCk9PVwiLi4uXCIpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdHZhciBoID0gY29uY29yZEluc3RhbmNlLnBhc3RlQmluLmh0bWwoKTtcblx0XHRcdGggPSBoLnJlcGxhY2UobmV3IFJlZ0V4cChcIjwoZGl2fHB8YmxvY2txdW90ZXxwcmV8bGl8YnJ8ZGR8ZHR8Y29kZXxoXFxcXGQpW14+XSooLyk/PlwiLFwiZ2lcIiksXCJcXG5cIik7XG5cdFx0XHRoID0gJChcIjxkaXYvPlwiKS5odG1sKGgpLnRleHQoKTtcblx0XHRcdHZhciBjbGlwYm9hcmRNYXRjaCA9IGZhbHNlO1xuXHRcdFx0aWYoY29uY29yZENsaXBib2FyZCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdFx0dmFyIHRyaW1tZWRDbGlwYm9hcmRUZXh0ID0gY29uY29yZENsaXBib2FyZC50ZXh0LnJlcGxhY2UoL15bXFxzXFxyXFxuXSt8W1xcc1xcclxcbl0rJC9nLCcnKTtcblx0XHRcdFx0dmFyIHRyaW1tZWRQYXN0ZVRleHQgPSBoLnJlcGxhY2UoL15bXFxzXFxyXFxuXSt8W1xcc1xcclxcbl0rJC9nLCcnKTtcblx0XHRcdFx0aWYodHJpbW1lZENsaXBib2FyZFRleHQ9PXRyaW1tZWRQYXN0ZVRleHQpe1xuXHRcdFx0XHRcdHZhciBjbGlwYm9hcmROb2RlcyA9IGNvbmNvcmRDbGlwYm9hcmQuZGF0YTtcblx0XHRcdFx0XHRpZihjbGlwYm9hcmROb2Rlcyl7XG5cdFx0XHRcdFx0XHR2YXIgY29sbGFwc2VOb2RlID0gZnVuY3Rpb24obm9kZSl7XG5cdFx0XHRcdFx0XHRcdG5vZGUuZmluZChcIm9sXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYoJCh0aGlzKS5jaGlsZHJlbigpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdCQodGhpcykucGFyZW50KCkuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRjbGlwYm9hcmROb2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRcdGNvbGxhcHNlTm9kZSgkKHRoaXMpKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyb290LmRhdGEoXCJjbGlwYm9hcmRcIiwgY2xpcGJvYXJkTm9kZXMpO1xuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldFRleHRNb2RlKGZhbHNlKTtcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5wYXN0ZSgpO1xuXHRcdFx0XHRcdFx0Y2xpcGJvYXJkTWF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0aWYoIWNsaXBib2FyZE1hdGNoKXtcblx0XHRcdFx0Y29uY29yZENsaXBib2FyZCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0dmFyIG51bWJlcm9mbGluZXMgPSAwO1xuXHRcdFx0XHR2YXIgbGluZXMgPSBoLnNwbGl0KFwiXFxuXCIpO1xuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0XHRcdHZhciBsaW5lID0gbGluZXNbaV07XG5cdFx0XHRcdFx0aWYoKGxpbmUhPVwiXCIpICYmICFsaW5lLm1hdGNoKC9eXFxzKyQvKSl7XG5cdFx0XHRcdFx0XHRudW1iZXJvZmxpbmVzKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRpZighY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSB8fCAobnVtYmVyb2ZsaW5lcyA+IDEpKXtcblx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuaW5zZXJ0VGV4dChoKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zYXZlU3RhdGUoKTtcblx0XHRcdFx0XHRcdGNvbmNvcmRUZXh0LmZvY3VzKCk7XG5cdFx0XHRcdFx0XHR2YXIgcmFuZ2UgPSBjb25jb3JkVGV4dC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKS5kYXRhKFwicmFuZ2VcIik7XG5cdFx0XHRcdFx0XHRpZihyYW5nZSl7XG5cdFx0XHRcdFx0XHRcdHRyeXtcblx0XHRcdFx0XHRcdFx0XHR2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdFx0XHRcdFx0XHRcdHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcblx0XHRcdFx0XHRcdFx0XHRzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y2F0Y2goZSl7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRmaW5hbGx5IHtcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkVGV4dC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKS5yZW1vdmVEYXRhKFwicmFuZ2VcIik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcImluc2VydFRleHRcIixudWxsLGgpO1xuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnJvb3QucmVtb3ZlRGF0YShcImNsaXBib2FyZFwiKTtcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRjb25jb3JkVGV4dC5yZW1vdmVDbGFzcyhcInBhc3RlXCIpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0dGhpcy5lc2NhcGUgPSBmdW5jdGlvbihzKXtcblx0XHR2YXIgaCA9ICQoXCI8ZGl2Lz5cIikudGV4dChzKS5odG1sKCk7XG5cdFx0aCA9IGgucmVwbGFjZSgvXFx1MDBBMC9nLCBcIiBcIik7XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldFJlbmRlck1vZGUoKSl7IC8vIFJlbmRlciBIVE1MIGlmIG9wLmdldFJlbmRlck1vZGUoKSByZXR1cm5zIHRydWUgLSAyLzE3LzEzIGJ5IEtTXG5cdFx0XHR2YXIgYWxsb3dlZFRhZ3MgPSBbXCJiXCIsXCJzdHJvbmdcIixcImlcIixcImVtXCIsXCJhXCIsXCJpbWdcIixcInN0cmlrZVwiLFwiZGVsXCJdO1xuXHRcdFx0Zm9yKHZhciB0YWdJbmRleCBpbiBhbGxvd2VkVGFncyl7XG5cdFx0XHRcdHZhciB0YWcgPSBhbGxvd2VkVGFnc1t0YWdJbmRleF07XG5cdFx0XHRcdGlmICh0YWcgPT0gXCJpbWdcIil7XG5cdFx0XHRcdFx0aCA9IGgucmVwbGFjZShuZXcgUmVnRXhwKFwiJmx0O1wiK3RhZytcIigoPyEmZ3Q7KS4rKSgvKT8mZ3Q7XCIsXCJnaVwiKSxcIjxcIit0YWcrXCIkMVwiK1wiLz5cIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh0YWc9PVwiYVwiKXtcblx0XHRcdFx0XHRoID0gaC5yZXBsYWNlKG5ldyBSZWdFeHAoXCImbHQ7XCIrdGFnK1wiKCg/ISZndDspLio/KSZndDsoKD8hJmx0Oy9cIit0YWcrXCImZ3Q7KS4rPykmbHQ7L1wiK3RhZytcIiZndDtcIixcImdpXCIpLFwiPFwiK3RhZytcIiQxXCIrXCI+JDJcIitcIjxcIitcIi9cIit0YWcrXCI+XCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0aCA9IGgucmVwbGFjZShuZXcgUmVnRXhwKFwiJmx0O1wiK3RhZytcIiZndDsoKD8hJmx0Oy9cIit0YWcrXCImZ3Q7KS4rPykmbHQ7L1wiK3RhZytcIiZndDtcIixcImdpXCIpLFwiPFwiK3RhZytcIj4kMVwiK1wiPFwiK1wiL1wiK3RhZytcIj5cIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0cmV0dXJuIGg7XG5cdFx0fTtcblx0dGhpcy51bmVzY2FwZSA9IGZ1bmN0aW9uKHMpe1xuXHRcdHZhciBoID0gcy5yZXBsYWNlKC88L2csXCImbHQ7XCIpLnJlcGxhY2UoLz4vZyxcIiZndDtcIik7XG5cdFx0aCA9ICQoXCI8ZGl2Lz5cIikuaHRtbChoKS50ZXh0KCk7XG5cdFx0cmV0dXJuIGg7XG5cdFx0fTtcblx0dGhpcy5nZXRTZWxlY3Rpb24gPSBmdW5jdGlvbigpe1xuXHRcdHZhciByYW5nZSA9IHVuZGVmaW5lZDtcblx0XHRpZih3aW5kb3cuZ2V0U2VsZWN0aW9uKXtcblx0XHRcdHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdGlmKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KXtcblx0XHRcdFx0cmFuZ2UgPSBzZWwuZ2V0UmFuZ2VBdCgwKTtcblx0XHRcdFx0aWYoJChyYW5nZS5zdGFydENvbnRhaW5lcikucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikubGVuZ3RoPT0wKXtcblx0XHRcdFx0XHRyYW5nZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRyZXR1cm4gcmFuZ2U7XG5cdFx0fTtcblx0dGhpcy5zYXZlU2VsZWN0aW9uID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgcmFuZ2UgPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuXHRcdGlmKHJhbmdlICE9PSB1bmRlZmluZWQpe1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmRhdGEoXCJyYW5nZVwiLCByYW5nZS5jbG9uZVJhbmdlKCkpO1xuXHRcdFx0fVxuXHRcdHJldHVybiByYW5nZTtcblx0XHR9O1xuXHR0aGlzLnJlc3RvcmVTZWxlY3Rpb24gPSBmdW5jdGlvbihyYW5nZSl7XG5cdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcblx0XHRpZihyYW5nZT09PXVuZGVmaW5lZCl7XG5cdFx0XHRyYW5nZSA9IGN1cnNvci5kYXRhKFwicmFuZ2VcIik7XG5cdFx0XHR9XG5cdFx0aWYocmFuZ2UgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRpZih3aW5kb3cuZ2V0U2VsZWN0aW9uKXtcblx0XHRcdFx0dmFyIGNvbmNvcmRUZXh0ID0gY3Vyc29yLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIik7XG5cdFx0XHRcdHRyeXtcblx0XHRcdFx0XHR2YXIgY2xvbmVSYW5nZXIgPSByYW5nZS5jbG9uZVJhbmdlKCk7XG5cdFx0XHRcdFx0dmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdFx0XHRzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cdFx0XHRcdFx0c2VsLmFkZFJhbmdlKGNsb25lUmFuZ2VyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoKGUpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0ZmluYWxseSB7XG5cdFx0XHRcdFx0Y3Vyc29yLnJlbW92ZURhdGEoXCJyYW5nZVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRyZXR1cm4gcmFuZ2U7XG5cdFx0fTtcblx0dGhpcy5yZWNhbGN1bGF0ZUxldmVscyA9IGZ1bmN0aW9uKGNvbnRleHQpe1xuXHRcdGlmKCFjb250ZXh0KXtcblx0XHRcdGNvbnRleHQgPSByb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpO1xuXHRcdFx0fVxuXHRcdGNvbnRleHQuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRleHQgPSAkKHRoaXMpLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIik7XG5cdFx0XHR2YXIgbGV2ZWxNYXRjaCA9ICQodGhpcykuYXR0cihcImNsYXNzXCIpLm1hdGNoKC8uKmNvbmNvcmQtbGV2ZWwtKFxcZCspLiovKTtcblx0XHRcdGlmKGxldmVsTWF0Y2gpe1xuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbE1hdGNoWzFdKTtcblx0XHRcdFx0dGV4dC5yZW1vdmVDbGFzcyhcImNvbmNvcmQtbGV2ZWwtXCIrbGV2ZWxNYXRjaFsxXStcIi10ZXh0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR2YXIgbGV2ZWwgPSAkKHRoaXMpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCsxO1xuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcyhcImNvbmNvcmQtbGV2ZWwtXCIrbGV2ZWwpO1xuXHRcdFx0dGV4dC5hZGRDbGFzcyhcImNvbmNvcmQtbGV2ZWwtXCIrbGV2ZWwrXCItdGV4dFwiKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdH1cblxubW9kdWxlLmV4cG9ydHMgPSBDb25jb3JkRWRpdG9yO1xuIiwidmFyIGNvbmNvcmQgPSByZXF1aXJlKFwiLi9jb25jb3JkXCIpO1xuXG5mdW5jdGlvbiBDb25jb3JkRXZlbnRzKHJvb3QsIGVkaXRvciwgb3AsIGNvbmNvcmRJbnN0YW5jZSkge1xuXHR2YXIgaW5zdGFuY2UgPSB0aGlzO1xuXHR0aGlzLndyYXBwZXJEb3VibGVDbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihyb290LmRhdGEoXCJkcm9wZG93blwiKSl7XG5cdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoIWVkaXRvci5lZGl0YWJsZSgkKGV2ZW50LnRhcmdldCkpKSB7XG5cdFx0XHR2YXIgd3JhcHBlciA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdGlmKHdyYXBwZXIuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpe1xuXHRcdFx0XHR3cmFwcGVyID0gd3JhcHBlci5wYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYod3JhcHBlci5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSkge1xuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0dmFyIG5vZGUgPSB3cmFwcGVyLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRvcC5zZXRUZXh0TW9kZShmYWxzZSk7XG5cdFx0XHRcdGlmKG9wLnN1YnNFeHBhbmRlZCgpKSB7XG5cdFx0XHRcdFx0b3AuY29sbGFwc2UoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b3AuZXhwYW5kKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmNsaWNrU2VsZWN0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKHJvb3QuZGF0YShcImRyb3Bkb3duXCIpKXtcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0ZWRpdG9yLmhpZGVDb250ZXh0TWVudSgpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmQubW9iaWxlKXtcblx0XHRcdHZhciBub2RlID0gJChldmVudC50YXJnZXQpO1xuXHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpWzBdPT09bm9kZVswXSl7XG5cdFx0XHRcdGluc3RhbmNlLmRvdWJsZUNsaWNrKGV2ZW50KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0aWYoKGV2ZW50LndoaWNoPT0xKSAmJiAhZWRpdG9yLmVkaXRhYmxlKCQoZXZlbnQudGFyZ2V0KSkpIHtcblx0XHRcdHZhciBub2RlID0gJChldmVudC50YXJnZXQpO1xuXHRcdFx0aWYoIW5vZGUuaGFzQ2xhc3MoXCJjb25jb3JkLW5vZGVcIikpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdGlmKG5vZGUubGVuZ3RoPT0xKSB7XG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRpZihldmVudC5zaGlmdEtleSAmJiAobm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZS5zZWxlY3RlZFwiKS5sZW5ndGg+MCkpe1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcblx0XHRcdFx0b3Auc2V0Q3Vyc29yKG5vZGUsIGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50Lm1ldGFLZXksIGV2ZW50LnNoaWZ0S2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuZG91YmxlQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYocm9vdC5kYXRhKFwiZHJvcGRvd25cIikpe1xuXHRcdFx0ZWRpdG9yLmhpZGVDb250ZXh0TWVudSgpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKCFlZGl0b3IuZWRpdGFibGUoJChldmVudC50YXJnZXQpKSkge1xuXHRcdFx0dmFyIG5vZGUgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRpZihub2RlLmhhc0NsYXNzKFwiY29uY29yZC1ub2RlXCIpICYmIG5vZGUuaGFzQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKSkge1xuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0b3Auc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSk7XG5cdFx0XHRcdGlmKG9wLnN1YnNFeHBhbmRlZCgpKSB7XG5cdFx0XHRcdFx0b3AuY29sbGFwc2UoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b3AuZXhwYW5kKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLndyYXBwZXJDbGlja1NlbGVjdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihyb290LmRhdGEoXCJkcm9wZG93blwiKSl7XG5cdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZC5tb2JpbGUpe1xuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdHZhciBub2RlID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpWzBdPT09bm9kZVswXSl7XG5cdFx0XHRcdGluc3RhbmNlLndyYXBwZXJEb3VibGVDbGljayhldmVudCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGlmKChldmVudC53aGljaD09MSkgJiYgIWVkaXRvci5lZGl0YWJsZSgkKGV2ZW50LnRhcmdldCkpKSB7XG5cdFx0XHR2YXIgd3JhcHBlciA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdGlmKHdyYXBwZXIuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpe1xuXHRcdFx0XHR3cmFwcGVyID0gd3JhcHBlci5wYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYod3JhcHBlci5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSkge1xuXHRcdFx0XHR2YXIgbm9kZSA9IHdyYXBwZXIucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdGlmKGV2ZW50LnNoaWZ0S2V5ICYmIChub2RlLnBhcmVudHMoXCIuY29uY29yZC1ub2RlLnNlbGVjdGVkXCIpLmxlbmd0aD4wKSl7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0b3Auc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQubWV0YUtleSwgZXZlbnQuc2hpZnRLZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5jb250ZXh0bWVudSA9IGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0dmFyIG5vZGUgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0aWYobm9kZS5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSB8fCBub2RlLmhhc0NsYXNzKFwibm9kZS1pY29uXCIpKXtcblx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcblx0XHRcdH1cblx0XHRpZighbm9kZS5oYXNDbGFzcyhcImNvbmNvcmQtbm9kZVwiKSl7XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdH1cblx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BDb250ZXh0TWVudVwiLCBvcC5zZXRDdXJzb3JDb250ZXh0KG5vZGUpKTtcblx0XHRvcC5zZXRDdXJzb3Iobm9kZSk7XG5cdFx0ZWRpdG9yLnNob3dDb250ZXh0TWVudShldmVudC5wYWdlWCwgZXZlbnQucGFnZVkpO1xuXHRcdH07XG5cdHJvb3Qub24oXCJkYmxjbGlja1wiLCBcIi5jb25jb3JkLXdyYXBwZXJcIiwgdGhpcy53cmFwcGVyRG91YmxlQ2xpY2spO1xuXHRyb290Lm9uKFwiZGJsY2xpY2tcIiwgXCIuY29uY29yZC1ub2RlXCIsIHRoaXMuZG91YmxlQ2xpY2spO1xuXHRyb290Lm9uKFwiZGJsY2xpY2tcIiwgXCIuY29uY29yZC10ZXh0XCIsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0dmFyIG5vZGUgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSk7XG5cdFx0XHRpZihvcC5zdWJzRXhwYW5kZWQoKSkge1xuXHRcdFx0XHRvcC5jb2xsYXBzZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9wLmV4cGFuZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0cm9vdC5vbihcImNsaWNrXCIsIFwiLmNvbmNvcmQtd3JhcHBlclwiLCB0aGlzLndyYXBwZXJDbGlja1NlbGVjdCk7XG5cdHJvb3Qub24oXCJjbGlja1wiLCBcIi5jb25jb3JkLW5vZGVcIiwgdGhpcy5jbGlja1NlbGVjdCk7XG5cdHJvb3Qub24oXCJtb3VzZW92ZXJcIiwgXCIuY29uY29yZC13cmFwcGVyXCIsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdHZhciBub2RlID0gJChldmVudC50YXJnZXQpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEhvdmVyXCIsIG9wLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xuXHRcdH0pO1xuXHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMuY29udGV4dE1lbnUpe1xuXHRcdHJvb3Qub24oXCJjb250ZXh0bWVudVwiLCBcIi5jb25jb3JkLXRleHRcIiwgdGhpcy5jb250ZXh0bWVudSk7XG5cdFx0cm9vdC5vbihcImNvbnRleHRtZW51XCIsIFwiLmNvbmNvcmQtbm9kZVwiLCB0aGlzLmNvbnRleHRtZW51KTtcblx0XHRyb290Lm9uKFwiY29udGV4dG1lbnVcIiwgXCIuY29uY29yZC13cmFwcGVyXCIsIHRoaXMuY29udGV4dG1lbnUpO1xuXHRcdH1cblx0cm9vdC5vbihcImJsdXJcIiwgXCIuY29uY29yZC10ZXh0XCIsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKCQodGhpcykuaHRtbCgpLm1hdGNoKC9eXFxzKjxicj5cXHMqJC8pKXtcblx0XHRcdCQodGhpcykuaHRtbChcIlwiKTtcblx0XHRcdH1cblx0XHR2YXIgY29uY29yZFRleHQgPSAkKHRoaXMpO1xuXHRcdHZhciBub2RlID0gJCh0aGlzKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKXtcblx0XHRcdGVkaXRvci5zYXZlU2VsZWN0aW9uKCk7XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSAmJiBub2RlLmhhc0NsYXNzKFwiZGlydHlcIikpe1xuXHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImRpcnR5XCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRyb290Lm9uKFwicGFzdGVcIiwgXCIuY29uY29yZC10ZXh0XCIsIGZ1bmN0aW9uKGV2ZW50KXtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdCQodGhpcykuYWRkQ2xhc3MoXCJwYXN0ZVwiKTtcblx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnNhdmVTZWxlY3Rpb24oKTtcblx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uaHRtbChcIlwiKTtcblx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uZm9jdXMoKTtcblx0XHRzZXRUaW1lb3V0KGVkaXRvci5zYW5pdGl6ZSwxMCk7XG5cdFx0fSk7XG5cdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5vbihcImNvcHlcIiwgZnVuY3Rpb24oKXtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdHZhciBjb3B5VGV4dCA9IFwiXCI7XG5cdFx0cm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdGNvcHlUZXh0Kz0gY29uY29yZEluc3RhbmNlLmVkaXRvci50ZXh0TGluZSgkKHRoaXMpKTtcblx0XHRcdH0pO1xuXHRcdGlmKChjb3B5VGV4dCE9XCJcIikgJiYgKGNvcHlUZXh0IT1cIlxcblwiKSl7XG5cdFx0XHRjb25jb3JkQ2xpcGJvYXJkID0ge3RleHQ6IGNvcHlUZXh0LCBkYXRhOiByb290LmZpbmQoXCIuc2VsZWN0ZWRcIikuY2xvbmUodHJ1ZSwgdHJ1ZSl9O1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLmh0bWwoXCI8cHJlPlwiKyQoXCI8ZGl2Lz5cIikudGV4dChjb3B5VGV4dCkuaHRtbCgpK1wiPC9wcmU+XCIpO1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLmZvY3VzKCk7XG5cdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInNlbGVjdEFsbFwiKTtcblx0XHRcdH1cblx0XHR9KTtcblx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLm9uKFwicGFzdGVcIiwgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIGNvbmNvcmRUZXh0ID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIik7XG5cdFx0Y29uY29yZFRleHQuYWRkQ2xhc3MoXCJwYXN0ZVwiKTtcblx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uaHRtbChcIlwiKTtcblx0XHRzZXRUaW1lb3V0KGVkaXRvci5zYW5pdGl6ZSwxMCk7XG5cdFx0fSk7XG5cdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5vbihcImN1dFwiLCBmdW5jdGlvbigpe1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIGNvcHlUZXh0ID0gXCJcIjtcblx0XHRyb290LmZpbmQoXCIuc2VsZWN0ZWRcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0Y29weVRleHQrPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnRleHRMaW5lKCQodGhpcykpO1xuXHRcdFx0fSk7XG5cdFx0aWYoKGNvcHlUZXh0IT1cIlwiKSAmJiAoY29weVRleHQhPVwiXFxuXCIpKXtcblx0XHRcdGNvbmNvcmRDbGlwYm9hcmQgPSB7dGV4dDogY29weVRleHQsIGRhdGE6IHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5jbG9uZSh0cnVlLCB0cnVlKX07XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uaHRtbChcIjxwcmU+XCIrJChcIjxkaXYvPlwiKS50ZXh0KGNvcHlUZXh0KS5odG1sKCkrXCI8L3ByZT5cIik7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW5Gb2N1cygpO1xuXHRcdFx0fVxuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5kZWxldGVMaW5lKCk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe2NvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCl9LCAyMDApO1xuXHRcdH0pO1xuXHRyb290Lm9uKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXHRcdGlmKHRhcmdldC5pcyhcImFcIikpe1xuXHRcdFx0aWYodGFyZ2V0LmF0dHIoXCJocmVmXCIpKXtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0d2luZG93Lm9wZW4odGFyZ2V0LmF0dHIoXCJocmVmXCIpKTtcblx0XHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRpZih0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIikubGVuZ3RoPT0xKXtcblx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZih0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXRleHRcIikpe1xuXHRcdFx0XHR2YXIgbm9kZSA9IHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0aWYobm9kZS5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdG9wLnNldEN1cnNvcihub2RlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRpZihldmVudC53aGljaD09MSkge1xuXHRcdFx0aWYocm9vdC5kYXRhKFwiZHJvcGRvd25cIikpe1xuXHRcdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0aWYodGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLmxlbmd0aD09MSl7XG5cdFx0XHRcdHRhcmdldCA9IHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC10ZXh0XCIpKXtcblx0XHRcdFx0dmFyIG5vZGUgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdGlmKG5vZGUubGVuZ3RoPT0xKXtcblx0XHRcdFx0XHRpZighcm9vdC5oYXNDbGFzcyhcInRleHRNb2RlXCIpKXtcblx0XHRcdFx0XHRcdHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xuXHRcdFx0XHRcdFx0cm9vdC5hZGRDbGFzcyhcInRleHRNb2RlXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKS5oYXNDbGFzcyhcImVkaXRpbmdcIikpe1xuXHRcdFx0XHRcdFx0cm9vdC5maW5kKFwiLmVkaXRpbmdcIikucmVtb3ZlQ2xhc3MoXCJlZGl0aW5nXCIpO1xuXHRcdFx0XHRcdFx0bm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmFkZENsYXNzKFwiZWRpdGluZ1wiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpKXtcblx0XHRcdFx0XHRcdHJvb3QuZmluZChcIi5jb25jb3JkLWN1cnNvclwiKS5yZW1vdmVDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpO1xuXHRcdFx0XHRcdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpO1xuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmZpcmVDYWxsYmFjayhcIm9wQ3Vyc29yTW92ZWRcIiwgb3Auc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdHJvb3QuZGF0YShcIm1vdXNlZG93blwiLCB0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdHJvb3Qub24oXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKCFlZGl0b3IuZWRpdGFibGUoJChldmVudC50YXJnZXQpKSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmKHJvb3QuZGF0YShcIm1vdXNlZG93blwiKSAmJiAhcm9vdC5kYXRhKFwiZHJhZ2dpbmdcIikpIHtcblx0XHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcblx0XHRcdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwibm9kZS1pY29uXCIpKXtcblx0XHRcdFx0XHR0YXJnZXQgPSB0YXJnZXQucGFyZW50KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRpZih0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXdyYXBwZXJcIikgJiYgdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKFwic2VsZWN0ZWRcIikpIHtcblx0XHRcdFx0XHRlZGl0b3IuZHJhZ01vZGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0cm9vdC5vbihcIm1vdXNldXBcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC1ub2RlXCIpKSB7XG5cdFx0XHR0YXJnZXQgPSB0YXJnZXQuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKTtcblx0XHRcdH0gZWxzZSBpZih0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXdyYXBwZXJcIikpIHtcblx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKTtcblx0XHRcdFx0fVxuXHRcdGlmKCFlZGl0b3IuZWRpdGFibGUodGFyZ2V0KSkge1xuXHRcdFx0cm9vdC5kYXRhKFwibW91c2Vkb3duXCIsIGZhbHNlKTtcblx0XHRcdGlmKHJvb3QuZGF0YShcImRyYWdnaW5nXCIpKSB7XG5cdFx0XHRcdHZhciB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XG5cdFx0XHRcdHZhciBub2RlID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHR2YXIgZHJhZ2dhYmxlID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpO1xuXHRcdFx0XHRpZigobm9kZS5sZW5ndGggPT0gMSkgJiYgKGRyYWdnYWJsZS5sZW5ndGggPj0gMSkpIHtcblx0XHRcdFx0XHR2YXIgaXNEcmFnZ2FibGVUYXJnZXQgPSBmYWxzZTtcblx0XHRcdFx0XHRkcmFnZ2FibGUuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0aWYodGhpcz09bm9kZVswXSl7XG5cdFx0XHRcdFx0XHRcdGlzRHJhZ2dhYmxlVGFyZ2V0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYoIWlzRHJhZ2dhYmxlVGFyZ2V0KSB7XG5cdFx0XHRcdFx0XHR2YXIgZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdG5vZGUucGFyZW50cyhcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0dmFyIG5vZGVQYXJlbnQgPSAkKHRoaXMpWzBdO1xuXHRcdFx0XHRcdFx0XHRkcmFnZ2FibGUuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0XHRcdGlmKCQodGhpcylbMF0gPT0gbm9kZVBhcmVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmKCFkcmFnZ2FibGVJc1RhcmdldFBhcmVudCkge1xuXHRcdFx0XHRcdFx0XHRpZih0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXdyYXBwZXJcIikgfHwgdGFyZ2V0Lmhhc0NsYXNzKFwibm9kZS1pY29uXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGNsb25lZERyYWdnYWJsZSA9IGRyYWdnYWJsZS5jbG9uZSh0cnVlLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0XHRjbG9uZWREcmFnZ2FibGUuaW5zZXJ0QWZ0ZXIobm9kZSk7XG5cdFx0XHRcdFx0XHRcdFx0ZHJhZ2dhYmxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgY2xvbmVkRHJhZ2dhYmxlID0gZHJhZ2dhYmxlLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIG91dGxpbmUgPSBub2RlLmNoaWxkcmVuKFwib2xcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRjbG9uZWREcmFnZ2FibGUucHJlcGVuZFRvKG91dGxpbmUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdGRyYWdnYWJsZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dmFyIHByZXYgPSBub2RlLnByZXYoKTtcblx0XHRcdFx0XHRcdFx0aWYocHJldi5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKHByZXYuaGFzQ2xhc3MoXCJkcm9wLWNoaWxkXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgY2xvbmVkRHJhZ2dhYmxlID0gZHJhZ2dhYmxlLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIG91dGxpbmUgPSBwcmV2LmNoaWxkcmVuKFwib2xcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRjbG9uZWREcmFnZ2FibGUuYXBwZW5kVG8ob3V0bGluZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRwcmV2LnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZHJhZ2dhYmxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0ZWRpdG9yLmRyYWdNb2RlRXhpdCgpO1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlY2FsY3VsYXRlTGV2ZWxzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0cm9vdC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYocm9vdC5kYXRhKFwiZHJhZ2dpbmdcIikpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuXHRcdFx0dmFyIG5vZGUgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHR2YXIgZHJhZ2dhYmxlID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpO1xuXHRcdFx0aWYoKG5vZGUubGVuZ3RoID09IDEpICYmIChkcmFnZ2FibGUubGVuZ3RoPj0xKSkge1xuXHRcdFx0XHR2YXIgaXNEcmFnZ2FibGVUYXJnZXQgPSBmYWxzZTtcblx0XHRcdFx0ZHJhZ2dhYmxlLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpZih0aGlzPT1ub2RlWzBdKXtcblx0XHRcdFx0XHRcdGlzRHJhZ2dhYmxlVGFyZ2V0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0aWYoIWlzRHJhZ2dhYmxlVGFyZ2V0KSB7XG5cdFx0XHRcdFx0dmFyIGRyYWdnYWJsZUlzVGFyZ2V0UGFyZW50ID0gZmFsc2U7XG5cdFx0XHRcdFx0bm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIG5vZGVQYXJlbnQgPSAkKHRoaXMpWzBdO1xuXHRcdFx0XHRcdFx0ZHJhZ2dhYmxlLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdFx0aWYoJCh0aGlzKVswXSA9PSBub2RlUGFyZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0ZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZighZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQpIHtcblx0XHRcdFx0XHRcdG5vZGUucmVtb3ZlQ2xhc3MoXCJkcm9wLXNpYmxpbmdcIikucmVtb3ZlKFwiZHJvcC1jaGlsZFwiKTtcblx0XHRcdFx0XHRcdGlmKHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSB8fCB0YXJnZXQuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpIHtcblx0XHRcdFx0XHRcdFx0bm9kZS5hZGRDbGFzcyhcImRyb3Atc2libGluZ1wiKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiZHJvcC1jaGlsZFwiKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChkcmFnZ2FibGUubGVuZ3RoPT0xKXtcblx0XHRcdFx0XHRcdHZhciBwcmV2ID0gbm9kZS5wcmV2KCk7XG5cdFx0XHRcdFx0XHRpZihwcmV2Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRcdHByZXYucmVtb3ZlQ2xhc3MoXCJkcm9wLXNpYmxpbmdcIikucmVtb3ZlKFwiZHJvcC1jaGlsZFwiKTtcblx0XHRcdFx0XHRcdFx0cHJldi5hZGRDbGFzcyhcImRyb3AtY2hpbGRcIik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRyb290Lm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKHJvb3QuZGF0YShcImRyYWdnaW5nXCIpKSB7XG5cdFx0XHRyb290LmZpbmQoXCIuZHJvcC1zaWJsaW5nXCIpLnJlbW92ZUNsYXNzKFwiZHJvcC1zaWJsaW5nXCIpO1xuXHRcdFx0cm9vdC5maW5kKFwiLmRyb3AtY2hpbGRcIikucmVtb3ZlQ2xhc3MoXCJkcm9wLWNoaWxkXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uY29yZEV2ZW50cztcbiIsImZ1bmN0aW9uIENvbmNvcmRPcEF0dHJpYnV0ZXMoY29uY29yZEluc3RhbmNlLCBjdXJzb3IpIHtcblx0dGhpcy5fY3NzVGV4dENsYXNzTmFtZSA9IFwiY3NzVGV4dENsYXNzXCI7XG5cdHRoaXMuX2Nzc1RleHRDbGFzcyA9IGZ1bmN0aW9uKG5ld1ZhbHVlKXtcblx0XHRpZihuZXdWYWx1ZT09PXVuZGVmaW5lZCl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIG5ld0Nzc0NsYXNzZXMgPSBuZXdWYWx1ZS5zcGxpdCgvXFxzKy8pO1xuXHRcdHZhciBjb25jb3JkVGV4dCA9IGN1cnNvci5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xuXHRcdHZhciBjdXJyZW50Q3NzQ2xhc3MgPSBjb25jb3JkVGV4dC5hdHRyKFwiY2xhc3NcIik7XG5cdFx0aWYoY3VycmVudENzc0NsYXNzKXtcblx0XHRcdHZhciBjc3NDbGFzc2VzQXJyYXkgPSBjdXJyZW50Q3NzQ2xhc3Muc3BsaXQoL1xccysvKTtcblx0XHRcdGZvcih2YXIgaSBpbiBjc3NDbGFzc2VzQXJyYXkpe1xuXHRcdFx0XHR2YXIgY2xhc3NOYW1lID0gY3NzQ2xhc3Nlc0FycmF5W2ldO1xuXHRcdFx0XHRpZihjbGFzc05hbWUubWF0Y2goL15jb25jb3JkXFwtLiskLykgPT0gbnVsbCl7XG5cdFx0XHRcdFx0Y29uY29yZFRleHQucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRmb3IodmFyIGogaW4gbmV3Q3NzQ2xhc3Nlcyl7XG5cdFx0XHR2YXIgbmV3Q2xhc3MgPSBuZXdDc3NDbGFzc2VzW2pdO1xuXHRcdFx0Y29uY29yZFRleHQuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuYWRkR3JvdXAgPSBmdW5jdGlvbihhdHRyaWJ1dGVzKSB7XG5cdFx0aWYoYXR0cmlidXRlc1tcInR5cGVcIl0pe1xuXHRcdFx0Y3Vyc29yLmF0dHIoXCJvcG1sLXR5cGVcIiwgYXR0cmlidXRlc1tcInR5cGVcIl0pO1xuXHRcdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Y3Vyc29yLnJlbW92ZUF0dHIoXCJvcG1sLXR5cGVcIik7XG5cdFx0XHR9XG5cdFx0dGhpcy5fY3NzVGV4dENsYXNzKGF0dHJpYnV0ZXNbdGhpcy5fY3NzVGV4dENsYXNzTmFtZV0pO1xuXHRcdHZhciBmaW5hbEF0dHJpYnV0ZXMgPSB0aGlzLmdldEFsbCgpO1xuXHRcdHZhciBpY29uQXR0cmlidXRlID0gXCJ0eXBlXCI7XG5cdFx0aWYoYXR0cmlidXRlc1tcImljb25cIl0pe1xuXHRcdFx0aWNvbkF0dHJpYnV0ZSA9IFwiaWNvblwiO1xuXHRcdFx0fVxuXHRcdGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVzKXtcblx0XHRcdGZpbmFsQXR0cmlidXRlc1tuYW1lXSA9IGF0dHJpYnV0ZXNbbmFtZV07XG5cdFx0XHRpZihuYW1lPT1pY29uQXR0cmlidXRlKXtcblx0XHRcdFx0dmFyIHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcblx0XHRcdFx0dmFyIHdyYXBwZXIgPSBjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpO1xuXHRcdFx0XHR2YXIgaWNvbk5hbWUgPSBudWxsO1xuXHRcdFx0XHRpZigobmFtZSA9PSBcInR5cGVcIikgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29uc1t2YWx1ZV0pe1xuXHRcdFx0XHRcdGljb25OYW1lID0gY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW3ZhbHVlXTtcblx0XHRcdFx0XHR9ZWxzZSBpZiAobmFtZT09XCJpY29uXCIpe1xuXHRcdFx0XHRcdFx0aWNvbk5hbWUgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0aWYoaWNvbk5hbWUpe1xuXHRcdFx0XHRcdHZhciBpY29uID0gXCI8aVwiK1wiIGNsYXNzPVxcXCJub2RlLWljb24gaWNvbi1cIisgaWNvbk5hbWUgK1wiXFxcIj48XCIrXCIvaT5cIjtcblx0XHRcdFx0XHR3cmFwcGVyLmNoaWxkcmVuKFwiLm5vZGUtaWNvbjpmaXJzdFwiKS5yZXBsYWNlV2l0aChpY29uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRjdXJzb3IuZGF0YShcImF0dHJpYnV0ZXNcIiwgZmluYWxBdHRyaWJ1dGVzKTtcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcblx0XHRyZXR1cm4gZmluYWxBdHRyaWJ1dGVzO1xuXHRcdH07XG5cdHRoaXMuc2V0R3JvdXAgPSBmdW5jdGlvbihhdHRyaWJ1dGVzKSB7XG5cdFx0aWYoYXR0cmlidXRlc1t0aGlzLl9jc3NUZXh0Q2xhc3NOYW1lXSE9PXVuZGVmaW5lZCl7XG5cdFx0XHR0aGlzLl9jc3NUZXh0Q2xhc3MoYXR0cmlidXRlc1t0aGlzLl9jc3NUZXh0Q2xhc3NOYW1lXSk7XG5cdFx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLl9jc3NUZXh0Q2xhc3MoXCJcIik7XG5cdFx0XHR9XG5cdFx0Y3Vyc29yLmRhdGEoXCJhdHRyaWJ1dGVzXCIsIGF0dHJpYnV0ZXMpO1xuXHRcdHZhciB3cmFwcGVyID0gY3Vyc29yLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKTtcblx0XHQkKGN1cnNvclswXS5hdHRyaWJ1dGVzKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG1hdGNoZXMgPSB0aGlzLm5hbWUubWF0Y2goL15vcG1sLSguKykkLylcblx0XHRcdGlmKG1hdGNoZXMpIHtcblx0XHRcdFx0dmFyIG5hbWUgPSBtYXRjaGVzWzFdO1xuXHRcdFx0XHRpZighYXR0cmlidXRlc1tuYW1lXSkge1xuXHRcdFx0XHRcdGN1cnNvci5yZW1vdmVBdHRyKHRoaXMubmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR2YXIgaWNvbkF0dHJpYnV0ZSA9IFwidHlwZVwiO1xuXHRcdGlmKGF0dHJpYnV0ZXNbXCJpY29uXCJdKXtcblx0XHRcdGljb25BdHRyaWJ1dGUgPSBcImljb25cIjtcblx0XHRcdH1cblx0XHRpZihuYW1lPT1cInR5cGVcIil7XG5cdFx0XHRjdXJzb3IuYXR0cihcIm9wbWwtXCIgKyBuYW1lLCBhdHRyaWJ1dGVzW25hbWVdKTtcblx0XHRcdH1cblx0XHRmb3IodmFyIG5hbWUgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0aWYobmFtZT09aWNvbkF0dHJpYnV0ZSl7XG5cdFx0XHRcdHZhciB2YWx1ZSA9IGF0dHJpYnV0ZXNbbmFtZV07XG5cdFx0XHRcdHZhciB3cmFwcGVyID0gY3Vyc29yLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKTtcblx0XHRcdFx0dmFyIGljb25OYW1lID0gbnVsbDtcblx0XHRcdFx0aWYoKG5hbWUgPT0gXCJ0eXBlXCIpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29ucyAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbdmFsdWVdKXtcblx0XHRcdFx0XHRpY29uTmFtZSA9IGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29uc1t2YWx1ZV07XG5cdFx0XHRcdFx0fWVsc2UgaWYgKG5hbWU9PVwiaWNvblwiKXtcblx0XHRcdFx0XHRcdGljb25OYW1lID0gdmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdGlmKGljb25OYW1lKXtcblx0XHRcdFx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tXCIrIGljb25OYW1lICtcIlxcXCI+PFwiK1wiL2k+XCI7XG5cdFx0XHRcdFx0d3JhcHBlci5jaGlsZHJlbihcIi5ub2RlLWljb246Zmlyc3RcIikucmVwbGFjZVdpdGgoaWNvbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XG5cdFx0cmV0dXJuIGF0dHJpYnV0ZXM7XG5cdFx0fTtcblx0dGhpcy5nZXRBbGwgPSBmdW5jdGlvbigpIHtcblx0XHRpZihjdXJzb3IuZGF0YShcImF0dHJpYnV0ZXNcIikgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRyZXR1cm4gY3Vyc29yLmRhdGEoXCJhdHRyaWJ1dGVzXCIpO1xuXHRcdFx0fVxuXHRcdHJldHVybiB7fTtcblx0XHR9O1xuXHR0aGlzLmdldE9uZSA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBbGwoKVtuYW1lXTtcblx0XHR9O1xuXHR0aGlzLm1ha2VFbXB0eSA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2Nzc1RleHRDbGFzcyhcIlwiKTtcblx0XHR2YXIgbnVtQXR0cmlidXRlcyA9IDA7XG5cdFx0dmFyIGF0dHMgPSB0aGlzLmdldEFsbCgpO1xuXHRcdGlmKGF0dHMgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRmb3IodmFyIGkgaW4gYXR0cyl7XG5cdFx0XHRcdG51bUF0dHJpYnV0ZXMrKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGN1cnNvci5yZW1vdmVEYXRhKFwiYXR0cmlidXRlc1wiKTtcblx0XHR2YXIgcmVtb3ZlZEFueUF0dHJpYnV0ZXMgPSAobnVtQXR0cmlidXRlcyA+IDApO1xuXHRcdHZhciBhdHRyaWJ1dGVzID0ge307XG5cdFx0JChjdXJzb3JbMF0uYXR0cmlidXRlcykuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHZhciBtYXRjaGVzID0gdGhpcy5uYW1lLm1hdGNoKC9eb3BtbC0oLispJC8pXG5cdFx0XHRpZihtYXRjaGVzKSB7XG5cdFx0XHRcdGN1cnNvci5yZW1vdmVBdHRyKHRoaXMubmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdGlmKHJlbW92ZWRBbnlBdHRyaWJ1dGVzKXtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0fVxuXHRcdHJldHVybiByZW1vdmVkQW55QXR0cmlidXRlcztcblx0XHR9O1xuXHR0aGlzLnNldE9uZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG5cdFx0aWYobmFtZT09dGhpcy5fY3NzVGV4dENsYXNzTmFtZSl7XG5cdFx0XHR0aGlzLl9jc3NUZXh0Q2xhc3ModmFsdWUpO1xuXHRcdFx0fVxuXHRcdHZhciBhdHRzID0gdGhpcy5nZXRBbGwoKTtcblx0XHRhdHRzW25hbWVdPXZhbHVlO1xuXHRcdGN1cnNvci5kYXRhKFwiYXR0cmlidXRlc1wiLCBhdHRzKTtcblx0XHRpZigobmFtZT09XCJ0eXBlXCIgKXx8IChuYW1lPT1cImljb25cIikpe1xuXHRcdFx0Y3Vyc29yLmF0dHIoXCJvcG1sLVwiICsgbmFtZSwgdmFsdWUpO1xuXHRcdFx0dmFyIHdyYXBwZXIgPSBjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpO1xuXHRcdFx0dmFyIGljb25OYW1lID0gbnVsbDtcblx0XHRcdGlmKChuYW1lID09IFwidHlwZVwiKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnMgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW3ZhbHVlXSl7XG5cdFx0XHRcdGljb25OYW1lID0gY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW3ZhbHVlXTtcblx0XHRcdFx0fWVsc2UgaWYgKG5hbWU9PVwiaWNvblwiKXtcblx0XHRcdFx0XHRpY29uTmFtZSA9IHZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdGlmKGljb25OYW1lKXtcblx0XHRcdFx0dmFyIGljb24gPSBcIjxpXCIrXCIgY2xhc3M9XFxcIm5vZGUtaWNvbiBpY29uLVwiKyBpY29uTmFtZSArXCJcXFwiPjxcIitcIi9pPlwiO1xuXHRcdFx0XHR3cmFwcGVyLmNoaWxkcmVuKFwiLm5vZGUtaWNvbjpmaXJzdFwiKS5yZXBsYWNlV2l0aChpY29uKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMuZXhpc3RzID0gZnVuY3Rpb24obmFtZSl7XG5cdFx0aWYodGhpcy5nZXRPbmUobmFtZSkgIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLnJlbW92ZU9uZSA9IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdGlmKHRoaXMuZ2V0QWxsKClbbmFtZV0pe1xuXHRcdFx0aWYobmFtZSA9PSB0aGlzLl9jc3NUZXh0Q2xhc3NOYW1lKXtcblx0XHRcdFx0dGhpcy5fY3NzVGV4dENsYXNzKFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRkZWxldGUgdGhpcy5nZXRBbGwoKVtuYW1lXTtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cdH1cblxubW9kdWxlLmV4cG9ydHMgPSBDb25jb3JkT3BBdHRyaWJ1dGVzO1xuIiwidmFyIENvbmNvcmRPcEF0dHJpYnV0ZXMgPSByZXF1aXJlKFwiLi9jb25jb3JkLW9wLWF0dHJpYnV0ZXNcIik7XG5cbnZhciBuaWwgPSBudWxsO1xudmFyIGluZmluaXR5ID0gTnVtYmVyLk1BWF9WQUxVRTtcbnZhciBkb3duID0gXCJkb3duXCI7XG52YXIgbGVmdCA9IFwibGVmdFwiO1xudmFyIHJpZ2h0ID0gXCJyaWdodFwiO1xudmFyIHVwID0gXCJ1cFwiO1xudmFyIGZsYXR1cCA9IFwiZmxhdHVwXCI7XG52YXIgZmxhdGRvd24gPSBcImZsYXRkb3duXCI7XG52YXIgbm9kaXJlY3Rpb24gPSBcIm5vZGlyZWN0aW9uXCI7XG5cbmZ1bmN0aW9uIENvbmNvcmRPcChyb290LCBjb25jb3JkSW5zdGFuY2UsIF9jdXJzb3IpIHtcblx0dGhpcy5fd2Fsa191cCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHR2YXIgcHJldiA9IGNvbnRleHQucHJldigpO1xuXHRcdGlmKHByZXYubGVuZ3RoID09IDApIHtcblx0XHRcdHZhciBwYXJlbnQgPSBjb250ZXh0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0aWYocGFyZW50Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdHJldHVybiBwYXJlbnQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2xhc3RfY2hpbGQocHJldik7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLl93YWxrX2Rvd24gPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cdFx0dmFyIG5leHQgPSBjb250ZXh0Lm5leHQoKTtcblx0XHRpZihuZXh0Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRyZXR1cm4gbmV4dDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBwYXJlbnQgPSBjb250ZXh0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRpZihwYXJlbnQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fd2Fsa19kb3duKHBhcmVudCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5fbGFzdF9jaGlsZCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcblx0XHRpZihjb250ZXh0Lmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpKSB7XG5cdFx0XHRyZXR1cm4gY29udGV4dDtcblx0XHRcdH1cblx0XHR2YXIgb3V0bGluZSA9IGNvbnRleHQuY2hpbGRyZW4oXCJvbFwiKTtcblx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAwKSB7XG5cdFx0XHRyZXR1cm4gY29udGV4dDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBsYXN0Q2hpbGQgPSBvdXRsaW5lLmNoaWxkcmVuKFwiLmNvbmNvcmQtbm9kZTpsYXN0XCIpO1xuXHRcdFx0XHRpZihsYXN0Q2hpbGQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fbGFzdF9jaGlsZChsYXN0Q2hpbGQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBjb250ZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmJvbGQgPSBmdW5jdGlvbigpe1xuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJib2xkXCIpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHRoaXMuZm9jdXNDdXJzb3IoKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIik7XG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiYm9sZFwiKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJ1bnNlbGVjdFwiKTtcblx0XHRcdFx0dGhpcy5ibHVyQ3Vyc29yKCk7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0fTtcblx0dGhpcy5jaGFuZ2VkID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHJvb3QuZGF0YShcImNoYW5nZWRcIikgPT0gdHJ1ZTtcblx0XHR9O1xuXHR0aGlzLmNsZWFyQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJvb3QuZGF0YShcImNoYW5nZWRcIiwgZmFsc2UpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMuY29sbGFwc2UgPSBmdW5jdGlvbih0cmlnZ2VyQ2FsbGJhY2tzKSB7XG5cdFx0aWYodHJpZ2dlckNhbGxiYWNrcyA9PSB1bmRlZmluZWQpe1xuXHRcdFx0dHJpZ2dlckNhbGxiYWNrcyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdGlmKG5vZGUubGVuZ3RoID09IDEpIHtcblx0XHRcdGlmKHRyaWdnZXJDYWxsYmFja3Mpe1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BDb2xsYXBzZVwiLCB0aGlzLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRub2RlLmFkZENsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0bm9kZS5maW5kKFwib2xcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYoJCh0aGlzKS5jaGlsZHJlbigpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHQkKHRoaXMpLnBhcmVudCgpLmFkZENsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5jb3B5ID0gZnVuY3Rpb24oKXtcblx0XHRpZighdGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0cm9vdC5kYXRhKFwiY2xpcGJvYXJkXCIsIHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5jbG9uZSh0cnVlLCB0cnVlKSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5jb3VudFN1YnMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0cmV0dXJuIG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLnNpemUoKTtcblx0XHRcdH1cblx0XHRyZXR1cm4gMDtcblx0XHR9O1xuXHR0aGlzLmN1cnNvclRvWG1sID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gY29uY29yZEluc3RhbmNlLmVkaXRvci5vcG1sKHRoaXMuZ2V0Q3Vyc29yKCkpO1xuXHRcdH07XG5cdHRoaXMuY3Vyc29yVG9YbWxTdWJzT25seSA9IGZ1bmN0aW9uKCl7IC8vOC81LzEzIGJ5IERXXG5cdFx0cmV0dXJuIGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iub3BtbCh0aGlzLmdldEN1cnNvcigpLCB0cnVlKTtcblx0XHR9O1xuXHR0aGlzLmN1dCA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoIXRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdHRoaXMuY29weSgpO1xuXHRcdFx0dGhpcy5kZWxldGVMaW5lKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5kZWxldGVMaW5lID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRcdHZhciBwID0gY3Vyc29yLnByZXYoKTtcblx0XHRcdGlmKHAubGVuZ3RoPT0wKXtcblx0XHRcdFx0cCA9IGN1cnNvci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0Y3Vyc29yLnJlbW92ZSgpO1xuXHRcdFx0aWYocC5sZW5ndGg9PTEpIHtcblx0XHRcdFx0dGhpcy5zZXRDdXJzb3IocCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKS5sZW5ndGg9PTEpIHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy53aXBlKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0dmFyIHNlbGVjdGVkID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpO1xuXHRcdFx0XHRpZihzZWxlY3RlZC5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdHZhciBwID0gc2VsZWN0ZWQucHJldigpO1xuXHRcdFx0XHRcdGlmKHAubGVuZ3RoPT0wKXtcblx0XHRcdFx0XHRcdHAgPSBzZWxlY3RlZC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzZWxlY3RlZC5yZW1vdmUoKTtcblx0XHRcdFx0XHRpZihwLmxlbmd0aD09MSkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3IocCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpLmxlbmd0aD09MSkge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLndpcGUoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZihzZWxlY3RlZC5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHR2YXIgZmlyc3QgPSByb290LmZpbmQoXCIuc2VsZWN0ZWQ6Zmlyc3RcIik7XG5cdFx0XHRcdFx0XHR2YXIgcCA9IGZpcnN0LnByZXYoKTtcblx0XHRcdFx0XHRcdGlmKHAubGVuZ3RoPT0wKXtcblx0XHRcdFx0XHRcdFx0cCA9IGZpcnN0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzZWxlY3RlZC5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmKHAubGVuZ3RoPT0xKXtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3IocCk7XG5cdFx0XHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0XHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikubGVuZ3RoPT0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEN1cnNvcihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMud2lwZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGggPT0gMCkge1xuXHRcdFx0dmFyIG5vZGUgPSB0aGlzLmluc2VydChcIlwiLCBkb3duKTtcblx0XHRcdHRoaXMuc2V0Q3Vyc29yKG5vZGUpO1xuXHRcdFx0fVxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHR9O1xuXHR0aGlzLmRlbGV0ZVN1YnMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0aWYobm9kZS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkubGVuZ3RoID4gMCl7XG5cdFx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0XHRcdG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5lbXB0eSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdH07XG5cdHRoaXMuZGVtb3RlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdHZhciBtb3ZlZFNpYmxpbmdzID0gZmFsc2U7XG5cdFx0aWYobm9kZS5uZXh0QWxsKCkubGVuZ3RoPjApe1xuXHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdG5vZGUubmV4dEFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzaWJsaW5nID0gJCh0aGlzKS5jbG9uZSh0cnVlLCB0cnVlKTtcblx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHRcdFx0c2libGluZy5hcHBlbmRUbyhub2RlLmNoaWxkcmVuKFwib2xcIikpO1xuXHRcdFx0XHRub2RlLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVjYWxjdWxhdGVMZXZlbHMobm9kZS5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKSk7XG5cdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5leHBhbmQgPSBmdW5jdGlvbih0cmlnZ2VyQ2FsbGJhY2tzKSB7XG5cdFx0aWYodHJpZ2dlckNhbGxiYWNrcyA9PSB1bmRlZmluZWQpe1xuXHRcdFx0dHJpZ2dlckNhbGxiYWNrcyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdGlmKG5vZGUubGVuZ3RoID09IDEpIHtcblx0XHRcdGlmKHRyaWdnZXJDYWxsYmFja3Mpe1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BFeHBhbmRcIiwgdGhpcy5zZXRDdXJzb3JDb250ZXh0KG5vZGUpKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYoIW5vZGUuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpe1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdG5vZGUucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHR2YXIgY3Vyc29yUG9zaXRpb24gPSBub2RlLm9mZnNldCgpLnRvcDtcblx0XHRcdHZhciBjdXJzb3JIZWlnaHQgPW5vZGUuaGVpZ2h0KCk7XG5cdFx0XHR2YXIgd2luZG93UG9zaXRpb24gPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cdFx0XHR2YXIgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuXHRcdFx0aWYoICggY3Vyc29yUG9zaXRpb24gPCB3aW5kb3dQb3NpdGlvbiApIHx8ICggKGN1cnNvclBvc2l0aW9uK2N1cnNvckhlaWdodCkgPiAod2luZG93UG9zaXRpb24rd2luZG93SGVpZ2h0KSApICl7XG5cdFx0XHRcdGlmKGN1cnNvclBvc2l0aW9uIDwgd2luZG93UG9zaXRpb24pe1xuXHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGxUb3AoY3Vyc29yUG9zaXRpb24pO1xuXHRcdFx0XHRcdH1lbHNlIGlmICgoY3Vyc29yUG9zaXRpb24rY3Vyc29ySGVpZ2h0KSA+ICh3aW5kb3dQb3NpdGlvbit3aW5kb3dIZWlnaHQpKXtcblx0XHRcdFx0XHRcdHZhciBsaW5lSGVpZ2h0ID0gcGFyc2VJbnQobm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmNzcyhcImxpbmUtaGVpZ2h0XCIpKSArIDY7XG5cdFx0XHRcdFx0XHRpZigoY3Vyc29ySGVpZ2h0K2xpbmVIZWlnaHQpIDwgd2luZG93SGVpZ2h0KXtcblx0XHRcdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbFRvcChjdXJzb3JQb3NpdGlvbiAtICh3aW5kb3dIZWlnaHQtY3Vyc29ySGVpZ2h0KStsaW5lSGVpZ2h0KTtcblx0XHRcdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbFRvcChjdXJzb3JQb3NpdGlvbik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5leHBhbmRBbGxMZXZlbHMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdG5vZGUuZmluZChcIi5jb25jb3JkLW5vZGVcIikucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5mb2N1c0N1cnNvciA9IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5nZXRDdXJzb3IoKS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmZvY3VzKCk7XG5cdFx0fTtcblx0dGhpcy5ibHVyQ3Vyc29yID0gZnVuY3Rpb24oKXtcblx0XHR0aGlzLmdldEN1cnNvcigpLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIikuYmx1cigpO1xuXHRcdH07XG5cdHRoaXMuZnVsbENvbGxhcHNlID0gZnVuY3Rpb24oKSB7XG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoJCh0aGlzKS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkuc2l6ZSgpID4gMCkge1xuXHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHR2YXIgdG9wUGFyZW50ID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmxhc3RcIik7XG5cdFx0aWYodG9wUGFyZW50Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnNlbGVjdCh0b3BQYXJlbnQpO1xuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuZnVsbEV4cGFuZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGVcIikucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0fTtcblx0dGhpcy5nZXRDdXJzb3IgPSBmdW5jdGlvbigpe1xuXHRcdGlmKF9jdXJzb3Ipe1xuXHRcdFx0cmV0dXJuIF9jdXJzb3I7XG5cdFx0XHR9XG5cdFx0cmV0dXJuIHJvb3QuZmluZChcIi5jb25jb3JkLWN1cnNvcjpmaXJzdFwiKTtcblx0XHR9O1xuXHR0aGlzLmdldEN1cnNvclJlZiA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Q3Vyc29yQ29udGV4dCh0aGlzLmdldEN1cnNvcigpKTtcblx0XHR9O1xuXHR0aGlzLmdldEhlYWRlcnMgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBoZWFkZXJzID0ge307XG5cdFx0aWYocm9vdC5kYXRhKFwiaGVhZFwiKSl7XG5cdFx0XHRoZWFkZXJzID0gcm9vdC5kYXRhKFwiaGVhZFwiKTtcblx0XHRcdH1cblx0XHRoZWFkZXJzW1widGl0bGVcIl0gPSB0aGlzLmdldFRpdGxlKCk7XG5cdFx0cmV0dXJuIGhlYWRlcnM7XG5cdFx0fSxcblx0dGhpcy5nZXRMaW5lVGV4dCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHR2YXIgdGV4dCA9IG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS5odG1sKCk7XG5cdFx0XHR2YXIgdGV4dE1hdGNoZXMgPSB0ZXh0Lm1hdGNoKC9eKC4rKTxicj5cXHMqJC8pO1xuXHRcdFx0aWYodGV4dE1hdGNoZXMpe1xuXHRcdFx0XHR0ZXh0ID0gdGV4dE1hdGNoZXNbMV07XG5cdFx0XHRcdH1cblx0XHRcdHJldHVybiBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnVuZXNjYXBlKHRleHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmdldFJlbmRlck1vZGUgPSBmdW5jdGlvbigpe1xuXHRcdGlmKHJvb3QuZGF0YShcInJlbmRlck1vZGVcIikhPT11bmRlZmluZWQpe1xuXHRcdFx0cmV0dXJuIChyb290LmRhdGEoXCJyZW5kZXJNb2RlXCIpPT09dHJ1ZSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmdldFRpdGxlID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHJvb3QuZGF0YShcInRpdGxlXCIpO1xuXHRcdH07XG5cdHRoaXMuZ28gPSBmdW5jdGlvbihkaXJlY3Rpb24sIGNvdW50LCBtdWx0aXBsZSwgdGV4dE1vZGUpIHtcblx0XHRpZihjb3VudD09PXVuZGVmaW5lZCkge1xuXHRcdFx0Y291bnQgPSAxO1xuXHRcdFx0fVxuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdGlmKHRleHRNb2RlPT11bmRlZmluZWQpe1xuXHRcdFx0dGV4dE1vZGUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR0aGlzLnNldFRleHRNb2RlKHRleHRNb2RlKTtcblx0XHR2YXIgYWJsZVRvTW92ZUluRGlyZWN0aW9uID0gZmFsc2U7XG5cdFx0c3dpdGNoKGRpcmVjdGlvbikge1xuXHRcdFx0Y2FzZSB1cDpcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcblx0XHRcdFx0XHR2YXIgcHJldiA9IGN1cnNvci5wcmV2KCk7XG5cdFx0XHRcdFx0aWYocHJldi5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdFx0Y3Vyc29yID0gcHJldjtcblx0XHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XG5cdFx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKGN1cnNvciwgbXVsdGlwbGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgZG93bjpcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcblx0XHRcdFx0XHR2YXIgbmV4dCA9IGN1cnNvci5uZXh0KCk7XG5cdFx0XHRcdFx0aWYobmV4dC5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdFx0Y3Vyc29yID0gbmV4dDtcblx0XHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XG5cdFx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKGN1cnNvciwgbXVsdGlwbGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgbGVmdDpcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRcdGlmKHBhcmVudC5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdFx0Y3Vyc29yID0gcGFyZW50O1xuXHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoY3Vyc29yLCBtdWx0aXBsZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSByaWdodDpcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcblx0XHRcdFx0XHR2YXIgZmlyc3RTaWJsaW5nID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRcdGlmKGZpcnN0U2libGluZy5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdFx0Y3Vyc29yID0gZmlyc3RTaWJsaW5nO1xuXHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoY3Vyc29yLCBtdWx0aXBsZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBmbGF0dXA6XG5cdFx0XHRcdHZhciBub2RlQ291bnQgPSAwO1xuXHRcdFx0XHR3aGlsZShjdXJzb3IgJiYgKG5vZGVDb3VudCA8IGNvdW50KSkge1xuXHRcdFx0XHRcdHZhciBjdXJzb3IgPSB0aGlzLl93YWxrX3VwKGN1cnNvcik7XG5cdFx0XHRcdFx0aWYoY3Vyc29yKSB7XG5cdFx0XHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpICYmIChjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLnNpemUoKSA+IDApKSB7XG5cdFx0XHRcdFx0XHRcdG5vZGVDb3VudCsrO1xuXHRcdFx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpZihub2RlQ291bnQgPT0gY291bnQpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IsIG11bHRpcGxlKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgZmxhdGRvd246XG5cdFx0XHRcdHZhciBub2RlQ291bnQgPSAwO1xuXHRcdFx0XHR3aGlsZShjdXJzb3IgJiYgKG5vZGVDb3VudCA8IGNvdW50KSkge1xuXHRcdFx0XHRcdHZhciBuZXh0ID0gbnVsbDtcblx0XHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpKSB7XG5cdFx0XHRcdFx0XHR2YXIgb3V0bGluZSA9IGN1cnNvci5jaGlsZHJlbihcIm9sXCIpO1xuXHRcdFx0XHRcdFx0aWYob3V0bGluZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0XHRcdFx0XHR2YXIgZmlyc3RDaGlsZCA9IG91dGxpbmUuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRcdFx0XHRpZihmaXJzdENoaWxkLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGZpcnN0Q2hpbGQ7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoIW5leHQpIHtcblx0XHRcdFx0XHRcdG5leHQgPSB0aGlzLl93YWxrX2Rvd24oY3Vyc29yKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjdXJzb3IgPSBuZXh0O1xuXHRcdFx0XHRcdGlmKGN1cnNvcikge1xuXHRcdFx0XHRcdFx0aWYoIWN1cnNvci5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSAmJiAoY3Vyc29yLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5zaXplKCkgPiAwKSkge1xuXHRcdFx0XHRcdFx0XHRub2RlQ291bnQrKztcblx0XHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0aWYobm9kZUNvdW50ID09IGNvdW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoY3Vyc29yLCBtdWx0aXBsZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0cmV0dXJuIGFibGVUb01vdmVJbkRpcmVjdGlvbjtcblx0XHR9O1xuXHR0aGlzLmluc2VydCA9IGZ1bmN0aW9uKGluc2VydFRleHQsIGluc2VydERpcmVjdGlvbikge1xuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0dmFyIGxldmVsID0gdGhpcy5nZXRDdXJzb3IoKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGgrMTtcblx0XHR2YXIgbm9kZSA9ICQoXCI8bGk+PC9saT5cIik7XG5cdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtbm9kZVwiKTtcblx0XHRzd2l0Y2goaW5zZXJ0RGlyZWN0aW9uKXtcblx0XHRcdGNhc2UgcmlnaHQ6XG5cdFx0XHRcdGxldmVsKz0xO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgbGVmdDpcblx0XHRcdFx0bGV2ZWwtPTE7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLWxldmVsLVwiK2xldmVsKTtcblx0XHR2YXIgd3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXdyYXBwZXInPjwvZGl2PlwiKTtcblx0XHR2YXIgaWNvbk5hbWU9XCJjYXJldC1yaWdodFwiO1xuXHRcdHZhciBpY29uID0gXCI8aVwiK1wiIGNsYXNzPVxcXCJub2RlLWljb24gaWNvbi1cIisgaWNvbk5hbWUgK1wiXFxcIj48XCIrXCIvaT5cIjtcblx0XHR3cmFwcGVyLmFwcGVuZChpY29uKTtcblx0XHR3cmFwcGVyLmFkZENsYXNzKFwidHlwZS1pY29uXCIpO1xuXHRcdHZhciB0ZXh0ID0gJChcIjxkaXYgY2xhc3M9J2NvbmNvcmQtdGV4dCcgY29udGVudGVkaXRhYmxlPSd0cnVlJz48L2Rpdj5cIik7XG5cdFx0dGV4dC5hZGRDbGFzcyhcImNvbmNvcmQtbGV2ZWwtXCIrbGV2ZWwrXCItdGV4dFwiKTtcblx0XHR2YXIgb3V0bGluZSA9ICQoXCI8b2w+PC9vbD5cIik7XG5cdFx0dGV4dC5hcHBlbmRUbyh3cmFwcGVyKTtcblx0XHR3cmFwcGVyLmFwcGVuZFRvKG5vZGUpO1xuXHRcdG91dGxpbmUuYXBwZW5kVG8obm9kZSk7XG5cdFx0aWYoaW5zZXJ0VGV4dCAmJiAoaW5zZXJ0VGV4dCE9XCJcIikpe1xuXHRcdFx0dGV4dC5odG1sKGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZXNjYXBlKGluc2VydFRleHQpKTtcblx0XHRcdH1cblx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZighaW5zZXJ0RGlyZWN0aW9uKSB7XG5cdFx0XHRpbnNlcnREaXJlY3Rpb24gPSBkb3duO1xuXHRcdFx0fVxuXHRcdHN3aXRjaChpbnNlcnREaXJlY3Rpb24pIHtcblx0XHRcdGNhc2UgZG93bjpcblx0XHRcdFx0Y3Vyc29yLmFmdGVyKG5vZGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgcmlnaHQ6XG5cdFx0XHRcdGN1cnNvci5jaGlsZHJlbihcIm9sXCIpLnByZXBlbmQobm9kZSk7XG5cdFx0XHRcdHRoaXMuZXhwYW5kKGZhbHNlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHVwOlxuXHRcdFx0XHRjdXJzb3IuYmVmb3JlKG5vZGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgbGVmdDpcblx0XHRcdFx0dmFyIHBhcmVudCA9IGN1cnNvci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0aWYocGFyZW50Lmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0cGFyZW50LmFmdGVyKG5vZGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0dGhpcy5zZXRDdXJzb3Iobm9kZSk7XG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEluc2VydFwiLCB0aGlzLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xuXHRcdHJldHVybiBub2RlO1xuXHRcdH07XG5cdHRoaXMuaW5zZXJ0SW1hZ2UgPSBmdW5jdGlvbih1cmwpe1xuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaW5zZXJ0SW1hZ2VcIiwgbnVsbCwgdXJsKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHR0aGlzLmluc2VydCgnPGltZyBzcmM9XCInK3VybCsnXCI+JywgZG93bik7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmluc2VydFRleHQgPSBmdW5jdGlvbih0ZXh0KXtcblx0XHR2YXIgbm9kZXMgPSAkKFwiPG9sPjwvb2w+XCIpO1xuXHRcdHZhciBsYXN0TGV2ZWwgPSAwO1xuXHRcdHZhciBzdGFydGluZ2xpbmUgPSAwO1xuXHRcdHZhciBzdGFydGluZ2xldmVsID0gMDtcblx0XHR2YXIgbGFzdE5vZGUgPSBudWxsO1xuXHRcdHZhciBwYXJlbnQgPSBudWxsO1xuXHRcdHZhciBwYXJlbnRzID0ge307XG5cdFx0dmFyIGxpbmVzID0gdGV4dC5zcGxpdChcIlxcblwiKTtcblx0XHR2YXIgd29ya2Zsb3d5PXRydWU7XG5cdFx0dmFyIHdvcmtmbG93eVBhcmVudCA9IG51bGw7XG5cdFx0dmFyIGZpcnN0bGluZXdpdGhjb250ZW50ID0gMDtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGxpbmUgPSBsaW5lc1tpXTtcblx0XHRcdGlmKCFsaW5lLm1hdGNoKC9eXFxzKiQvKSl7XG5cdFx0XHRcdGZpcnN0bGluZXdpdGhjb250ZW50ID0gaTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRpZihsaW5lcy5sZW5ndGg+KGZpcnN0bGluZXdpdGhjb250ZW50KzIpKXtcblx0XHRcdGlmKChsaW5lc1tmaXJzdGxpbmV3aXRoY29udGVudF0ubWF0Y2goL14oW1xcdFxcc10qKVxcLS4qJC8pPT1udWxsKSAmJiBsaW5lc1tmaXJzdGxpbmV3aXRoY29udGVudF0ubWF0Y2goL14uKyQvKSAmJiAobGluZXNbZmlyc3RsaW5ld2l0aGNvbnRlbnQrMV09PVwiXCIpKXtcblx0XHRcdFx0c3RhcnRpbmdsaW5lID0gZmlyc3RsaW5ld2l0aGNvbnRlbnQrMjtcblx0XHRcdFx0dmFyIHdvcmtmbG93eVBhcmVudCA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IubWFrZU5vZGUoKTtcblx0XHRcdFx0d29ya2Zsb3d5UGFyZW50LmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIikuaHRtbChsaW5lc1tmaXJzdGxpbmV3aXRoY29udGVudF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0Zm9yKHZhciBpID0gc3RhcnRpbmdsaW5lOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIGxpbmUgPSBsaW5lc1tpXTtcblx0XHRcdGlmKChsaW5lIT1cIlwiKSAmJiAhbGluZS5tYXRjaCgvXlxccyskLykgJiYgKGxpbmUubWF0Y2goL14oW1xcdFxcc10qKVxcLS4qJC8pPT1udWxsKSl7XG5cdFx0XHRcdHdvcmtmbG93eT1mYWxzZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRpZighd29ya2Zsb3d5KXtcblx0XHRcdHN0YXJ0aW5nbGluZSA9IDA7XG5cdFx0XHR3b3JrZmxvd3lQYXJlbnQ9bnVsbDtcblx0XHRcdH1cblx0XHRmb3IodmFyIGkgPSBzdGFydGluZ2xpbmU7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyl7XG5cdFx0XHR2YXIgbGluZSA9IGxpbmVzW2ldO1xuXHRcdFx0aWYoKGxpbmUhPVwiXCIpICYmICFsaW5lLm1hdGNoKC9eXFxzKyQvKSl7XG5cdFx0XHRcdHZhciBtYXRjaGVzID0gbGluZS5tYXRjaCgvXihbXFx0XFxzXSopKC4rKSQvKTtcblx0XHRcdFx0dmFyIG5vZGUgPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLm1ha2VOb2RlKCk7XG5cdFx0XHRcdHZhciBub2RlVGV4dCA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZXNjYXBlKG1hdGNoZXNbMl0pO1xuXHRcdFx0XHRpZih3b3JrZmxvd3kpe1xuXHRcdFx0XHRcdHZhciBub2RlVGV4dE1hdGNoZXMgPSBub2RlVGV4dC5tYXRjaCgvXihbXFx0XFxzXSopXFwtXFxzKiguKykkLylcblx0XHRcdFx0XHRpZihub2RlVGV4dE1hdGNoZXMhPW51bGwpe1xuXHRcdFx0XHRcdFx0bm9kZVRleHQgPSBub2RlVGV4dE1hdGNoZXNbMl07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIikuaHRtbChub2RlVGV4dCk7XG5cdFx0XHRcdHZhciBsZXZlbCA9IHN0YXJ0aW5nbGV2ZWw7XG5cdFx0XHRcdGlmKG1hdGNoZXNbMV0pe1xuXHRcdFx0XHRcdGlmKHdvcmtmbG93eSl7XG5cdFx0XHRcdFx0XHRsZXZlbCA9IChtYXRjaGVzWzFdLmxlbmd0aCAvIDIpICsgc3RhcnRpbmdsZXZlbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdGxldmVsID0gbWF0Y2hlc1sxXS5sZW5ndGggKyBzdGFydGluZ2xldmVsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKGxldmVsPmxhc3RMZXZlbCl7XG5cdFx0XHRcdFx0XHRwYXJlbnRzW2xhc3RMZXZlbF09bGFzdE5vZGU7XG5cdFx0XHRcdFx0XHRwYXJlbnQgPSBsYXN0Tm9kZTtcblx0XHRcdFx0XHRcdH1lbHNlIGlmICgobGV2ZWw+MCkgJiYgKGxldmVsIDwgbGFzdExldmVsKSl7XG5cdFx0XHRcdFx0XHRcdHBhcmVudCA9IHBhcmVudHNbbGV2ZWwtMV07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdGlmKHBhcmVudCAmJiAobGV2ZWwgPiAwKSl7XG5cdFx0XHRcdFx0cGFyZW50LmNoaWxkcmVuKFwib2xcIikuYXBwZW5kKG5vZGUpO1xuXHRcdFx0XHRcdHBhcmVudC5hZGRDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdHBhcmVudHMgPSB7fTtcblx0XHRcdFx0XHRcdG5vZGVzLmFwcGVuZChub2RlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0bGFzdE5vZGUgPSBub2RlO1xuXHRcdFx0XHRsYXN0TGV2ZWwgPSBsZXZlbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGlmKHdvcmtmbG93eVBhcmVudCl7XG5cdFx0XHRpZihub2Rlcy5jaGlsZHJlbigpLmxlbmd0aCA+IDApe1xuXHRcdFx0XHR3b3JrZmxvd3lQYXJlbnQuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdHZhciBjbG9uZWROb2RlcyA9IG5vZGVzLmNsb25lKCk7XG5cdFx0XHRjbG9uZWROb2Rlcy5jaGlsZHJlbigpLmFwcGVuZFRvKHdvcmtmbG93eVBhcmVudC5jaGlsZHJlbihcIm9sXCIpKTtcblx0XHRcdG5vZGVzID0gJChcIjxvbD48L29sPlwiKTtcblx0XHRcdG5vZGVzLmFwcGVuZCh3b3JrZmxvd3lQYXJlbnQpO1xuXHRcdFx0fVxuXHRcdGlmKG5vZGVzLmNoaWxkcmVuKCkubGVuZ3RoPjApe1xuXHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdHRoaXMuc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdFx0dmFyIGN1cnNvciA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0XHRub2Rlcy5jaGlsZHJlbigpLmluc2VydEFmdGVyKGN1cnNvcik7XG5cdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IubmV4dCgpKTtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5yb290LnJlbW92ZURhdGEoXCJjbGlwYm9hcmRcIik7XG5cdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlY2FsY3VsYXRlTGV2ZWxzKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0dGhpcy5pbnNlcnRYbWwgPSBmdW5jdGlvbihvcG1sdGV4dCxkaXIpe1xuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0dmFyIGRvYyA9IG51bGw7XG5cdFx0dmFyIG5vZGVzID0gJChcIjxvbD48L29sPlwiKTtcblx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHR2YXIgbGV2ZWwgPSBjdXJzb3IucGFyZW50cyhcIi5jb25jb3JkLW5vZGVcIikubGVuZ3RoKzE7XG5cdFx0aWYoIWRpcil7XG5cdFx0XHRkaXIgPSBkb3duO1xuXHRcdFx0fVxuXHRcdHN3aXRjaChkaXIpe1xuXHRcdFx0Y2FzZSByaWdodDpcblx0XHRcdFx0bGV2ZWwrPTE7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBsZWZ0OlxuXHRcdFx0XHRsZXZlbC09MTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0aWYodHlwZW9mIG9wbWx0ZXh0ID09IFwic3RyaW5nXCIpIHtcblx0XHRcdGRvYyA9ICQoJC5wYXJzZVhNTChvcG1sdGV4dCkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZG9jID0gJChvcG1sdGV4dCk7XG5cdFx0XHRcdH1cblx0XHRkb2MuZmluZChcImJvZHlcIikuY2hpbGRyZW4oXCJvdXRsaW5lXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRub2Rlcy5hcHBlbmQoY29uY29yZEluc3RhbmNlLmVkaXRvci5idWlsZCgkKHRoaXMpLCB0cnVlLCBsZXZlbCkpO1xuXHRcdFx0fSk7XG5cdFx0dmFyIGV4cGFuc2lvblN0YXRlID0gZG9jLmZpbmQoXCJleHBhbnNpb25TdGF0ZVwiKTtcblx0XHRpZihleHBhbnNpb25TdGF0ZSAmJiBleHBhbnNpb25TdGF0ZS50ZXh0KCkgJiYgKGV4cGFuc2lvblN0YXRlLnRleHQoKSE9XCJcIikpe1xuXHRcdFx0dmFyIGV4cGFuc2lvblN0YXRlcyA9IGV4cGFuc2lvblN0YXRlLnRleHQoKS5zcGxpdChcIixcIik7XG5cdFx0XHR2YXIgbm9kZUlkPTE7XG5cdFx0XHRub2Rlcy5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGlmKGV4cGFuc2lvblN0YXRlcy5pbmRleE9mKFwiXCIrbm9kZUlkKSA+PSAwKXtcblx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0bm9kZUlkKys7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdHN3aXRjaChkaXIpIHtcblx0XHRcdGNhc2UgZG93bjpcblx0XHRcdFx0bm9kZXMuY2hpbGRyZW4oKS5pbnNlcnRBZnRlcihjdXJzb3IpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgcmlnaHQ6XG5cdFx0XHRcdG5vZGVzLmNoaWxkcmVuKCkucHJlcGVuZFRvKGN1cnNvci5jaGlsZHJlbihcIm9sXCIpKTtcblx0XHRcdFx0dGhpcy5leHBhbmQoZmFsc2UpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgdXA6XG5cdFx0XHRcdG5vZGVzLmNoaWxkcmVuKCkuaW5zZXJ0QmVmb3JlKGN1cnNvcik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBsZWZ0OlxuXHRcdFx0XHR2YXIgcGFyZW50ID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xuXHRcdFx0XHRpZihwYXJlbnQubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRub2Rlcy5jaGlsZHJlbigpLmluc2VydEFmdGVyKHBhcmVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy5pblRleHRNb2RlID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gcm9vdC5oYXNDbGFzcyhcInRleHRNb2RlXCIpO1xuXHRcdH07XG5cdHRoaXMuaXRhbGljID0gZnVuY3Rpb24oKXtcblx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaXRhbGljXCIpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHRoaXMuZm9jdXNDdXJzb3IoKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIik7XG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaXRhbGljXCIpO1xuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInVuc2VsZWN0XCIpO1xuXHRcdFx0XHR0aGlzLmJsdXJDdXJzb3IoKTtcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHR9O1xuXHR0aGlzLmxldmVsID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gdGhpcy5nZXRDdXJzb3IoKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGgrMTtcblx0XHR9LFxuXHR0aGlzLmxpbmsgPSBmdW5jdGlvbih1cmwpe1xuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XG5cdFx0XHRcdHZhciBpbnN0YW5jZSA9IHRoaXM7XG5cdFx0XHRcdGNvbmNvcmQub25SZXN1bWUoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRpbnN0YW5jZS5saW5rKHVybCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0dmFyIHJhbmdlID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdGlmKHJhbmdlPT09dW5kZWZpbmVkKXtcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5yZXN0b3JlU2VsZWN0aW9uKCk7XG5cdFx0XHRcdH1cblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZ2V0U2VsZWN0aW9uKCkpe1xuXHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcImNyZWF0ZUxpbmtcIiwgbnVsbCwgdXJsKTtcblx0XHRcdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5tYXJrQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJvb3QuZGF0YShcImNoYW5nZWRcIiwgdHJ1ZSk7XG5cdFx0aWYoIXRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGUuZGlydHlcIikucmVtb3ZlQ2xhc3MoXCJkaXJ0eVwiKTtcblx0XHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHR0aGlzLnBhc3RlID0gZnVuY3Rpb24oKXtcblx0XHRpZighdGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0aWYocm9vdC5kYXRhKFwiY2xpcGJvYXJkXCIpIT1udWxsKXtcblx0XHRcdFx0dmFyIHBhc3RlTm9kZXMgPSByb290LmRhdGEoXCJjbGlwYm9hcmRcIikuY2xvbmUodHJ1ZSx0cnVlKTtcblx0XHRcdFx0aWYocGFzdGVOb2Rlcy5sZW5ndGg+MCl7XG5cdFx0XHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdFx0XHRyb290LmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcblx0XHRcdFx0XHRwYXN0ZU5vZGVzLmluc2VydEFmdGVyKHRoaXMuZ2V0Q3Vyc29yKCkpO1xuXHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKCQocGFzdGVOb2Rlc1swXSksIChwYXN0ZU5vZGVzLmxlbmd0aD4xKSk7XG5cdFx0XHRcdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdHRoaXMucHJvbW90ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHRpZihub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5sZW5ndGggPiAwKXtcblx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0XHRub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5yZXZlcnNlKCkuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGNoaWxkID0gJCh0aGlzKS5jbG9uZSh0cnVlLCB0cnVlKTtcblx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcblx0XHRcdFx0bm9kZS5hZnRlcihjaGlsZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5yZWNhbGN1bGF0ZUxldmVscyhub2RlLnBhcmVudCgpLmZpbmQoXCIuY29uY29yZC1ub2RlXCIpKTtcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLnJlZHJhdyA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGN0ID0gMTtcblx0XHR2YXIgY3Vyc29ySW5kZXggPSAxO1xuXHRcdHZhciB3YXNDaGFuZ2VkID0gdGhpcy5jaGFuZ2VkKCk7XG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTp2aXNpYmxlXCIpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdGlmKCQodGhpcykuaGFzQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKSl7XG5cdFx0XHRcdGN1cnNvckluZGV4PWN0O1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdGN0Kys7XG5cdFx0XHR9KTtcblx0XHR0aGlzLnhtbFRvT3V0bGluZSh0aGlzLm91dGxpbmVUb1htbCgpKTtcblx0XHRjdD0xO1xuXHRcdHZhciB0aGlzT3AgPSB0aGlzO1xuXHRcdHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6dmlzaWJsZVwiKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjdXJzb3JJbmRleD09Y3Qpe1xuXHRcdFx0XHR0aGlzT3Auc2V0Q3Vyc29yKCQodGhpcykpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdGN0Kys7XG5cdFx0XHR9KTtcblx0XHRpZih3YXNDaGFuZ2VkKXtcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLnJlb3JnID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBjb3VudCkge1xuXHRcdGlmKGNvdW50PT09dW5kZWZpbmVkKSB7XG5cdFx0XHRjb3VudCA9IDE7XG5cdFx0XHR9XG5cdFx0dmFyIGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IGZhbHNlO1xuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdHZhciByYW5nZSA9IHVuZGVmaW5lZDtcblx0XHR2YXIgdG9Nb3ZlID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHR2YXIgc2VsZWN0ZWQgPSByb290LmZpbmQoXCIuc2VsZWN0ZWRcIik7XG5cdFx0dmFyIGl0ZXJhdGlvbiA9IDE7XG5cdFx0aWYoc2VsZWN0ZWQubGVuZ3RoPjEpe1xuXHRcdFx0Y3Vyc29yID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkOmZpcnN0XCIpO1xuXHRcdFx0dG9Nb3ZlID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpO1xuXHRcdFx0fVxuXHRcdHN3aXRjaChkaXJlY3Rpb24pIHtcblx0XHRcdGNhc2UgdXA6XG5cdFx0XHRcdHZhciBwcmV2ID0gY3Vyc29yLnByZXYoKTtcblx0XHRcdFx0aWYocHJldi5sZW5ndGg9PTEpIHtcblx0XHRcdFx0XHR3aGlsZShpdGVyYXRpb24gPCBjb3VudCl7XG5cdFx0XHRcdFx0XHRpZihwcmV2LnByZXYoKS5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdFx0XHRwcmV2ID0gcHJldi5wcmV2KCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpdGVyYXRpb24rKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0XHRcdHZhciBjbG9uZWRNb3ZlID0gdG9Nb3ZlLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdHRvTW92ZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRjbG9uZWRNb3ZlLmluc2VydEJlZm9yZShwcmV2KTtcblx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGRvd246XG5cdFx0XHRcdGlmKCF0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRcdFx0Y3Vyc29yID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkOmxhc3RcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgbmV4dCA9IGN1cnNvci5uZXh0KCk7XG5cdFx0XHRcdGlmKG5leHQubGVuZ3RoPT0xKSB7XG5cdFx0XHRcdFx0d2hpbGUoaXRlcmF0aW9uIDwgY291bnQpe1xuXHRcdFx0XHRcdFx0aWYobmV4dC5uZXh0KCkubGVuZ3RoPT0xKXtcblx0XHRcdFx0XHRcdFx0bmV4dCA9IG5leHQubmV4dCgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aXRlcmF0aW9uKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdFx0XHR2YXIgY2xvbmVkTW92ZSA9IHRvTW92ZS5jbG9uZSh0cnVlLCB0cnVlKTtcblx0XHRcdFx0XHR0b01vdmUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0Y2xvbmVkTW92ZS5pbnNlcnRBZnRlcihuZXh0KTtcblx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGxlZnQ6XG5cdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLnBhcmVudCgpO1xuXHRcdFx0XHRpZighb3V0bGluZS5oYXNDbGFzcyhcImNvbmNvcmQtcm9vdFwiKSkge1xuXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBvdXRsaW5lLnBhcmVudCgpO1xuXHRcdFx0XHRcdHdoaWxlKGl0ZXJhdGlvbiA8IGNvdW50KXtcblx0XHRcdFx0XHRcdHZhciBwYXJlbnRQYXJlbnQgPSBwYXJlbnQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdFx0XHRpZihwYXJlbnRQYXJlbnQubGVuZ3RoPT0xKXtcblx0XHRcdFx0XHRcdFx0cGFyZW50ID0gcGFyZW50UGFyZW50O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aXRlcmF0aW9uKys7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHRcdFx0XHR2YXIgY2xvbmVkTW92ZSA9IHRvTW92ZS5jbG9uZSh0cnVlLCB0cnVlKTtcblx0XHRcdFx0XHR0b01vdmUucmVtb3ZlKCk7XG5cdFx0XHRcdFx0Y2xvbmVkTW92ZS5pbnNlcnRBZnRlcihwYXJlbnQpO1xuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVjYWxjdWxhdGVMZXZlbHMocGFyZW50Lm5leHRBbGwoXCIuY29uY29yZC1ub2RlXCIpKTtcblx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHJpZ2h0OlxuXHRcdFx0XHR2YXIgcHJldiA9IGN1cnNvci5wcmV2KCk7XG5cdFx0XHRcdGlmKHByZXYubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xuXHRcdFx0XHRcdHdoaWxlKGl0ZXJhdGlvbiA8IGNvdW50KXtcblx0XHRcdFx0XHRcdGlmKHByZXYuY2hpbGRyZW4oXCJvbFwiKS5sZW5ndGg9PTEpe1xuXHRcdFx0XHRcdFx0XHR2YXIgcHJldk5vZGUgPSBwcmV2LmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmxhc3RcIik7XG5cdFx0XHRcdFx0XHRcdGlmKHByZXZOb2RlLmxlbmd0aD09MSl7XG5cdFx0XHRcdFx0XHRcdFx0cHJldiA9IHByZXZOb2RlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpdGVyYXRpb24rKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR2YXIgcHJldk91dGxpbmUgPSBwcmV2LmNoaWxkcmVuKFwib2xcIik7XG5cdFx0XHRcdFx0aWYocHJldk91dGxpbmUubGVuZ3RoID09IDApIHtcblx0XHRcdFx0XHRcdHByZXZPdXRsaW5lID0gJChcIjxvbD48L29sPlwiKTtcblx0XHRcdFx0XHRcdHByZXZPdXRsaW5lLmFwcGVuZFRvKHByZXYpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZhciBjbG9uZWRNb3ZlID0gdG9Nb3ZlLmNsb25lKHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdHRvTW92ZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRjbG9uZWRNb3ZlLmFwcGVuZFRvKHByZXZPdXRsaW5lKTtcblx0XHRcdFx0XHRwcmV2LnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVjYWxjdWxhdGVMZXZlbHMocHJldi5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKSk7XG5cdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdGlmKGFibGVUb01vdmVJbkRpcmVjdGlvbil7XG5cdFx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKHRoaXMuZ2V0Q3Vyc29yKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0XHR9XG5cdFx0cmV0dXJuIGFibGVUb01vdmVJbkRpcmVjdGlvbjtcblx0XHR9O1xuXHR0aGlzLnJ1blNlbGVjdGlvbiA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHZhbHVlID0gZXZhbCAodGhpcy5nZXRMaW5lVGV4dCgpKTtcblx0XHR0aGlzLmRlbGV0ZVN1YnMoKTtcblx0XHR0aGlzLmluc2VydCh2YWx1ZSwgXCJyaWdodFwiKTtcblx0XHRjb25jb3JkSW5zdGFuY2Uuc2NyaXB0Lm1ha2VDb21tZW50KCk7XG5cdFx0dGhpcy5nbyhcImxlZnRcIiwgMSk7XG5cdFx0fTtcblx0dGhpcy5zYXZlU3RhdGUgPSBmdW5jdGlvbigpe1xuXHRcdHJvb3QuZGF0YShcImNoYW5nZVwiLCByb290LmNoaWxkcmVuKCkuY2xvbmUodHJ1ZSwgdHJ1ZSkpO1xuXHRcdHJvb3QuZGF0YShcImNoYW5nZVRleHRNb2RlXCIsIHRoaXMuaW5UZXh0TW9kZSgpKTtcblx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XG5cdFx0XHR2YXIgcmFuZ2UgPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmdldFNlbGVjdGlvbigpO1xuXHRcdFx0aWYoIHJhbmdlKXtcblx0XHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlUmFuZ2VcIixyYW5nZS5jbG9uZVJhbmdlKCkpO1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VSYW5nZVwiLCB1bmRlZmluZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdH1lbHNle1xuXHRcdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VSYW5nZVwiLCB1bmRlZmluZWQpO1xuXHRcdFx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy5zZXRDdXJzb3IgPSBmdW5jdGlvbihub2RlLCBtdWx0aXBsZSwgbXVsdGlwbGVSYW5nZSl7XG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yXCIpLnJlbW92ZUNsYXNzKFwiY29uY29yZC1jdXJzb3JcIik7XG5cdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpO1xuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZWRpdChub2RlKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnNlbGVjdChub2RlLCBtdWx0aXBsZSwgbXVsdGlwbGVSYW5nZSk7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BDdXJzb3JNb3ZlZFwiLCB0aGlzLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XG5cdFx0fTtcblx0dGhpcy5zZXRDdXJzb3JDb250ZXh0ID0gZnVuY3Rpb24oY3Vyc29yKXtcblx0XHRyZXR1cm4gbmV3IENvbmNvcmRPcChyb290LGNvbmNvcmRJbnN0YW5jZSxjdXJzb3IpO1xuXHRcdH07XG5cdHRoaXMuc2V0SGVhZGVycyA9IGZ1bmN0aW9uKGhlYWRlcnMpe1xuXHRcdHJvb3QuZGF0YShcImhlYWRcIiwgaGVhZGVycyk7XG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xuXHRcdH0sXG5cdHRoaXMuc2V0TGluZVRleHQgPSBmdW5jdGlvbih0ZXh0KSB7XG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0bm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLmh0bWwoY29uY29yZEluc3RhbmNlLmVkaXRvci5lc2NhcGUodGV4dCkpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0fTtcblx0dGhpcy5zZXRSZW5kZXJNb2RlID0gZnVuY3Rpb24obW9kZSl7XG5cdFx0cm9vdC5kYXRhKFwicmVuZGVyTW9kZVwiLCBtb2RlKTtcblx0XHR0aGlzLnJlZHJhdygpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMuc2V0U3R5bGUgPSBmdW5jdGlvbihjc3Mpe1xuXHRcdHJvb3QucGFyZW50KCkuZmluZChcInN0eWxlLmN1c3RvbVN0eWxlXCIpLnJlbW92ZSgpO1xuXHRcdHJvb3QuYmVmb3JlKCc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCIgY2xhc3M9XCJjdXN0b21TdHlsZVwiPicrIGNzcyArICc8L3N0eWxlPicpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMuc2V0VGV4dE1vZGUgPSBmdW5jdGlvbih0ZXh0TW9kZSl7XG5cdFx0dmFyIHJlYWRvbmx5ID0gY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXTtcblx0XHRpZihyZWFkb25seT09dW5kZWZpbmVkKXtcblx0XHRcdHJlYWRvbmx5ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0aWYocmVhZG9ubHkpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKHJvb3QuaGFzQ2xhc3MoXCJ0ZXh0TW9kZVwiKSA9PSB0ZXh0TW9kZSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYodGV4dE1vZGU9PXRydWUpe1xuXHRcdFx0cm9vdC5hZGRDbGFzcyhcInRleHRNb2RlXCIpO1xuXHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5lZGl0b3JNb2RlKCk7XG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmVkaXQodGhpcy5nZXRDdXJzb3IoKSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0cm9vdC5yZW1vdmVDbGFzcyhcInRleHRNb2RlXCIpO1xuXHRcdFx0XHRyb290LmZpbmQoXCIuZWRpdGluZ1wiKS5yZW1vdmVDbGFzcyhcImVkaXRpbmdcIik7XG5cdFx0XHRcdHRoaXMuYmx1ckN1cnNvcigpO1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnNlbGVjdCh0aGlzLmdldEN1cnNvcigpKTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdHRoaXMuc2V0VGl0bGUgPSBmdW5jdGlvbih0aXRsZSkge1xuXHRcdHJvb3QuZGF0YShcInRpdGxlXCIsIHRpdGxlKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHR0aGlzLnN0cmlrZXRocm91Z2ggPSBmdW5jdGlvbigpe1xuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzdHJpa2VUaHJvdWdoXCIpO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdHRoaXMuZm9jdXNDdXJzb3IoKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIik7XG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwic3RyaWtlVGhyb3VnaFwiKTtcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJ1bnNlbGVjdFwiKTtcblx0XHRcdFx0dGhpcy5ibHVyQ3Vyc29yKCk7XG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XG5cdFx0fTtcblx0dGhpcy5zdWJzRXhwYW5kZWQgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xuXHRcdFx0aWYoIW5vZGUuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikgJiYgKG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLnNpemUoKSA+IDApKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cdHRoaXMub3V0bGluZVRvVGV4dCA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHRleHQgPSBcIlwiO1xuXHRcdHJvb3QuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHR0ZXh0Kz0gY29uY29yZEluc3RhbmNlLmVkaXRvci50ZXh0TGluZSgkKHRoaXMpKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiB0ZXh0O1xuXHRcdH07XG5cdHRoaXMub3V0bGluZVRvWG1sID0gZnVuY3Rpb24ob3duZXJOYW1lLCBvd25lckVtYWlsLCBvd25lcklkKSB7XG5cdFx0dmFyIGhlYWQgPSB0aGlzLmdldEhlYWRlcnMoKTtcblx0XHRpZihvd25lck5hbWUpIHtcblx0XHRcdGhlYWRbXCJvd25lck5hbWVcIl0gPSBvd25lck5hbWU7XG5cdFx0XHR9XG5cdFx0aWYob3duZXJFbWFpbCkge1xuXHRcdFx0aGVhZFtcIm93bmVyRW1haWxcIl0gPSBvd25lckVtYWlsO1xuXHRcdFx0fVxuXHRcdGlmKG93bmVySWQpIHtcblx0XHRcdGhlYWRbXCJvd25lcklkXCJdID0gb3duZXJJZDtcblx0XHRcdH1cblx0XHR2YXIgdGl0bGUgPSB0aGlzLmdldFRpdGxlKCk7XG5cdFx0aWYoIXRpdGxlKSB7XG5cdFx0XHR0aXRsZSA9IFwiXCI7XG5cdFx0XHR9XG5cdFx0aGVhZFtcInRpdGxlXCJdID0gdGl0bGU7XG5cdFx0aGVhZFtcImRhdGVNb2RpZmllZFwiXSA9IChuZXcgRGF0ZSgpKS50b0dNVFN0cmluZygpO1xuXHRcdHZhciBleHBhbnNpb25TdGF0ZXMgPSBbXTtcblx0XHR2YXIgbm9kZUlkID0gMTtcblx0XHR2YXIgY3Vyc29yID0gcm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRkbyB7XG5cdFx0XHRpZihjdXJzb3IpIHtcblx0XHRcdFx0aWYoIWN1cnNvci5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSAmJiAoY3Vyc29yLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5zaXplKCkgPiAwKSkge1xuXHRcdFx0XHRcdGV4cGFuc2lvblN0YXRlcy5wdXNoKG5vZGVJZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRub2RlSWQrKztcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0dmFyIG5leHQgPSBudWxsO1xuXHRcdFx0aWYoIWN1cnNvci5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSkge1xuXHRcdFx0XHR2YXIgb3V0bGluZSA9IGN1cnNvci5jaGlsZHJlbihcIm9sXCIpO1xuXHRcdFx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0dmFyIGZpcnN0Q2hpbGQgPSBvdXRsaW5lLmNoaWxkcmVuKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdFx0XHRpZihmaXJzdENoaWxkLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRuZXh0ID0gZmlyc3RDaGlsZDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdGlmKCFuZXh0KSB7XG5cdFx0XHRcdG5leHQgPSB0aGlzLl93YWxrX2Rvd24oY3Vyc29yKTtcblx0XHRcdFx0fVxuXHRcdFx0Y3Vyc29yID0gbmV4dDtcblx0XHRcdH0gd2hpbGUoY3Vyc29yIT1udWxsKTtcblx0XHRoZWFkW1wiZXhwYW5zaW9uU3RhdGVcIl0gPSBleHBhbnNpb25TdGF0ZXMuam9pbihcIixcIik7XG5cdFx0dmFyIG9wbWwgPSAnJztcblx0XHR2YXIgaW5kZW50PTA7XG5cdFx0dmFyIGFkZCA9IGZ1bmN0aW9uKHMpe1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGluZGVudDsgaSsrKXtcblx0XHRcdFx0b3BtbCs9J1xcdCc7XG5cdFx0XHRcdH1cblx0XHRcdFx0b3BtbCs9cysnXFxuJztcblx0XHRcdH07XG5cdFx0YWRkKCc8P3htbCB2ZXJzaW9uPVwiMS4wXCI/PicpO1xuXHRcdGFkZCgnPG9wbWwgdmVyc2lvbj1cIjIuMFwiPicpO1xuXHRcdGluZGVudCsrO1xuXHRcdGFkZCgnPGhlYWQ+Jyk7XG5cdFx0aW5kZW50Kys7XG5cdFx0Zm9yKHZhciBoZWFkTmFtZSBpbiBoZWFkKXtcblx0XHRcdGlmKGhlYWRbaGVhZE5hbWVdIT09dW5kZWZpbmVkKXtcblx0XHRcdFx0YWRkKCc8JytoZWFkTmFtZSsnPicgKyBDb25jb3JkVXRpbC5lc2NhcGVYbWwoaGVhZFtoZWFkTmFtZV0pICsgJzwvJyArIGhlYWROYW1lICsgJz4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGFkZCgnPC9oZWFkPicpO1xuXHRcdGluZGVudC0tO1xuXHRcdGFkZCgnPGJvZHk+Jyk7XG5cdFx0aW5kZW50Kys7XG5cdFx0cm9vdC5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdG9wbWwgKz0gY29uY29yZEluc3RhbmNlLmVkaXRvci5vcG1sTGluZSgkKHRoaXMpLCBpbmRlbnQpO1xuXHRcdFx0fSk7XG5cdFx0YWRkKCc8L2JvZHk+Jyk7XG5cdFx0aW5kZW50LS07XG5cdFx0YWRkKCc8L29wbWw+Jyk7XG5cdFx0cmV0dXJuIG9wbWw7XG5cdFx0fTtcblx0dGhpcy51bmRvID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgc3RhdGVCZWZvcmVDaGFuZ2UgPSByb290LmNoaWxkcmVuKCkuY2xvbmUodHJ1ZSwgdHJ1ZSk7XG5cdFx0dmFyIHRleHRNb2RlQmVmb3JlQ2hhbmdlID0gdGhpcy5pblRleHRNb2RlKCk7XG5cdFx0dmFyIGJlZm9yZVJhbmdlID0gdW5kZWZpbmVkO1xuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcblx0XHRcdHZhciByYW5nZSA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0XHRpZihyYW5nZSl7XG5cdFx0XHRcdGJlZm9yZVJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0aWYocm9vdC5kYXRhKFwiY2hhbmdlXCIpKXtcblx0XHRcdHJvb3QuZW1wdHkoKTtcblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVwiKS5hcHBlbmRUbyhyb290KTtcblx0XHRcdHRoaXMuc2V0VGV4dE1vZGUocm9vdC5kYXRhKFwiY2hhbmdlVGV4dE1vZGVcIikpO1xuXHRcdFx0aWYodGhpcy5pblRleHRNb2RlKCkpe1xuXHRcdFx0XHR0aGlzLmZvY3VzQ3Vyc29yKCk7XG5cdFx0XHRcdHZhciByYW5nZSA9IHJvb3QuZGF0YShcImNoYW5nZVJhbmdlXCIpO1xuXHRcdFx0XHRpZihyYW5nZSl7XG5cdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5yZXN0b3JlU2VsZWN0aW9uKHJhbmdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVwiLCBzdGF0ZUJlZm9yZUNoYW5nZSk7XG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VUZXh0TW9kZVwiLCB0ZXh0TW9kZUJlZm9yZUNoYW5nZSk7XG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VSYW5nZVwiLCBiZWZvcmVSYW5nZSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblx0dGhpcy52aXNpdExldmVsID0gZnVuY3Rpb24oY2Ipe1xuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xuXHRcdHZhciBvcCA9IHRoaXM7XG5cdFx0Y3Vyc29yLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgc3ViQ3Vyc29yQ29udGV4dCA9IG9wLnNldEN1cnNvckNvbnRleHQoJCh0aGlzKSk7XG5cdFx0XHRjYihzdWJDdXJzb3JDb250ZXh0KTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMudmlzaXRUb1N1bW1pdCA9IGZ1bmN0aW9uKGNiKXtcblx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcblx0XHR3aGlsZShjYih0aGlzLnNldEN1cnNvckNvbnRleHQoY3Vyc29yKSkpe1xuXHRcdFx0dmFyIHBhcmVudCA9IGN1cnNvci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcblx0XHRcdGlmKHBhcmVudC5sZW5ndGg9PTEpe1xuXHRcdFx0XHRjdXJzb3I9cGFyZW50O1xuXHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0dGhpcy52aXNpdEFsbCA9IGZ1bmN0aW9uKGNiKXtcblx0XHR2YXIgb3AgPSB0aGlzO1xuXHRcdHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHN1YkN1cnNvckNvbnRleHQgPSBvcC5zZXRDdXJzb3JDb250ZXh0KCQodGhpcykpO1xuXHRcdFx0dmFyIHJldFZhbCA9IGNiKHN1YkN1cnNvckNvbnRleHQpO1xuXHRcdFx0aWYoKHJldFZhbCE9PXVuZGVmaW5lZCkgJiYgKHJldFZhbD09PWZhbHNlKSl7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0dGhpcy53aXBlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGggPiAwKXtcblx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XG5cdFx0XHR9XG5cdFx0cm9vdC5lbXB0eSgpO1xuXHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5tYWtlTm9kZSgpO1xuXHRcdHJvb3QuYXBwZW5kKG5vZGUpO1xuXHRcdHRoaXMuc2V0VGV4dE1vZGUoZmFsc2UpO1xuXHRcdHRoaXMuc2V0Q3Vyc29yKG5vZGUpO1xuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcblx0XHR9O1xuXHR0aGlzLnhtbFRvT3V0bGluZSA9IGZ1bmN0aW9uKHhtbFRleHQsIGZsU2V0Rm9jdXMpIHsgLy8yLzIyLzE0IGJ5IERXIC0tIG5ldyBwYXJhbSwgZmxTZXRGb2N1c1xuXHRcdFxuXHRcdGlmIChmbFNldEZvY3VzID09IHVuZGVmaW5lZCkgeyAvLzIvMjIvMTQgYnkgRFdcblx0XHRcdGZsU2V0Rm9jdXMgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFxuXHRcdHZhciBkb2MgPSBudWxsO1xuXHRcdGlmKHR5cGVvZiB4bWxUZXh0ID09IFwic3RyaW5nXCIpIHtcblx0XHRcdGRvYyA9ICQoJC5wYXJzZVhNTCh4bWxUZXh0KSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkb2MgPSAkKHhtbFRleHQpO1xuXHRcdFx0XHR9XG5cdFx0cm9vdC5lbXB0eSgpO1xuXHRcdHZhciB0aXRsZSA9IFwiXCI7XG5cdFx0aWYoZG9jLmZpbmQoXCJ0aXRsZTpmaXJzdFwiKS5sZW5ndGg9PTEpe1xuXHRcdFx0dGl0bGUgPSBkb2MuZmluZChcInRpdGxlOmZpcnN0XCIpLnRleHQoKTtcblx0XHRcdH1cblx0XHR0aGlzLnNldFRpdGxlKHRpdGxlKTtcblx0XHR2YXIgaGVhZGVycyA9IHt9O1xuXHRcdGRvYy5maW5kKFwiaGVhZFwiKS5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24oKXtcblx0XHRcdGhlYWRlcnNbJCh0aGlzKS5wcm9wKFwidGFnTmFtZVwiKV0gPSAkKHRoaXMpLnRleHQoKTtcblx0XHRcdH0pO1xuXHRcdHJvb3QuZGF0YShcImhlYWRcIiwgaGVhZGVycyk7XG5cdFx0ZG9jLmZpbmQoXCJib2R5XCIpLmNoaWxkcmVuKFwib3V0bGluZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0cm9vdC5hcHBlbmQoY29uY29yZEluc3RhbmNlLmVkaXRvci5idWlsZCgkKHRoaXMpLCB0cnVlKSk7XG5cdFx0XHR9KTtcblx0XHRyb290LmRhdGEoXCJjaGFuZ2VkXCIsIGZhbHNlKTtcblx0XHRyb290LnJlbW92ZURhdGEoXCJwcmV2aW91c0NoYW5nZVwiKTtcblx0XHR2YXIgZXhwYW5zaW9uU3RhdGUgPSBkb2MuZmluZChcImV4cGFuc2lvblN0YXRlXCIpO1xuXHRcdGlmKGV4cGFuc2lvblN0YXRlICYmIGV4cGFuc2lvblN0YXRlLnRleHQoKSAmJiAoZXhwYW5zaW9uU3RhdGUudGV4dCgpIT1cIlwiKSl7XG5cdFx0XHR2YXIgZXhwYW5zaW9uU3RhdGVzID0gZXhwYW5zaW9uU3RhdGUudGV4dCgpLnNwbGl0KC9cXHMqLFxccyovKTtcblx0XHRcdHZhciBub2RlSWQgPSAxO1xuXHRcdFx0dmFyIGN1cnNvciA9IHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdGlmKGN1cnNvcikge1xuXHRcdFx0XHRcdGlmKGV4cGFuc2lvblN0YXRlcy5pbmRleE9mKFwiXCIrbm9kZUlkKSA+PSAwKXtcblx0XHRcdFx0XHRcdGN1cnNvci5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRub2RlSWQrKztcblx0XHRcdFx0XHR9ZWxzZXtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgbmV4dCA9IG51bGw7XG5cdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcblx0XHRcdFx0XHR2YXIgb3V0bGluZSA9IGN1cnNvci5jaGlsZHJlbihcIm9sXCIpO1xuXHRcdFx0XHRcdGlmKG91dGxpbmUubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRcdHZhciBmaXJzdENoaWxkID0gb3V0bGluZS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XG5cdFx0XHRcdFx0XHRpZihmaXJzdENoaWxkLmxlbmd0aCA9PSAxKSB7XG5cdFx0XHRcdFx0XHRcdG5leHQgPSBmaXJzdENoaWxkO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRpZighbmV4dCkge1xuXHRcdFx0XHRcdG5leHQgPSB0aGlzLl93YWxrX2Rvd24oY3Vyc29yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGN1cnNvciA9IG5leHQ7XG5cdFx0XHRcdH0gd2hpbGUoY3Vyc29yIT1udWxsKTtcblx0XHRcdH1cblx0XHR0aGlzLnNldFRleHRNb2RlKGZhbHNlKTtcblx0XHRcblx0XHRpZiAoZmxTZXRGb2N1cykge1xuXHRcdFx0dGhpcy5zZXRDdXJzb3Iocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKSk7XG5cdFx0XHR9XG5cdFx0XG5cdFx0cm9vdC5kYXRhKFwiY3VycmVudENoYW5nZVwiLCByb290LmNoaWxkcmVuKCkuY2xvbmUodHJ1ZSwgdHJ1ZSkpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdHRoaXMuYXR0cmlidXRlcyA9IG5ldyBDb25jb3JkT3BBdHRyaWJ1dGVzKGNvbmNvcmRJbnN0YW5jZSwgdGhpcy5nZXRDdXJzb3IoKSk7XG5cdH1cblxubW9kdWxlLmV4cG9ydHMgPSBDb25jb3JkT3A7XG4iLCJ2YXIgQ29uY29yZEVkaXRvciA9IHJlcXVpcmUoXCIuL2NvbmNvcmQtZWRpdG9yXCIpO1xudmFyIENvbmNvcmRPcCA9IHJlcXVpcmUoXCIuL2NvbmNvcmQtb3BcIik7XG52YXIgQ29uY29yZFNjcmlwdCA9IHJlcXVpcmUoXCIuL2NvbmNvcmQtc2NyaXB0XCIpO1xudmFyIENvbmNvcmRFdmVudHMgPSByZXF1aXJlKFwiLi9jb25jb3JkLWV2ZW50c1wiKTtcblxuZnVuY3Rpb24gQ29uY29yZE91dGxpbmUoY29udGFpbmVyLCBvcHRpb25zLCBjb25jb3JkKSB7XG5cdHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHR0aGlzLmlkID0gbnVsbDtcblx0dGhpcy5yb290ID0gbnVsbDtcblx0dGhpcy5lZGl0b3IgPSBudWxsO1xuXHR0aGlzLm9wID0gbnVsbDtcblx0dGhpcy5zY3JpcHQgPSBudWxsO1xuXHR0aGlzLnBhc3RlQmluID0gbnVsbDtcblx0dGhpcy5wYXN0ZUJpbkZvY3VzID0gZnVuY3Rpb24oKXtcblx0XHRpZighY29uY29yZC5yZWFkeSl7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0aWYoY29uY29yZC5tb2JpbGUpe1xuXHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdGlmKHRoaXMucm9vdC5pcyhcIjp2aXNpYmxlXCIpKXtcblx0XHRcdHZhciBub2RlID0gdGhpcy5vcC5nZXRDdXJzb3IoKTtcblx0XHRcdHZhciBub2RlT2Zmc2V0ID0gbm9kZS5vZmZzZXQoKTtcblx0XHRcdHRoaXMucGFzdGVCaW4ub2Zmc2V0KG5vZGVPZmZzZXQpO1xuXHRcdFx0dGhpcy5wYXN0ZUJpbi5jc3MoXCJ6LWluZGV4XCIsXCIxMDAwXCIpO1xuXHRcdFx0aWYoKHRoaXMucGFzdGVCaW4udGV4dCgpPT1cIlwiKXx8KHRoaXMucGFzdGVCaW4udGV4dCgpPT1cIlxcblwiKSl7XG5cdFx0XHRcdHRoaXMucGFzdGVCaW4udGV4dChcIi4uLlwiKTtcblx0XHRcdFx0fVxuXHRcdFx0dGhpcy5vcC5mb2N1c0N1cnNvcigpO1xuXHRcdFx0dGhpcy5wYXN0ZUJpbi5mb2N1cygpO1xuXHRcdFx0aWYodGhpcy5wYXN0ZUJpblswXSA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCl7XG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwic2VsZWN0QWxsXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5jYWxsYmFja3MgPSBmdW5jdGlvbihjYWxsYmFja3MpIHtcblx0XHRpZihjYWxsYmFja3MpIHtcblx0XHRcdHRoaXMucm9vdC5kYXRhKFwiY2FsbGJhY2tzXCIsIGNhbGxiYWNrcyk7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2tzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLnJvb3QuZGF0YShcImNhbGxiYWNrc1wiKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5yb290LmRhdGEoXCJjYWxsYmFja3NcIik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHt9O1xuXHRcdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR0aGlzLmZpcmVDYWxsYmFjayA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG5cdFx0dmFyIGNiID0gdGhpcy5jYWxsYmFja3MoKVtuYW1lXVxuXHRcdGlmKGNiKSB7XG5cdFx0XHRjYih2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5wcmVmcyA9IGZ1bmN0aW9uKG5ld3ByZWZzKSB7XG5cdFx0dmFyIHByZWZzID0gdGhpcy5yb290LmRhdGEoXCJwcmVmc1wiKTtcblx0XHRpZihwcmVmcyA9PSB1bmRlZmluZWQpe1xuXHRcdFx0cHJlZnMgPSB7fTtcblx0XHRcdH1cblx0XHRpZihuZXdwcmVmcykge1xuXHRcdFx0Zm9yKHZhciBrZXkgaW4gbmV3cHJlZnMpe1xuXHRcdFx0XHRwcmVmc1trZXldID0gbmV3cHJlZnNba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0dGhpcy5yb290LmRhdGEoXCJwcmVmc1wiLCBwcmVmcyk7XG5cdFx0XHRpZihwcmVmcy5yZWFkb25seSl7XG5cdFx0XHRcdHRoaXMucm9vdC5hZGRDbGFzcyhcInJlYWRvbmx5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZihwcmVmcy5yZW5kZXJNb2RlIT09dW5kZWZpbmVkKXtcblx0XHRcdFx0dGhpcy5yb290LmRhdGEoXCJyZW5kZXJNb2RlXCIsIHByZWZzLnJlbmRlck1vZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZihwcmVmcy5jb250ZXh0TWVudSl7XG5cdFx0XHRcdCQocHJlZnMuY29udGV4dE1lbnUpLmhpZGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0dmFyIHN0eWxlID0ge307XG5cdFx0XHRpZihwcmVmcy5vdXRsaW5lRm9udCkge1xuXHRcdFx0XHRzdHlsZVtcImZvbnQtZmFtaWx5XCJdID0gcHJlZnMub3V0bGluZUZvbnQ7XG5cdFx0XHRcdH1cblx0XHRcdGlmKHByZWZzLm91dGxpbmVGb250U2l6ZSkge1xuXHRcdFx0XHRwcmVmcy5vdXRsaW5lRm9udFNpemUgPSBwYXJzZUludChwcmVmcy5vdXRsaW5lRm9udFNpemUpO1xuXHRcdFx0XHRzdHlsZVtcImZvbnQtc2l6ZVwiXSA9IHByZWZzLm91dGxpbmVGb250U2l6ZSArIFwicHhcIjtcblx0XHRcdFx0c3R5bGVbXCJtaW4taGVpZ2h0XCJdID0gKHByZWZzLm91dGxpbmVGb250U2l6ZSArIDYpICsgXCJweFwiO1xuXHRcdFx0XHRzdHlsZVtcImxpbmUtaGVpZ2h0XCJdID0gKHByZWZzLm91dGxpbmVGb250U2l6ZSArIDYpICsgXCJweFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRpZihwcmVmcy5vdXRsaW5lTGluZUhlaWdodCkge1xuXHRcdFx0XHRwcmVmcy5vdXRsaW5lTGluZUhlaWdodCA9IHBhcnNlSW50KHByZWZzLm91dGxpbmVMaW5lSGVpZ2h0KTtcblx0XHRcdFx0c3R5bGVbXCJtaW4taGVpZ2h0XCJdID0gcHJlZnMub3V0bGluZUxpbmVIZWlnaHQgKyBcInB4XCI7XG5cdFx0XHRcdHN0eWxlW1wibGluZS1oZWlnaHRcIl0gPSBwcmVmcy5vdXRsaW5lTGluZUhlaWdodCArIFwicHhcIjtcblx0XHRcdFx0fVxuXHRcdFx0dGhpcy5yb290LnBhcmVudCgpLmZpbmQoXCJzdHlsZS5wcmVmc1N0eWxlXCIpLnJlbW92ZSgpO1xuXHRcdFx0dmFyIGNzcyA9ICc8c3R5bGUgdHlwZT1cInRleHQvY3NzXCIgY2xhc3M9XCJwcmVmc1N0eWxlXCI+XFxuJztcblx0XHRcdHZhciBjc3NJZD1cIlwiO1xuXHRcdFx0aWYodGhpcy5yb290LnBhcmVudCgpLmF0dHIoXCJpZFwiKSl7XG5cdFx0XHRcdGNzc0lkPVwiI1wiK3RoaXMucm9vdC5wYXJlbnQoKS5hdHRyKFwiaWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdGNzcyArPSBjc3NJZCArICcgLmNvbmNvcmQgLmNvbmNvcmQtbm9kZSAuY29uY29yZC13cmFwcGVyIC5jb25jb3JkLXRleHQgeyc7XG5cdFx0XHRmb3IodmFyIGF0dHJpYnV0ZSBpbiBzdHlsZSkge1xuXHRcdFx0XHRjc3MgKz0gYXR0cmlidXRlICsgJzogJyArIHN0eWxlW2F0dHJpYnV0ZV0gKyAnOyc7XG5cdFx0XHRcdH1cblx0XHRcdGNzcyArPSAnfVxcbic7XG5cdFx0XHRjc3MgKz0gY3NzSWQgKyAnIC5jb25jb3JkIC5jb25jb3JkLW5vZGUgLmNvbmNvcmQtd3JhcHBlciAubm9kZS1pY29uIHsnO1xuXHRcdFx0Zm9yKHZhciBhdHRyaWJ1dGUgaW4gc3R5bGUpIHtcblx0XHRcdFx0aWYoYXR0cmlidXRlIT1cImZvbnQtZmFtaWx5XCIpe1xuXHRcdFx0XHRcdGNzcyArPSBhdHRyaWJ1dGUgKyAnOiAnICsgc3R5bGVbYXR0cmlidXRlXSArICc7Jztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdGNzcyArPSAnfVxcbidcblx0XHRcdHZhciB3cmFwcGVyUGFkZGluZ0xlZnQgPSBwcmVmcy5vdXRsaW5lTGluZUhlaWdodDtcblx0XHRcdGlmKHdyYXBwZXJQYWRkaW5nTGVmdD09PXVuZGVmaW5lZCl7XG5cdFx0XHRcdHdyYXBwZXJQYWRkaW5nTGVmdCA9IHByZWZzLm91dGxpbmVGb250U2l6ZTtcblx0XHRcdFx0fVxuXHRcdFx0aWYod3JhcHBlclBhZGRpbmdMZWZ0IT09IHVuZGVmaW5lZCl7XG5cdFx0XHRcdGNzcyArPSBjc3NJZCArICcgLmNvbmNvcmQgLmNvbmNvcmQtbm9kZSAuY29uY29yZC13cmFwcGVyIHsnO1xuXHRcdFx0XHRjc3MgKz0gXCJwYWRkaW5nLWxlZnQ6IFwiICsgd3JhcHBlclBhZGRpbmdMZWZ0ICsgXCJweFwiO1xuXHRcdFx0XHRjc3MgKz0gXCJ9XFxuXCI7XG5cdFx0XHRcdGNzcyArPSBjc3NJZCArICcgLmNvbmNvcmQgb2wgeyc7XG5cdFx0XHRcdGNzcyArPSBcInBhZGRpbmctbGVmdDogXCIgKyB3cmFwcGVyUGFkZGluZ0xlZnQgKyBcInB4XCI7XG5cdFx0XHRcdGNzcyArPSBcIn1cXG5cIjtcblx0XHRcdFx0fVxuXHRcdFx0Y3NzICs9ICc8L3N0eWxlPlxcbic7XG5cdFx0XHR0aGlzLnJvb3QuYmVmb3JlKGNzcyk7XG5cdFx0XHRpZihuZXdwcmVmcy5jc3Mpe1xuXHRcdFx0XHR0aGlzLm9wLnNldFN0eWxlKG5ld3ByZWZzLmNzcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRyZXR1cm4gcHJlZnM7XG5cdFx0fTtcblx0dGhpcy5hZnRlckluaXQgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVkaXRvciA9IG5ldyBDb25jb3JkRWRpdG9yKHRoaXMucm9vdCwgdGhpcyk7XG5cdFx0dGhpcy5vcCA9IG5ldyBDb25jb3JkT3AodGhpcy5yb290LCB0aGlzKTtcblx0XHR0aGlzLnNjcmlwdCA9IG5ldyBDb25jb3JkU2NyaXB0KHRoaXMucm9vdCwgdGhpcyk7XG5cdFx0aWYob3B0aW9ucykge1xuXHRcdFx0aWYob3B0aW9ucy5wcmVmcykge1xuXHRcdFx0XHR0aGlzLnByZWZzKG9wdGlvbnMucHJlZnMpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZihvcHRpb25zLm9wZW4pIHtcblx0XHRcdFx0dGhpcy5yb290LmRhdGEoXCJvcGVuXCIsIG9wdGlvbnMub3Blbik7XG5cdFx0XHRcdH1cblx0XHRcdGlmKG9wdGlvbnMuc2F2ZSkge1xuXHRcdFx0XHR0aGlzLnJvb3QuZGF0YShcInNhdmVcIiwgb3B0aW9ucy5zYXZlKTtcblx0XHRcdFx0fVxuXHRcdFx0aWYob3B0aW9ucy5jYWxsYmFja3MpIHtcblx0XHRcdFx0dGhpcy5jYWxsYmFja3Mob3B0aW9ucy5jYWxsYmFja3MpO1xuXHRcdFx0XHR9XG5cdFx0XHRpZihvcHRpb25zLmlkKSB7XG5cdFx0XHRcdHRoaXMucm9vdC5kYXRhKFwiaWRcIiwgb3B0aW9ucy5pZCk7XG5cdFx0XHRcdHRoaXMub3BlbigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYoJChjb250YWluZXIpLmZpbmQoXCIuY29uY29yZC1yb290OmZpcnN0XCIpLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMucm9vdCA9ICQoY29udGFpbmVyKS5maW5kKFwiLmNvbmNvcmQtcm9vdDpmaXJzdFwiKTtcblx0XHRcdHRoaXMucGFzdGVCaW4gPSAkKGNvbnRhaW5lcikuZmluZChcIi5wYXN0ZUJpbjpmaXJzdFwiKTtcblx0XHRcdHRoaXMuYWZ0ZXJJbml0KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIHJvb3QgPSAkKFwiPG9sPjwvb2w+XCIpO1xuXHRcdHJvb3QuYWRkQ2xhc3MoXCJjb25jb3JkIGNvbmNvcmQtcm9vdFwiKTtcblx0XHRyb290LmFwcGVuZFRvKGNvbnRhaW5lcik7XG5cdFx0dGhpcy5yb290ID0gcm9vdDtcblx0XHR2YXIgcGFzdGVCaW4gPSAkKCc8ZGl2IGNsYXNzPVwicGFzdGVCaW5cIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgc3R5bGU9XCJwb3NpdGlvbjogYWJzb2x1dGU7IGhlaWdodDogMXB4OyB3aWR0aDoxcHg7IG91dGxpbmU6bm9uZTsgb3ZlcmZsb3c6aGlkZGVuO1wiPjwvZGl2PicpO1xuXHRcdHBhc3RlQmluLmFwcGVuZFRvKGNvbnRhaW5lcik7XG5cdFx0dGhpcy5wYXN0ZUJpbiA9IHBhc3RlQmluO1xuXHRcdHRoaXMuYWZ0ZXJJbml0KCk7XG5cdFx0dGhpcy5ldmVudHMgPSBuZXcgQ29uY29yZEV2ZW50cyh0aGlzLnJvb3QsIHRoaXMuZWRpdG9yLCB0aGlzLm9wLCB0aGlzKTtcblx0XHR9O1xuXHR0aGlzW1wibmV3XCJdID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vcC53aXBlKCk7XG5cdFx0fTtcblx0dGhpcy5vcGVuID0gZnVuY3Rpb24oY2IpIHtcblx0XHR2YXIgb3BtbElkID0gdGhpcy5yb290LmRhdGEoXCJpZFwiKTtcblx0XHRpZighb3BtbElkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0dmFyIHJvb3QgPSB0aGlzLnJvb3Q7XG5cdFx0dmFyIGVkaXRvciA9IHRoaXMuZWRpdG9yO1xuXHRcdHZhciBvcCA9IHRoaXMub3A7XG5cdFx0dmFyIG9wZW5VcmwgPSBcImh0dHA6Ly9jb25jb3JkLnNtYWxscGljdHVyZS5jb20vb3BlblwiO1xuXHRcdGlmKHJvb3QuZGF0YShcIm9wZW5cIikpIHtcblx0XHRcdG9wZW5VcmwgPSByb290LmRhdGEoXCJvcGVuXCIpO1xuXHRcdFx0fVxuXHRcdHBhcmFtcyA9IHt9XG5cdFx0aWYob3BtbElkLm1hdGNoKC9eaHR0cC4rJC8pKSB7XG5cdFx0XHRwYXJhbXNbXCJ1cmxcIl0gPSBvcG1sSWRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBhcmFtc1tcImlkXCJdID0gb3BtbElkXG5cdFx0XHRcdH1cblx0XHQkLmFqYXgoe1xuXHRcdFx0dHlwZTogJ1BPU1QnLFxuXHRcdFx0dXJsOiBvcGVuVXJsLFxuXHRcdFx0ZGF0YTogcGFyYW1zLFxuXHRcdFx0ZGF0YVR5cGU6IFwieG1sXCIsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihvcG1sKSB7XG5cdFx0XHRcdGlmKG9wbWwpIHtcblx0XHRcdFx0XHRvcC54bWxUb091dGxpbmUob3BtbCk7XG5cdFx0XHRcdFx0aWYoY2IpIHtcblx0XHRcdFx0XHRcdGNiKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCA9PSAwKSB7XG5cdFx0XHRcdFx0b3Aud2lwZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0dGhpcy5zYXZlID0gZnVuY3Rpb24oY2IpIHtcblx0XHR2YXIgb3BtbElkID0gdGhpcy5yb290LmRhdGEoXCJpZFwiKTtcblx0XHRpZihvcG1sSWQgJiYgdGhpcy5vcC5jaGFuZ2VkKCkpIHtcblx0XHRcdHZhciBzYXZlVXJsID0gXCJodHRwOi8vY29uY29yZC5zbWFsbHBpY3R1cmUuY29tL3NhdmVcIjtcblx0XHRcdGlmKHRoaXMucm9vdC5kYXRhKFwic2F2ZVwiKSkge1xuXHRcdFx0XHRzYXZlVXJsID0gdGhpcy5yb290LmRhdGEoXCJzYXZlXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gdGhpcztcblx0XHRcdHZhciBvcG1sID0gdGhpcy5vcC5vdXRsaW5lVG9YbWwoKTtcblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdFx0dXJsOiBzYXZlVXJsLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XCJvcG1sXCI6IG9wbWwsXG5cdFx0XHRcdFx0XCJpZFwiOiBvcG1sSWRcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRkYXRhVHlwZTogXCJqc29uXCIsXG5cdFx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzb24pIHtcblx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuY2xlYXJDaGFuZ2VkKCk7XG5cdFx0XHRcdFx0aWYoY2IpIHtcblx0XHRcdFx0XHRcdGNiKGpzb24pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0dGhpc1tcImltcG9ydFwiXSA9IGZ1bmN0aW9uKG9wbWxJZCwgY2IpIHtcblx0XHR2YXIgb3BlblVybCA9IFwiaHR0cDovL2NvbmNvcmRvbGQuc21hbGxwaWN0dXJlLmNvbS9vcGVuXCI7XG5cdFx0dmFyIHJvb3QgPSB0aGlzLnJvb3Q7XG5cdFx0dmFyIGNvbmNvcmRJbnN0YW5jZSA9IHRoaXM7XG5cdFx0aWYocm9vdC5kYXRhKFwib3BlblwiKSkge1xuXHRcdFx0b3BlblVybCA9IHJvb3QuZGF0YShcIm9wZW5cIik7XG5cdFx0XHR9XG5cdFx0cGFyYW1zID0ge31cblx0XHRpZihvcG1sSWQubWF0Y2goL15odHRwLiskLykpIHtcblx0XHRcdHBhcmFtc1tcInVybFwiXSA9IG9wbWxJZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBhcmFtc1tcImlkXCJdID0gb3BtbElkO1xuXHRcdFx0XHR9XG5cdFx0JC5hamF4KHtcblx0XHRcdHR5cGU6ICdQT1NUJyxcblx0XHRcdHVybDogb3BlblVybCxcblx0XHRcdGRhdGE6IHBhcmFtcyxcblx0XHRcdGRhdGFUeXBlOiBcInhtbFwiLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ob3BtbCkge1xuXHRcdFx0XHRpZihvcG1sKSB7XG5cdFx0XHRcdFx0dmFyIGN1cnNvciA9IHJvb3QuZmluZChcIi5jb25jb3JkLWN1cnNvcjpmaXJzdFwiKTtcblx0XHRcdFx0XHQkKG9wbWwpLmZpbmQoXCJib2R5XCIpLmNoaWxkcmVuKFwib3V0bGluZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIG5vZGUgPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmJ1aWxkKCQodGhpcykpO1xuXHRcdFx0XHRcdFx0Y3Vyc29yLmFmdGVyKG5vZGUpO1xuXHRcdFx0XHRcdFx0Y3Vyc29yID0gbm9kZTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xuXHRcdFx0XHRcdGlmKGNiKSB7XG5cdFx0XHRcdFx0XHRjYigpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0dGhpc1tcImV4cG9ydFwiXSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb250ZXh0ID0gdGhpcy5yb290LmZpbmQoXCIuY29uY29yZC1jdXJzb3I6Zmlyc3RcIik7XG5cdFx0aWYoY29udGV4dC5sZW5ndGggPT0gMCkge1xuXHRcdFx0Y29udGV4dCA9IHRoaXMucm9vdC5maW5kKFwiLmNvbmNvcmQtcm9vdDpmaXJzdFwiKTtcblx0XHRcdH1cblx0XHRyZXR1cm4gdGhpcy5lZGl0b3Iub3BtbChjb250ZXh0KTtcblx0XHR9O1xuXHR0aGlzLmluaXQoKTtcblx0fVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbmNvcmRPdXRsaW5lO1xuIiwiZnVuY3Rpb24gQ29uY29yZFNjcmlwdChyb290LCBjb25jb3JkSW5zdGFuY2Upe1xuXHR0aGlzLmlzQ29tbWVudCA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmF0dHJpYnV0ZXMuZ2V0T25lKFwiaXNDb21tZW50XCIpIT09IHVuZGVmaW5lZCl7XG5cdFx0XHRyZXR1cm4gY29uY29yZEluc3RhbmNlLm9wLmF0dHJpYnV0ZXMuZ2V0T25lKFwiaXNDb21tZW50XCIpPT1cInRydWVcIjtcblx0XHRcdH1cblx0XHR2YXIgcGFyZW50SXNBQ29tbWVudD1mYWxzZTtcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkucGFyZW50cyhcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLnNldEN1cnNvckNvbnRleHQoJCh0aGlzKSkuYXR0cmlidXRlcy5nZXRPbmUoXCJpc0NvbW1lbnRcIikgPT0gXCJ0cnVlXCIpe1xuXHRcdFx0XHRwYXJlbnRJc0FDb21tZW50ID0gdHJ1ZTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gcGFyZW50SXNBQ29tbWVudDtcblx0XHR9O1xuXHR0aGlzLm1ha2VDb21tZW50ID0gZnVuY3Rpb24oKXtcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AuYXR0cmlidXRlcy5zZXRPbmUoXCJpc0NvbW1lbnRcIiwgXCJ0cnVlXCIpO1xuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKS5hZGRDbGFzcyhcImNvbmNvcmQtY29tbWVudFwiKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHR0aGlzLnVuQ29tbWVudCA9IGZ1bmN0aW9uKCl7XG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLmF0dHJpYnV0ZXMuc2V0T25lKFwiaXNDb21tZW50XCIsIFwiZmFsc2VcIik7XG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLnJlbW92ZUNsYXNzKFwiY29uY29yZC1jb21tZW50XCIpO1xuXHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdH1cblxubW9kdWxlLmV4cG9ydHMgPSBDb25jb3JkU2NyaXB0O1xuIiwidmFyIENvbmNvcmRPdXRsaW5lID0gcmVxdWlyZShcIi4vY29uY29yZC1vdXRsaW5lXCIpO1xuXG52YXIgY29uY29yZCA9IHtcblx0dmVyc2lvbjogXCIzLjAuMFwiLFxuXHRtb2JpbGU6IC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksXG5cdHJlYWR5OiBmYWxzZSxcblx0aGFuZGxlRXZlbnRzOiB0cnVlLFxuXHRyZXN1bWVDYWxsYmFja3M6IFtdLFxuXHRvblJlc3VtZTogZnVuY3Rpb24oY2Ipe1xuXHRcdHRoaXMucmVzdW1lQ2FsbGJhY2tzLnB1c2goY2IpO1xuXHRcdH0sXG5cdHJlc3VtZUxpc3RlbmluZzogZnVuY3Rpb24oKXtcblx0XHRpZighdGhpcy5oYW5kbGVFdmVudHMpe1xuXHRcdFx0dGhpcy5oYW5kbGVFdmVudHM9dHJ1ZTtcblx0XHRcdHZhciByID0gdGhpcy5nZXRGb2N1c1Jvb3QoKTtcblx0XHRcdGlmKHIhPW51bGwpe1xuXHRcdFx0XHR2YXIgYyA9IG5ldyBDb25jb3JkT3V0bGluZShyLnBhcmVudCgpLCBudWxsLCBjb25jb3JkKTtcblx0XHRcdFx0aWYoYy5vcC5pblRleHRNb2RlKCkpe1xuXHRcdFx0XHRcdGMub3AuZm9jdXNDdXJzb3IoKTtcblx0XHRcdFx0XHRjLmVkaXRvci5yZXN0b3JlU2VsZWN0aW9uKCk7XG5cdFx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0XHRjLnBhc3RlQmluRm9jdXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0Zm9yKHZhciBpIGluIHRoaXMucmVzdW1lQ2FsbGJhY2tzKXtcblx0XHRcdFx0XHR2YXIgY2IgPSB0aGlzLnJlc3VtZUNhbGxiYWNrc1tpXTtcblx0XHRcdFx0XHRjYigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5yZXN1bWVDYWxsYmFja3M9W107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRzdG9wTGlzdGVuaW5nOiBmdW5jdGlvbigpe1xuXHRcdGlmKHRoaXMuaGFuZGxlRXZlbnRzKXtcblx0XHRcdHRoaXMuaGFuZGxlRXZlbnRzPWZhbHNlO1xuXHRcdFx0dmFyIHIgPSB0aGlzLmdldEZvY3VzUm9vdCgpO1xuXHRcdFx0aWYociE9bnVsbCl7XG5cdFx0XHRcdHZhciBjID0gbmV3IENvbmNvcmRPdXRsaW5lKHIucGFyZW50KCksIG51bGwsIGNvbmNvcmQpO1xuXHRcdFx0XHRpZihjLm9wLmluVGV4dE1vZGUoKSl7XG5cdFx0XHRcdFx0Yy5lZGl0b3Iuc2F2ZVNlbGVjdGlvbigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdGZvY3VzUm9vdDogbnVsbCxcblx0Z2V0Rm9jdXNSb290OiBmdW5jdGlvbigpe1xuXHRcdGlmKCQoXCIuY29uY29yZC1yb290OnZpc2libGVcIikubGVuZ3RoPT0xKXtcblx0XHRcdHJldHVybiB0aGlzLnNldEZvY3VzUm9vdCgkKFwiLmNvbmNvcmQtcm9vdDp2aXNpYmxlOmZpcnN0XCIpKTtcblx0XHRcdH1cblx0XHRpZigkKFwiLm1vZGFsXCIpLmlzKFwiOnZpc2libGVcIikpe1xuXHRcdFx0aWYoJChcIi5tb2RhbFwiKS5maW5kKFwiLmNvbmNvcmQtcm9vdDp2aXNpYmxlOmZpcnN0XCIpLmxlbmd0aD09MSl7XG5cdFx0XHRcdHJldHVybiB0aGlzLnNldEZvY3VzUm9vdCgkKFwiLm1vZGFsXCIpLmZpbmQoXCIuY29uY29yZC1yb290OnZpc2libGU6Zmlyc3RcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0aWYodGhpcy5mb2N1c1Jvb3Q9PW51bGwpe1xuXHRcdFx0aWYoJChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZVwiKS5sZW5ndGg+MCl7XG5cdFx0XHRcdHJldHVybiB0aGlzLnNldEZvY3VzUm9vdCgkKFwiLmNvbmNvcmQtcm9vdDp2aXNpYmxlOmZpcnN0XCIpKTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdGlmKCF0aGlzLmZvY3VzUm9vdC5pcyhcIjp2aXNpYmxlXCIpKXtcblx0XHRcdHJldHVybiB0aGlzLnNldEZvY3VzUm9vdCgkKFwiLmNvbmNvcmQtcm9vdDp2aXNpYmxlOmZpcnN0XCIpKTtcblx0XHRcdH1cblx0XHRyZXR1cm4gdGhpcy5mb2N1c1Jvb3Q7XG5cdFx0fSxcblx0c2V0Rm9jdXNSb290OiBmdW5jdGlvbihyb290KXtcblx0XHR2YXIgb3JpZ1Jvb3QgPSB0aGlzLmZvY3VzUm9vdDtcblx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gbmV3IENvbmNvcmRPdXRsaW5lKHJvb3QucGFyZW50KCksIG51bGwsIGNvbmNvcmQpO1xuXHRcdGlmKChvcmlnUm9vdCE9bnVsbCkgJiYgIShvcmlnUm9vdFswXT09PXJvb3RbMF0pKXtcblx0XHRcdHZhciBvcmlnQ29uY29yZEluc3RhbmNlID0gbmV3IENvbmNvcmRPdXRsaW5lKG9yaWdSb290LnBhcmVudCgpLCBudWxsLCBjb25jb3JkKTtcblx0XHRcdG9yaWdDb25jb3JkSW5zdGFuY2UuZWRpdG9yLmhpZGVDb250ZXh0TWVudSgpO1xuXHRcdFx0b3JpZ0NvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZHJhZ01vZGVFeGl0KCk7XG5cdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKXtcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmZvY3VzQ3Vyc29yKCk7XG5cdFx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW5Gb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0dGhpcy5mb2N1c1Jvb3QgPSByb290O1xuXHRcdHJldHVybiB0aGlzLmZvY3VzUm9vdDtcblx0XHR9LFxuXHR1cGRhdGVGb2N1c1Jvb3RFdmVudDogZnVuY3Rpb24oZXZlbnQpe1xuXHRcdHZhciByb290ID0gJChldmVudC50YXJnZXQpLnBhcmVudHMoXCIuY29uY29yZC1yb290OmZpcnN0XCIpO1xuXHRcdGlmKHJvb3QubGVuZ3RoPT0xKXtcblx0XHRcdGNvbmNvcmQuc2V0Rm9jdXNSb290KHJvb3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25jb3JkO1xuIiwiLy8gQ29weXJpZ2h0IDIwMTMsIFNtYWxsIFBpY3R1cmUsIEluYy5cclxudmFyIENvbmNvcmRVdGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcclxudmFyIGNvbmNvcmQgPSByZXF1aXJlKFwiLi9jb25jb3JkXCIpO1xyXG52YXIgQ29uY29yZE91dGxpbmUgPSByZXF1aXJlKFwiLi9jb25jb3JkLW91dGxpbmVcIik7XHJcbiQoZnVuY3Rpb24gKCkge1xyXG5cdGlmKCQuZm4udG9vbHRpcCAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdCQoXCJhW3JlbD10b29sdGlwXVwiKS50b29sdGlwKHtcclxuXHRcdFx0bGl2ZTogdHJ1ZVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH0pXHJcbiQoZnVuY3Rpb24gKCkgeyBcclxuXHRpZigkLmZuLnBvcG92ZXIgIT09IHVuZGVmaW5lZCl7XHJcblx0XHQkKFwiYVtyZWw9cG9wb3Zlcl1cIikub24oXCJtb3VzZWVudGVyIG1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKXskKHRoaXMpLnBvcG92ZXIoXCJ0b2dnbGVcIil9KVxyXG5cdFx0fVxyXG5cdH0pXHJcbmlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcclxuXHRBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG9iaiwgc3RhcnQpIHtcclxuXHRcdGZvciAodmFyIGkgPSAoc3RhcnQgfHwgMCksIGogPSB0aGlzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG5cdFx0XHRpZiAodGhpc1tpXSA9PT0gb2JqKSB7IHJldHVybiBpOyB9XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiAtMTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG52YXIgY29uY29yZEVudmlyb25tZW50ID0ge1xyXG5cdFwidmVyc2lvblwiIDogY29uY29yZC52ZXJzaW9uXHJcblx0fTtcclxudmFyIGNvbmNvcmRDbGlwYm9hcmQgPSB1bmRlZmluZWQ7XHJcbmpRdWVyeS5mbi5yZXZlcnNlID0gW10ucmV2ZXJzZTtcclxuLy9Db25zdGFudHNcclxuXHR2YXIgbmlsID0gbnVsbDtcclxuXHR2YXIgaW5maW5pdHkgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG5cdHZhciBkb3duID0gXCJkb3duXCI7XHJcblx0dmFyIGxlZnQgPSBcImxlZnRcIjtcclxuXHR2YXIgcmlnaHQgPSBcInJpZ2h0XCI7XHJcblx0dmFyIHVwID0gXCJ1cFwiO1xyXG5cdHZhciBmbGF0dXAgPSBcImZsYXR1cFwiO1xyXG5cdHZhciBmbGF0ZG93biA9IFwiZmxhdGRvd25cIjtcclxuXHR2YXIgbm9kaXJlY3Rpb24gPSBcIm5vZGlyZWN0aW9uXCI7XHJcblxyXG5mdW5jdGlvbiBPcChvcG1sdGV4dCl7XHJcblx0dmFyIGZha2VEb20gPSAkKFwiPGRpdj48L2Rpdj5cIik7XHJcblx0ZmFrZURvbS5jb25jb3JkKCkub3AueG1sVG9PdXRsaW5lKG9wbWx0ZXh0KTtcclxuXHRyZXR1cm4gZmFrZURvbS5jb25jb3JkKCkub3A7XHJcblx0fVxyXG4oZnVuY3Rpb24oJCkge1xyXG5cdCQuZm4uY29uY29yZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiBuZXcgQ29uY29yZE91dGxpbmUoJCh0aGlzKSwgb3B0aW9ucywgY29uY29yZCk7XHJcblx0XHR9O1xyXG5cdCQoZG9jdW1lbnQpLm9uKFwia2V5ZG93blwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZigkKGV2ZW50LnRhcmdldCkuaXMoXCJpbnB1dFwiKXx8JChldmVudC50YXJnZXQpLmlzKFwidGV4dGFyZWFcIikpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdHZhciBmb2N1c1Jvb3QgPSBjb25jb3JkLmdldEZvY3VzUm9vdCgpO1xyXG5cdFx0aWYoZm9jdXNSb290PT1udWxsKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgY29udGV4dCA9IGZvY3VzUm9vdDtcclxuXHRcdGNvbnRleHQuZGF0YShcImtleWRvd25FdmVudFwiLCBldmVudCk7XHJcblx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gbmV3IENvbmNvcmRPdXRsaW5lKGNvbnRleHQucGFyZW50KCksIG51bGwsIGNvbmNvcmQpO1xyXG5cdFx0dmFyIHJlYWRvbmx5ID0gY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXTtcclxuXHRcdGlmKHJlYWRvbmx5PT11bmRlZmluZWQpe1xyXG5cdFx0XHRyZWFkb25seT1mYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0Ly8gUmVhZG9ubHkgZXhjZXB0aW9ucyBmb3IgYXJyb3cga2V5cyBhbmQgY21kLWNvbW1hXHJcblx0XHRpZihyZWFkb25seSl7XHJcblx0XHRcdGlmKCAoZXZlbnQud2hpY2g+PTM3KSAmJiAoZXZlbnQud2hpY2ggPD00MCkgKXtcclxuXHRcdFx0XHRyZWFkb25seSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiggKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkgJiYgKGV2ZW50LndoaWNoPT0xODgpICl7XHJcblx0XHRcdFx0cmVhZG9ubHkgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGlmKCFyZWFkb25seSl7XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEtleXN0cm9rZVwiLCBldmVudCk7XHJcblx0XHRcdHZhciBrZXlDYXB0dXJlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgY29tbWFuZEtleSA9IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleTtcclxuXHRcdFx0c3dpdGNoKGV2ZW50LndoaWNoKSB7XHJcblx0XHRcdFx0Y2FzZSA4OlxyXG5cdFx0XHRcdFx0Ly9CYWNrc3BhY2VcclxuXHRcdFx0XHRcdGlmKGNvbmNvcmQubW9iaWxlKXtcclxuXHRcdFx0XHRcdFx0aWYoKGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRMaW5lVGV4dCgpPT1cIlwiKSB8fCAoY29uY29yZEluc3RhbmNlLm9wLmdldExpbmVUZXh0KCk9PVwiPGJyPlwiKSl7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVsZXRlTGluZSgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZighY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmhhc0NsYXNzKFwiZGlydHlcIikpe1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmFkZENsYXNzKFwiZGlydHlcIik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZUxpbmUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA5OlxyXG5cdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0XHRcdFx0aWYoZXZlbnQuc2hpZnRLZXkpIHtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJlb3JnKGxlZnQpXHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJlb3JnKHJpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDY1OlxyXG5cdFx0XHRcdFx0Ly9DTUQrQVxyXG5cdFx0XHRcdFx0XHRpZihjb21tYW5kS2V5KSB7XHJcblx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ3NlbGVjdEFsbCcsZmFsc2UsbnVsbCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5zZWxlY3Rpb25Nb2RlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnNvci5wYXJlbnQoKS5jaGlsZHJlbigpLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgODU6XHJcblx0XHRcdFx0XHQvL0NNRCtVXHJcblx0XHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AucmVvcmcodXApO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA2ODpcclxuXHRcdFx0XHRcdC8vQ01EK0RcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5yZW9yZyhkb3duKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDc2OlxyXG5cdFx0XHRcdFx0Ly9DTUQrTFxyXG5cdFx0XHRcdFx0XHRpZihjb21tYW5kS2V5KSB7XHJcblx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJlb3JnKGxlZnQpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA4MjpcclxuXHRcdFx0XHRcdC8vQ01EK1JcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5yZW9yZyhyaWdodCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDIxOTpcclxuXHRcdFx0XHRcdC8vQ01EK1tcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5wcm9tb3RlKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDIyMTpcclxuXHRcdFx0XHRcdC8vQ01EK11cclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5kZW1vdGUoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTM6XHJcblx0XHRcdFx0XHRpZihjb25jb3JkLm1vYmlsZSl7XHJcblx0XHRcdFx0XHRcdC8vTW9iaWxlXHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdHZhciBjdXJzb3IgPSBjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdHZhciBjbG9uZWRDdXJzb3IgPSBjdXJzb3IuY2xvbmUodHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdGNsb25lZEN1cnNvci5yZW1vdmVDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpO1xyXG5cdFx0XHRcdFx0XHRjdXJzb3IucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuXHRcdFx0XHRcdFx0Y3Vyc29yLnJlbW92ZUNsYXNzKFwiZGlydHlcIik7XHJcblx0XHRcdFx0XHRcdGN1cnNvci5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldExpbmVUZXh0KFwiXCIpO1xyXG5cdFx0XHRcdFx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tY2FyZXQtcmlnaHRcXFwiPjxcIitcIi9pPlwiO1xyXG5cdFx0XHRcdFx0XHRjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLm5vZGUtaWNvblwiKS5yZXBsYWNlV2l0aChpY29uKTtcclxuXHRcdFx0XHRcdFx0Y2xvbmVkQ3Vyc29yLmluc2VydEJlZm9yZShjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuYXR0cmlidXRlcy5tYWtlRW1wdHkoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZVN1YnMoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmZvY3VzQ3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEluc2VydFwiLCBjb25jb3JkSW5zdGFuY2Uub3Auc2V0Q3Vyc29yQ29udGV4dChjdXJzb3IpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0aWYoZXZlbnQub3JpZ2luYWxFdmVudCAmJiAoKGV2ZW50Lm9yaWdpbmFsRXZlbnQua2V5TG9jYXRpb24gJiYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQua2V5TG9jYXRpb24gIT0gMCkpIHx8IChldmVudC5vcmlnaW5hbEV2ZW50LmxvY2F0aW9uICYmIChldmVudC5vcmlnaW5hbEV2ZW50LmxvY2F0aW9uICE9IDApKSkgKXtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2V0VGV4dE1vZGUoIWNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IGRvd247XHJcblx0XHRcdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3Auc3Vic0V4cGFuZGVkKCkpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRkaXJlY3Rpb249cmlnaHQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLm9wLmluc2VydChcIlwiLCBkaXJlY3Rpb24pO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldFRleHRNb2RlKHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmZvY3VzQ3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzc6XHJcblx0XHRcdFx0XHQvLyBsZWZ0XHJcblx0XHRcdFx0XHRcdHZhciBhY3RpdmUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoJChldmVudC50YXJnZXQpLmhhc0NsYXNzKFwiY29uY29yZC10ZXh0XCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYoZXZlbnQudGFyZ2V0LnNlbGVjdGlvblN0YXJ0ID4gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZihjb250ZXh0LmZpbmQoXCIuY29uY29yZC1jdXJzb3Iuc2VsZWN0ZWRcIikubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHRhY3RpdmUgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYoYWN0aXZlKSB7XHJcblx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgcHJldiA9IGNvbmNvcmRJbnN0YW5jZS5vcC5fd2Fsa191cChjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKHByZXYpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3IocHJldik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM4OlxyXG5cdFx0XHRcdFx0Ly8gdXBcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBwcmV2ID0gY29uY29yZEluc3RhbmNlLm9wLl93YWxrX3VwKGN1cnNvcik7XHJcblx0XHRcdFx0XHRcdFx0aWYocHJldikge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldEN1cnNvcihwcmV2KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5nbyh1cCwxLGV2ZW50LnNoaWZ0S2V5LCBjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzOTpcclxuXHRcdFx0XHRcdC8vIHJpZ2h0XHJcblx0XHRcdFx0XHRcdHZhciBhY3RpdmUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoY29udGV4dC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yLnNlbGVjdGVkXCIpLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0YWN0aXZlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmKGFjdGl2ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBuZXh0ID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBmaXJzdENoaWxkID0gb3V0bGluZS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuZXh0ID0gZmlyc3RDaGlsZDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZighbmV4dCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGNvbmNvcmRJbnN0YW5jZS5vcC5fd2Fsa19kb3duKGN1cnNvcik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmKG5leHQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3IobmV4dCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0Ly8gZG93blxyXG5cdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdFx0XHRcdHZhciBuZXh0ID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBmaXJzdENoaWxkID0gb3V0bGluZS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuZXh0ID0gZmlyc3RDaGlsZDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZighbmV4dCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGNvbmNvcmRJbnN0YW5jZS5vcC5fd2Fsa19kb3duKGN1cnNvcik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmKG5leHQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3IobmV4dCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ28oZG93biwxLCBldmVudC5zaGlmdEtleSwgY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNDY6XHJcblx0XHRcdFx0XHQvLyBkZWxldGVcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmKCFjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkuaGFzQ2xhc3MoXCJkaXJ0eVwiKSl7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2F2ZVN0YXRlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkuYWRkQ2xhc3MoXCJkaXJ0eVwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVsZXRlTGluZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDkwOlxyXG5cdFx0XHRcdFx0Ly9DTUQrWlxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC51bmRvKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgODg6XHJcblx0XHRcdFx0XHQvL0NNRCtYXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldExpbmVUZXh0KCk9PVwiXCIpe1xyXG5cdFx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVsZXRlTGluZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA2NzpcclxuXHRcdFx0XHRcdC8vQ01EK0NcclxuXHRcdFx0XHRcdGlmKGZhbHNlJiZjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldExpbmVUZXh0KCkhPVwiXCIpe1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnJvb3QucmVtb3ZlRGF0YShcImNsaXBib2FyZFwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmNvcHkoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA4NjpcclxuXHRcdFx0XHRcdC8vQ01EK1ZcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMjIwOlxyXG5cdFx0XHRcdFx0Ly8gQ01EK0JhY2tzbGFzaFxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5zY3JpcHQuaXNDb21tZW50KCkpe1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5zY3JpcHQudW5Db21tZW50KCk7XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uuc2NyaXB0Lm1ha2VDb21tZW50KCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNzM6XHJcblx0XHRcdFx0XHQvL0NNRCtJXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLml0YWxpYygpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDY2OlxyXG5cdFx0XHRcdFx0Ly9DTUQrQlxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5ib2xkKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTkyOlxyXG5cdFx0XHRcdFx0Ly9DTUQrYFxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRSZW5kZXJNb2RlKCFjb25jb3JkSW5zdGFuY2Uub3AuZ2V0UmVuZGVyTW9kZSgpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxODg6XHJcblx0XHRcdFx0XHQvL0NNRCssXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLnN1YnNFeHBhbmRlZCgpKXtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuY29sbGFwc2UoKTtcclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5leHBhbmQoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxOTE6XHJcblx0XHRcdFx0XHQvL0NNRCsvXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJ1blNlbGVjdGlvbigpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGlmKCFrZXlDYXB0dXJlZCkge1xyXG5cdFx0XHRcdGlmKChldmVudC53aGljaCA+PSAzMikgJiYgKChldmVudC53aGljaCA8IDExMikgfHwgKGV2ZW50LndoaWNoID4gMTIzKSkgJiYgKGV2ZW50LndoaWNoIDwgMTAwMCkgJiYgIWNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSkge1xyXG5cdFx0XHRcdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImRpcnR5XCIpKXtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2F2ZVN0YXRlKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiZGlydHlcIik7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldFRleHRNb2RlKHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zYXZlU3RhdGUoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmVkaXQobm9kZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0bm9kZS5hZGRDbGFzcyhcImRpcnR5XCIpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0JChkb2N1bWVudCkub24oXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKCQoXCIuY29uY29yZC1yb290XCIpLmxlbmd0aD09MCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYoICQoZXZlbnQudGFyZ2V0KS5pcyhcImFcIikgfHwgJChldmVudC50YXJnZXQpLmlzKFwiaW5wdXRcIikgfHwgJChldmVudC50YXJnZXQpLmlzKFwidGV4dGFyZWFcIikgfHwgKCQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKFwiYTpmaXJzdFwiKS5sZW5ndGg9PTEpIHx8ICQoZXZlbnQudGFyZ2V0KS5oYXNDbGFzcyhcImRyb3Bkb3duLW1lbnVcIikgfHwgKCQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKFwiLmRyb3Bkb3duLW1lbnU6Zmlyc3RcIikubGVuZ3RoPjApKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgY29udGV4dCA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKFwiLmNvbmNvcmQtcm9vdDpmaXJzdFwiKTtcclxuXHRcdGlmKGNvbnRleHQubGVuZ3RoID09IDApIHtcclxuXHRcdFx0JChcIi5jb25jb3JkLXJvb3RcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gbmV3IENvbmNvcmRPdXRsaW5lKCQodGhpcykucGFyZW50KCksIG51bGwsIGNvbmNvcmQpO1xyXG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XHJcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5kcmFnTW9kZUV4aXQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0dmFyIGZvY3VzUm9vdCA9IGNvbmNvcmQuZ2V0Rm9jdXNSb290KCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdCQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgY29uY29yZC51cGRhdGVGb2N1c1Jvb3RFdmVudCk7XHJcblx0JChkb2N1bWVudCkub24oXCJkYmxjbGlja1wiLCBjb25jb3JkLnVwZGF0ZUZvY3VzUm9vdEV2ZW50KTtcclxuXHQkKGRvY3VtZW50KS5vbignc2hvdycsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYoJChlLnRhcmdldCkuaXMoXCIubW9kYWxcIikpe1xyXG5cdFx0XHRpZigkKGUudGFyZ2V0KS5hdHRyKFwiY29uY29yZC1ldmVudHNcIikgIT0gXCJ0cnVlXCIpe1xyXG5cdFx0XHRcdGNvbmNvcmQuc3RvcExpc3RlbmluZygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0JChkb2N1bWVudCkub24oJ2hpZGRlbicsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYoJChlLnRhcmdldCkuaXMoXCIubW9kYWxcIikpe1xyXG5cdFx0XHRpZigkKGUudGFyZ2V0KS5hdHRyKFwiY29uY29yZC1ldmVudHNcIikgIT0gXCJ0cnVlXCIpe1xyXG5cdFx0XHRcdGNvbmNvcmQucmVzdW1lTGlzdGVuaW5nKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRjb25jb3JkLnJlYWR5PXRydWU7XHJcblx0fSkoalF1ZXJ5KTtcclxuIiwidmFyIFhNTF9DSEFSX01BUCA9IHtcbiAgXCI8XCIgOiBcIiZsdDtcIixcbiAgXCI+XCIgOiBcIiZndDtcIixcbiAgXCImXCIgOiBcIiZhbXA7XCIsXG4gIFwiXFxcIlwiOiBcIiZxdW90O1wiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXNjYXBlWG1sOiBmdW5jdGlvbiAocykge1xuICAgIHMgPSBzLnRvU3RyaW5nKCk7XG4gICAgcyA9IHMucmVwbGFjZSgvXFx1MDBBMC9nLCBcIiBcIik7XG4gICAgdmFyIGVzY2FwZWQgPSBzLnJlcGxhY2UoL1s8PiZcIl0vZywgZnVuY3Rpb24gKGNoKSB7XG4gICAgICByZXR1cm4gWE1MX0NIQVJfTUFQW2NoXTtcbiAgICB9KTtcblxuICAgIHJldHVybiBlc2NhcGVkO1xuICB9XG59O1xuIl19
