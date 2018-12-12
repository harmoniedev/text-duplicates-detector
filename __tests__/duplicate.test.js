const testMe = require('@harmon.ie/email-util/testsUtils');
let { isDuplicate, numOfDuplicates, getDuplicates } = require('../index');
const testData = require('./data/testData.json');
const subjectData = require('./data/subjectData');
const validData = require('./data/validationData');
const { expect } = require('chai');

if (global.Java) {
  const DuplicateDetectorClass = Java.type('com.harmonie.topics.Main.DuplicateDetector');
  const duplicateDetector = new DuplicateDetectorClass();
  console.log(`duplicateDetector=${duplicateDetector}`);

  //Wrapper to call Java DuplicateDetector.isDuplicate
  isDuplicate = function(text1, text2, topic, isSubject = false) {
    function convertToArray(t) {
      if (!Array.isArray(t)) {
        return [t, t];
      }
      return t;
    }
    const [topic1, topic2] = convertToArray(topic);
    return duplicateDetector.isDuplicate(topic1,text1,topic2,text2,isSubject);  
  }
}

testMe.describeJsonData('duplicate text tests', testData, (t) => {
  const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
  expect(res).to.equal(t.expectedDuplicate);
});

testMe.describeJsonData('duplicate subject tests', subjectData, (t) => {
  debugger; //TODO:Debug:Remove
  const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
  expect(res).to.equal(t.expectedDuplicate);
});

testMe.describeJsonData('validation tests', validData, (t) => {
  const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
  expect(res).to.equal(t.expectedDuplicate);
});

// testMe.describeJsonData('duplicate subject tests', [{
//   "testName": "special-chars topic",
//   "isSubject": false,
//   "a": "aaa?!@#$%^&*(~``= ?la la test!@# !@#$%^&*",
//   "b": "aaa?!@#$%^&*(~``= ?la la test!@# !@#$%^&*",
//   "topic": "?la la test!@#",
//   "expectedDuplicate": true
// }], (t) => {
//   const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
//   expect(res).to.equall(t.expectedDuplicate);
// });


// test('phrase not found', () => {
//   const res = isDuplicate('', '', 'ppp');
//   expect(res).toBe(false);
// });

// test('isDuplicate with different topics', () => {
//   const textA = 'Agents seems really really down';
//   const textB = 'Agents of the Mall seems really really down';
//   const topicA = 'Agents';
//   const topicB = 'Agents of the Mall';
//   const res = isDuplicate(textA, textB, [topicA, topicB]);
//   expect(res).toBe(true);
// });


// describe('numOfDuplicates', () => {
//   test('all duplicates', () => {
//     const text = 'New Request a Quote Opportunity Created - EaP';
//     const phrase = 'Opportunity';
//     const textAndPhrases = Array(5).fill([text, phrase]);
//     expect(numOfDuplicates([text, phrase], textAndPhrases)).toBe(5);
//   });
//   test('no duplicates', () => {
//     const text = 'New Request a Quote Opportunity Created - EaP';
//     const phrase = 'Opportunity';
//     const textAndPhrases = Array(5).fill(['text', 'phrase']);
//     expect(numOfDuplicates([text, phrase], textAndPhrases)).toBe(0);
//   });
// });

// describe('getDuplicates', () => {
//   test('all duplicates', () => {
//     const text = 'New Request a Quote Opportunity Created - EaP';
//     const phrase = 'Opportunity';
//     const textAndPhrases = Array(5).fill(null).map((x, idx) => ({ text, phrase, id: idx }));
//     expect(getDuplicates([text, phrase], textAndPhrases)).toHaveLength(5);
//   });
//   test('no duplicates', () => {
//     const text = 'New Request a Quote Opportunity Created - EaP';
//     const phrase = 'Opportunity';
//     const textAndPhrases = Array(5).fill({ text: 'text', phrase: 'phrase' });
//     expect(getDuplicates([text, phrase], textAndPhrases)).toHaveLength(0);
//   });
//   test('some duplicates', () => {
//     const text = 'New Request a Quote Opportunity Created - EaP';
//     const phrase = 'Opportunity';
//     const dups = Array(5).fill(null).map((x, idx) => ({ text, phrase, id: idx }));
//     const nonDups = Array(5).fill(null).map((x, idx) => ({ text: 'text', phrase: 'phrase', id: `bad-${idx}` }));
//     const textAndPhrases = dups.concat(nonDups);
//     expect(getDuplicates([text, phrase], textAndPhrases)).toEqual(dups);
//   });
// });
