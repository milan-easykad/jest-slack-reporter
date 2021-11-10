import {IncomingWebhookSendArguments} from "./slackTypes";

export interface MessageAttachment {
    // blocks?: (KnownBlock | Block)[];
    fallback?: string; // either this or text must be defined
    color?: 'good' | 'warning' | 'danger' | string;
    pretext?: string;
    author_name?: string;
    author_link?: string; // author_name must be present
    author_icon?: string; // author_name must be present
    title?: string;
    title_link?: string; // title must be present
    text?: string; // either this or fallback must be defined
    fields?: {
        title: string;
        value: string;
        short?: boolean;
    }[];
    image_url?: string;
    thumb_url?: string;
    footer?: string;
    footer_icon?: string; // footer must be present
    ts?: string;
    // actions?: AttachmentAction[];
    callback_id?: string;
    mrkdwn_in?: ('pretext' | 'text' | 'fields')[];
}

interface TestResult {
    fullName: string;
    title: string;
    status: "failed" | "pending" | "passed";
    ancestorTitles: Array<string>;
    failureMessages: Array<string>;
    numPassingAsserts: number;
    location: {
        column: number;
        line: number;
    };
}

interface TestReport {
    numFailingTests: number;
    numPassingTests: number;
    numPendingTests: number;
    testResults: Array<TestResult>;
    failureMessages: string;
}

export interface TestResults {
    success: boolean;
    startTime: Date;
    numTotalTestSuites: number;
    numPassedTestSuites: number;
    numFailedTestSuites: number;
    numTotalTests: number;
    numPassedTests: number;
    numFailedTests: number;
    openHandles: Array<Error>;
    testResults: Array<TestReport>;
}

interface FailedTestField{
    "value": string;
    "short": boolean
}

export interface FailedTest{
    color: string;
    title: string;
    text: string;
    fields: Array<FailedTestField>
}

export { IncomingWebhookSendArguments } from './slackTypes'
