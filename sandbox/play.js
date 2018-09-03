// const diff = require('fast-diff');
const dup = require('../index.js');

const text1 = 'Voicemail Message received (John > Jessy) in Office Voicemail at 15:21';
const text2 = 'Voicemail Message received (David > Franck) in Office Voicemail at 07:21';
console.log(dup.calcDuplicationDetails(text1, text2, 'Office Voicemail'));
// console.log(diff('Voicemail Message received (John > Jessy)', 'Voicemail Message received (David > Franck)'));