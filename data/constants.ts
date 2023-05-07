import dotenv from 'dotenv';
dotenv.config();

export const URL = {
    BASE: process.env.BASE_URL  || 'URL NOT PROVIDED'
}

export const EMAIl = process.env.EMAIL;

export const REGION = process.env.REGION;

export const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export const TABLE_ARN = process.env.TABLE_ARN;

export const LAMBDA_FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME;

export const LAMBDA_FUNCTION_ARN = process.env.LAMBDA_FUNCTION_ARN;

export const SQS_ARN = process.env.SQS_ARN;