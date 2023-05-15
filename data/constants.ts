import dotenv from 'dotenv';
dotenv.config();

export const URL = {
    BASE: process.env.BASE_URL  || 'URL NOT PROVIDED'
}

export const EMAIl = process.env.EMAIL;

export const REGION = process.env.REGION;

export const CLOUDWATCH_PREFIX = process.env.CLOUDWATCH_PREFIX || 'PREFIX NOT PROVIDED';

export const LOG_CLOUDINIT_GROUP_NAME = process.env.LOG_CLOUDINIT_GROUP_NAME || 'NAME NOT PROVIDED';

export const LOG_GROUP_MESSAGES = process.env.LOG_GROUP_MESSAGES || 'MESSAGES GROUP NOT PROVIDED'

export const LOG_EVENT_HANDLER = process.env.LOG_EVENT_HANDLER || 'EVENT HANDLER GROUP NOT PROVIDED';

export const CLOUD_TRAIL_NAME = process.env.CLOUD_TRAIL_NAME || 'CLOUD TRAIL NAME NOT PROVIDED';

export const CLOUD_APP_NAME = process.env.CLOUD_APP_NAME || 'APP NAME NOT PROVIDED';

export const CLOUD_TRAIL_ARN = process.env.CLOUD_TRAIL_ARN || 'ARN NOT PROVIDED';

export const FULL_LOG_EVENT_HANDLER_NAME = process.env.FULL_LOG_EVENT_HANDLER_NAME || 'FULL LOG EVENT HANDLER NAME NOT PROVIDED';