const diff = require('fast-diff');
const helpers = require('@harmon.ie/email-util/nlp-helpers');

// TODO: [harmon.ie] Update: <var text> --> Enough to detect match in either side
// (left/right) of the topic
// TODO:Q: return also diff of left+right ?

const LEN_TEXT_AFTER_NEW_LINE = 20;
function getTextAfterNewLines(str) {
  const lines = str.match(/[^\r\n]+/g);
  if (!lines) {
    return '';
  }
  return lines.reduce((res, line) => res + line.substr(0, LEN_TEXT_AFTER_NEW_LINE), '');
}

function calcNbrLeftAndRight(m, nbrSize) {
  const startOfLeft = Math.max(m.idxStart - nbrSize, 0);
  const endOfLeft = m.idxStart;
  const startOfRight = m.idxStart + m.matchStr.length;
  const endOfRight = Math.min(m.idxStart + m.matchStr.length + nbrSize, m.text.length - 1);
  return {
    left: m.text.substring(startOfLeft, endOfLeft),
    right: m.text.substring(startOfRight, endOfRight),
    phrase: m.matchStr,
  };
}

function getNbrNewLines(left, right) {
  // Add newLines (left and right) nbrs for Forms duplicate detection
  // (Problem: Forms may contain much variable text between their duplicate fields)

  return {
    nlLeft: getTextAfterNewLines(left),
    nlRight: getTextAfterNewLines(right),
  };
}

function getNbr(phrase, _text, inSubject) {
  function normalizedText() {
    if (inSubject) {
      return helpers.getNormalizedSubject(_text);
    }
    return _text;
  }
  const text = normalizedText();
  // Find the topicText and extract its surrounding window (+-N characters)
  const phraseInText = helpers.findTopicInText(phrase, text);
  if (phraseInText === null) {
    return null;
  }

  const { left, right } = calcNbrLeftAndRight(phraseInText, inSubject ? 20 : 70);
  const { nlLeft, nlRight } = getNbrNewLines(left, right);
  return {
    left,
    right,
    nlLeft,
    nlRight,
  };
}


const MIN_LEN_COMPARED = 10;
const MIN_LEN_COMPARED_SUBJECT = 6;

function smartDiff(text1, text2) {
  const result = diff(text1, text2)
    .reduce((res, [hunkType, hunk]) => {
      if (hunkType === diff.EQUAL) {
        return {
          ...res,
          cntMatch: res.cntMatch + hunk.length,
        };
      }
      return {
        ...res,
        // prefixMatch is the length of prefix match (from left to right, before first diff)
        prefixMatch: (res.cntDiff === 0) ? res.cntMatch : res.prefixMatch,
        cntDiff: res.cntDiff + hunk.length,
      };
    }, { cntDiff: 0, cntMatch: 0, prefixMatch: 0 });
  return {
    ...result,
    diffRatio: result.cntDiff / (result.cntDiff + result.cntMatch),
  };
}

// Calc min of LR nbrs lengths
function calcLenCompared(text1, text2) {
  // Removes spaces and newlines - do not participate in len-compared
  function removeIrrelevantCharacters(texts) {
    return texts.map(text => text.replace(/^(\n| )+|(\n| )+$/g, ''));
  }
  const [lhs, rhs] = removeIrrelevantCharacters([text1, text2]);
  const lenCompared = Math.min(lhs.length, rhs.length);
  return lenCompared;
}

// Subject - requires smaller nbr compared body
function minLenCompared(inSubject) {
  return inSubject ? MIN_LEN_COMPARED_SUBJECT : MIN_LEN_COMPARED;
}

function textDist(text1, text2, inSubject) {
  const lenCompared = calcLenCompared(text1, text2);
  // If nbr is extermenly small (ex: 10 chars in body) --> reject
  if (lenCompared <= minLenCompared(inSubject)) {
    return { diffRatio: 1, lenCompared: 0, prefixMatch: 0 };
  }
  const { diffRatio, prefixMatch } = smartDiff(text1, text2);

  return { diffRatio, lenCompared, prefixMatch };
}

