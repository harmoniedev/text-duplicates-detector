const _ = require('lodash');
const diff = require('fast-diff');
const helpers = require('./helpers');


//TODO: [harmon.ie] Update: <var text> --> Enough to detect match in either side (left/right) of the topic
//TODO:Q: return also diff of left+right ? Can 

function getTextAfterNewLines(str) {
  const lines = str.match(/[^\r\n]+/g);
  if (!lines) {
    return '';
  }
  let nlNbr = '';
  for (const line of lines) { 
    nlNbr += line.substr(0,20);
  }
  return nlNbr;
}

function getNbr(topicText,text,inSubject) {
  if (inSubject) {
      text = helpers.getNormalizedSubject(text);
  }
  //* Find the topicText and extract its surrounding window (+-N characters)
  const m = helpers.findTopicInText(topicText,text);
  if (m === null) { 
    console.warn(`getNbr: Failed to locate topicText:${topicText} in:\n${text}`);
    return null; 
  }
  const NBR_SIZE = inSubject ? 20 : 70;  
  const nbr = 
  {
     left:  text.substring(Math.max(m.idxStart - NBR_SIZE,0), m.idxStart),
     right: text.substring(m.idxStart + m.matchStr.length,Math.min(m.idxStart + m.matchStr.length + NBR_SIZE,text.length - 1)),
  }
  //* Add newLines (left and right) nbrs for Forms duplicate detection (Problem: Forms may contain much variable text between their duplicate fields) 
  nbr.nlLeft = getTextAfterNewLines(nbr.left);
  nbr.nlRight = getTextAfterNewLines(nbr.right);
  return nbr;
}
const MIN_LEN_COMPARED = 10;
const MIN_LEN_COMPARED_SUBJECT = 6;
function textDist(text1,text2, inSubject = false) {
  const lhs  = text1.replace(/^(\n| )+|(\n| )+$/g,'');
  const rhs  = text2.replace(/^(\n| )+|(\n| )+$/g,'');
  const minNbrSize = inSubject ? MIN_LEN_COMPARED_SUBJECT : MIN_LEN_COMPARED;
  if (lhs.length <= minNbrSize || rhs.length <= minNbrSize) {
    return { diffRatio : 1, lenCompared : 0, prefixMatch : 0};
  }
  const lenCompared = Math.min(lhs.length,rhs.length);
  const result = diff(text1, text2);
  let cntMatch = 0;
  let cntDiff = 0;
  let prefixMatch = 0;
  for (const pt of result) {
    const chars = pt[1];
    if (pt[0] === 0) {
      cntMatch += chars.length;      
    } else {
      if (cntDiff === 0) {
        prefixMatch = cntMatch; //Record the len of prefix match (from left to right, before first diff)
      }
      cntDiff += chars.length;
    }
  }
  const countAll = (cntDiff + cntMatch);
  const diffRatio = cntDiff / (countAll > 0 ? countAll : 1);
  
  return { diffRatio, lenCompared, prefixMatch};
}

const DUPLICATE_THRESHOLD = 0.3;

function nbrDist(nbr1,nbr2,inSubject = false) {  
   const leftInfo = textDist(nbr1.left,nbr2.left, inSubject);
   const rightInfo = textDist(nbr1.right,nbr2.right, inSubject);
   let dst = { left: leftInfo.diffRatio, right: rightInfo.diffRatio, duplicate: false };

   if (Math.min(dst.left, dst.right) <= DUPLICATE_THRESHOLD ) 
   {
     //Problem: Subject duplicates are based on small nbr size (ex: 'Industry News' subject: 'harmon.ie Industry News - March 28')
     //We want the 'Industry News' to match but Project Venice - not to match (2 different subjects mentioning the same topic)
     //sub: RE: Harmon.ie/Project Venice ("Euclid") sync oSub: RE: Harmon.ie/Project Venice sync  
     //If inSubject duplicate is based on < MIN_LEN_COMPARED from left/right --> require the other side (right/left) will match the remaining
     // chars to complete to MIN_LEN_COMPARED
     
     //*** TODO:Debug:Remove:False
     if (inSubject) {      
       const  leftMinimalLenDup = dst.left <= DUPLICATE_THRESHOLD && 
                leftInfo.lenCompared >= MIN_LEN_COMPARED || rightInfo.prefixMatch >= (MIN_LEN_COMPARED - leftInfo.lenCompared);          
       
       const  rightMinimalLenDup = dst.right <= DUPLICATE_THRESHOLD && 
                rightInfo.lenCompared >= MIN_LEN_COMPARED || leftInfo.prefixMatch >= (MIN_LEN_COMPARED - rightInfo.lenCompared);          
       
       dst.duplicate = leftMinimalLenDup || rightMinimalLenDup;  
       
     } else {
      dst.duplicate = true;
     }
   } else 
   {
       const nlLeftInfo = textDist(nbr1.nlLeft,nbr2.nlLeft, inSubject);
       const nlRightInfo = textDist(nbr1.nlRight,nbr2.nlRight, inSubject);
       const nlDst = { nlLeft: nlLeftInfo.diffRatio, nlRight: nlRightInfo.diffRatio };

      if (Math.min(nlDst.nlLeft, nlDst.nlRight) <= DUPLICATE_THRESHOLD ) 
      {
        nlDst.duplicate = true;
      }
      dst = { ...dst, ...nlDst };
   }
   return dst;
}

module.exports = {
   getNbr,
   nbrDist, 
}

