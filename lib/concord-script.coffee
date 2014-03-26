$ = require 'jquery/dist/jquery'

class ConcordScript
  constructor: (@root, @concordInstance) ->

  isComment: ->
    isComment = concordInstance.op.attributes.getOne 'isComment'
    return isComment is 'true' if isComment?

    parentIsAComment = no

    @concordInstance.op.getCursor().parents('.concord-node').each ->
      comment = @concordInstance.op.setCursorContext($(this)).attributes.getOne 'isComment'
      if comment is 'true'
        parentIsAComment = yes
        return no # exit the jQuery .each() loop

    return parentIsAComment

  makeComment: ->
    @concordInstance.op.attributes.setOne 'isComment', 'true'
    @concordInstance.op.getCursor().addClass 'concord-comment'
    return yes

  unComment: ->
    @concordInstance.op.attributes.setOne 'isComment', 'false'
    @concordInstance.op.getCursor().removeClass 'concord-comment'
    return yes

module.exports = ConcordScript
