const { isDuplicate, numOfDuplicates } = require('../index');
const testMe = require('@harmon.ie/email-util/testsUtils');
const testData = require('./data/testData.json');

testMe.describeJsonData('duplicate text tests', testData, (t) => {
    const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
    //console.log(`duplicate pair: ${t.topic} dist: ${JSON.stringify(res.dist)} inSubject:${t.isSubject} text: ${t.a} oText: ${t.b}\nnbr.left: ${res.nbr.left.replace(/\r\n/g,' ')} res.nbrOther.left: ${res.nbrOther.left.replace(/\r\n/g,' ')} res.nbr.right: ${res.nbr.right.replace(/\r\n/g,' ')} nbrOther.right: ${res.nbrOther.right.replace(/\r\n/g,' ')}`);
    expect(res).toEqual(t.expectedDuplicate);
});


test('phrase not found', () => {
    const res = isDuplicate('', '', 'ppp');
    expect(res).toBe(false);
});

test('isDuplicate with different topics', () => {
    const textA = "Agents seems really really down";
    const textB = "Agents of the Mall seems really really down";
    const topicA = "Agents";
    const topicB = "Agents of the Mall"
    const res = isDuplicate(textA, textB, [topicA, topicB]);
    expect(res).toBe(true);

});


test('numOfDuplicates', () => {
    const text = "New Request a Quote Opportunity Created - EaP";
    const phrase = "Opportunity";
    const textAndPhrases = Array(5).fill([text, phrase]);
    expect(numOfDuplicates([text, phrase], textAndPhrases)).toBe(5);
});