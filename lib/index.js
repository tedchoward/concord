// Copyright 2013, Small Picture, Inc.
var ConcordUtil = require("./concord-util");
var concord = require("./concord.coffee");
var ConcordOutline = require("./concord-outline");
var $ = jQuery = require("jquery/dist/jquery");
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
