let dup = require('../index.js');
let text1 = 'After a long period of inactivity, an intersting opportunity for IBM occurred last week';
let text2 = 'The last period was not exciting due to the negociations that lead nowhere, until an interesting opportunity for IBM occurred last week';
console.log(dup.calcDuplicationDetails(text1, text2, 'opportunity'));
