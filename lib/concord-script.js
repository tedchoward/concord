var $ = require("jquery/dist/jquery");

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
