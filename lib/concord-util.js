var XML_CHAR_MAP = {
  "<" : "&lt;",
  ">" : "&gt;",
  "&" : "&amp;",
  "\"": "&quot;"
};

module.exports = {
  escapeXml: function (s) {
    s = s.toString();
    s = s.replace(/\u00A0/g, " ");
    var escaped = s.replace(/[<>&"]/g, function (ch) {
      return XML_CHAR_MAP[ch];
    });

    return escaped;
  }
};
