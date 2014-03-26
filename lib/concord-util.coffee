XML_CHAR_MAP =
  '<': '&lt;'
  '>': '&gt;'
  '&': '&amp;'
  '"': '&quot;'

module.exports =
  escapeXml: (s) ->
    s = s.toString()
    s = s.replace /\u00A0/g, ' '
    escaped = s.replace /[<>&"]/g, (cb) -> XML_CHAR_MAP[ch]
