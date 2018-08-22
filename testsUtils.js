

function describeJsonData(suiteTitle,testData, testCaseCallback) {
    describe.only(suiteTitle, () => {
        let executedTestsData = testData.filter((tcData) => tcData.only);
        if (executedTestsData.length === 0) {
            executedTestsData = testData;
        }
        for (const tcData of executedTestsData) {
            const title = `test ${tcData.testName}`;
            if (tcData.skip) {
                it.skip(title, () => {
                });
            } else {
                it(title, () => testCaseCallback(tcData));
            }
        }

    });

}

module.exports = {
    describeJsonData
}