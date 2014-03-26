var concord = require("./concord");
var $ = require("jquery/dist/jquery");

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
