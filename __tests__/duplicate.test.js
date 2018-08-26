const dup = require('../index');
const testMe = require('@harmon.ie/email-util/testsUtils');

const testData = require('./data/testData.json');

function testDuplicate(text1, text2, topic, isSubject = false) {
    let nbr1 = dup.getNbr(topic, text1, isSubject);
    let nbr2 = dup.getNbr(topic, text2, isSubject);

    dist = dup.nbrDist(nbr1, nbr2);

    return { dist, nbr: nbr1, nbrOther: nbr2 };
}


testMe.describeJsonData('duplicate text tests', testData, (t) => {
    const res = testDuplicate(t.a, t.b, t.topic, t.isSubject);
    //console.log(`duplicate pair: ${t.topic} dist: ${JSON.stringify(res.dist)} inSubject:${t.isSubject} text: ${t.a} oText: ${t.b}\nnbr.left: ${res.nbr.left.replace(/\r\n/g,' ')} res.nbrOther.left: ${res.nbrOther.left.replace(/\r\n/g,' ')} res.nbr.right: ${res.nbr.right.replace(/\r\n/g,' ')} nbrOther.right: ${res.nbrOther.right.replace(/\r\n/g,' ')}`);
    expect(res.dist.duplicate).toEqual(t.expectedDuplicate);
});


