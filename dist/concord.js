(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright 2013, Small Picture, Inc.
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
				var c = new ConcordOutline(r.parent());
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
				var c = new ConcordOutline(r.parent());
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
		var concordInstance = new ConcordOutline(root.parent());
		if((origRoot!=null) && !(origRoot[0]===root[0])){
			var origConcordInstance = new ConcordOutline(origRoot.parent());
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
var XML_CHAR_MAP = {
	'<': '&lt;',
	'>': '&gt;',
	'&': '&amp;',
	'"': '&'+'quot;'
	};
var ConcordUtil = {
	escapeXml: function(s) {
		s = s.toString();
		s = s.replace(/\u00A0/g, " ");
		var escaped = s.replace(/[<>&"]/g, function(ch) {
			return XML_CHAR_MAP[ch];
			});
		return escaped;
		}
	};
function ConcordOutline(container, options) {
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
function Op(opmltext){
	var fakeDom = $("<div></div>");
	fakeDom.concord().op.xmlToOutline(opmltext);
	return fakeDom.concord().op;
	}
(function($) {
	$.fn.concord = function(options) {
		return new ConcordOutline($(this), options);
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
		var concordInstance = new ConcordOutline(context.parent());
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
				var concordInstance = new ConcordOutline($(this).parent());
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS90ZWQvV29yay9jb25jb3JkL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90ZWQvV29yay9jb25jb3JkL2NvbmNvcmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDb3B5cmlnaHQgMjAxMywgU21hbGwgUGljdHVyZSwgSW5jLlxyXG4kKGZ1bmN0aW9uICgpIHtcclxuXHRpZigkLmZuLnRvb2x0aXAgIT09IHVuZGVmaW5lZCl7XHJcblx0XHQkKFwiYVtyZWw9dG9vbHRpcF1cIikudG9vbHRpcCh7XHJcblx0XHRcdGxpdmU6IHRydWVcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9KVxyXG4kKGZ1bmN0aW9uICgpIHsgXHJcblx0aWYoJC5mbi5wb3BvdmVyICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0JChcImFbcmVsPXBvcG92ZXJdXCIpLm9uKFwibW91c2VlbnRlciBtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCl7JCh0aGlzKS5wb3BvdmVyKFwidG9nZ2xlXCIpfSlcclxuXHRcdH1cclxuXHR9KVxyXG5pZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XHJcblx0QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihvYmosIHN0YXJ0KSB7XHJcblx0XHRmb3IgKHZhciBpID0gKHN0YXJ0IHx8IDApLCBqID0gdGhpcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuXHRcdFx0aWYgKHRoaXNbaV0gPT09IG9iaikgeyByZXR1cm4gaTsgfVxyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gLTE7XHJcblx0XHR9XHJcblx0fVxyXG52YXIgY29uY29yZCA9IHtcclxuXHR2ZXJzaW9uOiBcIjMuMC4wXCIsXHJcblx0bW9iaWxlOiAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLFxyXG5cdHJlYWR5OiBmYWxzZSxcclxuXHRoYW5kbGVFdmVudHM6IHRydWUsXHJcblx0cmVzdW1lQ2FsbGJhY2tzOiBbXSxcclxuXHRvblJlc3VtZTogZnVuY3Rpb24oY2Ipe1xyXG5cdFx0dGhpcy5yZXN1bWVDYWxsYmFja3MucHVzaChjYik7XHJcblx0XHR9LFxyXG5cdHJlc3VtZUxpc3RlbmluZzogZnVuY3Rpb24oKXtcclxuXHRcdGlmKCF0aGlzLmhhbmRsZUV2ZW50cyl7XHJcblx0XHRcdHRoaXMuaGFuZGxlRXZlbnRzPXRydWU7XHJcblx0XHRcdHZhciByID0gdGhpcy5nZXRGb2N1c1Jvb3QoKTtcclxuXHRcdFx0aWYociE9bnVsbCl7XHJcblx0XHRcdFx0dmFyIGMgPSBuZXcgQ29uY29yZE91dGxpbmUoci5wYXJlbnQoKSk7XHJcblx0XHRcdFx0aWYoYy5vcC5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdFx0Yy5vcC5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdFx0Yy5lZGl0b3IucmVzdG9yZVNlbGVjdGlvbigpO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdGMucGFzdGVCaW5Gb2N1cygpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yKHZhciBpIGluIHRoaXMucmVzdW1lQ2FsbGJhY2tzKXtcclxuXHRcdFx0XHRcdHZhciBjYiA9IHRoaXMucmVzdW1lQ2FsbGJhY2tzW2ldO1xyXG5cdFx0XHRcdFx0Y2IoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLnJlc3VtZUNhbGxiYWNrcz1bXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0c3RvcExpc3RlbmluZzogZnVuY3Rpb24oKXtcclxuXHRcdGlmKHRoaXMuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0dGhpcy5oYW5kbGVFdmVudHM9ZmFsc2U7XHJcblx0XHRcdHZhciByID0gdGhpcy5nZXRGb2N1c1Jvb3QoKTtcclxuXHRcdFx0aWYociE9bnVsbCl7XHJcblx0XHRcdFx0dmFyIGMgPSBuZXcgQ29uY29yZE91dGxpbmUoci5wYXJlbnQoKSk7XHJcblx0XHRcdFx0aWYoYy5vcC5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdFx0Yy5lZGl0b3Iuc2F2ZVNlbGVjdGlvbigpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRmb2N1c1Jvb3Q6IG51bGwsXHJcblx0Z2V0Rm9jdXNSb290OiBmdW5jdGlvbigpe1xyXG5cdFx0aWYoJChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZVwiKS5sZW5ndGg9PTEpe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5zZXRGb2N1c1Jvb3QoJChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZTpmaXJzdFwiKSk7XHJcblx0XHRcdH1cclxuXHRcdGlmKCQoXCIubW9kYWxcIikuaXMoXCI6dmlzaWJsZVwiKSl7XHJcblx0XHRcdGlmKCQoXCIubW9kYWxcIikuZmluZChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZTpmaXJzdFwiKS5sZW5ndGg9PTEpe1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLnNldEZvY3VzUm9vdCgkKFwiLm1vZGFsXCIpLmZpbmQoXCIuY29uY29yZC1yb290OnZpc2libGU6Zmlyc3RcIikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0aWYodGhpcy5mb2N1c1Jvb3Q9PW51bGwpe1xyXG5cdFx0XHRpZigkKFwiLmNvbmNvcmQtcm9vdDp2aXNpYmxlXCIpLmxlbmd0aD4wKXtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRGb2N1c1Jvb3QoJChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZTpmaXJzdFwiKSk7XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0aWYoIXRoaXMuZm9jdXNSb290LmlzKFwiOnZpc2libGVcIikpe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5zZXRGb2N1c1Jvb3QoJChcIi5jb25jb3JkLXJvb3Q6dmlzaWJsZTpmaXJzdFwiKSk7XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiB0aGlzLmZvY3VzUm9vdDtcclxuXHRcdH0sXHJcblx0c2V0Rm9jdXNSb290OiBmdW5jdGlvbihyb290KXtcclxuXHRcdHZhciBvcmlnUm9vdCA9IHRoaXMuZm9jdXNSb290O1xyXG5cdFx0dmFyIGNvbmNvcmRJbnN0YW5jZSA9IG5ldyBDb25jb3JkT3V0bGluZShyb290LnBhcmVudCgpKTtcclxuXHRcdGlmKChvcmlnUm9vdCE9bnVsbCkgJiYgIShvcmlnUm9vdFswXT09PXJvb3RbMF0pKXtcclxuXHRcdFx0dmFyIG9yaWdDb25jb3JkSW5zdGFuY2UgPSBuZXcgQ29uY29yZE91dGxpbmUob3JpZ1Jvb3QucGFyZW50KCkpO1xyXG5cdFx0XHRvcmlnQ29uY29yZEluc3RhbmNlLmVkaXRvci5oaWRlQ29udGV4dE1lbnUoKTtcclxuXHRcdFx0b3JpZ0NvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZHJhZ01vZGVFeGl0KCk7XHJcblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdHRoaXMuZm9jdXNSb290ID0gcm9vdDtcclxuXHRcdHJldHVybiB0aGlzLmZvY3VzUm9vdDtcclxuXHRcdH0sXHJcblx0dXBkYXRlRm9jdXNSb290RXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdHZhciByb290ID0gJChldmVudC50YXJnZXQpLnBhcmVudHMoXCIuY29uY29yZC1yb290OmZpcnN0XCIpO1xyXG5cdFx0aWYocm9vdC5sZW5ndGg9PTEpe1xyXG5cdFx0XHRjb25jb3JkLnNldEZvY3VzUm9vdChyb290KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcbnZhciBjb25jb3JkRW52aXJvbm1lbnQgPSB7XHJcblx0XCJ2ZXJzaW9uXCIgOiBjb25jb3JkLnZlcnNpb25cclxuXHR9O1xyXG52YXIgY29uY29yZENsaXBib2FyZCA9IHVuZGVmaW5lZDtcclxualF1ZXJ5LmZuLnJldmVyc2UgPSBbXS5yZXZlcnNlO1xyXG4vL0NvbnN0YW50c1xyXG5cdHZhciBuaWwgPSBudWxsO1xyXG5cdHZhciBpbmZpbml0eSA9IE51bWJlci5NQVhfVkFMVUU7XHJcblx0dmFyIGRvd24gPSBcImRvd25cIjtcclxuXHR2YXIgbGVmdCA9IFwibGVmdFwiO1xyXG5cdHZhciByaWdodCA9IFwicmlnaHRcIjtcclxuXHR2YXIgdXAgPSBcInVwXCI7XHJcblx0dmFyIGZsYXR1cCA9IFwiZmxhdHVwXCI7XHJcblx0dmFyIGZsYXRkb3duID0gXCJmbGF0ZG93blwiO1xyXG5cdHZhciBub2RpcmVjdGlvbiA9IFwibm9kaXJlY3Rpb25cIjtcclxudmFyIFhNTF9DSEFSX01BUCA9IHtcclxuXHQnPCc6ICcmbHQ7JyxcclxuXHQnPic6ICcmZ3Q7JyxcclxuXHQnJic6ICcmYW1wOycsXHJcblx0J1wiJzogJyYnKydxdW90OydcclxuXHR9O1xyXG52YXIgQ29uY29yZFV0aWwgPSB7XHJcblx0ZXNjYXBlWG1sOiBmdW5jdGlvbihzKSB7XHJcblx0XHRzID0gcy50b1N0cmluZygpO1xyXG5cdFx0cyA9IHMucmVwbGFjZSgvXFx1MDBBMC9nLCBcIiBcIik7XHJcblx0XHR2YXIgZXNjYXBlZCA9IHMucmVwbGFjZSgvWzw+JlwiXS9nLCBmdW5jdGlvbihjaCkge1xyXG5cdFx0XHRyZXR1cm4gWE1MX0NIQVJfTUFQW2NoXTtcclxuXHRcdFx0fSk7XHJcblx0XHRyZXR1cm4gZXNjYXBlZDtcclxuXHRcdH1cclxuXHR9O1xyXG5mdW5jdGlvbiBDb25jb3JkT3V0bGluZShjb250YWluZXIsIG9wdGlvbnMpIHtcclxuXHR0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuXHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cdHRoaXMuaWQgPSBudWxsO1xyXG5cdHRoaXMucm9vdCA9IG51bGw7XHJcblx0dGhpcy5lZGl0b3IgPSBudWxsO1xyXG5cdHRoaXMub3AgPSBudWxsO1xyXG5cdHRoaXMuc2NyaXB0ID0gbnVsbDtcclxuXHR0aGlzLnBhc3RlQmluID0gbnVsbDtcclxuXHR0aGlzLnBhc3RlQmluRm9jdXMgPSBmdW5jdGlvbigpe1xyXG5cdFx0aWYoIWNvbmNvcmQucmVhZHkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmQubW9iaWxlKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZih0aGlzLnJvb3QuaXMoXCI6dmlzaWJsZVwiKSl7XHJcblx0XHRcdHZhciBub2RlID0gdGhpcy5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0dmFyIG5vZGVPZmZzZXQgPSBub2RlLm9mZnNldCgpO1xyXG5cdFx0XHR0aGlzLnBhc3RlQmluLm9mZnNldChub2RlT2Zmc2V0KTtcclxuXHRcdFx0dGhpcy5wYXN0ZUJpbi5jc3MoXCJ6LWluZGV4XCIsXCIxMDAwXCIpO1xyXG5cdFx0XHRpZigodGhpcy5wYXN0ZUJpbi50ZXh0KCk9PVwiXCIpfHwodGhpcy5wYXN0ZUJpbi50ZXh0KCk9PVwiXFxuXCIpKXtcclxuXHRcdFx0XHR0aGlzLnBhc3RlQmluLnRleHQoXCIuLi5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR0aGlzLm9wLmZvY3VzQ3Vyc29yKCk7XHJcblx0XHRcdHRoaXMucGFzdGVCaW4uZm9jdXMoKTtcclxuXHRcdFx0aWYodGhpcy5wYXN0ZUJpblswXSA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCl7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdHRoaXMuY2FsbGJhY2tzID0gZnVuY3Rpb24oY2FsbGJhY2tzKSB7XHJcblx0XHRpZihjYWxsYmFja3MpIHtcclxuXHRcdFx0dGhpcy5yb290LmRhdGEoXCJjYWxsYmFja3NcIiwgY2FsbGJhY2tzKTtcclxuXHRcdFx0cmV0dXJuIGNhbGxiYWNrcztcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmKHRoaXMucm9vdC5kYXRhKFwiY2FsbGJhY2tzXCIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMucm9vdC5kYXRhKFwiY2FsbGJhY2tzXCIpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4ge307XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5maXJlQ2FsbGJhY2sgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xyXG5cdFx0dmFyIGNiID0gdGhpcy5jYWxsYmFja3MoKVtuYW1lXVxyXG5cdFx0aWYoY2IpIHtcclxuXHRcdFx0Y2IodmFsdWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdHRoaXMucHJlZnMgPSBmdW5jdGlvbihuZXdwcmVmcykge1xyXG5cdFx0dmFyIHByZWZzID0gdGhpcy5yb290LmRhdGEoXCJwcmVmc1wiKTtcclxuXHRcdGlmKHByZWZzID09IHVuZGVmaW5lZCl7XHJcblx0XHRcdHByZWZzID0ge307XHJcblx0XHRcdH1cclxuXHRcdGlmKG5ld3ByZWZzKSB7XHJcblx0XHRcdGZvcih2YXIga2V5IGluIG5ld3ByZWZzKXtcclxuXHRcdFx0XHRwcmVmc1trZXldID0gbmV3cHJlZnNba2V5XTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdHRoaXMucm9vdC5kYXRhKFwicHJlZnNcIiwgcHJlZnMpO1xyXG5cdFx0XHRpZihwcmVmcy5yZWFkb25seSl7XHJcblx0XHRcdFx0dGhpcy5yb290LmFkZENsYXNzKFwicmVhZG9ubHlcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZihwcmVmcy5yZW5kZXJNb2RlIT09dW5kZWZpbmVkKXtcclxuXHRcdFx0XHR0aGlzLnJvb3QuZGF0YShcInJlbmRlck1vZGVcIiwgcHJlZnMucmVuZGVyTW9kZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZihwcmVmcy5jb250ZXh0TWVudSl7XHJcblx0XHRcdFx0JChwcmVmcy5jb250ZXh0TWVudSkuaGlkZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0dmFyIHN0eWxlID0ge307XHJcblx0XHRcdGlmKHByZWZzLm91dGxpbmVGb250KSB7XHJcblx0XHRcdFx0c3R5bGVbXCJmb250LWZhbWlseVwiXSA9IHByZWZzLm91dGxpbmVGb250O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYocHJlZnMub3V0bGluZUZvbnRTaXplKSB7XHJcblx0XHRcdFx0cHJlZnMub3V0bGluZUZvbnRTaXplID0gcGFyc2VJbnQocHJlZnMub3V0bGluZUZvbnRTaXplKTtcclxuXHRcdFx0XHRzdHlsZVtcImZvbnQtc2l6ZVwiXSA9IHByZWZzLm91dGxpbmVGb250U2l6ZSArIFwicHhcIjtcclxuXHRcdFx0XHRzdHlsZVtcIm1pbi1oZWlnaHRcIl0gPSAocHJlZnMub3V0bGluZUZvbnRTaXplICsgNikgKyBcInB4XCI7XHJcblx0XHRcdFx0c3R5bGVbXCJsaW5lLWhlaWdodFwiXSA9IChwcmVmcy5vdXRsaW5lRm9udFNpemUgKyA2KSArIFwicHhcIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGlmKHByZWZzLm91dGxpbmVMaW5lSGVpZ2h0KSB7XHJcblx0XHRcdFx0cHJlZnMub3V0bGluZUxpbmVIZWlnaHQgPSBwYXJzZUludChwcmVmcy5vdXRsaW5lTGluZUhlaWdodCk7XHJcblx0XHRcdFx0c3R5bGVbXCJtaW4taGVpZ2h0XCJdID0gcHJlZnMub3V0bGluZUxpbmVIZWlnaHQgKyBcInB4XCI7XHJcblx0XHRcdFx0c3R5bGVbXCJsaW5lLWhlaWdodFwiXSA9IHByZWZzLm91dGxpbmVMaW5lSGVpZ2h0ICsgXCJweFwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0dGhpcy5yb290LnBhcmVudCgpLmZpbmQoXCJzdHlsZS5wcmVmc1N0eWxlXCIpLnJlbW92ZSgpO1xyXG5cdFx0XHR2YXIgY3NzID0gJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIiBjbGFzcz1cInByZWZzU3R5bGVcIj5cXG4nO1xyXG5cdFx0XHR2YXIgY3NzSWQ9XCJcIjtcclxuXHRcdFx0aWYodGhpcy5yb290LnBhcmVudCgpLmF0dHIoXCJpZFwiKSl7XHJcblx0XHRcdFx0Y3NzSWQ9XCIjXCIrdGhpcy5yb290LnBhcmVudCgpLmF0dHIoXCJpZFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGNzcyArPSBjc3NJZCArICcgLmNvbmNvcmQgLmNvbmNvcmQtbm9kZSAuY29uY29yZC13cmFwcGVyIC5jb25jb3JkLXRleHQgeyc7XHJcblx0XHRcdGZvcih2YXIgYXR0cmlidXRlIGluIHN0eWxlKSB7XHJcblx0XHRcdFx0Y3NzICs9IGF0dHJpYnV0ZSArICc6ICcgKyBzdHlsZVthdHRyaWJ1dGVdICsgJzsnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0Y3NzICs9ICd9XFxuJztcclxuXHRcdFx0Y3NzICs9IGNzc0lkICsgJyAuY29uY29yZCAuY29uY29yZC1ub2RlIC5jb25jb3JkLXdyYXBwZXIgLm5vZGUtaWNvbiB7JztcclxuXHRcdFx0Zm9yKHZhciBhdHRyaWJ1dGUgaW4gc3R5bGUpIHtcclxuXHRcdFx0XHRpZihhdHRyaWJ1dGUhPVwiZm9udC1mYW1pbHlcIil7XHJcblx0XHRcdFx0XHRjc3MgKz0gYXR0cmlidXRlICsgJzogJyArIHN0eWxlW2F0dHJpYnV0ZV0gKyAnOyc7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRjc3MgKz0gJ31cXG4nXHJcblx0XHRcdHZhciB3cmFwcGVyUGFkZGluZ0xlZnQgPSBwcmVmcy5vdXRsaW5lTGluZUhlaWdodDtcclxuXHRcdFx0aWYod3JhcHBlclBhZGRpbmdMZWZ0PT09dW5kZWZpbmVkKXtcclxuXHRcdFx0XHR3cmFwcGVyUGFkZGluZ0xlZnQgPSBwcmVmcy5vdXRsaW5lRm9udFNpemU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZih3cmFwcGVyUGFkZGluZ0xlZnQhPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRjc3MgKz0gY3NzSWQgKyAnIC5jb25jb3JkIC5jb25jb3JkLW5vZGUgLmNvbmNvcmQtd3JhcHBlciB7JztcclxuXHRcdFx0XHRjc3MgKz0gXCJwYWRkaW5nLWxlZnQ6IFwiICsgd3JhcHBlclBhZGRpbmdMZWZ0ICsgXCJweFwiO1xyXG5cdFx0XHRcdGNzcyArPSBcIn1cXG5cIjtcclxuXHRcdFx0XHRjc3MgKz0gY3NzSWQgKyAnIC5jb25jb3JkIG9sIHsnO1xyXG5cdFx0XHRcdGNzcyArPSBcInBhZGRpbmctbGVmdDogXCIgKyB3cmFwcGVyUGFkZGluZ0xlZnQgKyBcInB4XCI7XHJcblx0XHRcdFx0Y3NzICs9IFwifVxcblwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0Y3NzICs9ICc8L3N0eWxlPlxcbic7XHJcblx0XHRcdHRoaXMucm9vdC5iZWZvcmUoY3NzKTtcclxuXHRcdFx0aWYobmV3cHJlZnMuY3NzKXtcclxuXHRcdFx0XHR0aGlzLm9wLnNldFN0eWxlKG5ld3ByZWZzLmNzcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gcHJlZnM7XHJcblx0XHR9O1xyXG5cdHRoaXMuYWZ0ZXJJbml0ID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLmVkaXRvciA9IG5ldyBDb25jb3JkRWRpdG9yKHRoaXMucm9vdCwgdGhpcyk7XHJcblx0XHR0aGlzLm9wID0gbmV3IENvbmNvcmRPcCh0aGlzLnJvb3QsIHRoaXMpO1xyXG5cdFx0dGhpcy5zY3JpcHQgPSBuZXcgQ29uY29yZFNjcmlwdCh0aGlzLnJvb3QsIHRoaXMpO1xyXG5cdFx0aWYob3B0aW9ucykge1xyXG5cdFx0XHRpZihvcHRpb25zLnByZWZzKSB7XHJcblx0XHRcdFx0dGhpcy5wcmVmcyhvcHRpb25zLnByZWZzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGlmKG9wdGlvbnMub3Blbikge1xyXG5cdFx0XHRcdHRoaXMucm9vdC5kYXRhKFwib3BlblwiLCBvcHRpb25zLm9wZW4pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYob3B0aW9ucy5zYXZlKSB7XHJcblx0XHRcdFx0dGhpcy5yb290LmRhdGEoXCJzYXZlXCIsIG9wdGlvbnMuc2F2ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZihvcHRpb25zLmNhbGxiYWNrcykge1xyXG5cdFx0XHRcdHRoaXMuY2FsbGJhY2tzKG9wdGlvbnMuY2FsbGJhY2tzKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGlmKG9wdGlvbnMuaWQpIHtcclxuXHRcdFx0XHR0aGlzLnJvb3QuZGF0YShcImlkXCIsIG9wdGlvbnMuaWQpO1xyXG5cdFx0XHRcdHRoaXMub3BlbigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmKCQoY29udGFpbmVyKS5maW5kKFwiLmNvbmNvcmQtcm9vdDpmaXJzdFwiKS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdHRoaXMucm9vdCA9ICQoY29udGFpbmVyKS5maW5kKFwiLmNvbmNvcmQtcm9vdDpmaXJzdFwiKTtcclxuXHRcdFx0dGhpcy5wYXN0ZUJpbiA9ICQoY29udGFpbmVyKS5maW5kKFwiLnBhc3RlQmluOmZpcnN0XCIpO1xyXG5cdFx0XHR0aGlzLmFmdGVySW5pdCgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdHZhciByb290ID0gJChcIjxvbD48L29sPlwiKTtcclxuXHRcdHJvb3QuYWRkQ2xhc3MoXCJjb25jb3JkIGNvbmNvcmQtcm9vdFwiKTtcclxuXHRcdHJvb3QuYXBwZW5kVG8oY29udGFpbmVyKTtcclxuXHRcdHRoaXMucm9vdCA9IHJvb3Q7XHJcblx0XHR2YXIgcGFzdGVCaW4gPSAkKCc8ZGl2IGNsYXNzPVwicGFzdGVCaW5cIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgc3R5bGU9XCJwb3NpdGlvbjogYWJzb2x1dGU7IGhlaWdodDogMXB4OyB3aWR0aDoxcHg7IG91dGxpbmU6bm9uZTsgb3ZlcmZsb3c6aGlkZGVuO1wiPjwvZGl2PicpO1xyXG5cdFx0cGFzdGVCaW4uYXBwZW5kVG8oY29udGFpbmVyKTtcclxuXHRcdHRoaXMucGFzdGVCaW4gPSBwYXN0ZUJpbjtcclxuXHRcdHRoaXMuYWZ0ZXJJbml0KCk7XHJcblx0XHR0aGlzLmV2ZW50cyA9IG5ldyBDb25jb3JkRXZlbnRzKHRoaXMucm9vdCwgdGhpcy5lZGl0b3IsIHRoaXMub3AsIHRoaXMpO1xyXG5cdFx0fTtcclxuXHR0aGlzW1wibmV3XCJdID0gZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLm9wLndpcGUoKTtcclxuXHRcdH07XHJcblx0dGhpcy5vcGVuID0gZnVuY3Rpb24oY2IpIHtcclxuXHRcdHZhciBvcG1sSWQgPSB0aGlzLnJvb3QuZGF0YShcImlkXCIpO1xyXG5cdFx0aWYoIW9wbWxJZCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdHZhciByb290ID0gdGhpcy5yb290O1xyXG5cdFx0dmFyIGVkaXRvciA9IHRoaXMuZWRpdG9yO1xyXG5cdFx0dmFyIG9wID0gdGhpcy5vcDtcclxuXHRcdHZhciBvcGVuVXJsID0gXCJodHRwOi8vY29uY29yZC5zbWFsbHBpY3R1cmUuY29tL29wZW5cIjtcclxuXHRcdGlmKHJvb3QuZGF0YShcIm9wZW5cIikpIHtcclxuXHRcdFx0b3BlblVybCA9IHJvb3QuZGF0YShcIm9wZW5cIik7XHJcblx0XHRcdH1cclxuXHRcdHBhcmFtcyA9IHt9XHJcblx0XHRpZihvcG1sSWQubWF0Y2goL15odHRwLiskLykpIHtcclxuXHRcdFx0cGFyYW1zW1widXJsXCJdID0gb3BtbElkXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cGFyYW1zW1wiaWRcIl0gPSBvcG1sSWRcclxuXHRcdFx0XHR9XHJcblx0XHQkLmFqYXgoe1xyXG5cdFx0XHR0eXBlOiAnUE9TVCcsXHJcblx0XHRcdHVybDogb3BlblVybCxcclxuXHRcdFx0ZGF0YTogcGFyYW1zLFxyXG5cdFx0XHRkYXRhVHlwZTogXCJ4bWxcIixcclxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ob3BtbCkge1xyXG5cdFx0XHRcdGlmKG9wbWwpIHtcclxuXHRcdFx0XHRcdG9wLnhtbFRvT3V0bGluZShvcG1sKTtcclxuXHRcdFx0XHRcdGlmKGNiKSB7XHJcblx0XHRcdFx0XHRcdGNiKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRcdFx0b3Aud2lwZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9O1xyXG5cdHRoaXMuc2F2ZSA9IGZ1bmN0aW9uKGNiKSB7XHJcblx0XHR2YXIgb3BtbElkID0gdGhpcy5yb290LmRhdGEoXCJpZFwiKTtcclxuXHRcdGlmKG9wbWxJZCAmJiB0aGlzLm9wLmNoYW5nZWQoKSkge1xyXG5cdFx0XHR2YXIgc2F2ZVVybCA9IFwiaHR0cDovL2NvbmNvcmQuc21hbGxwaWN0dXJlLmNvbS9zYXZlXCI7XHJcblx0XHRcdGlmKHRoaXMucm9vdC5kYXRhKFwic2F2ZVwiKSkge1xyXG5cdFx0XHRcdHNhdmVVcmwgPSB0aGlzLnJvb3QuZGF0YShcInNhdmVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gdGhpcztcclxuXHRcdFx0dmFyIG9wbWwgPSB0aGlzLm9wLm91dGxpbmVUb1htbCgpO1xyXG5cdFx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHR5cGU6ICdQT1NUJyxcclxuXHRcdFx0XHR1cmw6IHNhdmVVcmwsXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0XCJvcG1sXCI6IG9wbWwsXHJcblx0XHRcdFx0XHRcImlkXCI6IG9wbWxJZFxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRkYXRhVHlwZTogXCJqc29uXCIsXHJcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oanNvbikge1xyXG5cdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmNsZWFyQ2hhbmdlZCgpO1xyXG5cdFx0XHRcdFx0aWYoY2IpIHtcclxuXHRcdFx0XHRcdFx0Y2IoanNvbik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzW1wiaW1wb3J0XCJdID0gZnVuY3Rpb24ob3BtbElkLCBjYikge1xyXG5cdFx0dmFyIG9wZW5VcmwgPSBcImh0dHA6Ly9jb25jb3Jkb2xkLnNtYWxscGljdHVyZS5jb20vb3BlblwiO1xyXG5cdFx0dmFyIHJvb3QgPSB0aGlzLnJvb3Q7XHJcblx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gdGhpcztcclxuXHRcdGlmKHJvb3QuZGF0YShcIm9wZW5cIikpIHtcclxuXHRcdFx0b3BlblVybCA9IHJvb3QuZGF0YShcIm9wZW5cIik7XHJcblx0XHRcdH1cclxuXHRcdHBhcmFtcyA9IHt9XHJcblx0XHRpZihvcG1sSWQubWF0Y2goL15odHRwLiskLykpIHtcclxuXHRcdFx0cGFyYW1zW1widXJsXCJdID0gb3BtbElkO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHBhcmFtc1tcImlkXCJdID0gb3BtbElkO1xyXG5cdFx0XHRcdH1cclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdHR5cGU6ICdQT1NUJyxcclxuXHRcdFx0dXJsOiBvcGVuVXJsLFxyXG5cdFx0XHRkYXRhOiBwYXJhbXMsXHJcblx0XHRcdGRhdGFUeXBlOiBcInhtbFwiLFxyXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihvcG1sKSB7XHJcblx0XHRcdFx0aWYob3BtbCkge1xyXG5cdFx0XHRcdFx0dmFyIGN1cnNvciA9IHJvb3QuZmluZChcIi5jb25jb3JkLWN1cnNvcjpmaXJzdFwiKTtcclxuXHRcdFx0XHRcdCQob3BtbCkuZmluZChcImJvZHlcIikuY2hpbGRyZW4oXCJvdXRsaW5lXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5idWlsZCgkKHRoaXMpKTtcclxuXHRcdFx0XHRcdFx0Y3Vyc29yLmFmdGVyKG5vZGUpO1xyXG5cdFx0XHRcdFx0XHRjdXJzb3IgPSBub2RlO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHRcdFx0aWYoY2IpIHtcclxuXHRcdFx0XHRcdFx0Y2IoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdGVycm9yOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHR0aGlzW1wiZXhwb3J0XCJdID0gZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgY29udGV4dCA9IHRoaXMucm9vdC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yOmZpcnN0XCIpO1xyXG5cdFx0aWYoY29udGV4dC5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRjb250ZXh0ID0gdGhpcy5yb290LmZpbmQoXCIuY29uY29yZC1yb290OmZpcnN0XCIpO1xyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5lZGl0b3Iub3BtbChjb250ZXh0KTtcclxuXHRcdH07XHJcblx0dGhpcy5pbml0KCk7XHJcblx0fVxyXG5mdW5jdGlvbiBDb25jb3JkRWRpdG9yKHJvb3QsIGNvbmNvcmRJbnN0YW5jZSkge1xyXG5cdHRoaXMubWFrZU5vZGUgPSBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIG5vZGUgPSAkKFwiPGxpPjwvbGk+XCIpO1xyXG5cdFx0bm9kZS5hZGRDbGFzcyhcImNvbmNvcmQtbm9kZVwiKTtcclxuXHRcdHZhciB3cmFwcGVyID0gJChcIjxkaXYgY2xhc3M9J2NvbmNvcmQtd3JhcHBlcic+PC9kaXY+XCIpO1xyXG5cdFx0dmFyIGljb25OYW1lPVwiY2FyZXQtcmlnaHRcIjtcclxuXHRcdHZhciBpY29uID0gXCI8aVwiK1wiIGNsYXNzPVxcXCJub2RlLWljb24gaWNvbi1cIisgaWNvbk5hbWUgK1wiXFxcIj48XCIrXCIvaT5cIjtcclxuXHRcdHdyYXBwZXIuYXBwZW5kKGljb24pO1xyXG5cdFx0d3JhcHBlci5hZGRDbGFzcyhcInR5cGUtaWNvblwiKTtcclxuXHRcdHZhciB0ZXh0ID0gJChcIjxkaXYgY2xhc3M9J2NvbmNvcmQtdGV4dCcgY29udGVudGVkaXRhYmxlPSd0cnVlJz48L2Rpdj5cIik7XHJcblx0XHR2YXIgb3V0bGluZSA9ICQoXCI8b2w+PC9vbD5cIik7XHJcblx0XHR0ZXh0LmFwcGVuZFRvKHdyYXBwZXIpO1xyXG5cdFx0d3JhcHBlci5hcHBlbmRUbyhub2RlKTtcclxuXHRcdG91dGxpbmUuYXBwZW5kVG8obm9kZSk7XHJcblx0XHRyZXR1cm4gbm9kZTtcclxuXHRcdH07XHJcblx0dGhpcy5kcmFnTW9kZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cm9vdC5kYXRhKFwiZHJhZ2dpbmdDaGFuZ2VcIiwgcm9vdC5jaGlsZHJlbigpLmNsb25lKHRydWUsIHRydWUpKTtcclxuXHRcdHJvb3QuYWRkQ2xhc3MoXCJkcmFnZ2luZ1wiKTtcclxuXHRcdHJvb3QuZGF0YShcImRyYWdnaW5nXCIsIHRydWUpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmRyYWdNb2RlRXhpdCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYocm9vdC5kYXRhKFwiZHJhZ2dpbmdcIikpIHtcclxuXHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVwiLCByb290LmRhdGEoXCJkcmFnZ2luZ0NoYW5nZVwiKSk7XHJcblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVRleHRNb2RlXCIsIGZhbHNlKTtcclxuXHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlUmFuZ2VcIiwgdW5kZWZpbmVkKTtcclxuXHRcdFx0fVxyXG5cdFx0cm9vdC5maW5kKFwiLmRyYWdnYWJsZVwiKS5yZW1vdmVDbGFzcyhcImRyYWdnYWJsZVwiKTtcclxuXHRcdHJvb3QuZmluZChcIi5kcm9wLXNpYmxpbmdcIikucmVtb3ZlQ2xhc3MoXCJkcm9wLXNpYmxpbmdcIik7XHJcblx0XHRyb290LmZpbmQoXCIuZHJvcC1jaGlsZFwiKS5yZW1vdmVDbGFzcyhcImRyb3AtY2hpbGRcIik7XHJcblx0XHRyb290LnJlbW92ZUNsYXNzKFwiZHJhZ2dpbmdcIik7XHJcblx0XHRyb290LmRhdGEoXCJkcmFnZ2luZ1wiLCBmYWxzZSk7XHJcblx0XHRyb290LmRhdGEoXCJtb3VzZWRvd25cIiwgZmFsc2UpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmVkaXQgPSBmdW5jdGlvbihub2RlLCBlbXB0eSkge1xyXG5cdFx0dmFyIHRleHQgPSBub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XHJcblx0XHRpZihlbXB0eSkge1xyXG5cdFx0XHR0ZXh0Lmh0bWwoXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdHRleHQuZm9jdXMoKTtcclxuXHRcdHZhciBlbCA9IHRleHQuZ2V0KDApO1xyXG5cdFx0aWYoZWwgJiYgZWwuY2hpbGROb2RlcyAmJiBlbC5jaGlsZE5vZGVzWzBdKXtcclxuXHRcdFx0aWYgKHR5cGVvZiB3aW5kb3cuZ2V0U2VsZWN0aW9uICE9IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZVJhbmdlICE9IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0XHQgICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcblx0XHRcdFx0ICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWwpO1xyXG5cdFx0XHRcdCAgICAgICAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xyXG5cdFx0XHRcdCAgICAgICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuXHRcdFx0XHQgICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcclxuXHRcdFx0XHQgICAgICAgIHNlbC5hZGRSYW5nZShyYW5nZSk7XHJcblx0XHRcdFx0ICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmJvZHkuY3JlYXRlVGV4dFJhbmdlICE9IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0XHRcdHZhciB0ZXh0UmFuZ2UgPSBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xyXG5cdFx0XHRcdFx0dGV4dFJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsKTtcclxuXHRcdFx0XHRcdHRleHRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XHJcblx0XHRcdFx0XHQgICAgICAgIHRleHRSYW5nZS5zZWxlY3QoKTtcclxuXHRcdFx0XHQgICAgfVxyXG5cdFx0XHR9XHJcblx0XHR0ZXh0LmFkZENsYXNzKFwiZWRpdGluZ1wiKTtcclxuXHRcdGlmKCFlbXB0eSl7XHJcblx0XHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGUuZGlydHlcIikubGVuZ3RoPjApe1xyXG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmVkaXRhYmxlID0gZnVuY3Rpb24odGFyZ2V0KSB7XHJcblx0XHR2YXIgZWRpdGFibGUgPSBmYWxzZTtcclxuXHRcdGlmKCF0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXRleHRcIikpIHtcclxuXHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xyXG5cdFx0XHR9XHJcblx0XHRpZih0YXJnZXQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0ZWRpdGFibGUgPSB0YXJnZXQuaGFzQ2xhc3MoXCJjb25jb3JkLXRleHRcIikgJiYgdGFyZ2V0Lmhhc0NsYXNzKFwiZWRpdGluZ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0cmV0dXJuIGVkaXRhYmxlO1xyXG5cdFx0fTtcclxuXHR0aGlzLmVkaXRvck1vZGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xyXG5cdFx0cm9vdC5maW5kKFwiLmVkaXRpbmdcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly8kKHRoaXMpLmJsdXIoKTtcclxuXHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcyhcImVkaXRpbmdcIik7XHJcblx0XHRcdH0pO1xyXG5cdFx0cm9vdC5maW5kKFwiLnNlbGVjdGlvbi10b29sYmFyXCIpLnJlbW92ZSgpO1xyXG5cdFx0fTtcclxuXHR0aGlzLm9wbWwgPSBmdW5jdGlvbihfcm9vdCwgZmxzdWJzb25seSkge1xyXG5cdFx0XHJcblx0XHRpZiAoZmxzdWJzb25seSA9PSB1bmRlZmluZWQpIHsgLy84LzUvMTMgYnkgRFdcclxuXHRcdFx0ZmxzdWJzb25seSA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcclxuXHRcdGlmKF9yb290KSB7XHJcblx0XHRcdHJvb3QgPSBfcm9vdDtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIHRpdGxlID0gcm9vdC5kYXRhKFwidGl0bGVcIik7XHJcblx0XHRpZighdGl0bGUpIHtcclxuXHRcdFx0aWYocm9vdC5oYXNDbGFzcyhcImNvbmNvcmQtbm9kZVwiKSkge1xyXG5cdFx0XHRcdHRpdGxlID0gcm9vdC5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLnRleHQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRpdGxlID0gXCJcIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdHZhciBvcG1sID0gJzw/eG1sIHZlcnNpb249XCIxLjBcIj8+XFxuJztcclxuXHRcdG9wbWwgKz0gJzxvcG1sIHZlcnNpb249XCIyLjBcIj5cXG4nO1xyXG5cdFx0b3BtbCArPSAnPGhlYWQ+XFxuJztcclxuXHRcdG9wbWwgKz0gJzx0aXRsZT4nICsgQ29uY29yZFV0aWwuZXNjYXBlWG1sKHRpdGxlKSArICc8L3RpdGxlPlxcbic7XHJcblx0XHRvcG1sICs9ICc8L2hlYWQ+XFxuJztcclxuXHRcdG9wbWwgKz0gJzxib2R5Plxcbic7XHJcblx0XHRpZihyb290Lmhhc0NsYXNzKFwiY29uY29yZC1jdXJzb3JcIikpIHtcclxuXHRcdFx0b3BtbCArPSB0aGlzLm9wbWxMaW5lKHJvb3QsIDAsIGZsc3Vic29ubHkpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHZhciBlZGl0b3IgPSB0aGlzO1xyXG5cdFx0XHRcdHJvb3QuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRvcG1sICs9IGVkaXRvci5vcG1sTGluZSgkKHRoaXMpKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdG9wbWwgKz0gJzwvYm9keT5cXG4nO1xyXG5cdFx0b3BtbCArPSAnPC9vcG1sPlxcbic7XHJcblx0XHRyZXR1cm4gb3BtbDtcclxuXHRcdH07XHJcblx0dGhpcy5vcG1sTGluZSA9IGZ1bmN0aW9uKG5vZGUsIGluZGVudCwgZmxzdWJzb25seSkge1xyXG5cdFx0aWYoaW5kZW50PT11bmRlZmluZWQpe1xyXG5cdFx0XHRpbmRlbnQ9MDtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoZmxzdWJzb25seSA9PSB1bmRlZmluZWQpIHsgLy84LzUvMTMgYnkgRFdcclxuXHRcdFx0ZmxzdWJzb25seSA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcclxuXHRcdHZhciB0ZXh0ID0gdGhpcy51bmVzY2FwZShub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIikuaHRtbCgpKTtcclxuXHRcdHZhciB0ZXh0TWF0Y2hlcyA9IHRleHQubWF0Y2goL14oLispPGJyPlxccyokLyk7XHJcblx0XHRpZih0ZXh0TWF0Y2hlcyl7XHJcblx0XHRcdHRleHQgPSB0ZXh0TWF0Y2hlc1sxXTtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIG9wbWwgPSAnJztcclxuXHRcdGZvcih2YXIgaT0wOyBpIDwgaW5kZW50O2krKyl7XHJcblx0XHRcdG9wbWwgKz0gJ1xcdCc7XHJcblx0XHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHN1YmhlYWRzOyBcclxuXHRcdGlmICghZmxzdWJzb25seSkgeyAvLzgvNS8xMyBieSBEV1xyXG5cdFx0XHRvcG1sICs9ICc8b3V0bGluZSB0ZXh0PVwiJyArIENvbmNvcmRVdGlsLmVzY2FwZVhtbCh0ZXh0KSArICdcIic7XHJcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gbm9kZS5kYXRhKFwiYXR0cmlidXRlc1wiKTtcclxuXHRcdFx0aWYoYXR0cmlidXRlcz09PXVuZGVmaW5lZCl7XHJcblx0XHRcdFx0YXR0cmlidXRlcz17fTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVzKXtcclxuXHRcdFx0XHRpZigobmFtZSE9PXVuZGVmaW5lZCkgJiYgKG5hbWUhPVwiXCIpICYmIChuYW1lICE9IFwidGV4dFwiKSkge1xyXG5cdFx0XHRcdFx0aWYoYXR0cmlidXRlc1tuYW1lXSE9PXVuZGVmaW5lZCl7XHJcblx0XHRcdFx0XHRcdG9wbWwgKz0gJyAnICsgbmFtZSArICc9XCInICsgQ29uY29yZFV0aWwuZXNjYXBlWG1sKGF0dHJpYnV0ZXNbbmFtZV0pICsgJ1wiJztcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0c3ViaGVhZHMgPSBub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpO1xyXG5cdFx0XHRpZihzdWJoZWFkcy5sZW5ndGg9PTApe1xyXG5cdFx0XHRcdG9wbWwrPVwiLz5cXG5cIjtcclxuXHRcdFx0XHRyZXR1cm4gb3BtbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdG9wbWwgKz0gXCI+XFxuXCI7XHJcblx0XHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRzdWJoZWFkcyA9IG5vZGUuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIik7XHJcblx0XHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGVkaXRvciA9IHRoaXM7XHJcblx0XHRpbmRlbnQrKztcclxuXHRcdHN1YmhlYWRzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdG9wbWwgKz0gZWRpdG9yLm9wbWxMaW5lKCQodGhpcyksIGluZGVudCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZiAoIWZsc3Vic29ubHkpIHsgLy84LzUvMTMgYnkgRFdcclxuXHRcdFx0Zm9yKHZhciBpPTA7IGkgPCBpbmRlbnQ7aSsrKXtcclxuXHRcdFx0XHRvcG1sICs9ICdcXHQnO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0b3BtbCArPSAnPC9vdXRsaW5lPlxcbic7XHJcblx0XHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9wbWw7XHJcblx0XHR9O1xyXG5cdHRoaXMudGV4dExpbmUgPSBmdW5jdGlvbihub2RlLCBpbmRlbnQpe1xyXG5cdFx0aWYoIWluZGVudCl7XHJcblx0XHRcdGluZGVudCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdHZhciB0ZXh0ID0gXCJcIjtcclxuXHRcdGZvcih2YXIgaT0wOyBpIDwgaW5kZW50O2krKyl7XHJcblx0XHRcdHRleHQgKz0gXCJcXHRcIjtcclxuXHRcdFx0fVxyXG5cdFx0dGV4dCArPSB0aGlzLnVuZXNjYXBlKG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS5odG1sKCkpO1xyXG5cdFx0dGV4dCArPSBcIlxcblwiO1xyXG5cdFx0dmFyIGVkaXRvciA9IHRoaXM7XHJcblx0XHRub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHRleHQgKz0gZWRpdG9yLnRleHRMaW5lKCQodGhpcyksIGluZGVudCsxKTtcclxuXHRcdFx0fSk7XHJcblx0XHRyZXR1cm4gdGV4dDtcclxuXHRcdH07XHJcblx0dGhpcy5zZWxlY3QgPSBmdW5jdGlvbihub2RlLCBtdWx0aXBsZSwgbXVsdGlwbGVSYW5nZSkge1xyXG5cdFx0aWYobXVsdGlwbGUgPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdG11bHRpcGxlID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdGlmKG11bHRpcGxlUmFuZ2UgPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdG11bHRpcGxlUmFuZ2UgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHR0aGlzLnNlbGVjdGlvbk1vZGUobXVsdGlwbGUpO1xyXG5cdFx0XHRpZihtdWx0aXBsZSl7XHJcblx0XHRcdFx0bm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZS5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xyXG5cdFx0XHRcdG5vZGUuZmluZChcIi5jb25jb3JkLW5vZGUuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGlmKG11bHRpcGxlICYmIG11bHRpcGxlUmFuZ2UpIHtcclxuXHRcdFx0XHR2YXIgcHJldk5vZGVzID0gbm9kZS5wcmV2QWxsKFwiLnNlbGVjdGVkXCIpO1xyXG5cdFx0XHRcdGlmKHByZXZOb2Rlcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHR2YXIgc3RhbXAgPSBmYWxzZTtcclxuXHRcdFx0XHRcdG5vZGUucHJldkFsbCgpLnJldmVyc2UoKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRpZigkKHRoaXMpLmhhc0NsYXNzKFwic2VsZWN0ZWRcIikpIHtcclxuXHRcdFx0XHRcdFx0XHRzdGFtcCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmKHN0YW1wKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dmFyIG5leHROb2RlcyA9IG5vZGUubmV4dEFsbChcIi5zZWxlY3RlZFwiKTtcclxuXHRcdFx0XHRcdFx0aWYobmV4dE5vZGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgc3RhbXAgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdG5vZGUubmV4dEFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZigkKHRoaXMpLmhhc0NsYXNzKFwic2VsZWN0ZWRcIikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0c3RhbXAgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmKHN0YW1wKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0dmFyIHRleHQgPSBub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XHJcblx0XHRcdGlmKHRleHQuaGFzQ2xhc3MoXCJlZGl0aW5nXCIpKSB7XHJcblx0XHRcdFx0dGV4dC5yZW1vdmVDbGFzcyhcImVkaXRpbmdcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHQvL3RleHQuYmx1cigpO1xyXG5cdFx0XHRub2RlLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XHJcblx0XHRcdGlmKHRleHQudGV4dCgpLmxlbmd0aD4wKXtcclxuXHRcdFx0XHQvL3Jvb3QuZGF0YShcImN1cnJlbnRDaGFuZ2VcIiwgcm9vdC5jaGlsZHJlbigpLmNsb25lKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0dGhpcy5kcmFnTW9kZUV4aXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZS5kaXJ0eVwiKS5sZW5ndGg+MCl7XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdHRoaXMuc2VsZWN0aW9uTW9kZSA9IGZ1bmN0aW9uKG11bHRpcGxlKSB7XHJcblx0XHRpZihtdWx0aXBsZSA9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0bXVsdGlwbGUgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIG5vZGUgPSByb290LmZpbmQoXCIuY29uY29yZC1jdXJzb3JcIik7XHJcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdHZhciB0ZXh0ID0gbm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xyXG5cdFx0XHRpZih0ZXh0Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0Ly90ZXh0LmJsdXIoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGlmKCFtdWx0aXBsZSkge1xyXG5cdFx0XHRyb290LmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuXHRcdFx0fVxyXG5cdFx0cm9vdC5maW5kKFwiLnNlbGVjdGlvbi10b29sYmFyXCIpLnJlbW92ZSgpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmJ1aWxkID0gZnVuY3Rpb24ob3V0bGluZSxjb2xsYXBzZWQsIGxldmVsKSB7XHJcblx0XHRpZighbGV2ZWwpe1xyXG5cdFx0XHRsZXZlbCA9IDE7XHJcblx0XHRcdH1cclxuXHRcdHZhciBub2RlID0gJChcIjxsaT48L2xpPlwiKTtcclxuXHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLW5vZGVcIik7XHJcblx0XHRub2RlLmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCk7XHJcblx0XHR2YXIgYXR0cmlidXRlcyA9IHt9O1xyXG5cdFx0JChvdXRsaW5lWzBdLmF0dHJpYnV0ZXMpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKHRoaXMubmFtZSAhPSAndGV4dCcpIHtcclxuXHRcdFx0XHRhdHRyaWJ1dGVzW3RoaXMubmFtZV0gPSB0aGlzLnZhbHVlO1xyXG5cdFx0XHRcdGlmKHRoaXMubmFtZT09XCJ0eXBlXCIpe1xyXG5cdFx0XHRcdFx0bm9kZS5hdHRyKFwib3BtbC1cIiArIHRoaXMubmFtZSwgdGhpcy52YWx1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdG5vZGUuZGF0YShcImF0dHJpYnV0ZXNcIiwgYXR0cmlidXRlcyk7XHJcblx0XHR2YXIgd3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXdyYXBwZXInPjwvZGl2PlwiKTtcclxuXHRcdHZhciBub2RlSWNvbiA9IGF0dHJpYnV0ZXNbXCJpY29uXCJdO1xyXG5cdFx0aWYoIW5vZGVJY29uKXtcclxuXHRcdFx0bm9kZUljb24gPSBhdHRyaWJ1dGVzW1widHlwZVwiXTtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIGljb25OYW1lPVwiY2FyZXQtcmlnaHRcIjtcclxuXHRcdGlmKG5vZGVJY29uKXtcclxuXHRcdFx0aWYoKG5vZGVJY29uPT1ub2RlLmF0dHIoXCJvcG1sLXR5cGVcIikpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29ucyAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbbm9kZUljb25dKXtcclxuXHRcdFx0XHRpY29uTmFtZSA9IGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29uc1tub2RlSWNvbl07XHJcblx0XHRcdFx0fWVsc2UgaWYgKG5vZGVJY29uPT1hdHRyaWJ1dGVzW1wiaWNvblwiXSl7XHJcblx0XHRcdFx0XHRpY29uTmFtZSA9IG5vZGVJY29uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tXCIrIGljb25OYW1lICtcIlxcXCI+PFwiK1wiL2k+XCI7XHJcblx0XHR3cmFwcGVyLmFwcGVuZChpY29uKTtcclxuXHRcdHdyYXBwZXIuYWRkQ2xhc3MoXCJ0eXBlLWljb25cIik7XHJcblx0XHRpZihhdHRyaWJ1dGVzW1wiaXNDb21tZW50XCJdPT1cInRydWVcIil7XHJcblx0XHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLWNvbW1lbnRcIik7XHJcblx0XHRcdH1cclxuXHRcdHZhciB0ZXh0ID0gJChcIjxkaXYgY2xhc3M9J2NvbmNvcmQtdGV4dCcgY29udGVudGVkaXRhYmxlPSd0cnVlJz48L2Rpdj5cIik7XHJcblx0XHR0ZXh0LmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCtcIi10ZXh0XCIpO1xyXG5cdFx0dGV4dC5odG1sKHRoaXMuZXNjYXBlKG91dGxpbmUuYXR0cigndGV4dCcpKSk7XHJcblx0XHRpZihhdHRyaWJ1dGVzW1wiY3NzVGV4dENsYXNzXCJdIT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dmFyIGNzc0NsYXNzZXMgPSBhdHRyaWJ1dGVzW1wiY3NzVGV4dENsYXNzXCJdLnNwbGl0KC9cXHMrLyk7XHJcblx0XHRcdGZvcih2YXIgYyBpbiBjc3NDbGFzc2VzKXtcclxuXHRcdFx0XHR2YXIgbmV3Q2xhc3MgPSBjc3NDbGFzc2VzW2NdO1xyXG5cdFx0XHRcdHRleHQuYWRkQ2xhc3MobmV3Q2xhc3MpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0dmFyIGNoaWxkcmVuID0gJChcIjxvbD48L29sPlwiKTtcclxuXHRcdHZhciBlZGl0b3IgPSB0aGlzO1xyXG5cdFx0b3V0bGluZS5jaGlsZHJlbihcIm91dGxpbmVcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGNoaWxkID0gZWRpdG9yLmJ1aWxkKCQodGhpcyksIGNvbGxhcHNlZCwgbGV2ZWwrMSk7XHJcblx0XHRcdGNoaWxkLmFwcGVuZFRvKGNoaWxkcmVuKTtcclxuXHRcdFx0fSk7XHJcblx0XHRpZihjb2xsYXBzZWQpe1xyXG5cdFx0XHRpZihvdXRsaW5lLmNoaWxkcmVuKFwib3V0bGluZVwiKS5zaXplKCk+MCl7XHJcblx0XHRcdFx0bm9kZS5hZGRDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdHRleHQuYXBwZW5kVG8od3JhcHBlcik7XHJcblx0XHR3cmFwcGVyLmFwcGVuZFRvKG5vZGUpO1xyXG5cdFx0Y2hpbGRyZW4uYXBwZW5kVG8obm9kZSk7XHJcblx0XHRyZXR1cm4gbm9kZTtcclxuXHRcdH07XHJcblx0dGhpcy5oaWRlQ29udGV4dE1lbnUgPSBmdW5jdGlvbigpe1xyXG5cdFx0aWYocm9vdC5kYXRhKFwiZHJvcGRvd25cIikpe1xyXG5cdFx0XHRyb290LmRhdGEoXCJkcm9wZG93blwiKS5oaWRlKCk7XHJcblx0XHRcdHJvb3QuZGF0YShcImRyb3Bkb3duXCIpLnJlbW92ZSgpO1xyXG5cdFx0XHRyb290LnJlbW92ZURhdGEoXCJkcm9wZG93blwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLnNob3dDb250ZXh0TWVudSA9IGZ1bmN0aW9uKHgseSl7XHJcblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKS5jb250ZXh0TWVudSl7XHJcblx0XHRcdHRoaXMuaGlkZUNvbnRleHRNZW51KCk7XHJcblx0XHRcdHJvb3QuZGF0YShcImRyb3Bkb3duXCIsICQoY29uY29yZEluc3RhbmNlLnByZWZzKCkuY29udGV4dE1lbnUpLmNsb25lKCkuYXBwZW5kVG8oY29uY29yZEluc3RhbmNlLmNvbnRhaW5lcikpO1xyXG5cdFx0XHR2YXIgZWRpdG9yID0gdGhpcztcclxuXHRcdFx0cm9vdC5kYXRhKFwiZHJvcGRvd25cIikub24oXCJjbGlja1wiLCBcImFcIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0XHRcdGVkaXRvci5oaWRlQ29udGV4dE1lbnUoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0cm9vdC5kYXRhKFwiZHJvcGRvd25cIikuY3NzKHtcInBvc2l0aW9uXCIgOiBcImFic29sdXRlXCIsIFwidG9wXCIgOiB5ICtcInB4XCIsIFwibGVmdFwiIDogeCArIFwicHhcIiwgXCJjdXJzb3JcIiA6IFwiZGVmYXVsdFwifSk7XHJcblx0XHRcdHJvb3QuZGF0YShcImRyb3Bkb3duXCIpLnNob3coKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLnNhbml0aXplID0gZnVuY3Rpb24oKXtcclxuXHRcdHZhciBlZGl0b3IgPSB0aGlzO1xyXG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtdGV4dC5wYXN0ZVwiKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBjb25jb3JkVGV4dCA9ICQodGhpcyk7XHJcblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi50ZXh0KCk9PVwiLi4uXCIpe1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdHZhciBoID0gY29uY29yZEluc3RhbmNlLnBhc3RlQmluLmh0bWwoKTtcclxuXHRcdFx0aCA9IGgucmVwbGFjZShuZXcgUmVnRXhwKFwiPChkaXZ8cHxibG9ja3F1b3RlfHByZXxsaXxicnxkZHxkdHxjb2RlfGhcXFxcZClbXj5dKigvKT8+XCIsXCJnaVwiKSxcIlxcblwiKTtcclxuXHRcdFx0aCA9ICQoXCI8ZGl2Lz5cIikuaHRtbChoKS50ZXh0KCk7XHJcblx0XHRcdHZhciBjbGlwYm9hcmRNYXRjaCA9IGZhbHNlO1xyXG5cdFx0XHRpZihjb25jb3JkQ2xpcGJvYXJkICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdHZhciB0cmltbWVkQ2xpcGJvYXJkVGV4dCA9IGNvbmNvcmRDbGlwYm9hcmQudGV4dC5yZXBsYWNlKC9eW1xcc1xcclxcbl0rfFtcXHNcXHJcXG5dKyQvZywnJyk7XHJcblx0XHRcdFx0dmFyIHRyaW1tZWRQYXN0ZVRleHQgPSBoLnJlcGxhY2UoL15bXFxzXFxyXFxuXSt8W1xcc1xcclxcbl0rJC9nLCcnKTtcclxuXHRcdFx0XHRpZih0cmltbWVkQ2xpcGJvYXJkVGV4dD09dHJpbW1lZFBhc3RlVGV4dCl7XHJcblx0XHRcdFx0XHR2YXIgY2xpcGJvYXJkTm9kZXMgPSBjb25jb3JkQ2xpcGJvYXJkLmRhdGE7XHJcblx0XHRcdFx0XHRpZihjbGlwYm9hcmROb2Rlcyl7XHJcblx0XHRcdFx0XHRcdHZhciBjb2xsYXBzZU5vZGUgPSBmdW5jdGlvbihub2RlKXtcclxuXHRcdFx0XHRcdFx0XHRub2RlLmZpbmQoXCJvbFwiKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYoJCh0aGlzKS5jaGlsZHJlbigpLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0JCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0Y2xpcGJvYXJkTm9kZXMuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdGNvbGxhcHNlTm9kZSgkKHRoaXMpKTtcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0cm9vdC5kYXRhKFwiY2xpcGJvYXJkXCIsIGNsaXBib2FyZE5vZGVzKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldFRleHRNb2RlKGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnBhc3RlKCk7XHJcblx0XHRcdFx0XHRcdGNsaXBib2FyZE1hdGNoID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYoIWNsaXBib2FyZE1hdGNoKXtcclxuXHRcdFx0XHRjb25jb3JkQ2xpcGJvYXJkID0gdW5kZWZpbmVkO1xyXG5cdFx0XHRcdHZhciBudW1iZXJvZmxpbmVzID0gMDtcclxuXHRcdFx0XHR2YXIgbGluZXMgPSBoLnNwbGl0KFwiXFxuXCIpO1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdFx0XHR2YXIgbGluZSA9IGxpbmVzW2ldO1xyXG5cdFx0XHRcdFx0aWYoKGxpbmUhPVwiXCIpICYmICFsaW5lLm1hdGNoKC9eXFxzKyQvKSl7XHJcblx0XHRcdFx0XHRcdG51bWJlcm9mbGluZXMrKztcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKCFjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpIHx8IChudW1iZXJvZmxpbmVzID4gMSkpe1xyXG5cdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmluc2VydFRleHQoaCk7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRjb25jb3JkVGV4dC5mb2N1cygpO1xyXG5cdFx0XHRcdFx0XHR2YXIgcmFuZ2UgPSBjb25jb3JkVGV4dC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKS5kYXRhKFwicmFuZ2VcIik7XHJcblx0XHRcdFx0XHRcdGlmKHJhbmdlKXtcclxuXHRcdFx0XHRcdFx0XHR0cnl7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsLnJlbW92ZUFsbFJhbmdlcygpO1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsLmFkZFJhbmdlKHJhbmdlKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRjYXRjaChlKXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGZpbmFsbHkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZFRleHQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikucmVtb3ZlRGF0YShcInJhbmdlXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpbnNlcnRUZXh0XCIsbnVsbCxoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnJvb3QucmVtb3ZlRGF0YShcImNsaXBib2FyZFwiKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdGNvbmNvcmRUZXh0LnJlbW92ZUNsYXNzKFwicGFzdGVcIik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHR0aGlzLmVzY2FwZSA9IGZ1bmN0aW9uKHMpe1xyXG5cdFx0dmFyIGggPSAkKFwiPGRpdi8+XCIpLnRleHQocykuaHRtbCgpO1xyXG5cdFx0aCA9IGgucmVwbGFjZSgvXFx1MDBBMC9nLCBcIiBcIik7XHJcblx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuZ2V0UmVuZGVyTW9kZSgpKXsgLy8gUmVuZGVyIEhUTUwgaWYgb3AuZ2V0UmVuZGVyTW9kZSgpIHJldHVybnMgdHJ1ZSAtIDIvMTcvMTMgYnkgS1NcclxuXHRcdFx0dmFyIGFsbG93ZWRUYWdzID0gW1wiYlwiLFwic3Ryb25nXCIsXCJpXCIsXCJlbVwiLFwiYVwiLFwiaW1nXCIsXCJzdHJpa2VcIixcImRlbFwiXTtcclxuXHRcdFx0Zm9yKHZhciB0YWdJbmRleCBpbiBhbGxvd2VkVGFncyl7XHJcblx0XHRcdFx0dmFyIHRhZyA9IGFsbG93ZWRUYWdzW3RhZ0luZGV4XTtcclxuXHRcdFx0XHRpZiAodGFnID09IFwiaW1nXCIpe1xyXG5cdFx0XHRcdFx0aCA9IGgucmVwbGFjZShuZXcgUmVnRXhwKFwiJmx0O1wiK3RhZytcIigoPyEmZ3Q7KS4rKSgvKT8mZ3Q7XCIsXCJnaVwiKSxcIjxcIit0YWcrXCIkMVwiK1wiLz5cIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZiAodGFnPT1cImFcIil7XHJcblx0XHRcdFx0XHRoID0gaC5yZXBsYWNlKG5ldyBSZWdFeHAoXCImbHQ7XCIrdGFnK1wiKCg/ISZndDspLio/KSZndDsoKD8hJmx0Oy9cIit0YWcrXCImZ3Q7KS4rPykmbHQ7L1wiK3RhZytcIiZndDtcIixcImdpXCIpLFwiPFwiK3RhZytcIiQxXCIrXCI+JDJcIitcIjxcIitcIi9cIit0YWcrXCI+XCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0aCA9IGgucmVwbGFjZShuZXcgUmVnRXhwKFwiJmx0O1wiK3RhZytcIiZndDsoKD8hJmx0Oy9cIit0YWcrXCImZ3Q7KS4rPykmbHQ7L1wiK3RhZytcIiZndDtcIixcImdpXCIpLFwiPFwiK3RhZytcIj4kMVwiK1wiPFwiK1wiL1wiK3RhZytcIj5cIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gaDtcclxuXHRcdH07XHJcblx0dGhpcy51bmVzY2FwZSA9IGZ1bmN0aW9uKHMpe1xyXG5cdFx0dmFyIGggPSBzLnJlcGxhY2UoLzwvZyxcIiZsdDtcIikucmVwbGFjZSgvPi9nLFwiJmd0O1wiKTtcclxuXHRcdGggPSAkKFwiPGRpdi8+XCIpLmh0bWwoaCkudGV4dCgpO1xyXG5cdFx0cmV0dXJuIGg7XHJcblx0XHR9O1xyXG5cdHRoaXMuZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24oKXtcclxuXHRcdHZhciByYW5nZSA9IHVuZGVmaW5lZDtcclxuXHRcdGlmKHdpbmRvdy5nZXRTZWxlY3Rpb24pe1xyXG5cdFx0XHRzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcblx0XHRcdGlmKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KXtcclxuXHRcdFx0XHRyYW5nZSA9IHNlbC5nZXRSYW5nZUF0KDApO1xyXG5cdFx0XHRcdGlmKCQocmFuZ2Uuc3RhcnRDb250YWluZXIpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpLmxlbmd0aD09MCl7XHJcblx0XHRcdFx0XHRyYW5nZSA9IHVuZGVmaW5lZDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiByYW5nZTtcclxuXHRcdH07XHJcblx0dGhpcy5zYXZlU2VsZWN0aW9uID0gZnVuY3Rpb24oKXtcclxuXHRcdHZhciByYW5nZSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XHJcblx0XHRpZihyYW5nZSAhPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmRhdGEoXCJyYW5nZVwiLCByYW5nZS5jbG9uZVJhbmdlKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gcmFuZ2U7XHJcblx0XHR9O1xyXG5cdHRoaXMucmVzdG9yZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKHJhbmdlKXtcclxuXHRcdHZhciBjdXJzb3IgPSBjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCk7XHJcblx0XHRpZihyYW5nZT09PXVuZGVmaW5lZCl7XHJcblx0XHRcdHJhbmdlID0gY3Vyc29yLmRhdGEoXCJyYW5nZVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0aWYocmFuZ2UgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdGlmKHdpbmRvdy5nZXRTZWxlY3Rpb24pe1xyXG5cdFx0XHRcdHZhciBjb25jb3JkVGV4dCA9IGN1cnNvci5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpO1xyXG5cdFx0XHRcdHRyeXtcclxuXHRcdFx0XHRcdHZhciBjbG9uZVJhbmdlciA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcclxuXHRcdFx0XHRcdHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcblx0XHRcdFx0XHRzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XHJcblx0XHRcdFx0XHRzZWwuYWRkUmFuZ2UoY2xvbmVSYW5nZXIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoKGUpe1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0ZmluYWxseSB7XHJcblx0XHRcdFx0XHRjdXJzb3IucmVtb3ZlRGF0YShcInJhbmdlXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0cmV0dXJuIHJhbmdlO1xyXG5cdFx0fTtcclxuXHR0aGlzLnJlY2FsY3VsYXRlTGV2ZWxzID0gZnVuY3Rpb24oY29udGV4dCl7XHJcblx0XHRpZighY29udGV4dCl7XHJcblx0XHRcdGNvbnRleHQgPSByb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRjb250ZXh0LmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyIHRleHQgPSAkKHRoaXMpLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIik7XHJcblx0XHRcdHZhciBsZXZlbE1hdGNoID0gJCh0aGlzKS5hdHRyKFwiY2xhc3NcIikubWF0Y2goLy4qY29uY29yZC1sZXZlbC0oXFxkKykuKi8pO1xyXG5cdFx0XHRpZihsZXZlbE1hdGNoKXtcclxuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbE1hdGNoWzFdKTtcclxuXHRcdFx0XHR0ZXh0LnJlbW92ZUNsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbE1hdGNoWzFdK1wiLXRleHRcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR2YXIgbGV2ZWwgPSAkKHRoaXMpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCsxO1xyXG5cdFx0XHQkKHRoaXMpLmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCk7XHJcblx0XHRcdHRleHQuYWRkQ2xhc3MoXCJjb25jb3JkLWxldmVsLVwiK2xldmVsK1wiLXRleHRcIik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHR9XHJcbmZ1bmN0aW9uIENvbmNvcmRFdmVudHMocm9vdCwgZWRpdG9yLCBvcCwgY29uY29yZEluc3RhbmNlKSB7XHJcblx0dmFyIGluc3RhbmNlID0gdGhpcztcclxuXHR0aGlzLndyYXBwZXJEb3VibGVDbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKHJvb3QuZGF0YShcImRyb3Bkb3duXCIpKXtcclxuXHRcdFx0ZWRpdG9yLmhpZGVDb250ZXh0TWVudSgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKCFlZGl0b3IuZWRpdGFibGUoJChldmVudC50YXJnZXQpKSkge1xyXG5cdFx0XHR2YXIgd3JhcHBlciA9ICQoZXZlbnQudGFyZ2V0KTtcclxuXHRcdFx0aWYod3JhcHBlci5oYXNDbGFzcyhcIm5vZGUtaWNvblwiKSl7XHJcblx0XHRcdFx0d3JhcHBlciA9IHdyYXBwZXIucGFyZW50KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZih3cmFwcGVyLmhhc0NsYXNzKFwiY29uY29yZC13cmFwcGVyXCIpKSB7XHJcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdFx0dmFyIG5vZGUgPSB3cmFwcGVyLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcclxuXHRcdFx0XHRpZihvcC5zdWJzRXhwYW5kZWQoKSkge1xyXG5cdFx0XHRcdFx0b3AuY29sbGFwc2UoKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdG9wLmV4cGFuZCgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdHRoaXMuY2xpY2tTZWxlY3QgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZihyb290LmRhdGEoXCJkcm9wZG93blwiKSl7XHJcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYoY29uY29yZC5tb2JpbGUpe1xyXG5cdFx0XHR2YXIgbm9kZSA9ICQoZXZlbnQudGFyZ2V0KTtcclxuXHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpWzBdPT09bm9kZVswXSl7XHJcblx0XHRcdFx0aW5zdGFuY2UuZG91YmxlQ2xpY2soZXZlbnQpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGlmKChldmVudC53aGljaD09MSkgJiYgIWVkaXRvci5lZGl0YWJsZSgkKGV2ZW50LnRhcmdldCkpKSB7XHJcblx0XHRcdHZhciBub2RlID0gJChldmVudC50YXJnZXQpO1xyXG5cdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImNvbmNvcmQtbm9kZVwiKSl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYobm9kZS5sZW5ndGg9PTEpIHtcclxuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHRcdFx0XHRpZihldmVudC5zaGlmdEtleSAmJiAobm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZS5zZWxlY3RlZFwiKS5sZW5ndGg+MCkpe1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcclxuXHRcdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQubWV0YUtleSwgZXZlbnQuc2hpZnRLZXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmRvdWJsZUNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYocm9vdC5kYXRhKFwiZHJvcGRvd25cIikpe1xyXG5cdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYoIWVkaXRvci5lZGl0YWJsZSgkKGV2ZW50LnRhcmdldCkpKSB7XHJcblx0XHRcdHZhciBub2RlID0gJChldmVudC50YXJnZXQpO1xyXG5cdFx0XHRpZihub2RlLmhhc0NsYXNzKFwiY29uY29yZC1ub2RlXCIpICYmIG5vZGUuaGFzQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKSkge1xyXG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcclxuXHRcdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSk7XHJcblx0XHRcdFx0aWYob3Auc3Vic0V4cGFuZGVkKCkpIHtcclxuXHRcdFx0XHRcdG9wLmNvbGxhcHNlKCk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRvcC5leHBhbmQoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLndyYXBwZXJDbGlja1NlbGVjdCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKHJvb3QuZGF0YShcImRyb3Bkb3duXCIpKXtcclxuXHRcdFx0ZWRpdG9yLmhpZGVDb250ZXh0TWVudSgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmQubW9iaWxlKXtcclxuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcclxuXHRcdFx0dmFyIG5vZGUgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKVswXT09PW5vZGVbMF0pe1xyXG5cdFx0XHRcdGluc3RhbmNlLndyYXBwZXJEb3VibGVDbGljayhldmVudCk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0aWYoKGV2ZW50LndoaWNoPT0xKSAmJiAhZWRpdG9yLmVkaXRhYmxlKCQoZXZlbnQudGFyZ2V0KSkpIHtcclxuXHRcdFx0dmFyIHdyYXBwZXIgPSAkKGV2ZW50LnRhcmdldCk7XHJcblx0XHRcdGlmKHdyYXBwZXIuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpe1xyXG5cdFx0XHRcdHdyYXBwZXIgPSB3cmFwcGVyLnBhcmVudCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYod3JhcHBlci5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSkge1xyXG5cdFx0XHRcdHZhciBub2RlID0gd3JhcHBlci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRpZihldmVudC5zaGlmdEtleSAmJiAobm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZS5zZWxlY3RlZFwiKS5sZW5ndGg+MCkpe1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcclxuXHRcdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQubWV0YUtleSwgZXZlbnQuc2hpZnRLZXkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmNvbnRleHRtZW51ID0gZnVuY3Rpb24oZXZlbnQpe1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHR2YXIgbm9kZSA9ICQoZXZlbnQudGFyZ2V0KTtcclxuXHRcdGlmKG5vZGUuaGFzQ2xhc3MoXCJjb25jb3JkLXdyYXBwZXJcIikgfHwgbm9kZS5oYXNDbGFzcyhcIm5vZGUtaWNvblwiKSl7XHJcblx0XHRcdG9wLnNldFRleHRNb2RlKGZhbHNlKTtcclxuXHRcdFx0fVxyXG5cdFx0aWYoIW5vZGUuaGFzQ2xhc3MoXCJjb25jb3JkLW5vZGVcIikpe1xyXG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0fVxyXG5cdFx0Y29uY29yZEluc3RhbmNlLmZpcmVDYWxsYmFjayhcIm9wQ29udGV4dE1lbnVcIiwgb3Auc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XHJcblx0XHRvcC5zZXRDdXJzb3Iobm9kZSk7XHJcblx0XHRlZGl0b3Iuc2hvd0NvbnRleHRNZW51KGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSk7XHJcblx0XHR9O1xyXG5cdHJvb3Qub24oXCJkYmxjbGlja1wiLCBcIi5jb25jb3JkLXdyYXBwZXJcIiwgdGhpcy53cmFwcGVyRG91YmxlQ2xpY2spO1xyXG5cdHJvb3Qub24oXCJkYmxjbGlja1wiLCBcIi5jb25jb3JkLW5vZGVcIiwgdGhpcy5kb3VibGVDbGljayk7XHJcblx0cm9vdC5vbihcImRibGNsaWNrXCIsIFwiLmNvbmNvcmQtdGV4dFwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHRcdFx0dmFyIG5vZGUgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdG9wLnNldEN1cnNvcihub2RlKTtcclxuXHRcdFx0aWYob3Auc3Vic0V4cGFuZGVkKCkpIHtcclxuXHRcdFx0XHRvcC5jb2xsYXBzZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRvcC5leHBhbmQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0cm9vdC5vbihcImNsaWNrXCIsIFwiLmNvbmNvcmQtd3JhcHBlclwiLCB0aGlzLndyYXBwZXJDbGlja1NlbGVjdCk7XHJcblx0cm9vdC5vbihcImNsaWNrXCIsIFwiLmNvbmNvcmQtbm9kZVwiLCB0aGlzLmNsaWNrU2VsZWN0KTtcclxuXHRyb290Lm9uKFwibW91c2VvdmVyXCIsIFwiLmNvbmNvcmQtd3JhcHBlclwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdHZhciBub2RlID0gJChldmVudC50YXJnZXQpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0Y29uY29yZEluc3RhbmNlLmZpcmVDYWxsYmFjayhcIm9wSG92ZXJcIiwgb3Auc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XHJcblx0XHR9KTtcclxuXHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMuY29udGV4dE1lbnUpe1xyXG5cdFx0cm9vdC5vbihcImNvbnRleHRtZW51XCIsIFwiLmNvbmNvcmQtdGV4dFwiLCB0aGlzLmNvbnRleHRtZW51KTtcclxuXHRcdHJvb3Qub24oXCJjb250ZXh0bWVudVwiLCBcIi5jb25jb3JkLW5vZGVcIiwgdGhpcy5jb250ZXh0bWVudSk7XHJcblx0XHRyb290Lm9uKFwiY29udGV4dG1lbnVcIiwgXCIuY29uY29yZC13cmFwcGVyXCIsIHRoaXMuY29udGV4dG1lbnUpO1xyXG5cdFx0fVxyXG5cdHJvb3Qub24oXCJibHVyXCIsIFwiLmNvbmNvcmQtdGV4dFwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKCQodGhpcykuaHRtbCgpLm1hdGNoKC9eXFxzKjxicj5cXHMqJC8pKXtcclxuXHRcdFx0JCh0aGlzKS5odG1sKFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgY29uY29yZFRleHQgPSAkKHRoaXMpO1xyXG5cdFx0dmFyIG5vZGUgPSAkKHRoaXMpLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdGVkaXRvci5zYXZlU2VsZWN0aW9uKCk7XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkgJiYgbm9kZS5oYXNDbGFzcyhcImRpcnR5XCIpKXtcclxuXHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImRpcnR5XCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRyb290Lm9uKFwicGFzdGVcIiwgXCIuY29uY29yZC10ZXh0XCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0JCh0aGlzKS5hZGRDbGFzcyhcInBhc3RlXCIpO1xyXG5cdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5zYXZlU2VsZWN0aW9uKCk7XHJcblx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4uaHRtbChcIlwiKTtcclxuXHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5mb2N1cygpO1xyXG5cdFx0c2V0VGltZW91dChlZGl0b3Iuc2FuaXRpemUsMTApO1xyXG5cdFx0fSk7XHJcblx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLm9uKFwiY29weVwiLCBmdW5jdGlvbigpe1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgY29weVRleHQgPSBcIlwiO1xyXG5cdFx0cm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0Y29weVRleHQrPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnRleHRMaW5lKCQodGhpcykpO1xyXG5cdFx0XHR9KTtcclxuXHRcdGlmKChjb3B5VGV4dCE9XCJcIikgJiYgKGNvcHlUZXh0IT1cIlxcblwiKSl7XHJcblx0XHRcdGNvbmNvcmRDbGlwYm9hcmQgPSB7dGV4dDogY29weVRleHQsIGRhdGE6IHJvb3QuZmluZChcIi5zZWxlY3RlZFwiKS5jbG9uZSh0cnVlLCB0cnVlKX07XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5odG1sKFwiPHByZT5cIiskKFwiPGRpdi8+XCIpLnRleHQoY29weVRleHQpLmh0bWwoKStcIjwvcHJlPlwiKTtcclxuXHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLmZvY3VzKCk7XHJcblx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwic2VsZWN0QWxsXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW4ub24oXCJwYXN0ZVwiLCBmdW5jdGlvbihldmVudCl7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdHZhciBjb25jb3JkVGV4dCA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpO1xyXG5cdFx0Y29uY29yZFRleHQuYWRkQ2xhc3MoXCJwYXN0ZVwiKTtcclxuXHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbi5odG1sKFwiXCIpO1xyXG5cdFx0c2V0VGltZW91dChlZGl0b3Iuc2FuaXRpemUsMTApO1xyXG5cdFx0fSk7XHJcblx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLm9uKFwiY3V0XCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdHZhciBjb3B5VGV4dCA9IFwiXCI7XHJcblx0XHRyb290LmZpbmQoXCIuc2VsZWN0ZWRcIikuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRjb3B5VGV4dCs9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IudGV4dExpbmUoJCh0aGlzKSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0aWYoKGNvcHlUZXh0IT1cIlwiKSAmJiAoY29weVRleHQhPVwiXFxuXCIpKXtcclxuXHRcdFx0Y29uY29yZENsaXBib2FyZCA9IHt0ZXh0OiBjb3B5VGV4dCwgZGF0YTogcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLmNsb25lKHRydWUsIHRydWUpfTtcclxuXHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluLmh0bWwoXCI8cHJlPlwiKyQoXCI8ZGl2Lz5cIikudGV4dChjb3B5VGV4dCkuaHRtbCgpK1wiPC9wcmU+XCIpO1xyXG5cdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW5Gb2N1cygpO1xyXG5cdFx0XHR9XHJcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVsZXRlTGluZSgpO1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpe2NvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCl9LCAyMDApO1xyXG5cdFx0fSk7XHJcblx0cm9vdC5vbihcIm1vdXNlZG93blwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xyXG5cdFx0aWYodGFyZ2V0LmlzKFwiYVwiKSl7XHJcblx0XHRcdGlmKHRhcmdldC5hdHRyKFwiaHJlZlwiKSl7XHJcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR3aW5kb3cub3Blbih0YXJnZXQuYXR0cihcImhyZWZcIikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKVtcInJlYWRvbmx5XCJdPT10cnVlKXtcclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcclxuXHRcdFx0aWYodGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLmxlbmd0aD09MSl7XHJcblx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC10ZXh0XCIpKXtcclxuXHRcdFx0XHR2YXIgbm9kZSA9IHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRpZihub2RlLmxlbmd0aD09MSl7XHJcblx0XHRcdFx0XHRvcC5zZXRDdXJzb3Iobm9kZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGV2ZW50LndoaWNoPT0xKSB7XHJcblx0XHRcdGlmKHJvb3QuZGF0YShcImRyb3Bkb3duXCIpKXtcclxuXHRcdFx0XHRlZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYodGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpLmxlbmd0aD09MSl7XHJcblx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC10ZXh0XCIpKXtcclxuXHRcdFx0XHR2YXIgbm9kZSA9IHRhcmdldC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRpZihub2RlLmxlbmd0aD09MSl7XHJcblx0XHRcdFx0XHRpZighcm9vdC5oYXNDbGFzcyhcInRleHRNb2RlXCIpKXtcclxuXHRcdFx0XHRcdFx0cm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XHJcblx0XHRcdFx0XHRcdHJvb3QuYWRkQ2xhc3MoXCJ0ZXh0TW9kZVwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYobm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmhhc0NsYXNzKFwiZWRpdGluZ1wiKSl7XHJcblx0XHRcdFx0XHRcdHJvb3QuZmluZChcIi5lZGl0aW5nXCIpLnJlbW92ZUNsYXNzKFwiZWRpdGluZ1wiKTtcclxuXHRcdFx0XHRcdFx0bm9kZS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmFkZENsYXNzKFwiZWRpdGluZ1wiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoIW5vZGUuaGFzQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKSl7XHJcblx0XHRcdFx0XHRcdHJvb3QuZmluZChcIi5jb25jb3JkLWN1cnNvclwiKS5yZW1vdmVDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpO1xyXG5cdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiY29uY29yZC1jdXJzb3JcIik7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEN1cnNvck1vdmVkXCIsIG9wLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0cm9vdC5kYXRhKFwibW91c2Vkb3duXCIsIHRydWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRyb290Lm9uKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl09PXRydWUpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKCFlZGl0b3IuZWRpdGFibGUoJChldmVudC50YXJnZXQpKSkge1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRpZihyb290LmRhdGEoXCJtb3VzZWRvd25cIikgJiYgIXJvb3QuZGF0YShcImRyYWdnaW5nXCIpKSB7XHJcblx0XHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcclxuXHRcdFx0XHRpZih0YXJnZXQuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpe1xyXG5cdFx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LnBhcmVudCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSAmJiB0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoXCJzZWxlY3RlZFwiKSkge1xyXG5cdFx0XHRcdFx0ZWRpdG9yLmRyYWdNb2RlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRyb290Lm9uKFwibW91c2V1cFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKVtcInJlYWRvbmx5XCJdPT10cnVlKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xyXG5cdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC1ub2RlXCIpKSB7XHJcblx0XHRcdHRhcmdldCA9IHRhcmdldC5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXI6Zmlyc3RcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0OmZpcnN0XCIpO1xyXG5cdFx0XHR9IGVsc2UgaWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC13cmFwcGVyXCIpKSB7XHJcblx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0LmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRpZighZWRpdG9yLmVkaXRhYmxlKHRhcmdldCkpIHtcclxuXHRcdFx0cm9vdC5kYXRhKFwibW91c2Vkb3duXCIsIGZhbHNlKTtcclxuXHRcdFx0aWYocm9vdC5kYXRhKFwiZHJhZ2dpbmdcIikpIHtcclxuXHRcdFx0XHR2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xyXG5cdFx0XHRcdHZhciBub2RlID0gdGFyZ2V0LnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdHZhciBkcmFnZ2FibGUgPSByb290LmZpbmQoXCIuc2VsZWN0ZWRcIik7XHJcblx0XHRcdFx0aWYoKG5vZGUubGVuZ3RoID09IDEpICYmIChkcmFnZ2FibGUubGVuZ3RoID49IDEpKSB7XHJcblx0XHRcdFx0XHR2YXIgaXNEcmFnZ2FibGVUYXJnZXQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdGRyYWdnYWJsZS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdGlmKHRoaXM9PW5vZGVbMF0pe1xyXG5cdFx0XHRcdFx0XHRcdGlzRHJhZ2dhYmxlVGFyZ2V0ID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0aWYoIWlzRHJhZ2dhYmxlVGFyZ2V0KSB7XHJcblx0XHRcdFx0XHRcdHZhciBkcmFnZ2FibGVJc1RhcmdldFBhcmVudCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRub2RlLnBhcmVudHMoXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIG5vZGVQYXJlbnQgPSAkKHRoaXMpWzBdO1xyXG5cdFx0XHRcdFx0XHRcdGRyYWdnYWJsZS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRcdFx0XHRpZigkKHRoaXMpWzBdID09IG5vZGVQYXJlbnQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0aWYoIWRyYWdnYWJsZUlzVGFyZ2V0UGFyZW50KSB7XHJcblx0XHRcdFx0XHRcdFx0aWYodGFyZ2V0Lmhhc0NsYXNzKFwiY29uY29yZC13cmFwcGVyXCIpIHx8IHRhcmdldC5oYXNDbGFzcyhcIm5vZGUtaWNvblwiKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGNsb25lZERyYWdnYWJsZSA9IGRyYWdnYWJsZS5jbG9uZSh0cnVlLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRcdGNsb25lZERyYWdnYWJsZS5pbnNlcnRBZnRlcihub2RlKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRyYWdnYWJsZS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBjbG9uZWREcmFnZ2FibGUgPSBkcmFnZ2FibGUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBvdXRsaW5lID0gbm9kZS5jaGlsZHJlbihcIm9sXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjbG9uZWREcmFnZ2FibGUucHJlcGVuZFRvKG91dGxpbmUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRub2RlLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRkcmFnZ2FibGUucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHByZXYgPSBub2RlLnByZXYoKTtcclxuXHRcdFx0XHRcdFx0XHRpZihwcmV2Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZihwcmV2Lmhhc0NsYXNzKFwiZHJvcC1jaGlsZFwiKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgY2xvbmVkRHJhZ2dhYmxlID0gZHJhZ2dhYmxlLmNsb25lKHRydWUsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgb3V0bGluZSA9IHByZXYuY2hpbGRyZW4oXCJvbFwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xvbmVkRHJhZ2dhYmxlLmFwcGVuZFRvKG91dGxpbmUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRwcmV2LnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRkcmFnZ2FibGUucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0ZWRpdG9yLmRyYWdNb2RlRXhpdCgpO1xyXG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVjYWxjdWxhdGVMZXZlbHMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdHJvb3Qub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdGlmKCFjb25jb3JkLmhhbmRsZUV2ZW50cyl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYoY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXT09dHJ1ZSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYocm9vdC5kYXRhKFwiZHJhZ2dpbmdcIikpIHtcclxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcclxuXHRcdFx0dmFyIG5vZGUgPSB0YXJnZXQucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdHZhciBkcmFnZ2FibGUgPSByb290LmZpbmQoXCIuc2VsZWN0ZWRcIik7XHJcblx0XHRcdGlmKChub2RlLmxlbmd0aCA9PSAxKSAmJiAoZHJhZ2dhYmxlLmxlbmd0aD49MSkpIHtcclxuXHRcdFx0XHR2YXIgaXNEcmFnZ2FibGVUYXJnZXQgPSBmYWxzZTtcclxuXHRcdFx0XHRkcmFnZ2FibGUuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0aWYodGhpcz09bm9kZVswXSl7XHJcblx0XHRcdFx0XHRcdGlzRHJhZ2dhYmxlVGFyZ2V0ID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0aWYoIWlzRHJhZ2dhYmxlVGFyZ2V0KSB7XHJcblx0XHRcdFx0XHR2YXIgZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdG5vZGUucGFyZW50cyhcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0dmFyIG5vZGVQYXJlbnQgPSAkKHRoaXMpWzBdO1xyXG5cdFx0XHRcdFx0XHRkcmFnZ2FibGUuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0XHRcdGlmKCQodGhpcylbMF0gPT0gbm9kZVBhcmVudCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZHJhZ2dhYmxlSXNUYXJnZXRQYXJlbnQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdGlmKCFkcmFnZ2FibGVJc1RhcmdldFBhcmVudCkge1xyXG5cdFx0XHRcdFx0XHRub2RlLnJlbW92ZUNsYXNzKFwiZHJvcC1zaWJsaW5nXCIpLnJlbW92ZShcImRyb3AtY2hpbGRcIik7XHJcblx0XHRcdFx0XHRcdGlmKHRhcmdldC5oYXNDbGFzcyhcImNvbmNvcmQtd3JhcHBlclwiKSB8fCB0YXJnZXQuaGFzQ2xhc3MoXCJub2RlLWljb25cIikpIHtcclxuXHRcdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiZHJvcC1zaWJsaW5nXCIpO1xyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiZHJvcC1jaGlsZFwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChkcmFnZ2FibGUubGVuZ3RoPT0xKXtcclxuXHRcdFx0XHRcdFx0dmFyIHByZXYgPSBub2RlLnByZXYoKTtcclxuXHRcdFx0XHRcdFx0aWYocHJldi5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0XHRcdHByZXYucmVtb3ZlQ2xhc3MoXCJkcm9wLXNpYmxpbmdcIikucmVtb3ZlKFwiZHJvcC1jaGlsZFwiKTtcclxuXHRcdFx0XHRcdFx0XHRwcmV2LmFkZENsYXNzKFwiZHJvcC1jaGlsZFwiKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdHJvb3Qub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZihjb25jb3JkSW5zdGFuY2UucHJlZnMoKVtcInJlYWRvbmx5XCJdPT10cnVlKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZihyb290LmRhdGEoXCJkcmFnZ2luZ1wiKSkge1xyXG5cdFx0XHRyb290LmZpbmQoXCIuZHJvcC1zaWJsaW5nXCIpLnJlbW92ZUNsYXNzKFwiZHJvcC1zaWJsaW5nXCIpO1xyXG5cdFx0XHRyb290LmZpbmQoXCIuZHJvcC1jaGlsZFwiKS5yZW1vdmVDbGFzcyhcImRyb3AtY2hpbGRcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuZnVuY3Rpb24gQ29uY29yZE9wKHJvb3QsIGNvbmNvcmRJbnN0YW5jZSwgX2N1cnNvcikge1xyXG5cdHRoaXMuX3dhbGtfdXAgPSBmdW5jdGlvbihjb250ZXh0KSB7XHJcblx0XHR2YXIgcHJldiA9IGNvbnRleHQucHJldigpO1xyXG5cdFx0aWYocHJldi5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHR2YXIgcGFyZW50ID0gY29udGV4dC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0aWYocGFyZW50Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0cmV0dXJuIHBhcmVudDtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2xhc3RfY2hpbGQocHJldik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLl93YWxrX2Rvd24gPSBmdW5jdGlvbihjb250ZXh0KSB7XHJcblx0XHR2YXIgbmV4dCA9IGNvbnRleHQubmV4dCgpO1xyXG5cdFx0aWYobmV4dC5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRyZXR1cm4gbmV4dDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR2YXIgcGFyZW50ID0gY29udGV4dC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRpZihwYXJlbnQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl93YWxrX2Rvd24ocGFyZW50KTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLl9sYXN0X2NoaWxkID0gZnVuY3Rpb24oY29udGV4dCkge1xyXG5cdFx0aWYoY29udGV4dC5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSkge1xyXG5cdFx0XHRyZXR1cm4gY29udGV4dDtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIG91dGxpbmUgPSBjb250ZXh0LmNoaWxkcmVuKFwib2xcIik7XHJcblx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAwKSB7XHJcblx0XHRcdHJldHVybiBjb250ZXh0O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHZhciBsYXN0Q2hpbGQgPSBvdXRsaW5lLmNoaWxkcmVuKFwiLmNvbmNvcmQtbm9kZTpsYXN0XCIpO1xyXG5cdFx0XHRcdGlmKGxhc3RDaGlsZC5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2xhc3RfY2hpbGQobGFzdENoaWxkKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGNvbnRleHQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5ib2xkID0gZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XHJcblx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiYm9sZFwiKTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dGhpcy5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwic2VsZWN0QWxsXCIpO1xyXG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiYm9sZFwiKTtcclxuXHRcdFx0XHRkb2N1bWVudC5leGVjQ29tbWFuZChcInVuc2VsZWN0XCIpO1xyXG5cdFx0XHRcdHRoaXMuYmx1ckN1cnNvcigpO1xyXG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5wYXN0ZUJpbkZvY3VzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiByb290LmRhdGEoXCJjaGFuZ2VkXCIpID09IHRydWU7XHJcblx0XHR9O1xyXG5cdHRoaXMuY2xlYXJDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyb290LmRhdGEoXCJjaGFuZ2VkXCIsIGZhbHNlKTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fTtcclxuXHR0aGlzLmNvbGxhcHNlID0gZnVuY3Rpb24odHJpZ2dlckNhbGxiYWNrcykge1xyXG5cdFx0aWYodHJpZ2dlckNhbGxiYWNrcyA9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHR0cmlnZ2VyQ2FsbGJhY2tzID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRpZih0cmlnZ2VyQ2FsbGJhY2tzKXtcclxuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BDb2xsYXBzZVwiLCB0aGlzLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0bm9kZS5hZGRDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0bm9kZS5maW5kKFwib2xcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZigkKHRoaXMpLmNoaWxkcmVuKCkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5wYXJlbnQoKS5hZGRDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdHRoaXMuY29weSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRpZighdGhpcy5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRyb290LmRhdGEoXCJjbGlwYm9hcmRcIiwgcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLmNsb25lKHRydWUsIHRydWUpKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmNvdW50U3VicyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRyZXR1cm4gbm9kZS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkuc2l6ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gMDtcclxuXHRcdH07XHJcblx0dGhpcy5jdXJzb3JUb1htbCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gY29uY29yZEluc3RhbmNlLmVkaXRvci5vcG1sKHRoaXMuZ2V0Q3Vyc29yKCkpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmN1cnNvclRvWG1sU3Vic09ubHkgPSBmdW5jdGlvbigpeyAvLzgvNS8xMyBieSBEV1xyXG5cdFx0cmV0dXJuIGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iub3BtbCh0aGlzLmdldEN1cnNvcigpLCB0cnVlKTtcclxuXHRcdH07XHJcblx0dGhpcy5jdXQgPSBmdW5jdGlvbigpe1xyXG5cdFx0aWYoIXRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0dGhpcy5jb3B5KCk7XHJcblx0XHRcdHRoaXMuZGVsZXRlTGluZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdHRoaXMuZGVsZXRlTGluZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcclxuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0dmFyIGN1cnNvciA9IHRoaXMuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdHZhciBwID0gY3Vyc29yLnByZXYoKTtcclxuXHRcdFx0aWYocC5sZW5ndGg9PTApe1xyXG5cdFx0XHRcdHAgPSBjdXJzb3IucGFyZW50cyhcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRjdXJzb3IucmVtb3ZlKCk7XHJcblx0XHRcdGlmKHAubGVuZ3RoPT0xKSB7XHJcblx0XHRcdFx0dGhpcy5zZXRDdXJzb3IocCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikubGVuZ3RoPT0xKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMud2lwZSgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0dmFyIHNlbGVjdGVkID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpO1xyXG5cdFx0XHRcdGlmKHNlbGVjdGVkLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHR2YXIgcCA9IHNlbGVjdGVkLnByZXYoKTtcclxuXHRcdFx0XHRcdGlmKHAubGVuZ3RoPT0wKXtcclxuXHRcdFx0XHRcdFx0cCA9IHNlbGVjdGVkLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRzZWxlY3RlZC5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdGlmKHAubGVuZ3RoPT0xKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKHApO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIikubGVuZ3RoPT0xKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEN1cnNvcihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMud2lwZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKHNlbGVjdGVkLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGZpcnN0ID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkOmZpcnN0XCIpO1xyXG5cdFx0XHRcdFx0XHR2YXIgcCA9IGZpcnN0LnByZXYoKTtcclxuXHRcdFx0XHRcdFx0aWYocC5sZW5ndGg9PTApe1xyXG5cdFx0XHRcdFx0XHRcdHAgPSBmaXJzdC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdHNlbGVjdGVkLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0aWYocC5sZW5ndGg9PTEpe1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKHApO1xyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKS5sZW5ndGg9PTEpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3Iocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy53aXBlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0aWYocm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHR2YXIgbm9kZSA9IHRoaXMuaW5zZXJ0KFwiXCIsIGRvd24pO1xyXG5cdFx0XHR0aGlzLnNldEN1cnNvcihub2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmRlbGV0ZVN1YnMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0aWYobm9kZS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkubGVuZ3RoID4gMCl7XHJcblx0XHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcclxuXHRcdFx0XHRub2RlLmNoaWxkcmVuKFwib2xcIikuZW1wdHkoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdH07XHJcblx0dGhpcy5kZW1vdGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcclxuXHRcdHZhciBtb3ZlZFNpYmxpbmdzID0gZmFsc2U7XHJcblx0XHRpZihub2RlLm5leHRBbGwoKS5sZW5ndGg+MCl7XHJcblx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XHJcblx0XHRcdG5vZGUubmV4dEFsbCgpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHNpYmxpbmcgPSAkKHRoaXMpLmNsb25lKHRydWUsIHRydWUpO1xyXG5cdFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XHJcblx0XHRcdFx0c2libGluZy5hcHBlbmRUbyhub2RlLmNoaWxkcmVuKFwib2xcIikpO1xyXG5cdFx0XHRcdG5vZGUucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVjYWxjdWxhdGVMZXZlbHMobm9kZS5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKSk7XHJcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmV4cGFuZCA9IGZ1bmN0aW9uKHRyaWdnZXJDYWxsYmFja3MpIHtcclxuXHRcdGlmKHRyaWdnZXJDYWxsYmFja3MgPT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0dHJpZ2dlckNhbGxiYWNrcyA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0aWYodHJpZ2dlckNhbGxiYWNrcyl7XHJcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmZpcmVDYWxsYmFjayhcIm9wRXhwYW5kXCIsIHRoaXMuc2V0Q3Vyc29yQ29udGV4dChub2RlKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0dmFyIGN1cnNvclBvc2l0aW9uID0gbm9kZS5vZmZzZXQoKS50b3A7XHJcblx0XHRcdHZhciBjdXJzb3JIZWlnaHQgPW5vZGUuaGVpZ2h0KCk7XHJcblx0XHRcdHZhciB3aW5kb3dQb3NpdGlvbiA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuXHRcdFx0dmFyIHdpbmRvd0hlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcclxuXHRcdFx0aWYoICggY3Vyc29yUG9zaXRpb24gPCB3aW5kb3dQb3NpdGlvbiApIHx8ICggKGN1cnNvclBvc2l0aW9uK2N1cnNvckhlaWdodCkgPiAod2luZG93UG9zaXRpb24rd2luZG93SGVpZ2h0KSApICl7XHJcblx0XHRcdFx0aWYoY3Vyc29yUG9zaXRpb24gPCB3aW5kb3dQb3NpdGlvbil7XHJcblx0XHRcdFx0XHQkKHdpbmRvdykuc2Nyb2xsVG9wKGN1cnNvclBvc2l0aW9uKTtcclxuXHRcdFx0XHRcdH1lbHNlIGlmICgoY3Vyc29yUG9zaXRpb24rY3Vyc29ySGVpZ2h0KSA+ICh3aW5kb3dQb3NpdGlvbit3aW5kb3dIZWlnaHQpKXtcclxuXHRcdFx0XHRcdFx0dmFyIGxpbmVIZWlnaHQgPSBwYXJzZUludChub2RlLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlclwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHRcIikuY3NzKFwibGluZS1oZWlnaHRcIikpICsgNjtcclxuXHRcdFx0XHRcdFx0aWYoKGN1cnNvckhlaWdodCtsaW5lSGVpZ2h0KSA8IHdpbmRvd0hlaWdodCl7XHJcblx0XHRcdFx0XHRcdFx0JCh3aW5kb3cpLnNjcm9sbFRvcChjdXJzb3JQb3NpdGlvbiAtICh3aW5kb3dIZWlnaHQtY3Vyc29ySGVpZ2h0KStsaW5lSGVpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdCQod2luZG93KS5zY3JvbGxUb3AoY3Vyc29yUG9zaXRpb24pO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5leHBhbmRBbGxMZXZlbHMgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBub2RlID0gdGhpcy5nZXRDdXJzb3IoKTtcclxuXHRcdGlmKG5vZGUubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0bm9kZS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0bm9kZS5maW5kKFwiLmNvbmNvcmQtbm9kZVwiKS5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmZvY3VzQ3Vyc29yID0gZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuZ2V0Q3Vyc29yKCkuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKS5mb2N1cygpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmJsdXJDdXJzb3IgPSBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5nZXRDdXJzb3IoKS5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmJsdXIoKTtcclxuXHRcdH07XHJcblx0dGhpcy5mdWxsQ29sbGFwc2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYoJCh0aGlzKS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkuc2l6ZSgpID4gMCkge1xyXG5cdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0dmFyIHRvcFBhcmVudCA9IGN1cnNvci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpsYXN0XCIpO1xyXG5cdFx0aWYodG9wUGFyZW50Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3Iuc2VsZWN0KHRvcFBhcmVudCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5mdWxsRXhwYW5kID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpLnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmdldEN1cnNvciA9IGZ1bmN0aW9uKCl7XHJcblx0XHRpZihfY3Vyc29yKXtcclxuXHRcdFx0cmV0dXJuIF9jdXJzb3I7XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiByb290LmZpbmQoXCIuY29uY29yZC1jdXJzb3I6Zmlyc3RcIik7XHJcblx0XHR9O1xyXG5cdHRoaXMuZ2V0Q3Vyc29yUmVmID0gZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB0aGlzLnNldEN1cnNvckNvbnRleHQodGhpcy5nZXRDdXJzb3IoKSk7XHJcblx0XHR9O1xyXG5cdHRoaXMuZ2V0SGVhZGVycyA9IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgaGVhZGVycyA9IHt9O1xyXG5cdFx0aWYocm9vdC5kYXRhKFwiaGVhZFwiKSl7XHJcblx0XHRcdGhlYWRlcnMgPSByb290LmRhdGEoXCJoZWFkXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRoZWFkZXJzW1widGl0bGVcIl0gPSB0aGlzLmdldFRpdGxlKCk7XHJcblx0XHRyZXR1cm4gaGVhZGVycztcclxuXHRcdH0sXHJcblx0dGhpcy5nZXRMaW5lVGV4dCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIG5vZGUgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0aWYobm9kZS5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHR2YXIgdGV4dCA9IG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS5odG1sKCk7XHJcblx0XHRcdHZhciB0ZXh0TWF0Y2hlcyA9IHRleHQubWF0Y2goL14oLispPGJyPlxccyokLyk7XHJcblx0XHRcdGlmKHRleHRNYXRjaGVzKXtcclxuXHRcdFx0XHR0ZXh0ID0gdGV4dE1hdGNoZXNbMV07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gY29uY29yZEluc3RhbmNlLmVkaXRvci51bmVzY2FwZSh0ZXh0KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHR9O1xyXG5cdHRoaXMuZ2V0UmVuZGVyTW9kZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRpZihyb290LmRhdGEoXCJyZW5kZXJNb2RlXCIpIT09dW5kZWZpbmVkKXtcclxuXHRcdFx0cmV0dXJuIChyb290LmRhdGEoXCJyZW5kZXJNb2RlXCIpPT09dHJ1ZSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5nZXRUaXRsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHJvb3QuZGF0YShcInRpdGxlXCIpO1xyXG5cdFx0fTtcclxuXHR0aGlzLmdvID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBjb3VudCwgbXVsdGlwbGUsIHRleHRNb2RlKSB7XHJcblx0XHRpZihjb3VudD09PXVuZGVmaW5lZCkge1xyXG5cdFx0XHRjb3VudCA9IDE7XHJcblx0XHRcdH1cclxuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0aWYodGV4dE1vZGU9PXVuZGVmaW5lZCl7XHJcblx0XHRcdHRleHRNb2RlID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdHRoaXMuc2V0VGV4dE1vZGUodGV4dE1vZGUpO1xyXG5cdFx0dmFyIGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IGZhbHNlO1xyXG5cdFx0c3dpdGNoKGRpcmVjdGlvbikge1xyXG5cdFx0XHRjYXNlIHVwOlxyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgcHJldiA9IGN1cnNvci5wcmV2KCk7XHJcblx0XHRcdFx0XHRpZihwcmV2Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdGN1cnNvciA9IHByZXY7XHJcblx0XHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XHJcblx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IsIG11bHRpcGxlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBkb3duOlxyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgbmV4dCA9IGN1cnNvci5uZXh0KCk7XHJcblx0XHRcdFx0XHRpZihuZXh0Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdGN1cnNvciA9IG5leHQ7XHJcblx0XHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XHJcblx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IsIG11bHRpcGxlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBsZWZ0OlxyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdFx0aWYocGFyZW50Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdGN1cnNvciA9IHBhcmVudDtcclxuXHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKGN1cnNvciwgbXVsdGlwbGUpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIHJpZ2h0OlxyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgZmlyc3RTaWJsaW5nID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdFx0aWYoZmlyc3RTaWJsaW5nLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdGN1cnNvciA9IGZpcnN0U2libGluZztcclxuXHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKGN1cnNvciwgbXVsdGlwbGUpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIGZsYXR1cDpcclxuXHRcdFx0XHR2YXIgbm9kZUNvdW50ID0gMDtcclxuXHRcdFx0XHR3aGlsZShjdXJzb3IgJiYgKG5vZGVDb3VudCA8IGNvdW50KSkge1xyXG5cdFx0XHRcdFx0dmFyIGN1cnNvciA9IHRoaXMuX3dhbGtfdXAoY3Vyc29yKTtcclxuXHRcdFx0XHRcdGlmKGN1cnNvcikge1xyXG5cdFx0XHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpICYmIChjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKS5jaGlsZHJlbigpLnNpemUoKSA+IDApKSB7XHJcblx0XHRcdFx0XHRcdFx0bm9kZUNvdW50Kys7XHJcblx0XHRcdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRpZihub2RlQ291bnQgPT0gY291bnQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0Q3Vyc29yKGN1cnNvciwgbXVsdGlwbGUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIGZsYXRkb3duOlxyXG5cdFx0XHRcdHZhciBub2RlQ291bnQgPSAwO1xyXG5cdFx0XHRcdHdoaWxlKGN1cnNvciAmJiAobm9kZUNvdW50IDwgY291bnQpKSB7XHJcblx0XHRcdFx0XHR2YXIgbmV4dCA9IG51bGw7XHJcblx0XHRcdFx0XHRpZighY3Vyc29yLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpKSB7XHJcblx0XHRcdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XHJcblx0XHRcdFx0XHRcdGlmKG91dGxpbmUubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgZmlyc3RDaGlsZCA9IG91dGxpbmUuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHRcdG5leHQgPSBmaXJzdENoaWxkO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYoIW5leHQpIHtcclxuXHRcdFx0XHRcdFx0bmV4dCA9IHRoaXMuX3dhbGtfZG93bihjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjdXJzb3IgPSBuZXh0O1xyXG5cdFx0XHRcdFx0aWYoY3Vyc29yKSB7XHJcblx0XHRcdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikgJiYgKGN1cnNvci5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkuc2l6ZSgpID4gMCkpIHtcclxuXHRcdFx0XHRcdFx0XHRub2RlQ291bnQrKztcclxuXHRcdFx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGlmKG5vZGVDb3VudCA9PSBjb3VudCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoY3Vyc29yLCBtdWx0aXBsZSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdHJldHVybiBhYmxlVG9Nb3ZlSW5EaXJlY3Rpb247XHJcblx0XHR9O1xyXG5cdHRoaXMuaW5zZXJ0ID0gZnVuY3Rpb24oaW5zZXJ0VGV4dCwgaW5zZXJ0RGlyZWN0aW9uKSB7XHJcblx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xyXG5cdFx0dmFyIGxldmVsID0gdGhpcy5nZXRDdXJzb3IoKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGgrMTtcclxuXHRcdHZhciBub2RlID0gJChcIjxsaT48L2xpPlwiKTtcclxuXHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLW5vZGVcIik7XHJcblx0XHRzd2l0Y2goaW5zZXJ0RGlyZWN0aW9uKXtcclxuXHRcdFx0Y2FzZSByaWdodDpcclxuXHRcdFx0XHRsZXZlbCs9MTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBsZWZ0OlxyXG5cdFx0XHRcdGxldmVsLT0xO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHRub2RlLmFkZENsYXNzKFwiY29uY29yZC1sZXZlbC1cIitsZXZlbCk7XHJcblx0XHR2YXIgd3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXdyYXBwZXInPjwvZGl2PlwiKTtcclxuXHRcdHZhciBpY29uTmFtZT1cImNhcmV0LXJpZ2h0XCI7XHJcblx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tXCIrIGljb25OYW1lICtcIlxcXCI+PFwiK1wiL2k+XCI7XHJcblx0XHR3cmFwcGVyLmFwcGVuZChpY29uKTtcclxuXHRcdHdyYXBwZXIuYWRkQ2xhc3MoXCJ0eXBlLWljb25cIik7XHJcblx0XHR2YXIgdGV4dCA9ICQoXCI8ZGl2IGNsYXNzPSdjb25jb3JkLXRleHQnIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSc+PC9kaXY+XCIpO1xyXG5cdFx0dGV4dC5hZGRDbGFzcyhcImNvbmNvcmQtbGV2ZWwtXCIrbGV2ZWwrXCItdGV4dFwiKTtcclxuXHRcdHZhciBvdXRsaW5lID0gJChcIjxvbD48L29sPlwiKTtcclxuXHRcdHRleHQuYXBwZW5kVG8od3JhcHBlcik7XHJcblx0XHR3cmFwcGVyLmFwcGVuZFRvKG5vZGUpO1xyXG5cdFx0b3V0bGluZS5hcHBlbmRUbyhub2RlKTtcclxuXHRcdGlmKGluc2VydFRleHQgJiYgKGluc2VydFRleHQhPVwiXCIpKXtcclxuXHRcdFx0dGV4dC5odG1sKGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZXNjYXBlKGluc2VydFRleHQpKTtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIGN1cnNvciA9IHRoaXMuZ2V0Q3Vyc29yKCk7XHJcblx0XHRpZighaW5zZXJ0RGlyZWN0aW9uKSB7XHJcblx0XHRcdGluc2VydERpcmVjdGlvbiA9IGRvd247XHJcblx0XHRcdH1cclxuXHRcdHN3aXRjaChpbnNlcnREaXJlY3Rpb24pIHtcclxuXHRcdFx0Y2FzZSBkb3duOlxyXG5cdFx0XHRcdGN1cnNvci5hZnRlcihub2RlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSByaWdodDpcclxuXHRcdFx0XHRjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKS5wcmVwZW5kKG5vZGUpO1xyXG5cdFx0XHRcdHRoaXMuZXhwYW5kKGZhbHNlKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSB1cDpcclxuXHRcdFx0XHRjdXJzb3IuYmVmb3JlKG5vZGUpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIGxlZnQ6XHJcblx0XHRcdFx0dmFyIHBhcmVudCA9IGN1cnNvci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRpZihwYXJlbnQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdHBhcmVudC5hZnRlcihub2RlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0dGhpcy5zZXRDdXJzb3Iobm9kZSk7XHJcblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BJbnNlcnRcIiwgdGhpcy5zZXRDdXJzb3JDb250ZXh0KG5vZGUpKTtcclxuXHRcdHJldHVybiBub2RlO1xyXG5cdFx0fTtcclxuXHR0aGlzLmluc2VydEltYWdlID0gZnVuY3Rpb24odXJsKXtcclxuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpbnNlcnRJbWFnZVwiLCBudWxsLCB1cmwpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmluc2VydCgnPGltZyBzcmM9XCInK3VybCsnXCI+JywgZG93bik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmluc2VydFRleHQgPSBmdW5jdGlvbih0ZXh0KXtcclxuXHRcdHZhciBub2RlcyA9ICQoXCI8b2w+PC9vbD5cIik7XHJcblx0XHR2YXIgbGFzdExldmVsID0gMDtcclxuXHRcdHZhciBzdGFydGluZ2xpbmUgPSAwO1xyXG5cdFx0dmFyIHN0YXJ0aW5nbGV2ZWwgPSAwO1xyXG5cdFx0dmFyIGxhc3ROb2RlID0gbnVsbDtcclxuXHRcdHZhciBwYXJlbnQgPSBudWxsO1xyXG5cdFx0dmFyIHBhcmVudHMgPSB7fTtcclxuXHRcdHZhciBsaW5lcyA9IHRleHQuc3BsaXQoXCJcXG5cIik7XHJcblx0XHR2YXIgd29ya2Zsb3d5PXRydWU7XHJcblx0XHR2YXIgd29ya2Zsb3d5UGFyZW50ID0gbnVsbDtcclxuXHRcdHZhciBmaXJzdGxpbmV3aXRoY29udGVudCA9IDA7XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspe1xyXG5cdFx0XHR2YXIgbGluZSA9IGxpbmVzW2ldO1xyXG5cdFx0XHRpZighbGluZS5tYXRjaCgvXlxccyokLykpe1xyXG5cdFx0XHRcdGZpcnN0bGluZXdpdGhjb250ZW50ID0gaTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGlmKGxpbmVzLmxlbmd0aD4oZmlyc3RsaW5ld2l0aGNvbnRlbnQrMikpe1xyXG5cdFx0XHRpZigobGluZXNbZmlyc3RsaW5ld2l0aGNvbnRlbnRdLm1hdGNoKC9eKFtcXHRcXHNdKilcXC0uKiQvKT09bnVsbCkgJiYgbGluZXNbZmlyc3RsaW5ld2l0aGNvbnRlbnRdLm1hdGNoKC9eLiskLykgJiYgKGxpbmVzW2ZpcnN0bGluZXdpdGhjb250ZW50KzFdPT1cIlwiKSl7XHJcblx0XHRcdFx0c3RhcnRpbmdsaW5lID0gZmlyc3RsaW5ld2l0aGNvbnRlbnQrMjtcclxuXHRcdFx0XHR2YXIgd29ya2Zsb3d5UGFyZW50ID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5tYWtlTm9kZSgpO1xyXG5cdFx0XHRcdHdvcmtmbG93eVBhcmVudC5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIikuY2hpbGRyZW4oXCIuY29uY29yZC10ZXh0XCIpLmh0bWwobGluZXNbZmlyc3RsaW5ld2l0aGNvbnRlbnRdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGZvcih2YXIgaSA9IHN0YXJ0aW5nbGluZTsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0dmFyIGxpbmUgPSBsaW5lc1tpXTtcclxuXHRcdFx0aWYoKGxpbmUhPVwiXCIpICYmICFsaW5lLm1hdGNoKC9eXFxzKyQvKSAmJiAobGluZS5tYXRjaCgvXihbXFx0XFxzXSopXFwtLiokLyk9PW51bGwpKXtcclxuXHRcdFx0XHR3b3JrZmxvd3k9ZmFsc2U7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRpZighd29ya2Zsb3d5KXtcclxuXHRcdFx0c3RhcnRpbmdsaW5lID0gMDtcclxuXHRcdFx0d29ya2Zsb3d5UGFyZW50PW51bGw7XHJcblx0XHRcdH1cclxuXHRcdGZvcih2YXIgaSA9IHN0YXJ0aW5nbGluZTsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKXtcclxuXHRcdFx0dmFyIGxpbmUgPSBsaW5lc1tpXTtcclxuXHRcdFx0aWYoKGxpbmUhPVwiXCIpICYmICFsaW5lLm1hdGNoKC9eXFxzKyQvKSl7XHJcblx0XHRcdFx0dmFyIG1hdGNoZXMgPSBsaW5lLm1hdGNoKC9eKFtcXHRcXHNdKikoLispJC8pO1xyXG5cdFx0XHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5tYWtlTm9kZSgpO1xyXG5cdFx0XHRcdHZhciBub2RlVGV4dCA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZXNjYXBlKG1hdGNoZXNbMl0pO1xyXG5cdFx0XHRcdGlmKHdvcmtmbG93eSl7XHJcblx0XHRcdFx0XHR2YXIgbm9kZVRleHRNYXRjaGVzID0gbm9kZVRleHQubWF0Y2goL14oW1xcdFxcc10qKVxcLVxccyooLispJC8pXHJcblx0XHRcdFx0XHRpZihub2RlVGV4dE1hdGNoZXMhPW51bGwpe1xyXG5cdFx0XHRcdFx0XHRub2RlVGV4dCA9IG5vZGVUZXh0TWF0Y2hlc1syXTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dFwiKS5odG1sKG5vZGVUZXh0KTtcclxuXHRcdFx0XHR2YXIgbGV2ZWwgPSBzdGFydGluZ2xldmVsO1xyXG5cdFx0XHRcdGlmKG1hdGNoZXNbMV0pe1xyXG5cdFx0XHRcdFx0aWYod29ya2Zsb3d5KXtcclxuXHRcdFx0XHRcdFx0bGV2ZWwgPSAobWF0Y2hlc1sxXS5sZW5ndGggLyAyKSArIHN0YXJ0aW5nbGV2ZWw7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRsZXZlbCA9IG1hdGNoZXNbMV0ubGVuZ3RoICsgc3RhcnRpbmdsZXZlbDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYobGV2ZWw+bGFzdExldmVsKXtcclxuXHRcdFx0XHRcdFx0cGFyZW50c1tsYXN0TGV2ZWxdPWxhc3ROb2RlO1xyXG5cdFx0XHRcdFx0XHRwYXJlbnQgPSBsYXN0Tm9kZTtcclxuXHRcdFx0XHRcdFx0fWVsc2UgaWYgKChsZXZlbD4wKSAmJiAobGV2ZWwgPCBsYXN0TGV2ZWwpKXtcclxuXHRcdFx0XHRcdFx0XHRwYXJlbnQgPSBwYXJlbnRzW2xldmVsLTFdO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRpZihwYXJlbnQgJiYgKGxldmVsID4gMCkpe1xyXG5cdFx0XHRcdFx0cGFyZW50LmNoaWxkcmVuKFwib2xcIikuYXBwZW5kKG5vZGUpO1xyXG5cdFx0XHRcdFx0cGFyZW50LmFkZENsYXNzKFwiY29sbGFwc2VkXCIpO1xyXG5cdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdHBhcmVudHMgPSB7fTtcclxuXHRcdFx0XHRcdFx0bm9kZXMuYXBwZW5kKG5vZGUpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0bGFzdE5vZGUgPSBub2RlO1xyXG5cdFx0XHRcdGxhc3RMZXZlbCA9IGxldmVsO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0aWYod29ya2Zsb3d5UGFyZW50KXtcclxuXHRcdFx0aWYobm9kZXMuY2hpbGRyZW4oKS5sZW5ndGggPiAwKXtcclxuXHRcdFx0XHR3b3JrZmxvd3lQYXJlbnQuYWRkQ2xhc3MoXCJjb2xsYXBzZWRcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR2YXIgY2xvbmVkTm9kZXMgPSBub2Rlcy5jbG9uZSgpO1xyXG5cdFx0XHRjbG9uZWROb2Rlcy5jaGlsZHJlbigpLmFwcGVuZFRvKHdvcmtmbG93eVBhcmVudC5jaGlsZHJlbihcIm9sXCIpKTtcclxuXHRcdFx0bm9kZXMgPSAkKFwiPG9sPjwvb2w+XCIpO1xyXG5cdFx0XHRub2Rlcy5hcHBlbmQod29ya2Zsb3d5UGFyZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0aWYobm9kZXMuY2hpbGRyZW4oKS5sZW5ndGg+MCl7XHJcblx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XHJcblx0XHRcdHRoaXMuc2V0VGV4dE1vZGUoZmFsc2UpO1xyXG5cdFx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcclxuXHRcdFx0bm9kZXMuY2hpbGRyZW4oKS5pbnNlcnRBZnRlcihjdXJzb3IpO1xyXG5cdFx0XHR0aGlzLnNldEN1cnNvcihjdXJzb3IubmV4dCgpKTtcclxuXHRcdFx0Y29uY29yZEluc3RhbmNlLnJvb3QucmVtb3ZlRGF0YShcImNsaXBib2FyZFwiKTtcclxuXHRcdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlY2FsY3VsYXRlTGV2ZWxzKCk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0dGhpcy5pbnNlcnRYbWwgPSBmdW5jdGlvbihvcG1sdGV4dCxkaXIpe1xyXG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcclxuXHRcdHZhciBkb2MgPSBudWxsO1xyXG5cdFx0dmFyIG5vZGVzID0gJChcIjxvbD48L29sPlwiKTtcclxuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0dmFyIGxldmVsID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlXCIpLmxlbmd0aCsxO1xyXG5cdFx0aWYoIWRpcil7XHJcblx0XHRcdGRpciA9IGRvd247XHJcblx0XHRcdH1cclxuXHRcdHN3aXRjaChkaXIpe1xyXG5cdFx0XHRjYXNlIHJpZ2h0OlxyXG5cdFx0XHRcdGxldmVsKz0xO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIGxlZnQ6XHJcblx0XHRcdFx0bGV2ZWwtPTE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdGlmKHR5cGVvZiBvcG1sdGV4dCA9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdGRvYyA9ICQoJC5wYXJzZVhNTChvcG1sdGV4dCkpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRvYyA9ICQob3BtbHRleHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdGRvYy5maW5kKFwiYm9keVwiKS5jaGlsZHJlbihcIm91dGxpbmVcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0bm9kZXMuYXBwZW5kKGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuYnVpbGQoJCh0aGlzKSwgdHJ1ZSwgbGV2ZWwpKTtcclxuXHRcdFx0fSk7XHJcblx0XHR2YXIgZXhwYW5zaW9uU3RhdGUgPSBkb2MuZmluZChcImV4cGFuc2lvblN0YXRlXCIpO1xyXG5cdFx0aWYoZXhwYW5zaW9uU3RhdGUgJiYgZXhwYW5zaW9uU3RhdGUudGV4dCgpICYmIChleHBhbnNpb25TdGF0ZS50ZXh0KCkhPVwiXCIpKXtcclxuXHRcdFx0dmFyIGV4cGFuc2lvblN0YXRlcyA9IGV4cGFuc2lvblN0YXRlLnRleHQoKS5zcGxpdChcIixcIik7XHJcblx0XHRcdHZhciBub2RlSWQ9MTtcclxuXHRcdFx0bm9kZXMuZmluZChcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGlmKGV4cGFuc2lvblN0YXRlcy5pbmRleE9mKFwiXCIrbm9kZUlkKSA+PSAwKXtcclxuXHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3MoXCJjb2xsYXBzZWRcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0bm9kZUlkKys7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdHN3aXRjaChkaXIpIHtcclxuXHRcdFx0Y2FzZSBkb3duOlxyXG5cdFx0XHRcdG5vZGVzLmNoaWxkcmVuKCkuaW5zZXJ0QWZ0ZXIoY3Vyc29yKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSByaWdodDpcclxuXHRcdFx0XHRub2Rlcy5jaGlsZHJlbigpLnByZXBlbmRUbyhjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKSk7XHJcblx0XHRcdFx0dGhpcy5leHBhbmQoZmFsc2UpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIHVwOlxyXG5cdFx0XHRcdG5vZGVzLmNoaWxkcmVuKCkuaW5zZXJ0QmVmb3JlKGN1cnNvcik7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgbGVmdDpcclxuXHRcdFx0XHR2YXIgcGFyZW50ID0gY3Vyc29yLnBhcmVudHMoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRcdGlmKHBhcmVudC5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0bm9kZXMuY2hpbGRyZW4oKS5pbnNlcnRBZnRlcihwYXJlbnQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy5pblRleHRNb2RlID0gZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiByb290Lmhhc0NsYXNzKFwidGV4dE1vZGVcIik7XHJcblx0XHR9O1xyXG5cdHRoaXMuaXRhbGljID0gZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XHJcblx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiaXRhbGljXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmZvY3VzQ3Vyc29yKCk7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIik7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJpdGFsaWNcIik7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJ1bnNlbGVjdFwiKTtcclxuXHRcdFx0XHR0aGlzLmJsdXJDdXJzb3IoKTtcclxuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UucGFzdGVCaW5Gb2N1cygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdH07XHJcblx0dGhpcy5sZXZlbCA9IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRDdXJzb3IoKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5sZW5ndGgrMTtcclxuXHRcdH0sXHJcblx0dGhpcy5saW5rID0gZnVuY3Rpb24odXJsKXtcclxuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0XHR2YXIgaW5zdGFuY2UgPSB0aGlzO1xyXG5cdFx0XHRcdGNvbmNvcmQub25SZXN1bWUoZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdGluc3RhbmNlLmxpbmsodXJsKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdHZhciByYW5nZSA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XHJcblx0XHRcdGlmKHJhbmdlPT09dW5kZWZpbmVkKXtcclxuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlc3RvcmVTZWxlY3Rpb24oKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZ2V0U2VsZWN0aW9uKCkpe1xyXG5cdFx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjcmVhdGVMaW5rXCIsIG51bGwsIHVybCk7XHJcblx0XHRcdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLm1hcmtDaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyb290LmRhdGEoXCJjaGFuZ2VkXCIsIHRydWUpO1xyXG5cdFx0aWYoIXRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZS5kaXJ0eVwiKS5yZW1vdmVDbGFzcyhcImRpcnR5XCIpO1xyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy5wYXN0ZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRpZighdGhpcy5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRpZihyb290LmRhdGEoXCJjbGlwYm9hcmRcIikhPW51bGwpe1xyXG5cdFx0XHRcdHZhciBwYXN0ZU5vZGVzID0gcm9vdC5kYXRhKFwiY2xpcGJvYXJkXCIpLmNsb25lKHRydWUsdHJ1ZSk7XHJcblx0XHRcdFx0aWYocGFzdGVOb2Rlcy5sZW5ndGg+MCl7XHJcblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0cm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRcIik7XHJcblx0XHRcdFx0XHRwYXN0ZU5vZGVzLmluc2VydEFmdGVyKHRoaXMuZ2V0Q3Vyc29yKCkpO1xyXG5cdFx0XHRcdFx0dGhpcy5zZXRDdXJzb3IoJChwYXN0ZU5vZGVzWzBdKSwgKHBhc3RlTm9kZXMubGVuZ3RoPjEpKTtcclxuXHRcdFx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5wcm9tb3RlID0gZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XHJcblx0XHRpZihub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5sZW5ndGggPiAwKXtcclxuXHRcdFx0dGhpcy5zYXZlU3RhdGUoKTtcclxuXHRcdFx0bm9kZS5jaGlsZHJlbihcIm9sXCIpLmNoaWxkcmVuKCkucmV2ZXJzZSgpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIGNoaWxkID0gJCh0aGlzKS5jbG9uZSh0cnVlLCB0cnVlKTtcclxuXHRcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xyXG5cdFx0XHRcdG5vZGUuYWZ0ZXIoY2hpbGQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlY2FsY3VsYXRlTGV2ZWxzKG5vZGUucGFyZW50KCkuZmluZChcIi5jb25jb3JkLW5vZGVcIikpO1xyXG5cdFx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5yZWRyYXcgPSBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGN0ID0gMTtcclxuXHRcdHZhciBjdXJzb3JJbmRleCA9IDE7XHJcblx0XHR2YXIgd2FzQ2hhbmdlZCA9IHRoaXMuY2hhbmdlZCgpO1xyXG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTp2aXNpYmxlXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYoJCh0aGlzKS5oYXNDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpKXtcclxuXHRcdFx0XHRjdXJzb3JJbmRleD1jdDtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRjdCsrO1xyXG5cdFx0XHR9KTtcclxuXHRcdHRoaXMueG1sVG9PdXRsaW5lKHRoaXMub3V0bGluZVRvWG1sKCkpO1xyXG5cdFx0Y3Q9MTtcclxuXHRcdHZhciB0aGlzT3AgPSB0aGlzO1xyXG5cdFx0cm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTp2aXNpYmxlXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYoY3Vyc29ySW5kZXg9PWN0KXtcclxuXHRcdFx0XHR0aGlzT3Auc2V0Q3Vyc29yKCQodGhpcykpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGN0Kys7XHJcblx0XHRcdH0pO1xyXG5cdFx0aWYod2FzQ2hhbmdlZCl7XHJcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLnJlb3JnID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBjb3VudCkge1xyXG5cdFx0aWYoY291bnQ9PT11bmRlZmluZWQpIHtcclxuXHRcdFx0Y291bnQgPSAxO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgYWJsZVRvTW92ZUluRGlyZWN0aW9uID0gZmFsc2U7XHJcblx0XHR2YXIgY3Vyc29yID0gdGhpcy5nZXRDdXJzb3IoKTtcclxuXHRcdHZhciByYW5nZSA9IHVuZGVmaW5lZDtcclxuXHRcdHZhciB0b01vdmUgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0dmFyIHNlbGVjdGVkID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpO1xyXG5cdFx0dmFyIGl0ZXJhdGlvbiA9IDE7XHJcblx0XHRpZihzZWxlY3RlZC5sZW5ndGg+MSl7XHJcblx0XHRcdGN1cnNvciA9IHJvb3QuZmluZChcIi5zZWxlY3RlZDpmaXJzdFwiKTtcclxuXHRcdFx0dG9Nb3ZlID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRzd2l0Y2goZGlyZWN0aW9uKSB7XHJcblx0XHRcdGNhc2UgdXA6XHJcblx0XHRcdFx0dmFyIHByZXYgPSBjdXJzb3IucHJldigpO1xyXG5cdFx0XHRcdGlmKHByZXYubGVuZ3RoPT0xKSB7XHJcblx0XHRcdFx0XHR3aGlsZShpdGVyYXRpb24gPCBjb3VudCl7XHJcblx0XHRcdFx0XHRcdGlmKHByZXYucHJldigpLmxlbmd0aD09MSl7XHJcblx0XHRcdFx0XHRcdFx0cHJldiA9IHByZXYucHJldigpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGl0ZXJhdGlvbisrO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0dmFyIGNsb25lZE1vdmUgPSB0b01vdmUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHR0b01vdmUucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRjbG9uZWRNb3ZlLmluc2VydEJlZm9yZShwcmV2KTtcclxuXHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgZG93bjpcclxuXHRcdFx0XHRpZighdGhpcy5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdFx0Y3Vyc29yID0gcm9vdC5maW5kKFwiLnNlbGVjdGVkOmxhc3RcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0dmFyIG5leHQgPSBjdXJzb3IubmV4dCgpO1xyXG5cdFx0XHRcdGlmKG5leHQubGVuZ3RoPT0xKSB7XHJcblx0XHRcdFx0XHR3aGlsZShpdGVyYXRpb24gPCBjb3VudCl7XHJcblx0XHRcdFx0XHRcdGlmKG5leHQubmV4dCgpLmxlbmd0aD09MSl7XHJcblx0XHRcdFx0XHRcdFx0bmV4dCA9IG5leHQubmV4dCgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGl0ZXJhdGlvbisrO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0dmFyIGNsb25lZE1vdmUgPSB0b01vdmUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHR0b01vdmUucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRjbG9uZWRNb3ZlLmluc2VydEFmdGVyKG5leHQpO1xyXG5cdFx0XHRcdFx0YWJsZVRvTW92ZUluRGlyZWN0aW9uID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBsZWZ0OlxyXG5cdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLnBhcmVudCgpO1xyXG5cdFx0XHRcdGlmKCFvdXRsaW5lLmhhc0NsYXNzKFwiY29uY29yZC1yb290XCIpKSB7XHJcblx0XHRcdFx0XHR2YXIgcGFyZW50ID0gb3V0bGluZS5wYXJlbnQoKTtcclxuXHRcdFx0XHRcdHdoaWxlKGl0ZXJhdGlvbiA8IGNvdW50KXtcclxuXHRcdFx0XHRcdFx0dmFyIHBhcmVudFBhcmVudCA9IHBhcmVudC5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRcdFx0aWYocGFyZW50UGFyZW50Lmxlbmd0aD09MSl7XHJcblx0XHRcdFx0XHRcdFx0cGFyZW50ID0gcGFyZW50UGFyZW50O1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGl0ZXJhdGlvbisrO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0dmFyIGNsb25lZE1vdmUgPSB0b01vdmUuY2xvbmUodHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHR0b01vdmUucmVtb3ZlKCk7XHJcblx0XHRcdFx0XHRjbG9uZWRNb3ZlLmluc2VydEFmdGVyKHBhcmVudCk7XHJcblx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnJlY2FsY3VsYXRlTGV2ZWxzKHBhcmVudC5uZXh0QWxsKFwiLmNvbmNvcmQtbm9kZVwiKSk7XHJcblx0XHRcdFx0XHRhYmxlVG9Nb3ZlSW5EaXJlY3Rpb24gPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIHJpZ2h0OlxyXG5cdFx0XHRcdHZhciBwcmV2ID0gY3Vyc29yLnByZXYoKTtcclxuXHRcdFx0XHRpZihwcmV2Lmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHR0aGlzLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0d2hpbGUoaXRlcmF0aW9uIDwgY291bnQpe1xyXG5cdFx0XHRcdFx0XHRpZihwcmV2LmNoaWxkcmVuKFwib2xcIikubGVuZ3RoPT0xKXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgcHJldk5vZGUgPSBwcmV2LmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlOmxhc3RcIik7XHJcblx0XHRcdFx0XHRcdFx0aWYocHJldk5vZGUubGVuZ3RoPT0xKXtcclxuXHRcdFx0XHRcdFx0XHRcdHByZXYgPSBwcmV2Tm9kZTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aXRlcmF0aW9uKys7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBwcmV2T3V0bGluZSA9IHByZXYuY2hpbGRyZW4oXCJvbFwiKTtcclxuXHRcdFx0XHRcdGlmKHByZXZPdXRsaW5lLmxlbmd0aCA9PSAwKSB7XHJcblx0XHRcdFx0XHRcdHByZXZPdXRsaW5lID0gJChcIjxvbD48L29sPlwiKTtcclxuXHRcdFx0XHRcdFx0cHJldk91dGxpbmUuYXBwZW5kVG8ocHJldik7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBjbG9uZWRNb3ZlID0gdG9Nb3ZlLmNsb25lKHRydWUsIHRydWUpO1xyXG5cdFx0XHRcdFx0dG9Nb3ZlLnJlbW92ZSgpO1xyXG5cdFx0XHRcdFx0Y2xvbmVkTW92ZS5hcHBlbmRUbyhwcmV2T3V0bGluZSk7XHJcblx0XHRcdFx0XHRwcmV2LnJlbW92ZUNsYXNzKFwiY29sbGFwc2VkXCIpO1xyXG5cdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5yZWNhbGN1bGF0ZUxldmVscyhwcmV2LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpKTtcclxuXHRcdFx0XHRcdGFibGVUb01vdmVJbkRpcmVjdGlvbiA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdGlmKGFibGVUb01vdmVJbkRpcmVjdGlvbil7XHJcblx0XHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0XHR0aGlzLnNldEN1cnNvcih0aGlzLmdldEN1cnNvcigpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdFx0fVxyXG5cdFx0cmV0dXJuIGFibGVUb01vdmVJbkRpcmVjdGlvbjtcclxuXHRcdH07XHJcblx0dGhpcy5ydW5TZWxlY3Rpb24gPSBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHZhbHVlID0gZXZhbCAodGhpcy5nZXRMaW5lVGV4dCgpKTtcclxuXHRcdHRoaXMuZGVsZXRlU3VicygpO1xyXG5cdFx0dGhpcy5pbnNlcnQodmFsdWUsIFwicmlnaHRcIik7XHJcblx0XHRjb25jb3JkSW5zdGFuY2Uuc2NyaXB0Lm1ha2VDb21tZW50KCk7XHJcblx0XHR0aGlzLmdvKFwibGVmdFwiLCAxKTtcclxuXHRcdH07XHJcblx0dGhpcy5zYXZlU3RhdGUgPSBmdW5jdGlvbigpe1xyXG5cdFx0cm9vdC5kYXRhKFwiY2hhbmdlXCIsIHJvb3QuY2hpbGRyZW4oKS5jbG9uZSh0cnVlLCB0cnVlKSk7XHJcblx0XHRyb290LmRhdGEoXCJjaGFuZ2VUZXh0TW9kZVwiLCB0aGlzLmluVGV4dE1vZGUoKSk7XHJcblx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdHZhciByYW5nZSA9IGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZ2V0U2VsZWN0aW9uKCk7XHJcblx0XHRcdGlmKCByYW5nZSl7XHJcblx0XHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlUmFuZ2VcIixyYW5nZS5jbG9uZVJhbmdlKCkpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlUmFuZ2VcIiwgdW5kZWZpbmVkKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0cm9vdC5kYXRhKFwiY2hhbmdlUmFuZ2VcIiwgdW5kZWZpbmVkKTtcclxuXHRcdFx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy5zZXRDdXJzb3IgPSBmdW5jdGlvbihub2RlLCBtdWx0aXBsZSwgbXVsdGlwbGVSYW5nZSl7XHJcblx0XHRyb290LmZpbmQoXCIuY29uY29yZC1jdXJzb3JcIikucmVtb3ZlQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKTtcclxuXHRcdG5vZGUuYWRkQ2xhc3MoXCJjb25jb3JkLWN1cnNvclwiKTtcclxuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5lZGl0KG5vZGUpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnNlbGVjdChub2RlLCBtdWx0aXBsZSwgbXVsdGlwbGVSYW5nZSk7XHJcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRjb25jb3JkSW5zdGFuY2UuZmlyZUNhbGxiYWNrKFwib3BDdXJzb3JNb3ZlZFwiLCB0aGlzLnNldEN1cnNvckNvbnRleHQobm9kZSkpO1xyXG5cdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5oaWRlQ29udGV4dE1lbnUoKTtcclxuXHRcdH07XHJcblx0dGhpcy5zZXRDdXJzb3JDb250ZXh0ID0gZnVuY3Rpb24oY3Vyc29yKXtcclxuXHRcdHJldHVybiBuZXcgQ29uY29yZE9wKHJvb3QsY29uY29yZEluc3RhbmNlLGN1cnNvcik7XHJcblx0XHR9O1xyXG5cdHRoaXMuc2V0SGVhZGVycyA9IGZ1bmN0aW9uKGhlYWRlcnMpe1xyXG5cdFx0cm9vdC5kYXRhKFwiaGVhZFwiLCBoZWFkZXJzKTtcclxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdH0sXHJcblx0dGhpcy5zZXRMaW5lVGV4dCA9IGZ1bmN0aW9uKHRleHQpIHtcclxuXHRcdHRoaXMuc2F2ZVN0YXRlKCk7XHJcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XHJcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdG5vZGUuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyOmZpcnN0XCIpLmNoaWxkcmVuKFwiLmNvbmNvcmQtdGV4dDpmaXJzdFwiKS5odG1sKGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZXNjYXBlKHRleHQpKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdHRoaXMubWFya0NoYW5nZWQoKTtcclxuXHRcdH07XHJcblx0dGhpcy5zZXRSZW5kZXJNb2RlID0gZnVuY3Rpb24obW9kZSl7XHJcblx0XHRyb290LmRhdGEoXCJyZW5kZXJNb2RlXCIsIG1vZGUpO1xyXG5cdFx0dGhpcy5yZWRyYXcoKTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fTtcclxuXHR0aGlzLnNldFN0eWxlID0gZnVuY3Rpb24oY3NzKXtcclxuXHRcdHJvb3QucGFyZW50KCkuZmluZChcInN0eWxlLmN1c3RvbVN0eWxlXCIpLnJlbW92ZSgpO1xyXG5cdFx0cm9vdC5iZWZvcmUoJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIiBjbGFzcz1cImN1c3RvbVN0eWxlXCI+JysgY3NzICsgJzwvc3R5bGU+Jyk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy5zZXRUZXh0TW9kZSA9IGZ1bmN0aW9uKHRleHRNb2RlKXtcclxuXHRcdHZhciByZWFkb25seSA9IGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpW1wicmVhZG9ubHlcIl07XHJcblx0XHRpZihyZWFkb25seT09dW5kZWZpbmVkKXtcclxuXHRcdFx0cmVhZG9ubHkgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0aWYocmVhZG9ubHkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKHJvb3QuaGFzQ2xhc3MoXCJ0ZXh0TW9kZVwiKSA9PSB0ZXh0TW9kZSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYodGV4dE1vZGU9PXRydWUpe1xyXG5cdFx0XHRyb290LmFkZENsYXNzKFwidGV4dE1vZGVcIik7XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuZWRpdG9yTW9kZSgpO1xyXG5cdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmVkaXQodGhpcy5nZXRDdXJzb3IoKSk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHJvb3QucmVtb3ZlQ2xhc3MoXCJ0ZXh0TW9kZVwiKTtcclxuXHRcdFx0XHRyb290LmZpbmQoXCIuZWRpdGluZ1wiKS5yZW1vdmVDbGFzcyhcImVkaXRpbmdcIik7XHJcblx0XHRcdFx0dGhpcy5ibHVyQ3Vyc29yKCk7XHJcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5zZWxlY3QodGhpcy5nZXRDdXJzb3IoKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLnNldFRpdGxlID0gZnVuY3Rpb24odGl0bGUpIHtcclxuXHRcdHJvb3QuZGF0YShcInRpdGxlXCIsIHRpdGxlKTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fTtcclxuXHR0aGlzLnN0cmlrZXRocm91Z2ggPSBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5zYXZlU3RhdGUoKTtcclxuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzdHJpa2VUaHJvdWdoXCIpO1xyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHR0aGlzLmZvY3VzQ3Vyc29yKCk7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzZWxlY3RBbGxcIik7XHJcblx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJzdHJpa2VUaHJvdWdoXCIpO1xyXG5cdFx0XHRcdGRvY3VtZW50LmV4ZWNDb21tYW5kKFwidW5zZWxlY3RcIik7XHJcblx0XHRcdFx0dGhpcy5ibHVyQ3Vyc29yKCk7XHJcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnBhc3RlQmluRm9jdXMoKTtcclxuXHRcdFx0XHR9XHJcblx0XHR0aGlzLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHR9O1xyXG5cdHRoaXMuc3Vic0V4cGFuZGVkID0gZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgbm9kZSA9IHRoaXMuZ2V0Q3Vyc29yKCk7XHJcblx0XHRpZihub2RlLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdGlmKCFub2RlLmhhc0NsYXNzKFwiY29sbGFwc2VkXCIpICYmIChub2RlLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5zaXplKCkgPiAwKSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH07XHJcblx0dGhpcy5vdXRsaW5lVG9UZXh0ID0gZnVuY3Rpb24oKXtcclxuXHRcdHZhciB0ZXh0ID0gXCJcIjtcclxuXHRcdHJvb3QuY2hpbGRyZW4oXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHRleHQrPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLnRleHRMaW5lKCQodGhpcykpO1xyXG5cdFx0XHR9KTtcclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdFx0fTtcclxuXHR0aGlzLm91dGxpbmVUb1htbCA9IGZ1bmN0aW9uKG93bmVyTmFtZSwgb3duZXJFbWFpbCwgb3duZXJJZCkge1xyXG5cdFx0dmFyIGhlYWQgPSB0aGlzLmdldEhlYWRlcnMoKTtcclxuXHRcdGlmKG93bmVyTmFtZSkge1xyXG5cdFx0XHRoZWFkW1wib3duZXJOYW1lXCJdID0gb3duZXJOYW1lO1xyXG5cdFx0XHR9XHJcblx0XHRpZihvd25lckVtYWlsKSB7XHJcblx0XHRcdGhlYWRbXCJvd25lckVtYWlsXCJdID0gb3duZXJFbWFpbDtcclxuXHRcdFx0fVxyXG5cdFx0aWYob3duZXJJZCkge1xyXG5cdFx0XHRoZWFkW1wib3duZXJJZFwiXSA9IG93bmVySWQ7XHJcblx0XHRcdH1cclxuXHRcdHZhciB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKTtcclxuXHRcdGlmKCF0aXRsZSkge1xyXG5cdFx0XHR0aXRsZSA9IFwiXCI7XHJcblx0XHRcdH1cclxuXHRcdGhlYWRbXCJ0aXRsZVwiXSA9IHRpdGxlO1xyXG5cdFx0aGVhZFtcImRhdGVNb2RpZmllZFwiXSA9IChuZXcgRGF0ZSgpKS50b0dNVFN0cmluZygpO1xyXG5cdFx0dmFyIGV4cGFuc2lvblN0YXRlcyA9IFtdO1xyXG5cdFx0dmFyIG5vZGVJZCA9IDE7XHJcblx0XHR2YXIgY3Vyc29yID0gcm9vdC5maW5kKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdGRvIHtcclxuXHRcdFx0aWYoY3Vyc29yKSB7XHJcblx0XHRcdFx0aWYoIWN1cnNvci5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSAmJiAoY3Vyc29yLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5zaXplKCkgPiAwKSkge1xyXG5cdFx0XHRcdFx0ZXhwYW5zaW9uU3RhdGVzLnB1c2gobm9kZUlkKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRub2RlSWQrKztcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR2YXIgbmV4dCA9IG51bGw7XHJcblx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcclxuXHRcdFx0XHR2YXIgb3V0bGluZSA9IGN1cnNvci5jaGlsZHJlbihcIm9sXCIpO1xyXG5cdFx0XHRcdGlmKG91dGxpbmUubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdHZhciBmaXJzdENoaWxkID0gb3V0bGluZS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdFx0XHRpZihmaXJzdENoaWxkLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdG5leHQgPSBmaXJzdENoaWxkO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRpZighbmV4dCkge1xyXG5cdFx0XHRcdG5leHQgPSB0aGlzLl93YWxrX2Rvd24oY3Vyc29yKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGN1cnNvciA9IG5leHQ7XHJcblx0XHRcdH0gd2hpbGUoY3Vyc29yIT1udWxsKTtcclxuXHRcdGhlYWRbXCJleHBhbnNpb25TdGF0ZVwiXSA9IGV4cGFuc2lvblN0YXRlcy5qb2luKFwiLFwiKTtcclxuXHRcdHZhciBvcG1sID0gJyc7XHJcblx0XHR2YXIgaW5kZW50PTA7XHJcblx0XHR2YXIgYWRkID0gZnVuY3Rpb24ocyl7XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBpbmRlbnQ7IGkrKyl7XHJcblx0XHRcdFx0b3BtbCs9J1xcdCc7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdG9wbWwrPXMrJ1xcbic7XHJcblx0XHRcdH07XHJcblx0XHRhZGQoJzw/eG1sIHZlcnNpb249XCIxLjBcIj8+Jyk7XHJcblx0XHRhZGQoJzxvcG1sIHZlcnNpb249XCIyLjBcIj4nKTtcclxuXHRcdGluZGVudCsrO1xyXG5cdFx0YWRkKCc8aGVhZD4nKTtcclxuXHRcdGluZGVudCsrO1xyXG5cdFx0Zm9yKHZhciBoZWFkTmFtZSBpbiBoZWFkKXtcclxuXHRcdFx0aWYoaGVhZFtoZWFkTmFtZV0hPT11bmRlZmluZWQpe1xyXG5cdFx0XHRcdGFkZCgnPCcraGVhZE5hbWUrJz4nICsgQ29uY29yZFV0aWwuZXNjYXBlWG1sKGhlYWRbaGVhZE5hbWVdKSArICc8LycgKyBoZWFkTmFtZSArICc+Jyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRhZGQoJzwvaGVhZD4nKTtcclxuXHRcdGluZGVudC0tO1xyXG5cdFx0YWRkKCc8Ym9keT4nKTtcclxuXHRcdGluZGVudCsrO1xyXG5cdFx0cm9vdC5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGVcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0b3BtbCArPSBjb25jb3JkSW5zdGFuY2UuZWRpdG9yLm9wbWxMaW5lKCQodGhpcyksIGluZGVudCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0YWRkKCc8L2JvZHk+Jyk7XHJcblx0XHRpbmRlbnQtLTtcclxuXHRcdGFkZCgnPC9vcG1sPicpO1xyXG5cdFx0cmV0dXJuIG9wbWw7XHJcblx0XHR9O1xyXG5cdHRoaXMudW5kbyA9IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgc3RhdGVCZWZvcmVDaGFuZ2UgPSByb290LmNoaWxkcmVuKCkuY2xvbmUodHJ1ZSwgdHJ1ZSk7XHJcblx0XHR2YXIgdGV4dE1vZGVCZWZvcmVDaGFuZ2UgPSB0aGlzLmluVGV4dE1vZGUoKTtcclxuXHRcdHZhciBiZWZvcmVSYW5nZSA9IHVuZGVmaW5lZDtcclxuXHRcdGlmKHRoaXMuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0dmFyIHJhbmdlID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5nZXRTZWxlY3Rpb24oKTtcclxuXHRcdFx0aWYocmFuZ2Upe1xyXG5cdFx0XHRcdGJlZm9yZVJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0aWYocm9vdC5kYXRhKFwiY2hhbmdlXCIpKXtcclxuXHRcdFx0cm9vdC5lbXB0eSgpO1xyXG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VcIikuYXBwZW5kVG8ocm9vdCk7XHJcblx0XHRcdHRoaXMuc2V0VGV4dE1vZGUocm9vdC5kYXRhKFwiY2hhbmdlVGV4dE1vZGVcIikpO1xyXG5cdFx0XHRpZih0aGlzLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdFx0dGhpcy5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdHZhciByYW5nZSA9IHJvb3QuZGF0YShcImNoYW5nZVJhbmdlXCIpO1xyXG5cdFx0XHRcdGlmKHJhbmdlKXtcclxuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IucmVzdG9yZVNlbGVjdGlvbihyYW5nZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VcIiwgc3RhdGVCZWZvcmVDaGFuZ2UpO1xyXG5cdFx0XHRyb290LmRhdGEoXCJjaGFuZ2VUZXh0TW9kZVwiLCB0ZXh0TW9kZUJlZm9yZUNoYW5nZSk7XHJcblx0XHRcdHJvb3QuZGF0YShcImNoYW5nZVJhbmdlXCIsIGJlZm9yZVJhbmdlKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH07XHJcblx0dGhpcy52aXNpdExldmVsID0gZnVuY3Rpb24oY2Ipe1xyXG5cdFx0dmFyIGN1cnNvciA9IHRoaXMuZ2V0Q3Vyc29yKCk7XHJcblx0XHR2YXIgb3AgPSB0aGlzO1xyXG5cdFx0Y3Vyc29yLmNoaWxkcmVuKFwib2xcIikuY2hpbGRyZW4oKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHZhciBzdWJDdXJzb3JDb250ZXh0ID0gb3Auc2V0Q3Vyc29yQ29udGV4dCgkKHRoaXMpKTtcclxuXHRcdFx0Y2Ioc3ViQ3Vyc29yQ29udGV4dCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9O1xyXG5cdHRoaXMudmlzaXRUb1N1bW1pdCA9IGZ1bmN0aW9uKGNiKXtcclxuXHRcdHZhciBjdXJzb3IgPSB0aGlzLmdldEN1cnNvcigpO1xyXG5cdFx0d2hpbGUoY2IodGhpcy5zZXRDdXJzb3JDb250ZXh0KGN1cnNvcikpKXtcclxuXHRcdFx0dmFyIHBhcmVudCA9IGN1cnNvci5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0aWYocGFyZW50Lmxlbmd0aD09MSl7XHJcblx0XHRcdFx0Y3Vyc29yPXBhcmVudDtcclxuXHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy52aXNpdEFsbCA9IGZ1bmN0aW9uKGNiKXtcclxuXHRcdHZhciBvcCA9IHRoaXM7XHJcblx0XHRyb290LmZpbmQoXCIuY29uY29yZC1ub2RlXCIpLmVhY2goZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyIHN1YkN1cnNvckNvbnRleHQgPSBvcC5zZXRDdXJzb3JDb250ZXh0KCQodGhpcykpO1xyXG5cdFx0XHR2YXIgcmV0VmFsID0gY2Ioc3ViQ3Vyc29yQ29udGV4dCk7XHJcblx0XHRcdGlmKChyZXRWYWwhPT11bmRlZmluZWQpICYmIChyZXRWYWw9PT1mYWxzZSkpe1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSxcclxuXHR0aGlzLndpcGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmKHJvb3QuZmluZChcIi5jb25jb3JkLW5vZGVcIikubGVuZ3RoID4gMCl7XHJcblx0XHRcdHRoaXMuc2F2ZVN0YXRlKCk7XHJcblx0XHRcdH1cclxuXHRcdHJvb3QuZW1wdHkoKTtcclxuXHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLmVkaXRvci5tYWtlTm9kZSgpO1xyXG5cdFx0cm9vdC5hcHBlbmQobm9kZSk7XHJcblx0XHR0aGlzLnNldFRleHRNb2RlKGZhbHNlKTtcclxuXHRcdHRoaXMuc2V0Q3Vyc29yKG5vZGUpO1xyXG5cdFx0dGhpcy5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0fTtcclxuXHR0aGlzLnhtbFRvT3V0bGluZSA9IGZ1bmN0aW9uKHhtbFRleHQsIGZsU2V0Rm9jdXMpIHsgLy8yLzIyLzE0IGJ5IERXIC0tIG5ldyBwYXJhbSwgZmxTZXRGb2N1c1xyXG5cdFx0XHJcblx0XHRpZiAoZmxTZXRGb2N1cyA9PSB1bmRlZmluZWQpIHsgLy8yLzIyLzE0IGJ5IERXXHJcblx0XHRcdGZsU2V0Rm9jdXMgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBkb2MgPSBudWxsO1xyXG5cdFx0aWYodHlwZW9mIHhtbFRleHQgPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRkb2MgPSAkKCQucGFyc2VYTUwoeG1sVGV4dCkpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGRvYyA9ICQoeG1sVGV4dCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0cm9vdC5lbXB0eSgpO1xyXG5cdFx0dmFyIHRpdGxlID0gXCJcIjtcclxuXHRcdGlmKGRvYy5maW5kKFwidGl0bGU6Zmlyc3RcIikubGVuZ3RoPT0xKXtcclxuXHRcdFx0dGl0bGUgPSBkb2MuZmluZChcInRpdGxlOmZpcnN0XCIpLnRleHQoKTtcclxuXHRcdFx0fVxyXG5cdFx0dGhpcy5zZXRUaXRsZSh0aXRsZSk7XHJcblx0XHR2YXIgaGVhZGVycyA9IHt9O1xyXG5cdFx0ZG9jLmZpbmQoXCJoZWFkXCIpLmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbigpe1xyXG5cdFx0XHRoZWFkZXJzWyQodGhpcykucHJvcChcInRhZ05hbWVcIildID0gJCh0aGlzKS50ZXh0KCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0cm9vdC5kYXRhKFwiaGVhZFwiLCBoZWFkZXJzKTtcclxuXHRcdGRvYy5maW5kKFwiYm9keVwiKS5jaGlsZHJlbihcIm91dGxpbmVcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0cm9vdC5hcHBlbmQoY29uY29yZEluc3RhbmNlLmVkaXRvci5idWlsZCgkKHRoaXMpLCB0cnVlKSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0cm9vdC5kYXRhKFwiY2hhbmdlZFwiLCBmYWxzZSk7XHJcblx0XHRyb290LnJlbW92ZURhdGEoXCJwcmV2aW91c0NoYW5nZVwiKTtcclxuXHRcdHZhciBleHBhbnNpb25TdGF0ZSA9IGRvYy5maW5kKFwiZXhwYW5zaW9uU3RhdGVcIik7XHJcblx0XHRpZihleHBhbnNpb25TdGF0ZSAmJiBleHBhbnNpb25TdGF0ZS50ZXh0KCkgJiYgKGV4cGFuc2lvblN0YXRlLnRleHQoKSE9XCJcIikpe1xyXG5cdFx0XHR2YXIgZXhwYW5zaW9uU3RhdGVzID0gZXhwYW5zaW9uU3RhdGUudGV4dCgpLnNwbGl0KC9cXHMqLFxccyovKTtcclxuXHRcdFx0dmFyIG5vZGVJZCA9IDE7XHJcblx0XHRcdHZhciBjdXJzb3IgPSByb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpO1xyXG5cdFx0XHRkbyB7XHJcblx0XHRcdFx0aWYoY3Vyc29yKSB7XHJcblx0XHRcdFx0XHRpZihleHBhbnNpb25TdGF0ZXMuaW5kZXhPZihcIlwiK25vZGVJZCkgPj0gMCl7XHJcblx0XHRcdFx0XHRcdGN1cnNvci5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0bm9kZUlkKys7XHJcblx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHR2YXIgbmV4dCA9IG51bGw7XHJcblx0XHRcdFx0aWYoIWN1cnNvci5oYXNDbGFzcyhcImNvbGxhcHNlZFwiKSkge1xyXG5cdFx0XHRcdFx0dmFyIG91dGxpbmUgPSBjdXJzb3IuY2hpbGRyZW4oXCJvbFwiKTtcclxuXHRcdFx0XHRcdGlmKG91dGxpbmUubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGZpcnN0Q2hpbGQgPSBvdXRsaW5lLmNoaWxkcmVuKFwiLmNvbmNvcmQtbm9kZTpmaXJzdFwiKTtcclxuXHRcdFx0XHRcdFx0aWYoZmlyc3RDaGlsZC5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRcdFx0XHRcdG5leHQgPSBmaXJzdENoaWxkO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKCFuZXh0KSB7XHJcblx0XHRcdFx0XHRuZXh0ID0gdGhpcy5fd2Fsa19kb3duKGN1cnNvcik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0Y3Vyc29yID0gbmV4dDtcclxuXHRcdFx0XHR9IHdoaWxlKGN1cnNvciE9bnVsbCk7XHJcblx0XHRcdH1cclxuXHRcdHRoaXMuc2V0VGV4dE1vZGUoZmFsc2UpO1xyXG5cdFx0XHJcblx0XHRpZiAoZmxTZXRGb2N1cykge1xyXG5cdFx0XHR0aGlzLnNldEN1cnNvcihyb290LmZpbmQoXCIuY29uY29yZC1ub2RlOmZpcnN0XCIpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHRyb290LmRhdGEoXCJjdXJyZW50Q2hhbmdlXCIsIHJvb3QuY2hpbGRyZW4oKS5jbG9uZSh0cnVlLCB0cnVlKSk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy5hdHRyaWJ1dGVzID0gbmV3IENvbmNvcmRPcEF0dHJpYnV0ZXMoY29uY29yZEluc3RhbmNlLCB0aGlzLmdldEN1cnNvcigpKTtcclxuXHR9XHJcbmZ1bmN0aW9uIENvbmNvcmRPcEF0dHJpYnV0ZXMoY29uY29yZEluc3RhbmNlLCBjdXJzb3IpIHtcclxuXHR0aGlzLl9jc3NUZXh0Q2xhc3NOYW1lID0gXCJjc3NUZXh0Q2xhc3NcIjtcclxuXHR0aGlzLl9jc3NUZXh0Q2xhc3MgPSBmdW5jdGlvbihuZXdWYWx1ZSl7XHJcblx0XHRpZihuZXdWYWx1ZT09PXVuZGVmaW5lZCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0dmFyIG5ld0Nzc0NsYXNzZXMgPSBuZXdWYWx1ZS5zcGxpdCgvXFxzKy8pO1xyXG5cdFx0dmFyIGNvbmNvcmRUZXh0ID0gY3Vyc29yLmNoaWxkcmVuKFwiLmNvbmNvcmQtd3JhcHBlcjpmaXJzdFwiKS5jaGlsZHJlbihcIi5jb25jb3JkLXRleHQ6Zmlyc3RcIik7XHJcblx0XHR2YXIgY3VycmVudENzc0NsYXNzID0gY29uY29yZFRleHQuYXR0cihcImNsYXNzXCIpO1xyXG5cdFx0aWYoY3VycmVudENzc0NsYXNzKXtcclxuXHRcdFx0dmFyIGNzc0NsYXNzZXNBcnJheSA9IGN1cnJlbnRDc3NDbGFzcy5zcGxpdCgvXFxzKy8pO1xyXG5cdFx0XHRmb3IodmFyIGkgaW4gY3NzQ2xhc3Nlc0FycmF5KXtcclxuXHRcdFx0XHR2YXIgY2xhc3NOYW1lID0gY3NzQ2xhc3Nlc0FycmF5W2ldO1xyXG5cdFx0XHRcdGlmKGNsYXNzTmFtZS5tYXRjaCgvXmNvbmNvcmRcXC0uKyQvKSA9PSBudWxsKXtcclxuXHRcdFx0XHRcdGNvbmNvcmRUZXh0LnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRmb3IodmFyIGogaW4gbmV3Q3NzQ2xhc3Nlcyl7XHJcblx0XHRcdHZhciBuZXdDbGFzcyA9IG5ld0Nzc0NsYXNzZXNbal07XHJcblx0XHRcdGNvbmNvcmRUZXh0LmFkZENsYXNzKG5ld0NsYXNzKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR0aGlzLmFkZEdyb3VwID0gZnVuY3Rpb24oYXR0cmlidXRlcykge1xyXG5cdFx0aWYoYXR0cmlidXRlc1tcInR5cGVcIl0pe1xyXG5cdFx0XHRjdXJzb3IuYXR0cihcIm9wbWwtdHlwZVwiLCBhdHRyaWJ1dGVzW1widHlwZVwiXSk7XHJcblx0XHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjdXJzb3IucmVtb3ZlQXR0cihcIm9wbWwtdHlwZVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0dGhpcy5fY3NzVGV4dENsYXNzKGF0dHJpYnV0ZXNbdGhpcy5fY3NzVGV4dENsYXNzTmFtZV0pO1xyXG5cdFx0dmFyIGZpbmFsQXR0cmlidXRlcyA9IHRoaXMuZ2V0QWxsKCk7XHJcblx0XHR2YXIgaWNvbkF0dHJpYnV0ZSA9IFwidHlwZVwiO1xyXG5cdFx0aWYoYXR0cmlidXRlc1tcImljb25cIl0pe1xyXG5cdFx0XHRpY29uQXR0cmlidXRlID0gXCJpY29uXCI7XHJcblx0XHRcdH1cclxuXHRcdGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVzKXtcclxuXHRcdFx0ZmluYWxBdHRyaWJ1dGVzW25hbWVdID0gYXR0cmlidXRlc1tuYW1lXTtcclxuXHRcdFx0aWYobmFtZT09aWNvbkF0dHJpYnV0ZSl7XHJcblx0XHRcdFx0dmFyIHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcclxuXHRcdFx0XHR2YXIgd3JhcHBlciA9IGN1cnNvci5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIik7XHJcblx0XHRcdFx0dmFyIGljb25OYW1lID0gbnVsbDtcclxuXHRcdFx0XHRpZigobmFtZSA9PSBcInR5cGVcIikgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29uc1t2YWx1ZV0pe1xyXG5cdFx0XHRcdFx0aWNvbk5hbWUgPSBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbdmFsdWVdO1xyXG5cdFx0XHRcdFx0fWVsc2UgaWYgKG5hbWU9PVwiaWNvblwiKXtcclxuXHRcdFx0XHRcdFx0aWNvbk5hbWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKGljb25OYW1lKXtcclxuXHRcdFx0XHRcdHZhciBpY29uID0gXCI8aVwiK1wiIGNsYXNzPVxcXCJub2RlLWljb24gaWNvbi1cIisgaWNvbk5hbWUgK1wiXFxcIj48XCIrXCIvaT5cIjtcclxuXHRcdFx0XHRcdHdyYXBwZXIuY2hpbGRyZW4oXCIubm9kZS1pY29uOmZpcnN0XCIpLnJlcGxhY2VXaXRoKGljb24pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0Y3Vyc29yLmRhdGEoXCJhdHRyaWJ1dGVzXCIsIGZpbmFsQXR0cmlidXRlcyk7XHJcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcclxuXHRcdHJldHVybiBmaW5hbEF0dHJpYnV0ZXM7XHJcblx0XHR9O1xyXG5cdHRoaXMuc2V0R3JvdXAgPSBmdW5jdGlvbihhdHRyaWJ1dGVzKSB7XHJcblx0XHRpZihhdHRyaWJ1dGVzW3RoaXMuX2Nzc1RleHRDbGFzc05hbWVdIT09dW5kZWZpbmVkKXtcclxuXHRcdFx0dGhpcy5fY3NzVGV4dENsYXNzKGF0dHJpYnV0ZXNbdGhpcy5fY3NzVGV4dENsYXNzTmFtZV0pO1xyXG5cdFx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0dGhpcy5fY3NzVGV4dENsYXNzKFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRjdXJzb3IuZGF0YShcImF0dHJpYnV0ZXNcIiwgYXR0cmlidXRlcyk7XHJcblx0XHR2YXIgd3JhcHBlciA9IGN1cnNvci5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIik7XHJcblx0XHQkKGN1cnNvclswXS5hdHRyaWJ1dGVzKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgbWF0Y2hlcyA9IHRoaXMubmFtZS5tYXRjaCgvXm9wbWwtKC4rKSQvKVxyXG5cdFx0XHRpZihtYXRjaGVzKSB7XHJcblx0XHRcdFx0dmFyIG5hbWUgPSBtYXRjaGVzWzFdO1xyXG5cdFx0XHRcdGlmKCFhdHRyaWJ1dGVzW25hbWVdKSB7XHJcblx0XHRcdFx0XHRjdXJzb3IucmVtb3ZlQXR0cih0aGlzLm5hbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR2YXIgaWNvbkF0dHJpYnV0ZSA9IFwidHlwZVwiO1xyXG5cdFx0aWYoYXR0cmlidXRlc1tcImljb25cIl0pe1xyXG5cdFx0XHRpY29uQXR0cmlidXRlID0gXCJpY29uXCI7XHJcblx0XHRcdH1cclxuXHRcdGlmKG5hbWU9PVwidHlwZVwiKXtcclxuXHRcdFx0Y3Vyc29yLmF0dHIoXCJvcG1sLVwiICsgbmFtZSwgYXR0cmlidXRlc1tuYW1lXSk7XHJcblx0XHRcdH1cclxuXHRcdGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVzKSB7XHJcblx0XHRcdGlmKG5hbWU9PWljb25BdHRyaWJ1dGUpe1xyXG5cdFx0XHRcdHZhciB2YWx1ZSA9IGF0dHJpYnV0ZXNbbmFtZV07XHJcblx0XHRcdFx0dmFyIHdyYXBwZXIgPSBjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpO1xyXG5cdFx0XHRcdHZhciBpY29uTmFtZSA9IG51bGw7XHJcblx0XHRcdFx0aWYoKG5hbWUgPT0gXCJ0eXBlXCIpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpICYmIGNvbmNvcmRJbnN0YW5jZS5wcmVmcygpLnR5cGVJY29ucyAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbdmFsdWVdKXtcclxuXHRcdFx0XHRcdGljb25OYW1lID0gY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW3ZhbHVlXTtcclxuXHRcdFx0XHRcdH1lbHNlIGlmIChuYW1lPT1cImljb25cIil7XHJcblx0XHRcdFx0XHRcdGljb25OYW1lID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRpZihpY29uTmFtZSl7XHJcblx0XHRcdFx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tXCIrIGljb25OYW1lICtcIlxcXCI+PFwiK1wiL2k+XCI7XHJcblx0XHRcdFx0XHR3cmFwcGVyLmNoaWxkcmVuKFwiLm5vZGUtaWNvbjpmaXJzdFwiKS5yZXBsYWNlV2l0aChpY29uKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0cmV0dXJuIGF0dHJpYnV0ZXM7XHJcblx0XHR9O1xyXG5cdHRoaXMuZ2V0QWxsID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZihjdXJzb3IuZGF0YShcImF0dHJpYnV0ZXNcIikgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdHJldHVybiBjdXJzb3IuZGF0YShcImF0dHJpYnV0ZXNcIik7XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiB7fTtcclxuXHRcdH07XHJcblx0dGhpcy5nZXRPbmUgPSBmdW5jdGlvbihuYW1lKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRBbGwoKVtuYW1lXTtcclxuXHRcdH07XHJcblx0dGhpcy5tYWtlRW1wdHkgPSBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuX2Nzc1RleHRDbGFzcyhcIlwiKTtcclxuXHRcdHZhciBudW1BdHRyaWJ1dGVzID0gMDtcclxuXHRcdHZhciBhdHRzID0gdGhpcy5nZXRBbGwoKTtcclxuXHRcdGlmKGF0dHMgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdGZvcih2YXIgaSBpbiBhdHRzKXtcclxuXHRcdFx0XHRudW1BdHRyaWJ1dGVzKys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRjdXJzb3IucmVtb3ZlRGF0YShcImF0dHJpYnV0ZXNcIik7XHJcblx0XHR2YXIgcmVtb3ZlZEFueUF0dHJpYnV0ZXMgPSAobnVtQXR0cmlidXRlcyA+IDApO1xyXG5cdFx0dmFyIGF0dHJpYnV0ZXMgPSB7fTtcclxuXHRcdCQoY3Vyc29yWzBdLmF0dHJpYnV0ZXMpLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBtYXRjaGVzID0gdGhpcy5uYW1lLm1hdGNoKC9eb3BtbC0oLispJC8pXHJcblx0XHRcdGlmKG1hdGNoZXMpIHtcclxuXHRcdFx0XHRjdXJzb3IucmVtb3ZlQXR0cih0aGlzLm5hbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRpZihyZW1vdmVkQW55QXR0cmlidXRlcyl7XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gcmVtb3ZlZEFueUF0dHJpYnV0ZXM7XHJcblx0XHR9O1xyXG5cdHRoaXMuc2V0T25lID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcclxuXHRcdGlmKG5hbWU9PXRoaXMuX2Nzc1RleHRDbGFzc05hbWUpe1xyXG5cdFx0XHR0aGlzLl9jc3NUZXh0Q2xhc3ModmFsdWUpO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgYXR0cyA9IHRoaXMuZ2V0QWxsKCk7XHJcblx0XHRhdHRzW25hbWVdPXZhbHVlO1xyXG5cdFx0Y3Vyc29yLmRhdGEoXCJhdHRyaWJ1dGVzXCIsIGF0dHMpO1xyXG5cdFx0aWYoKG5hbWU9PVwidHlwZVwiICl8fCAobmFtZT09XCJpY29uXCIpKXtcclxuXHRcdFx0Y3Vyc29yLmF0dHIoXCJvcG1sLVwiICsgbmFtZSwgdmFsdWUpO1xyXG5cdFx0XHR2YXIgd3JhcHBlciA9IGN1cnNvci5jaGlsZHJlbihcIi5jb25jb3JkLXdyYXBwZXJcIik7XHJcblx0XHRcdHZhciBpY29uTmFtZSA9IG51bGw7XHJcblx0XHRcdGlmKChuYW1lID09IFwidHlwZVwiKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKSAmJiBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnMgJiYgY29uY29yZEluc3RhbmNlLnByZWZzKCkudHlwZUljb25zW3ZhbHVlXSl7XHJcblx0XHRcdFx0aWNvbk5hbWUgPSBjb25jb3JkSW5zdGFuY2UucHJlZnMoKS50eXBlSWNvbnNbdmFsdWVdO1xyXG5cdFx0XHRcdH1lbHNlIGlmIChuYW1lPT1cImljb25cIil7XHJcblx0XHRcdFx0XHRpY29uTmFtZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRpZihpY29uTmFtZSl7XHJcblx0XHRcdFx0dmFyIGljb24gPSBcIjxpXCIrXCIgY2xhc3M9XFxcIm5vZGUtaWNvbiBpY29uLVwiKyBpY29uTmFtZSArXCJcXFwiPjxcIitcIi9pPlwiO1xyXG5cdFx0XHRcdHdyYXBwZXIuY2hpbGRyZW4oXCIubm9kZS1pY29uOmZpcnN0XCIpLnJlcGxhY2VXaXRoKGljb24pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLm1hcmtDaGFuZ2VkKCk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy5leGlzdHMgPSBmdW5jdGlvbihuYW1lKXtcclxuXHRcdGlmKHRoaXMuZ2V0T25lKG5hbWUpICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdH07XHJcblx0dGhpcy5yZW1vdmVPbmUgPSBmdW5jdGlvbihuYW1lKXtcclxuXHRcdGlmKHRoaXMuZ2V0QWxsKClbbmFtZV0pe1xyXG5cdFx0XHRpZihuYW1lID09IHRoaXMuX2Nzc1RleHRDbGFzc05hbWUpe1xyXG5cdFx0XHRcdHRoaXMuX2Nzc1RleHRDbGFzcyhcIlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGRlbGV0ZSB0aGlzLmdldEFsbCgpW25hbWVdO1xyXG5cdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AubWFya0NoYW5nZWQoKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH07XHJcblx0fVxyXG5mdW5jdGlvbiBDb25jb3JkU2NyaXB0KHJvb3QsIGNvbmNvcmRJbnN0YW5jZSl7XHJcblx0dGhpcy5pc0NvbW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmF0dHJpYnV0ZXMuZ2V0T25lKFwiaXNDb21tZW50XCIpIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdHJldHVybiBjb25jb3JkSW5zdGFuY2Uub3AuYXR0cmlidXRlcy5nZXRPbmUoXCJpc0NvbW1lbnRcIik9PVwidHJ1ZVwiO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgcGFyZW50SXNBQ29tbWVudD1mYWxzZTtcclxuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKS5wYXJlbnRzKFwiLmNvbmNvcmQtbm9kZVwiKS5lYWNoKGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3JDb250ZXh0KCQodGhpcykpLmF0dHJpYnV0ZXMuZ2V0T25lKFwiaXNDb21tZW50XCIpID09IFwidHJ1ZVwiKXtcclxuXHRcdFx0XHRwYXJlbnRJc0FDb21tZW50ID0gdHJ1ZTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdHJldHVybiBwYXJlbnRJc0FDb21tZW50O1xyXG5cdFx0fTtcclxuXHR0aGlzLm1ha2VDb21tZW50ID0gZnVuY3Rpb24oKXtcclxuXHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5hdHRyaWJ1dGVzLnNldE9uZShcImlzQ29tbWVudFwiLCBcInRydWVcIik7XHJcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkuYWRkQ2xhc3MoXCJjb25jb3JkLWNvbW1lbnRcIik7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0dGhpcy51bkNvbW1lbnQgPSBmdW5jdGlvbigpe1xyXG5cdFx0Y29uY29yZEluc3RhbmNlLm9wLmF0dHJpYnV0ZXMuc2V0T25lKFwiaXNDb21tZW50XCIsIFwiZmFsc2VcIik7XHJcblx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkucmVtb3ZlQ2xhc3MoXCJjb25jb3JkLWNvbW1lbnRcIik7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH07XHJcblx0fVxyXG5mdW5jdGlvbiBPcChvcG1sdGV4dCl7XHJcblx0dmFyIGZha2VEb20gPSAkKFwiPGRpdj48L2Rpdj5cIik7XHJcblx0ZmFrZURvbS5jb25jb3JkKCkub3AueG1sVG9PdXRsaW5lKG9wbWx0ZXh0KTtcclxuXHRyZXR1cm4gZmFrZURvbS5jb25jb3JkKCkub3A7XHJcblx0fVxyXG4oZnVuY3Rpb24oJCkge1xyXG5cdCQuZm4uY29uY29yZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHRcdHJldHVybiBuZXcgQ29uY29yZE91dGxpbmUoJCh0aGlzKSwgb3B0aW9ucyk7XHJcblx0XHR9O1xyXG5cdCQoZG9jdW1lbnQpLm9uKFwia2V5ZG93blwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0aWYoIWNvbmNvcmQuaGFuZGxlRXZlbnRzKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRpZigkKGV2ZW50LnRhcmdldCkuaXMoXCJpbnB1dFwiKXx8JChldmVudC50YXJnZXQpLmlzKFwidGV4dGFyZWFcIikpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdHZhciBmb2N1c1Jvb3QgPSBjb25jb3JkLmdldEZvY3VzUm9vdCgpO1xyXG5cdFx0aWYoZm9jdXNSb290PT1udWxsKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgY29udGV4dCA9IGZvY3VzUm9vdDtcclxuXHRcdGNvbnRleHQuZGF0YShcImtleWRvd25FdmVudFwiLCBldmVudCk7XHJcblx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gbmV3IENvbmNvcmRPdXRsaW5lKGNvbnRleHQucGFyZW50KCkpO1xyXG5cdFx0dmFyIHJlYWRvbmx5ID0gY29uY29yZEluc3RhbmNlLnByZWZzKClbXCJyZWFkb25seVwiXTtcclxuXHRcdGlmKHJlYWRvbmx5PT11bmRlZmluZWQpe1xyXG5cdFx0XHRyZWFkb25seT1mYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0Ly8gUmVhZG9ubHkgZXhjZXB0aW9ucyBmb3IgYXJyb3cga2V5cyBhbmQgY21kLWNvbW1hXHJcblx0XHRpZihyZWFkb25seSl7XHJcblx0XHRcdGlmKCAoZXZlbnQud2hpY2g+PTM3KSAmJiAoZXZlbnQud2hpY2ggPD00MCkgKXtcclxuXHRcdFx0XHRyZWFkb25seSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiggKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkgJiYgKGV2ZW50LndoaWNoPT0xODgpICl7XHJcblx0XHRcdFx0cmVhZG9ubHkgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdGlmKCFyZWFkb25seSl7XHJcblx0XHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEtleXN0cm9rZVwiLCBldmVudCk7XHJcblx0XHRcdHZhciBrZXlDYXB0dXJlZCA9IGZhbHNlO1xyXG5cdFx0XHR2YXIgY29tbWFuZEtleSA9IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleTtcclxuXHRcdFx0c3dpdGNoKGV2ZW50LndoaWNoKSB7XHJcblx0XHRcdFx0Y2FzZSA4OlxyXG5cdFx0XHRcdFx0Ly9CYWNrc3BhY2VcclxuXHRcdFx0XHRcdGlmKGNvbmNvcmQubW9iaWxlKXtcclxuXHRcdFx0XHRcdFx0aWYoKGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRMaW5lVGV4dCgpPT1cIlwiKSB8fCAoY29uY29yZEluc3RhbmNlLm9wLmdldExpbmVUZXh0KCk9PVwiPGJyPlwiKSl7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVsZXRlTGluZSgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZighY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmhhc0NsYXNzKFwiZGlydHlcIikpe1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpLmFkZENsYXNzKFwiZGlydHlcIik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZUxpbmUoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA5OlxyXG5cdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cdFx0XHRcdFx0aWYoZXZlbnQuc2hpZnRLZXkpIHtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJlb3JnKGxlZnQpXHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJlb3JnKHJpZ2h0KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDY1OlxyXG5cdFx0XHRcdFx0Ly9DTUQrQVxyXG5cdFx0XHRcdFx0XHRpZihjb21tYW5kS2V5KSB7XHJcblx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5mb2N1c0N1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ3NlbGVjdEFsbCcsZmFsc2UsbnVsbCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5zZWxlY3Rpb25Nb2RlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGN1cnNvci5wYXJlbnQoKS5jaGlsZHJlbigpLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgODU6XHJcblx0XHRcdFx0XHQvL0NNRCtVXHJcblx0XHRcdFx0XHRcdGlmKGNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AucmVvcmcodXApO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA2ODpcclxuXHRcdFx0XHRcdC8vQ01EK0RcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5yZW9yZyhkb3duKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDc2OlxyXG5cdFx0XHRcdFx0Ly9DTUQrTFxyXG5cdFx0XHRcdFx0XHRpZihjb21tYW5kS2V5KSB7XHJcblx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJlb3JnKGxlZnQpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA4MjpcclxuXHRcdFx0XHRcdC8vQ01EK1JcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5yZW9yZyhyaWdodCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDIxOTpcclxuXHRcdFx0XHRcdC8vQ01EK1tcclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5wcm9tb3RlKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDIyMTpcclxuXHRcdFx0XHRcdC8vQ01EK11cclxuXHRcdFx0XHRcdFx0aWYoY29tbWFuZEtleSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5kZW1vdGUoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTM6XHJcblx0XHRcdFx0XHRpZihjb25jb3JkLm1vYmlsZSl7XHJcblx0XHRcdFx0XHRcdC8vTW9iaWxlXHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdHZhciBjdXJzb3IgPSBjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdHZhciBjbG9uZWRDdXJzb3IgPSBjdXJzb3IuY2xvbmUodHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdGNsb25lZEN1cnNvci5yZW1vdmVDbGFzcyhcImNvbmNvcmQtY3Vyc29yXCIpO1xyXG5cdFx0XHRcdFx0XHRjdXJzb3IucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuXHRcdFx0XHRcdFx0Y3Vyc29yLnJlbW92ZUNsYXNzKFwiZGlydHlcIik7XHJcblx0XHRcdFx0XHRcdGN1cnNvci5yZW1vdmVDbGFzcyhcImNvbGxhcHNlZFwiKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldExpbmVUZXh0KFwiXCIpO1xyXG5cdFx0XHRcdFx0XHR2YXIgaWNvbiA9IFwiPGlcIitcIiBjbGFzcz1cXFwibm9kZS1pY29uIGljb24tY2FyZXQtcmlnaHRcXFwiPjxcIitcIi9pPlwiO1xyXG5cdFx0XHRcdFx0XHRjdXJzb3IuY2hpbGRyZW4oXCIuY29uY29yZC13cmFwcGVyXCIpLmNoaWxkcmVuKFwiLm5vZGUtaWNvblwiKS5yZXBsYWNlV2l0aChpY29uKTtcclxuXHRcdFx0XHRcdFx0Y2xvbmVkQ3Vyc29yLmluc2VydEJlZm9yZShjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuYXR0cmlidXRlcy5tYWtlRW1wdHkoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmRlbGV0ZVN1YnMoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmZvY3VzQ3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5maXJlQ2FsbGJhY2soXCJvcEluc2VydFwiLCBjb25jb3JkSW5zdGFuY2Uub3Auc2V0Q3Vyc29yQ29udGV4dChjdXJzb3IpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0aWYoZXZlbnQub3JpZ2luYWxFdmVudCAmJiAoKGV2ZW50Lm9yaWdpbmFsRXZlbnQua2V5TG9jYXRpb24gJiYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQua2V5TG9jYXRpb24gIT0gMCkpIHx8IChldmVudC5vcmlnaW5hbEV2ZW50LmxvY2F0aW9uICYmIChldmVudC5vcmlnaW5hbEV2ZW50LmxvY2F0aW9uICE9IDApKSkgKXtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2V0VGV4dE1vZGUoIWNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpO1xyXG5cdFx0XHRcdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IGRvd247XHJcblx0XHRcdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3Auc3Vic0V4cGFuZGVkKCkpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRkaXJlY3Rpb249cmlnaHQ7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLm9wLmluc2VydChcIlwiLCBkaXJlY3Rpb24pO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldFRleHRNb2RlKHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmZvY3VzQ3Vyc29yKCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzc6XHJcblx0XHRcdFx0XHQvLyBsZWZ0XHJcblx0XHRcdFx0XHRcdHZhciBhY3RpdmUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoJChldmVudC50YXJnZXQpLmhhc0NsYXNzKFwiY29uY29yZC10ZXh0XCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYoZXZlbnQudGFyZ2V0LnNlbGVjdGlvblN0YXJ0ID4gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZihjb250ZXh0LmZpbmQoXCIuY29uY29yZC1jdXJzb3Iuc2VsZWN0ZWRcIikubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHRhY3RpdmUgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYoYWN0aXZlKSB7XHJcblx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGN1cnNvciA9IGNvbmNvcmRJbnN0YW5jZS5vcC5nZXRDdXJzb3IoKTtcclxuXHRcdFx0XHRcdFx0XHR2YXIgcHJldiA9IGNvbmNvcmRJbnN0YW5jZS5vcC5fd2Fsa191cChjdXJzb3IpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKHByZXYpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3IocHJldik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM4OlxyXG5cdFx0XHRcdFx0Ly8gdXBcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRpZihjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKXtcclxuXHRcdFx0XHRcdFx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBwcmV2ID0gY29uY29yZEluc3RhbmNlLm9wLl93YWxrX3VwKGN1cnNvcik7XHJcblx0XHRcdFx0XHRcdFx0aWYocHJldikge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldEN1cnNvcihwcmV2KTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5nbyh1cCwxLGV2ZW50LnNoaWZ0S2V5LCBjb25jb3JkSW5zdGFuY2Uub3AuaW5UZXh0TW9kZSgpKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzOTpcclxuXHRcdFx0XHRcdC8vIHJpZ2h0XHJcblx0XHRcdFx0XHRcdHZhciBhY3RpdmUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0aWYoY29udGV4dC5maW5kKFwiLmNvbmNvcmQtY3Vyc29yLnNlbGVjdGVkXCIpLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0YWN0aXZlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmKGFjdGl2ZSkge1xyXG5cdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdHZhciBuZXh0ID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBmaXJzdENoaWxkID0gb3V0bGluZS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuZXh0ID0gZmlyc3RDaGlsZDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZighbmV4dCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGNvbmNvcmRJbnN0YW5jZS5vcC5fd2Fsa19kb3duKGN1cnNvcik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmKG5leHQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3IobmV4dCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0Ly8gZG93blxyXG5cdFx0XHRcdFx0XHRrZXlDYXB0dXJlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5vcC5pblRleHRNb2RlKCkpe1xyXG5cdFx0XHRcdFx0XHRcdHZhciBuZXh0ID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHR2YXIgY3Vyc29yID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0XHRcdGlmKCFjdXJzb3IuaGFzQ2xhc3MoXCJjb2xsYXBzZWRcIikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBvdXRsaW5lID0gY3Vyc29yLmNoaWxkcmVuKFwib2xcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRpZihvdXRsaW5lLmxlbmd0aCA9PSAxKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBmaXJzdENoaWxkID0gb3V0bGluZS5jaGlsZHJlbihcIi5jb25jb3JkLW5vZGU6Zmlyc3RcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmKGZpcnN0Q2hpbGQubGVuZ3RoID09IDEpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRuZXh0ID0gZmlyc3RDaGlsZDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZighbmV4dCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmV4dCA9IGNvbmNvcmRJbnN0YW5jZS5vcC5fd2Fsa19kb3duKGN1cnNvcik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmKG5leHQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRDdXJzb3IobmV4dCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ28oZG93biwxLCBldmVudC5zaGlmdEtleSwgY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNDY6XHJcblx0XHRcdFx0XHQvLyBkZWxldGVcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmKCFjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkuaGFzQ2xhc3MoXCJkaXJ0eVwiKSl7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2F2ZVN0YXRlKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZ2V0Q3Vyc29yKCkuYWRkQ2xhc3MoXCJkaXJ0eVwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVsZXRlTGluZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDkwOlxyXG5cdFx0XHRcdFx0Ly9DTUQrWlxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC51bmRvKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgODg6XHJcblx0XHRcdFx0XHQvL0NNRCtYXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldExpbmVUZXh0KCk9PVwiXCIpe1xyXG5cdFx0XHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuZGVsZXRlTGluZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNhdmVTdGF0ZSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA2NzpcclxuXHRcdFx0XHRcdC8vQ01EK0NcclxuXHRcdFx0XHRcdGlmKGZhbHNlJiZjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSl7XHJcblx0XHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmdldExpbmVUZXh0KCkhPVwiXCIpe1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLnJvb3QucmVtb3ZlRGF0YShcImNsaXBib2FyZFwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLmNvcHkoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA4NjpcclxuXHRcdFx0XHRcdC8vQ01EK1ZcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMjIwOlxyXG5cdFx0XHRcdFx0Ly8gQ01EK0JhY2tzbGFzaFxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGlmKGNvbmNvcmRJbnN0YW5jZS5zY3JpcHQuaXNDb21tZW50KCkpe1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5zY3JpcHQudW5Db21tZW50KCk7XHJcblx0XHRcdFx0XHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uuc2NyaXB0Lm1ha2VDb21tZW50KCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNzM6XHJcblx0XHRcdFx0XHQvL0NNRCtJXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLml0YWxpYygpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDY2OlxyXG5cdFx0XHRcdFx0Ly9DTUQrQlxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5ib2xkKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMTkyOlxyXG5cdFx0XHRcdFx0Ly9DTUQrYFxyXG5cdFx0XHRcdFx0aWYoY29tbWFuZEtleSl7XHJcblx0XHRcdFx0XHRcdGtleUNhcHR1cmVkPXRydWU7XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zZXRSZW5kZXJNb2RlKCFjb25jb3JkSW5zdGFuY2Uub3AuZ2V0UmVuZGVyTW9kZSgpKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxODg6XHJcblx0XHRcdFx0XHQvL0NNRCssXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLnN1YnNFeHBhbmRlZCgpKXtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3AuY29sbGFwc2UoKTtcclxuXHRcdFx0XHRcdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5leHBhbmQoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxOTE6XHJcblx0XHRcdFx0XHQvL0NNRCsvXHJcblx0XHRcdFx0XHRpZihjb21tYW5kS2V5KXtcclxuXHRcdFx0XHRcdFx0a2V5Q2FwdHVyZWQ9dHJ1ZTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnJ1blNlbGVjdGlvbigpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0a2V5Q2FwdHVyZWQgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdGlmKCFrZXlDYXB0dXJlZCkge1xyXG5cdFx0XHRcdGlmKChldmVudC53aGljaCA+PSAzMikgJiYgKChldmVudC53aGljaCA8IDExMikgfHwgKGV2ZW50LndoaWNoID4gMTIzKSkgJiYgKGV2ZW50LndoaWNoIDwgMTAwMCkgJiYgIWNvbW1hbmRLZXkpIHtcclxuXHRcdFx0XHRcdHZhciBub2RlID0gY29uY29yZEluc3RhbmNlLm9wLmdldEN1cnNvcigpO1xyXG5cdFx0XHRcdFx0aWYoY29uY29yZEluc3RhbmNlLm9wLmluVGV4dE1vZGUoKSkge1xyXG5cdFx0XHRcdFx0XHRpZighbm9kZS5oYXNDbGFzcyhcImRpcnR5XCIpKXtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2Uub3Auc2F2ZVN0YXRlKCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRub2RlLmFkZENsYXNzKFwiZGlydHlcIik7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uY29yZEluc3RhbmNlLm9wLnNldFRleHRNb2RlKHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5zYXZlU3RhdGUoKTtcclxuXHRcdFx0XHRcdFx0XHRjb25jb3JkSW5zdGFuY2UuZWRpdG9yLmVkaXQobm9kZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0bm9kZS5hZGRDbGFzcyhcImRpcnR5XCIpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5vcC5tYXJrQ2hhbmdlZCgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0JChkb2N1bWVudCkub24oXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRpZighY29uY29yZC5oYW5kbGVFdmVudHMpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdGlmKCQoXCIuY29uY29yZC1yb290XCIpLmxlbmd0aD09MCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cdFx0aWYoICQoZXZlbnQudGFyZ2V0KS5pcyhcImFcIikgfHwgJChldmVudC50YXJnZXQpLmlzKFwiaW5wdXRcIikgfHwgJChldmVudC50YXJnZXQpLmlzKFwidGV4dGFyZWFcIikgfHwgKCQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKFwiYTpmaXJzdFwiKS5sZW5ndGg9PTEpIHx8ICQoZXZlbnQudGFyZ2V0KS5oYXNDbGFzcyhcImRyb3Bkb3duLW1lbnVcIikgfHwgKCQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKFwiLmRyb3Bkb3duLW1lbnU6Zmlyc3RcIikubGVuZ3RoPjApKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR2YXIgY29udGV4dCA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnRzKFwiLmNvbmNvcmQtcm9vdDpmaXJzdFwiKTtcclxuXHRcdGlmKGNvbnRleHQubGVuZ3RoID09IDApIHtcclxuXHRcdFx0JChcIi5jb25jb3JkLXJvb3RcIikuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgY29uY29yZEluc3RhbmNlID0gbmV3IENvbmNvcmRPdXRsaW5lKCQodGhpcykucGFyZW50KCkpO1xyXG5cdFx0XHRcdGNvbmNvcmRJbnN0YW5jZS5lZGl0b3IuaGlkZUNvbnRleHRNZW51KCk7XHJcblx0XHRcdFx0Y29uY29yZEluc3RhbmNlLmVkaXRvci5kcmFnTW9kZUV4aXQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0dmFyIGZvY3VzUm9vdCA9IGNvbmNvcmQuZ2V0Rm9jdXNSb290KCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdCQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgY29uY29yZC51cGRhdGVGb2N1c1Jvb3RFdmVudCk7XHJcblx0JChkb2N1bWVudCkub24oXCJkYmxjbGlja1wiLCBjb25jb3JkLnVwZGF0ZUZvY3VzUm9vdEV2ZW50KTtcclxuXHQkKGRvY3VtZW50KS5vbignc2hvdycsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYoJChlLnRhcmdldCkuaXMoXCIubW9kYWxcIikpe1xyXG5cdFx0XHRpZigkKGUudGFyZ2V0KS5hdHRyKFwiY29uY29yZC1ldmVudHNcIikgIT0gXCJ0cnVlXCIpe1xyXG5cdFx0XHRcdGNvbmNvcmQuc3RvcExpc3RlbmluZygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0JChkb2N1bWVudCkub24oJ2hpZGRlbicsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYoJChlLnRhcmdldCkuaXMoXCIubW9kYWxcIikpe1xyXG5cdFx0XHRpZigkKGUudGFyZ2V0KS5hdHRyKFwiY29uY29yZC1ldmVudHNcIikgIT0gXCJ0cnVlXCIpe1xyXG5cdFx0XHRcdGNvbmNvcmQucmVzdW1lTGlzdGVuaW5nKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRjb25jb3JkLnJlYWR5PXRydWU7XHJcblx0fSkoalF1ZXJ5KTtcclxuIl19
