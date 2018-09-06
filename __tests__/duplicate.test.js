const testMe = require('@harmon.ie/email-util/testsUtils');
const { isDuplicate, numOfDuplicates, getDuplicates } = require('../index');
const testData = require('./data/testData.json');
const subjectData = require('./data/subjectData');
const validData = require('./data/validationData')

testMe.describeJsonData('duplicate text tests', testData, (t) => {
  const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
  expect(res).toEqual(t.expectedDuplicate);
});

testMe.describeJsonData('duplicate subject tests', subjectData, (t) => {
  const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
  expect(res).toEqual(t.expectedDuplicate);
});

testMe.describeJsonData('validation tests', validData, (t) => {
  const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
  expect(res).toEqual(t.expectedDuplicate);
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
//   expect(res).toEqual(t.expectedDuplicate);
// });


test('phrase not found', () => {
  const res = isDuplicate('', '', 'ppp');
  expect(res).toBe(false);
});

test('isDuplicate with different topics', () => {
  const textA = 'Agents seems really really down';
  const textB = 'Agents of the Mall seems really really down';
  const topicA = 'Agents';
  const topicB = 'Agents of the Mall';
  const res = isDuplicate(textA, textB, [topicA, topicB]);
  expect(res).toBe(true);
});


describe('numOfDuplicates', () => {
  test('all duplicates', () => {
    const text = 'New Request a Quote Opportunity Created - EaP';
    const phrase = 'Opportunity';
    const textAndPhrases = Array(5).fill([text, phrase]);
    expect(numOfDuplicates([text, phrase], textAndPhrases)).toBe(5);
  });
  test('no duplicates', () => {
    const text = 'New Request a Quote Opportunity Created - EaP';
    const phrase = 'Opportunity';
    const textAndPhrases = Array(5).fill(['text', 'phrase']);
    expect(numOfDuplicates([text, phrase], textAndPhrases)).toBe(0);
  });
});

describe('getDuplicates', () => {
  test('all duplicates', () => {
    const text = 'New Request a Quote Opportunity Created - EaP';
    const phrase = 'Opportunity';
    const textAndPhrases = Array(5).fill(null).map((x, idx) => ({ text, phrase, id: idx }));
    expect(getDuplicates([text, phrase], textAndPhrases)).toHaveLength(5);
  });
  test('no duplicates', () => {
    const text = 'New Request a Quote Opportunity Created - EaP';
    const phrase = 'Opportunity';
    const textAndPhrases = Array(5).fill({ text: 'text', phrase: 'phrase' });
    expect(getDuplicates([text, phrase], textAndPhrases)).toHaveLength(0);
  });
  test('some duplicates', () => {
    const text = 'New Request a Quote Opportunity Created - EaP';
    const phrase = 'Opportunity';
    const dups = Array(5).fill(null).map((x, idx) => ({ text, phrase, id: idx }));
    const nonDups = Array(5).fill(null).map((x, idx) => ({ text: 'text', phrase: 'phrase', id: `bad-${idx}` }));
    const textAndPhrases = dups.concat(nonDups);
    expect(getDuplicates([text, phrase], textAndPhrases)).toEqual(dups);
  });
});
