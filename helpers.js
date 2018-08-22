function getNormalizedSubject(subject) {
	return subject.replace(/^fw:|^re:|^fwd:|^aw:/gi, '').replace(/^Accepted:|^Cancelled:|^Declined:/g, '').trim();
}

function regExpEscape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&"); //Do not escape \s
}

function findTopicInText(topicText,text) {
  let escapedTopicText = regExpEscape(topicText);
  if (escapedTopicText.indexOf(' ') != - 1) {
      escapedTopicText = escapedTopicText.replace(/ /g,'( {1,2}|%20)');
  }
  escapedTopicText = '\\b'+escapedTopicText+'\\b';    
  const m = new RegExp(`${escapedTopicText}`).exec(text);     
  let res = null;
  if (m != null) {
    res = { idxStart : m.index, matchStr : m[0] };
  }
  return res;
}


module.exports = {
    getNormalizedSubject,
    findTopicInText,
}
 