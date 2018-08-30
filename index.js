const diff = require('fast-diff');
const helpers = require('@harmon.ie/email-util/nlp-helpers');

//TODO: [harmon.ie] Update: <var text> --> Enough to detect match in either side (left/right) of the topic
//TODO:Q: return also diff of left+right ? Can 

function getTextAfterNewLines(str) {
  const lines = str.match(/[^\r\n]+/g);
  if (!lines) {
    return '';
  }
  return lines.reduce((res, line) => res + line.substr(0, 20), '');
}

function calcNbrLeftAndRight(text, m, nbrSize) {
  return {
    left: text.substring(Math.max(m.idxStart - nbrSize, 0), m.idxStart),
    right: text.substring(m.idxStart + m.matchStr.length, Math.min(m.idxStart + m.matchStr.length + nbrSize, text.length - 1)),
  };
}

function getNbrNewLines(left, right) {
  // Add newLines (left and right) nbrs for Forms duplicate detection 
  // (Problem: Forms may contain much variable text between their duplicate fields) 

  return {
    nlLeft: getTextAfterNewLines(left),
    nlRight: getTextAfterNewLines(right)
  };
}

function getNbr(topicText, text, inSubject) {
  if (inSubject) {
    text = helpers.getNormalizedSubject(text);
  }
  // Find the topicText and extract its surrounding window (+-N characters)
  const topicInText = helpers.findTopicInText(topicText, text);
  if (topicInText === null) {
    return null;
  }

  const { left, right } = calcNbrLeftAndRight(text, topicInText, inSubject ? 20 : 70);
  const { nlLeft, nlRight } = getNbrNewLines(left, right);
  return { left, right, nlLeft, nlRight };
}

function convertTexts(texts) {
  return texts.map(text => text.replace(/^(\n| )+|(\n| )+$/g, ''));
}

const MIN_LEN_COMPARED = 10;
const MIN_LEN_COMPARED_SUBJECT = 6;

function smartDiff(text1, text2) {
  const delta = diff(text1, text2);
  return delta.reduce((res, [startPos, chars]) => {
    if (startPos === 0) {
      res.cntMatch += chars.length;
      return res;
    } else {
      if (res.cntDiff === 0) {
        res.prefixMatch = res.cntMatch; //Record the len of prefix match (from left to right, before first diff)
      }
      res.cntDiff += chars.length;
      return res;
    }
  }, { cntDiff: 0, cntMatch: 0, prefixMatch: 0 });
}

function calcLenCompared(text1, text2) {
  const [lhs, rhs] = convertTexts([text1, text2]);
  const lenCompared = Math.min(lhs.length, rhs.length);
  return lenCompared;
}

function minLenCompared(inSubject) {
  return inSubject ? MIN_LEN_COMPARED_SUBJECT : MIN_LEN_COMPARED;
}

function textDist(text1, text2, inSubject) {
  const lenCompared = calcLenCompared(text1, text2);
  if (lenCompared <= minLenCompared(inSubject)) {
    return { diffRatio: 1, lenCompared: 0, prefixMatch: 0 };
  }
  const { cntDiff, cntMatch, prefixMatch } = smartDiff(text1, text2);
  const diffRatio = cntDiff / (cntDiff + cntMatch);

  return { diffRatio, lenCompared, prefixMatch };
}

const DUPLICATE_THRESHOLD = 0.3;

function calcNbrDistShortInSubject(leftInfo, rightInfo) {
  function inner(leftInfo, rightInfo) {
    return (leftInfo.diffRatio <= DUPLICATE_THRESHOLD)
    && ((leftInfo.lenCompared >= MIN_LEN_COMPARED)
      || (rightInfo.prefixMatch >= (MIN_LEN_COMPARED - leftInfo.lenCompared)));
  }

  const duplicate = inner(leftInfo, rightInfo) || inner(rightInfo, leftInfo);
  return { leftInfo, rightInfo, duplicate };
}

function isSmallDiff(leftDiff, rightDiff) {
  return Math.min(leftDiff, rightDiff) <= DUPLICATE_THRESHOLD
}

function calcNbrDist(aLeft, bLeft, aRight, bRight, inSubject) {
  const leftInfo = textDist(aLeft, bLeft, inSubject);
  const rightInfo = textDist(aRight, bRight, inSubject);
  const duplicate = isSmallDiff(leftInfo.diffRatio, rightInfo.diffRatio);

  return {
    leftInfo,
    rightInfo,
    duplicate
  };
}

function nbrDist(nbr1, nbr2, inSubject) {
  const { leftInfo, rightInfo, duplicate } = calcNbrDist(nbr1.left, nbr2.left, nbr1.right, nbr2.right, inSubject);
  if (duplicate) {
    //Problem: Subject duplicates are based on small nbr size (ex: 'Industry News' subject: 'harmon.ie Industry News - March 28')
    //We want the 'Industry News' to match but Project Venice - not to match (2 different subjects mentioning the same topic)
    //sub: RE: Harmon.ie/Project Venice ("Euclid") sync oSub: RE: Harmon.ie/Project Venice sync  
    //If inSubject duplicate is based on < MIN_LEN_COMPARED from left/right --> require the other side (right/left) will match the remaining
    // chars to complete to MIN_LEN_COMPARED

    //*** TODO:Debug:Remove:False
    if (inSubject) {
      return calcNbrDistShortInSubject(leftInfo, rightInfo);
    } else {
      return { leftInfo, rightInfo, duplicate };
    }
  } else {
    const { leftInfo: nlLeftInfo, rightInfo: nlRightInfo, duplicate: nlDuplicate } = calcNbrDist(nbr1.nlLeft, nbr2.nlLeft, nbr1.nlRight, nbr2.nlRight, inSubject)
    return { duplicate: nlDuplicate, nlLeftInfo, nlRightInfo, leftInfo, rightInfo };
  }
}


function calcDuplicationDetails(text1, text2, topic, isSubject) {
  if (!Array.isArray(topic)) {
    topic = [topic, topic];
  }
  const [topic1, topic2] = topic;
  const nbr1 = getNbr(topic1, text1, isSubject);
  const nbr2 = getNbr(topic2, text2, isSubject);
  if (nbr1 === null || nbr2 === null) {
    return {
      dist: {
        duplicate: false
      }
    }
  }
  const dist = nbrDist(nbr1, nbr2, isSubject);

  return { dist, nbr: nbr1, nbrOther: nbr2 };
}

function isDuplicate(text1, text2, topic, isSubject = false) {
  return calcDuplicationDetails(text1, text2, topic, isSubject).dist.duplicate;
}


function numOfDuplicates([text, phrase], textAndPhrases, inSubject) {
  return textAndPhrases.reduce((res, otherTextAndPhrase) => {
    const [otherText, otherPhrase] = otherTextAndPhrase;
    if (isDuplicate(text, otherText, [phrase, otherPhrase], inSubject)) {
      return res + 1;
    }
    return res;
  }, 0);
}

module.exports = {
  isDuplicate,
  numOfDuplicates,
  calcDuplicationDetails,
  getNbr,
  nbrDist,
}