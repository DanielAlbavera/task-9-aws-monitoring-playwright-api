import { test, expect } from '@playwright/test';
import { DynamoDBClient, DescribeTableCommand, DescribeTimeToLiveCommand, ListTagsOfResourceCommand } from "@aws-sdk/client-dynamodb";
import { LambdaClient, ListEventSourceMappingsCommand, GetFunctionConfigurationCommand, GetFunctionConfigurationCommandInput, ListTagsCommand, ListTagsCommandInput } from '@aws-sdk/client-lambda';
import { CloudWatchLogsClient, DescribeLogGroupsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { REGION, DYNAMODB_TABLE_NAME, TABLE_ARN, LAMBDA_FUNCTION_NAME, LAMBDA_FUNCTION_ARN, SQS_ARN } from '../data/constants';

test.describe('Cloudxserverless Deployment Validations', () => {

    let client: DynamoDBClient;
    let input: any;
    let command: any;
    let response: Object;
    let atributes: Object;
    let provisionedThroughput: Object;

    test.beforeAll( async () => {
        client = new DynamoDBClient({ region: REGION });
        input = {
            TableName: DYNAMODB_TABLE_NAME
        };
        command = new DescribeTableCommand(input);
        response = await client.send(command);
        atributes = response['Table']['AttributeDefinitions'];
        provisionedThroughput = response['Table']['ProvisionedThroughput'];
    });

    test('The application database is replaced with a DynamoDB table', async () => {                
        expect(response['Table']['TableName']).toEqual(DYNAMODB_TABLE_NAME);
    });

    test('The DynamoDB table should store the following image metadata information', async () => {                
        const EXPECTED_ATRIBUTE = { AttributeName: 'id', "AttributeType": "S" };
        expect(atributes[0]).toEqual(EXPECTED_ATRIBUTE);
    });

    test('DynamoDB Table requirements- Name, ReadCapacityUnits, WriteCapacityUnits ', async () => {                
        const EXPECTED_PROVISIONED_READ_CAPACITY_UNITS = 5;
        const EXPECTED_PROVISIONED_WRITE_CAPACITY_UNITS = 1;
        expect(response['Table']['TableName']).toEqual(DYNAMODB_TABLE_NAME);
        expect(provisionedThroughput['ReadCapacityUnits']).toEqual(EXPECTED_PROVISIONED_READ_CAPACITY_UNITS);
        expect(provisionedThroughput['WriteCapacityUnits']).toEqual(EXPECTED_PROVISIONED_WRITE_CAPACITY_UNITS);
    });

    test('DynamoDB Table - Time to Live', async () => {  
        const EXPECTED_TTL = { TimeToLiveStatus: "DISABLED"};
        command = new DescribeTimeToLiveCommand(input);
        response = await client.send(command);
        expect(response['TimeToLiveDescription']).toEqual(EXPECTED_TTL);
    });

    test('DynamoDB Table - Tags', async () => {  
        const EXPECTED_TAG = { Key: 'cloudx', Value: 'qa' };
        input = {
            ResourceArn: TABLE_ARN
        }
        command = new ListTagsOfResourceCommand (input);
        response = await client.send(command);
        expect(response['Tags'][0]).toEqual(EXPECTED_TAG);
    });

    test('AWS Lambda requirements ', async () => {    
        const client = new LambdaClient({ region: REGION });   
        const params = {
            FunctionName: LAMBDA_FUNCTION_NAME
          };
        const command = new ListEventSourceMappingsCommand(params);
        const response: Object = await client.send(command);
        expect(response['EventSourceMappings'][0]['EventSourceArn']).toBe(SQS_ARN);
    });

    test('AWS Cloudwatch Logs ', async () => {    
        const EXPECTED_GROUP_NAME = '/aws/lambda/cloudxserverless-EventHandlerLambda';
        const client = new CloudWatchLogsClient({ region: REGION });   
        const input = {
            logGroupNamePrefix: EXPECTED_GROUP_NAME
        };
        const command = new DescribeLogGroupsCommand(input); 
        const response: Object = await client.send(command);
        expect(response['logGroups'][0]['logGroupName']).toContain(EXPECTED_GROUP_NAME);
    });

    test('AWS Lambda - Memory, Storage, Timeout', async () => {    
        const EXPECTED_MEMORY_SIZE = 128;
        const EXPECTED_STORAGE_SIZE = 512;
        const EXPECTED_TIMEOUT = 3;
        const client = new LambdaClient({ region: REGION });   
        const input: GetFunctionConfigurationCommandInput = {
            FunctionName: LAMBDA_FUNCTION_NAME
        };
        const command = new GetFunctionConfigurationCommand(input); 
        const response: Object = await client.send(command);
        expect(response['MemorySize']).toBe(EXPECTED_MEMORY_SIZE);
        expect(response['EphemeralStorage']['Size']).toBe(EXPECTED_STORAGE_SIZE);
        expect(response['Timeout']).toBe(EXPECTED_TIMEOUT);
    });

    test('AWS Lambda Tags', async () => { 
        const EXPECTED_LAMBDA_TAG = '"cloudx":"qa"';
        const client = new LambdaClient({ region: REGION });   
        const input: ListTagsCommandInput = {
            Resource: LAMBDA_FUNCTION_ARN
        };
        const command = new ListTagsCommand(input); 
        const response: Object = await client.send(command);
        const responseString = JSON.stringify(response['Tags']);
        expect(responseString).toContain(EXPECTED_LAMBDA_TAG);
    });

});