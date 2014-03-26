ConcordOutline = require './concord-outline'
$ = require 'jquery/dist/jquery'

module.exports =
  version: '3.0.0'
  mobile: (/Android|webOS|iPhone|iPad|iPod|Blackberry/i).test navigator.userAgent
  ready: no
  handleEvents: yes
  resumeCallbacks: []
  focusRoot: null

  onResume: (cb) ->
    @resumeCallbacks.push cb

  resumeListening: ->
    unless @handleEvents
      r = @getFocusRoot()

      unless r?
        c = new ConcordOutline r.parent(), null, @

        if c.op.inTextMode()
          c.op.focusCursor()
          c.editor.restoreSelection()
        else
          c.pasteBinFocus()

        cb() for cb in @resumeCallbacks

    return

  stopListening: ->
    if @handleEvents
      @handleEvents = no
      r = @getFocusRoot()

      unless r
        c = new ConcordOutline r.parent(), null, @
        c.editor.saveSelection() if c.op.inTextMode()

    return

  getFocusRoot: ->
    kFirstVisibleRoot = '.concord-root:visible:first'
    visibleRootLength = $('.concord-root:visible').length
    return @setFocusRoot $(kFirstVisibleRoot) if visibleRootLength is 1
    return @setFocusRoot $('.modal').find(kFirstVisibleRoot) if $('.modal').is(':visible') and $('.modal').find(kFirstVisibleRoot).length is 1
    (if visibleRootLength > 0 then return @setFocusRoot $(kFirstVisibleRoot) else return null) unless @focusRoot?
    return @setFocusRoot $(kFirstVisibleRoot) unless @focusRoot.is ':visible'
    return @focusRoot

  setFocusRoot: (root) ->
    origRoot = @focusRoot
    concordInstance = new ConcordOutline root.parent(), null, @

    if origRoot? and origRoot[0] isnt root[0]
      origConcordInstance = new ConcordOutline origRoot.parent(), null, @
      origConcordInstance.editor.hideContextMenu()
      origConcordInstance.editor.dragModeExit()

      if concordInstance.op.inTextMode()
        concordInstance.op.focusCursor()
      else
        concordInstance.pasteBinFocus()

    @focusRoot = root

  updateFocusRootEvent: (event) =>
    root = $(event.target).parents 'concord-root:first'
    @setFocusRoot root if root.length is 1

