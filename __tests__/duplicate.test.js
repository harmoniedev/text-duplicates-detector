const testMe = require('@harmon.ie/email-util/testsUtils');
const { isDuplicate, numOfDuplicates } = require('../index');
const testData = require('./data/testData.json');

testMe.describeJsonData('duplicate text tests', testData, (t) => {
  const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
  expect(res).toEqual(t.expectedDuplicate);
});


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