const DUPLICATE_THRESHOLD = 0.3;

function calcNbrDistShortInSubject(myLeftInfo, myRightInfo) {
  function inner(leftInfo, rightInfo) {
    // one nbr (ex: left) is of min len (10) Or: left nbr is too small,
    // so must find prefix (suffix) match from other (ex: right) nbr
    return (leftInfo.diffRatio <= DUPLICATE_THRESHOLD)
      && ((leftInfo.lenCompared >= MIN_LEN_COMPARED)
        || (rightInfo.prefixMatch >= (MIN_LEN_COMPARED - leftInfo.lenCompared)));
  }

  const duplicate = inner(myLeftInfo, myRightInfo) || inner(myRightInfo, myLeftInfo);
  return { myLeftInfo, myRightInfo, duplicate };
}

function isSmallDiff(leftDiff, rightDiff) {
  return Math.min(leftDiff, rightDiff) <= DUPLICATE_THRESHOLD;
}

function calcNbrDist(aLeft, bLeft, aRight, bRight, inSubject) {
  const leftInfo = textDist(aLeft, bLeft, inSubject);
  const rightInfo = textDist(aRight, bRight, inSubject);
  const duplicate = isSmallDiff(leftInfo.diffRatio, rightInfo.diffRatio);

  return {
    leftInfo,
    rightInfo,
    duplicate,
  };
}

function nbrDist(nbr1, nbr2, inSubject) {
  const {
    leftInfo,
    rightInfo,
    duplicate,
  } = calcNbrDist(nbr1.left, nbr2.left, nbr1.right, nbr2.right, inSubject);
  if (duplicate) {
    // Problem: Subject duplicates are based on small nbr size
    // (ex: 'Industry News' subject: 'harmon.ie Industry News - March 28')
    // We want the 'Industry News' to match but Project Venice - not to match
    // (2 different subjects mentioning the same topic)
    // sub: RE: Harmon.ie/Project Venice ("Euclid") sync oSub: RE: Harmon.ie/Project Venice sync
    // If inSubject duplicate is based on < MIN_LEN_COMPARED from left/right -->
    // require the other side (right/left) will match the remaining
    // chars to complete to MIN_LEN_COMPARED

    // TODO:Debug:Remove:False
    if (inSubject) {
      return calcNbrDistShortInSubject(leftInfo, rightInfo);
    }
    return { leftInfo, rightInfo, duplicate };
  }
  const {
    leftInfo: nlLeftInfo,
    rightInfo: nlRightInfo,
    duplicate: nlDuplicate,
  } = calcNbrDist(nbr1.nlLeft, nbr2.nlLeft, nbr1.nlRight, nbr2.nlRight, inSubject);
  return {
    duplicate: nlDuplicate,
    nlLeftInfo,
    nlRightInfo,
    leftInfo,
    rightInfo,
  };
}

function convertToArray(t) {
  if (!Array.isArray(t)) {
    return [t, t];
  }
  return t;
}

function calcDuplicationDetails(text1, text2, topic, isSubject) {
  const [topic1, topic2] = convertToArray(topic);
  const nbr1 = getNbr(topic1, text1, isSubject);
  const nbr2 = getNbr(topic2, text2, isSubject);
  if (nbr1 === null || nbr2 === null) {
    return {
      dist: {
        duplicate: false,
      },
    };
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

function getDuplicates([textA, phraseA], occurrences, inSubject) {
  return occurrences.reduce((dups, occurrence) => {
    const { text, phrase } = occurrence;
    if (isDuplicate(textA, text, [phraseA, phrase], inSubject)) {
      dups.push(occurrence);
      return dups;
    }
    return dups;
  }, []);
}

module.exports = {
  isDuplicate,
  numOfDuplicates,
  getDuplicates,
  calcDuplicationDetails,
  getNbr,
  nbrDist,
};
