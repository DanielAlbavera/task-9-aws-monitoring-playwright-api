import { test, expect } from '@playwright/test';
import { CloudWatchClient, DescribeAlarmsCommand } from '@aws-sdk/client-cloudwatch';
import { CloudWatchLogsClient, DescribeLogGroupsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { CloudTrailClient, DescribeTrailsCommand, ListTagsCommand } from "@aws-sdk/client-cloudtrail";
import { REGION, CLOUDWATCH_PREFIX, LOG_CLOUDINIT_GROUP_NAME, LOG_GROUP_MESSAGES, LOG_EVENT_HANDLER, CLOUD_TRAIL_NAME, CLOUD_APP_NAME, CLOUD_TRAIL_ARN  } from '../data/constants';

test.describe('Cloudxserverless Deployment Validations', () => {

    let client: any;
    let input: any;
    let command: any;
    let response: Object;
    let alarms: [];

    test('The application EC2 instance has CloudWatch integration.', async () => {     
        client = new CloudWatchClient({ region: REGION });
        input = {
            AlarmNamePrefix: CLOUDWATCH_PREFIX
        };
        command = new DescribeAlarmsCommand(input);
        response = await client.send(command);
        alarms = response['MetricAlarms'];

        const alarmNames = alarms.map( alarm => alarm['AlarmName']);
        const names = new Array(...alarmNames);
        names.forEach( name => {
            expect(name).toContain(CLOUDWATCH_PREFIX);
        });
    });

    test('CloudInit logs should be collected in CloudWatch logs.', async () => {
        const EXPECTED_CLOUD_INIT_LOGS = 'cloud-init';            
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupNamePrefix: LOG_CLOUDINIT_GROUP_NAME
        };
        command = new DescribeLogGroupsCommand(input);
        response = await client.send(command);
        const logGroups = response['logGroups'];
        const group = logGroups[0];
        const name = group['logGroupName'];
        expect(name).toContain(EXPECTED_CLOUD_INIT_LOGS);
    });

    test('The application messages should be collected in CloudWatch logs.', async () => {
        const EXPECTED_CLOUD_MESSAGES_LOGS = 'messages';            
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupNamePrefix: LOG_GROUP_MESSAGES
        };
        command = new DescribeLogGroupsCommand(input);
        response = await client.send(command);
        const logGroups = response['logGroups'];
        const group = logGroups[0];
        const name = group['logGroupName'];
        expect(name).toContain(EXPECTED_CLOUD_MESSAGES_LOGS);
    });

    test('The event handler logs should be collected in CloudWatch logs.', async () => {
        const EXPECTED_CLOUD_EVENT_HANDLER_LOGS = 'EventHandler';            
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupNamePrefix: LOG_EVENT_HANDLER
        };
        command = new DescribeLogGroupsCommand(input);
        response = await client.send(command);
        const logGroups = response['logGroups'];
        const group = logGroups[0];
        const name = group['logGroupName'];
        expect(name).toContain(EXPECTED_CLOUD_EVENT_HANDLER_LOGS);
    });

    test('CloudTrail is enabled for Serverless stack and collects logs about AWS services access.', async () => {
        const EXPECTED_CLOUD_TRAIL_NAME = 'cloudxserverless-Trail';            
        client = new CloudTrailClient({ region: REGION });
        input = {
            trailNameList: [
                CLOUD_TRAIL_NAME
            ]
        };
        command = new DescribeTrailsCommand(input);
        response = await client.send(command);
        const trailList = response['trailList'];
        const trail = trailList[0];
        expect(trail['Name']).toContain(EXPECTED_CLOUD_TRAIL_NAME);
    });

    test('CloudWatch LogGroups requirements - /aws/lambda/cloudxserverless-EventHandlerLambda', async () => {           
        const EXPECTED_EVENT_HANDLER_NAME = '/aws/lambda/cloudxserverless-EventHandlerLambda';
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupNamePrefix: LOG_EVENT_HANDLER
        };
        command = new DescribeLogGroupsCommand(input);
        response = await client.send(command);
        const logGroups = response['logGroups'];
        const group = logGroups[0];
        const arn = group['arn'];
        const name = group['logGroupName'];
        expect(name).toContain(EXPECTED_EVENT_HANDLER_NAME);
        expect(arn).toContain(REGION);
    });

    test('CloudWatch LogGroups requirements - /var/log/cloudxserverless-app', async () => {           
        const EXPECTED_APP_NAME = '/var/log/cloudxserverless-app';
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupNamePrefix: CLOUD_APP_NAME
        };
        command = new DescribeLogGroupsCommand(input);
        response = await client.send(command);
        const logGroups = response['logGroups'];
        const group = logGroups[0];
        const arn = group['arn'];
        const name = group['logGroupName'];
        expect(name).toContain(EXPECTED_APP_NAME);
        expect(arn).toContain(REGION);
    });

    test('CloudWatch LogGroups requirements - /var/log/cloud-init', async () => {           
        const EXPECTED_CLOUDINIT_NAME = '/var/log/cloud-init';
        client = new CloudWatchLogsClient({ region: REGION });
        input = {
            logGroupNamePrefix: LOG_CLOUDINIT_GROUP_NAME
        };
        command = new DescribeLogGroupsCommand(input);
        response = await client.send(command);
        const logGroups = response['logGroups'];
        const group = logGroups[0];
        const arn = group['arn'];
        const name = group['logGroupName'];
        expect(name).toContain(EXPECTED_CLOUDINIT_NAME);
        expect(arn).toContain(REGION);
    });

    test('CloudTrail trail requirements: name, multi-region, file-validation', async () => {           
        const EXPECTED_NAME = 'cloudxserverless-Trail';
        const EXPECTED_MULTI_REGION = true;
        const EXPECTED_LOG_FILE_VALIDATION = true;
        client = new CloudTrailClient({ region: REGION });
        input = {
            trailNameList: [
                CLOUD_TRAIL_NAME
            ]
        };
        command = new DescribeTrailsCommand(input);
        response = await client.send(command);
        const trail = response['trailList'][0];
        const name = trail['Name'];
        const multiRegion = trail['IsMultiRegionTrail'];
        const logFileValidation = trail['LogFileValidationEnabled'];
        expect(name).toContain(EXPECTED_NAME);
        expect(multiRegion).toBe(EXPECTED_MULTI_REGION);
        expect(logFileValidation).toBe(EXPECTED_LOG_FILE_VALIDATION);
    });

    test('CloudTrail trail requirements: tags', async () => {           
        const EXPECTED_TAG = { Key: 'cloudx', Value: 'qa' };
        client = new CloudTrailClient({ region: REGION });
        input = {
            ResourceIdList: [
                CLOUD_TRAIL_ARN
            ]
        };
        command = new ListTagsCommand(input);
        response = await client.send(command);
        const tagList = response['ResourceTagList'][0]['TagsList'];
        const tag = tagList[0];
        expect(tag).toEqual(EXPECTED_TAG);
    });

});