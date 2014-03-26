var $ = require("jquery/dist/jquery");

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
