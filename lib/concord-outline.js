var ConcordEditor = require("./concord-editor");
var ConcordOp = require("./concord-op");
var ConcordScript = require("./concord-script");
var ConcordEvents = require("./concord-events");
var $ = require("jquery/dist/jquery");

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
