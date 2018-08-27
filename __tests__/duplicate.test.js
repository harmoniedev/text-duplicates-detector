const {isDuplicate} = require('../index');
const testMe = require('@harmon.ie/email-util/testsUtils');
const testData = require('./data/testData.json');

testMe.describeJsonData('duplicate text tests', testData, (t) => {
    const res = isDuplicate(t.a, t.b, t.topic, t.isSubject);
    //console.log(`duplicate pair: ${t.topic} dist: ${JSON.stringify(res.dist)} inSubject:${t.isSubject} text: ${t.a} oText: ${t.b}\nnbr.left: ${res.nbr.left.replace(/\r\n/g,' ')} res.nbrOther.left: ${res.nbrOther.left.replace(/\r\n/g,' ')} res.nbr.right: ${res.nbr.right.replace(/\r\n/g,' ')} nbrOther.right: ${res.nbrOther.right.replace(/\r\n/g,' ')}`);
    expect(res).toEqual(t.expectedDuplicate);
});