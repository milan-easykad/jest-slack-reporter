import * as https from 'https';
import {FailedTest, IncomingWebhookSendArguments, TestResults} from "../types";

const processor = (testResults: TestResults, optionalProcessing?: (testResults: TestResults) => IncomingWebhookSendArguments) => {
    const {WEBHOOK_URL: webhookUrl} = process.env;
    if (!webhookUrl) {
        throw new Error("Please provide a Slack webhookUrl field as an env variable — WEBHOOK_URL");
    }

    const err = testResults.testResults[0].failureMessages.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    const expected = err.search("Expected") ;
    const received = err.search("Received") ;
    const errorText = err.substring(expected, expected+15) +'\n'+ err.substring(received, received+15);

    const testData = testResults.testResults;

    let failedTests: Array<FailedTest> = [];

    testData.filter((item) => {
        item.testResults.filter((test) => {
            return test.status === "failed" ? failedTests.push({
                "color": "#ff0000",
                "title": test.fullName,
                "text": errorText,
                "fields": [
                    {
                        "value": 'Failed',
                        "short": false
                    }
                ],
            }) : null;
        });
    });

    const errText = `
    *${testResults.numFailedTests}* ${testResults.numFailedTests > 1 ? 'tests have' : 'test has'} failed. Please take a look. 
  `;

    const passingText = `All *${testResults.numTotalTests}* tests have passed :thumbsup:`;

    const text = testResults.numFailedTests > 0 ? errText : passingText;


    const data = JSON.stringify({
        'text': text,
        'attachments': failedTests.length > 0 ? failedTests : [{ "color": "#00ff00", "title": 'No Errors',}]
    })

    const prepared = webhookUrl.replace('https://', '').match(/(^.*)(\/services*.*$)/)

    const options = {
        hostname: prepared[1],
        path: prepared[2],
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res: any) => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', (d: any) => {
            process.stdout.write(d)
        })
    })

    req.on('error', (error: any) => {
        console.error(error)
    })

    if(optionalProcessing){
        req.write(JSON.stringify(optionalProcessing(testResults)))
    } else {
        req.write(data)
    }

    req.end()

    return testResults;
};

export = processor;
