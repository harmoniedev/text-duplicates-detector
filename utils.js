const diff = require('fast-diff');

function smartDiff(text1, text2) {
  const result = diff(text1, text2)
    .reduce((res, [hunkType, hunk]) => {
      if (hunkType === diff.EQUAL) {
        return {
          ...res,
          first: false,
          cntMatch: res.cntMatch + hunk.length,
          suffixMatch: hunk.length,
          prefixMatch: res.first ? hunk.length : res.prefixMatch,
        };
      }
      return {
        ...res,
        first: false,
        suffixMatch: 0,
        // prefixMatch is the length of prefix match (from left to right, before first diff)
        prefixMatch: (res.first === 0) ? 0 : res.prefixMatch,
        cntDiff: res.cntDiff + hunk.length,
      };
    }, {
        cntDiff: 0,
        cntMatch: 0,
        prefixMatch: 0,
        suffixMatch: 0,
        first: true,
      });
  const cntTotal = Math.max(text1.length, text2.length);
  const matchRatio = result.cntMatch / cntTotal;
  const diffRatio = 1 - matchRatio;
  return {
    prefixMatch: result.prefixMatch,
    suffixMatch: result.suffixMatch,
    cntDiff: result.cntDiff,
    cntMatch: result.cntMatch,
    cntTotal,
    matchRatio,
    diffRatio,
  };
}

module.exports = {
  smartDiff,
};
