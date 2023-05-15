import { test, expect } from '@playwright/test';
import { createReadStream } from 'fs';
import path from "path";
import { CloudWatchLogsClient, DescribeLogStreamsCommand, GetLogEventsCommand   } from "@aws-sdk/client-cloudwatch-logs";
import { REGION, FULL_LOG_EVENT_HANDLER_NAME, CLOUD_APP_NAME } from '../data/constants';

test.describe('AWS Monitoring and logging validation', () => {

    const file_path = './files/';
    const file_name = 'AWS-Logo.jpg';

    let client: any;
    let input: any;
    let command: any;
    let response: Object;
    let logStream: [];
    let streamName: string;

    test('Uploads image to DynamoDB', async ({request, baseURL}) => {
        const endpoind = '/image';
        const filePath = path.resolve(file_path, file_name); // ./files/AWS-Logo.jpg
        const image = createReadStream(filePath);
        const response = await request.post(baseURL+endpoind, {
            headers: {
                'Conten-Type': 'multipart/form-data' 
            },
            multipart: {
                upfile: image
            }
        });
        expect.soft(response).toBeOK();
        expect.soft(response.statusText()).toBe('NO CONTENT');
    });

    test('Cloudxserverless-EventHandlerLambda{unique_id} log group:', async () => {     
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupName: FULL_LOG_EVENT_HANDLER_NAME
        };
        command = new DescribeLogStreamsCommand (input);
        response = await client.send(command);
        logStream = response['logStreams'][0];
        streamName = logStream['logStreamName'];
        console.log('Stream Name: ', streamName);
    });

    test('Each notification event processed by Event Handler Lambda is logged in the CloudWatch logs.', async () => {     
        const EXPECTED_OBJECT_KEY = 'object_key';
        const EXPECTED_OBJECT_TYPE = 'object_type';
        const EXPECTED_OBJECT_SIZE = 'object_size';
        const EXPECTED_LAST_MODIFIED = 'last_modified';
        const EXPECTED_DOWNLOAD_LINK = 'download_link';
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupName: FULL_LOG_EVENT_HANDLER_NAME,
            logStreamName: streamName
        };
        command = new GetLogEventsCommand (input);
        response = await client.send(command);
        const events: [] = response['events'];
        const messages = events.map( event => {
            return {
                timeStamp: event['timestamp'],
                message: event['message']
            }
        });
        const messagesString = JSON.stringify(messages);
        expect(messages.length).toBeGreaterThan(0);
        expect(messagesString).toContain(EXPECTED_OBJECT_KEY);
        expect(messagesString).toContain(EXPECTED_OBJECT_TYPE);
        expect(messagesString).toContain(EXPECTED_OBJECT_SIZE);
        expect(messagesString).toContain(EXPECTED_LAST_MODIFIED);
        expect(messagesString).toContain(EXPECTED_DOWNLOAD_LINK);
    });

    test('Cloudxserverless-app log group: All HTTP API requests processed by the application are logged in the CloudWatch logs.', async () => {     
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupName: CLOUD_APP_NAME
        };
        command = new DescribeLogStreamsCommand (input);
        response = await client.send(command);
        logStream = response['logStreams'];
        console.log('Streams: ', logStream);
        expect(logStream.length).toBeGreaterThan(0);
    });

});