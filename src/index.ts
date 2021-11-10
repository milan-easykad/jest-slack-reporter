import * as https from 'https';
import {FailedTest, IncomingWebhookSendArguments, TestResults} from "../types";

const processor = (testResults: TestResults, optionalProcessing?: (testResults: TestResults) => IncomingWebhookSendArguments) => {
    const {WEBHOOK_URL: webhookUrl} = process.env;
    if (!webhookUrl) {
        throw new Error("Please provide a Slack webhookUrl field as an env variable — WEBHOOK_URL");
    }

    var testData = testResults.testResults;
    var failedTests = [];
    testData.filter(function (item) {
        item.testResults.filter(function (test) {
            console.log(test)
            if(test.status === "failed"){
                var err = test.failureMessages[0].replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
                var expected = err.search("Expected");
                var received = err.search("Received");
                var errorText = err.substring(expected, expected + 15) + ' day(s) \n' + err.substring(received, received + 15) + ' day(s)';

                failedTests.push({
                    "color": "#ff0000",
                    "title": test.fullName,
                    "text": errorText,
                    "fields": [
                        {
                            "value": 'Failed',
                            "short": false
                        }
                    ],
                })
            }
            return failedTests;
        });
    });


    var errText = "\n    *" + testResults.numFailedTests + "* " + (testResults.numFailedTests > 1 ? 'tests have' : 'test has') + " failed. Please take a look. \n  ";
    var passingText = "All *" + testResults.numTotalTests + "* tests have passed :thumbsup:";
    var text = testResults.numFailedTests > 0 ? errText : passingText;
    var data = JSON.stringify({
        'text': text,
        'attachments': failedTests.length > 0 ? failedTests : [{ "color": "#00ff00", "title": 'No Errors', }]
    });

    if (failedTests.length > 0){
        var prepared = webhookUrl.replace('https://', '').match(/(^.*)(\/services*.*$)/);
        var options = {
            hostname: prepared[1],
            path: prepared[2],
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        var req = https.request(options, function (res) {
            console.log("statusCode: " + res.statusCode);
            res.on('data', function (d) {
                process.stdout.write(d);
            });
        });
        req.on('error', function (error) {
            console.error(error);
        });
        if (optionalProcessing) {
            req.write(JSON.stringify(optionalProcessing(testResults)));
        }
        else {
            req.write(data);
        }
        req.end();
        return testResults;
    }
    return testResults;
};

export = processor;
