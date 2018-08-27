const _ = require('lodash');
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
    console.warn(`getNbr: Failed to locate topicText:${topicText} in:\n${text}`);
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
function safeDivide(a, b) {
  if (b === 0) { return a; }
  return a / b;
}

function calcLenCompared(text1, text2) {
  const [lhs, rhs] = convertTexts([text1, text2]);
  const lenCompared = Math.min(lhs.length, rhs.length);
  return lenCompared;
}

function minLenCompared(inSubject) {
  return inSubject ? MIN_LEN_COMPARED_SUBJECT : MIN_LEN_COMPARED;
}

function textDist(text1, text2, inSubject = false) {
  const lenCompared = calcLenCompared(text1, text2);
  if (lenCompared <= minLenCompared(inSubject)) {
    return { diffRatio: 1, lenCompared: 0, prefixMatch: 0 };
  }
  const { cntDiff, cntMatch, prefixMatch } = smartDiff(text1, text2);
  const diffRatio = safeDivide(cntDiff, cntDiff + cntMatch);

  return { diffRatio, lenCompared, prefixMatch };
}

const DUPLICATE_THRESHOLD = 0.3;

function calcNbrDistShortInSubject(dst) {
  const leftMinimalLenDup = dst.left <= DUPLICATE_THRESHOLD &&
    leftInfo.lenCompared >= MIN_LEN_COMPARED || rightInfo.prefixMatch >= (MIN_LEN_COMPARED - leftInfo.lenCompared);

  const rightMinimalLenDup = dst.right <= DUPLICATE_THRESHOLD &&
    rightInfo.lenCompared >= MIN_LEN_COMPARED || leftInfo.prefixMatch >= (MIN_LEN_COMPARED - rightInfo.lenCompared);

  dst.duplicate = leftMinimalLenDup || rightMinimalLenDup;
  return dst;
}

function calcNbrDistLong(nbr1, nbr2, inSubject, dst) {
  const nlLeftInfo = textDist(nbr1.nlLeft, nbr2.nlLeft, inSubject);
  const nlRightInfo = textDist(nbr1.nlRight, nbr2.nlRight, inSubject);
  const nlDst = { nlLeft: nlLeftInfo.diffRatio, nlRight: nlRightInfo.diffRatio };

  if (Math.min(nlDst.nlLeft, nlDst.nlRight) <= DUPLICATE_THRESHOLD) {
    nlDst.duplicate = true;
  }
  return { ...dst, ...nlDst };
}

function calcInitialDst(nbr1, nbr2, inSubject) {
  const leftInfo = textDist(nbr1.left, nbr2.left, inSubject);
  const rightInfo = textDist(nbr1.right, nbr2.right, inSubject);
  return { left: leftInfo.diffRatio, right: rightInfo.diffRatio, duplicate: false };
}

function isDmallDst(dst) {
  return Math.min(dst.left, dst.right) <= DUPLICATE_THRESHOLD
}

function nbrDist(nbr1, nbr2, inSubject = false) {
  const dst = calcInitialDst(nbr1, nbr2, inSubject);
  if (isDmallDst(dst)) {
    //Problem: Subject duplicates are based on small nbr size (ex: 'Industry News' subject: 'harmon.ie Industry News - March 28')
    //We want the 'Industry News' to match but Project Venice - not to match (2 different subjects mentioning the same topic)
    //sub: RE: Harmon.ie/Project Venice ("Euclid") sync oSub: RE: Harmon.ie/Project Venice sync  
    //If inSubject duplicate is based on < MIN_LEN_COMPARED from left/right --> require the other side (right/left) will match the remaining
    // chars to complete to MIN_LEN_COMPARED

    //*** TODO:Debug:Remove:False
    if (inSubject) {
      calcNbrDistShortInSubject(dst);
    } else {
      return { ...dst, duplicate: true };
    }
  } else {
    return calcNbrDistLong(nbr1, nbr2, inSubject, dst);
  }
}


function calcDuplicationDetails(text1, text2, topic, isSubject = false) {
  const nbr1 = getNbr(topic, text1, isSubject);
  const nbr2 = getNbr(topic, text2, isSubject);

  const dist = nbrDist(nbr1, nbr2);

  return { dist, nbr: nbr1, nbrOther: nbr2 };
}

function isDuplicate(text1, text2, topic, isSubject = false) {
  return calcDuplicationDetails(text1, text2, topic, isSubject).dist.duplicate;
}

module.exports = {
  isDuplicate,
  calcDuplicationDetails,
  getNbr,
  nbrDist,
}

