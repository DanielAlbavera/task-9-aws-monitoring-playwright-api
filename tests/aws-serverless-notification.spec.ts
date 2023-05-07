import { test, expect } from '@playwright/test';
import { EMAIl } from '../data/constants';

test.describe('AWS S3 Notification Validations', () => {

    const valid_email = EMAIl;

    test('List email subscriptions to SNS topic before subscriptions', async ({request, baseURL}) => {
        const endpoind = '/notification';
        const response = await request.get(baseURL+endpoind);
        const json = await response.json();
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
        expect.soft(Array.isArray(json)).toBe(true);
        expect.soft(json.length).toBe(0);
    });

    test('Subscribes email to SNS topic', async ({request, baseURL}) => {
        const endpoind = '/notification/';
        const response = await request.post(baseURL+endpoind+valid_email);
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    test('List email subscriptions to SNS topic after subscriptions', async ({request, baseURL}) => {
        const endpoind = '/notification';
        const response = await request.get(baseURL+endpoind);
        const json = await response.json();
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
        expect.soft(Array.isArray(json)).toBe(true);
        for (const subscription of json) {
            expect.soft(subscription).toHaveProperty("Endpoint");
            expect.soft(subscription['Endpoint']).toBe(EMAIl);
            expect.soft(subscription).toHaveProperty("Owner");
            expect.soft(subscription).toHaveProperty("Protocol");
            expect.soft(subscription['Protocol']).toBe("email");
            expect.soft(subscription).toHaveProperty("SubscriptionArn");
            expect.soft(subscription['SubscriptionArn']).toBe("PendingConfirmation");
            expect.soft(subscription).toHaveProperty("TopicArn");
        }
        for (const key of json) {
            expect.soft(typeof key).toBe("object");
        }
    });

    test('Subscribes by invalid email to SNS topic', async ({request, baseURL}) => {
        const endpoind = '/notification/';
        const invalid_email = '123';
        const response = await request.post(baseURL+endpoind+invalid_email);
        const json = await response.json();
        expect.soft(response.status()).toBe(400);
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    test.skip('Unsubscribes email to SNS topic', async ({request, baseURL}) => {
        const endpoind = '/notification/';
        const response = await request.delete(baseURL+endpoind+valid_email);
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    test('Unsubscribes email to SNS topic without confirm subscription', async ({request, baseURL}) => {
        const endpoind = '/notification/';
        const response = await request.delete(baseURL+endpoind+valid_email);
        expect.soft(response.status()).toBe(412);
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    test('Unsubscribes by an email that is not subscribed', async ({request, baseURL}) => {
        const endpoind = '/notification/';
        const not_subscribed_email = 'test@emial.com';
        const response = await request.delete(baseURL+endpoind+not_subscribed_email);
        expect.soft(response.status()).toBe(404);
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    //Skipping because needs confiormation before unsubcribing 
    test.skip('List email subscriptions to SNS topic after unsubscription', async ({request, baseURL}) => {
        const endpoind = '/notification';
        const response = await request.get(baseURL+endpoind);
        const json = await response.json();
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
        expect.soft(Array.isArray(json)).toBe(true);
        expect.soft(json.length).toBe(0);
    });

});