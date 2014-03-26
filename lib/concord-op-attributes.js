var $ = require("jquery/dist/jquery");

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
