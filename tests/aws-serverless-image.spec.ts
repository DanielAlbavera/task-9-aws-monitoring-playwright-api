import { test, expect } from '@playwright/test';
import { createReadStream } from 'fs';
import path from "path";

test.describe('AWS Serverless Image Validations', () => {

    const file_path = './files/';
    const file_name = 'AWS-Logo.jpg';
    let image_id = '';

    // GET - /image
    test('Gets all images metadata before uploading a file', async ({request, baseURL}) => {
        const endpoind = '/image';
        const response = await request.get(baseURL+endpoind);
        const json = await response.json();
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
        expect.soft(Array.isArray(json)).toBe(true);
        expect.soft(json.length).toBe(0);
    });

    // POST - /image
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

    // POST - /image
    test('Uploads an invalid image to DynamoDB', async ({request, baseURL}) => {
        const endpoind = '/image';
        const response = await request.post(baseURL+endpoind,
            {
                data: {}
            });
        expect.soft(response.status()).toBe(400);
    });

    test('Gets image id', async ({request, baseURL}) => {
        const endpoind = '/image';
        const response = await request.get(baseURL+endpoind);
        const json = await response.json();
        image_id = json[0]['id'];
        console.log(image_id);
        expect.soft(response).toBeOK();
    });

    // GET - /image/file/{image_id}
    test('Gets image metadata by object id', async ({request, baseURL}) => {
        const endpoind = '/image/file/';
        const response = await request.get(baseURL+endpoind+image_id);
        expect.soft(response).toBeOK();
    });

        // GET - /image/file/{image_id}
    test('downloads image file by object id', async ({request, baseURL}) => {
        const endpoind = '/image/file/';
        const response = await request.get(baseURL+endpoind+image_id);
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toContain('image/');
    });

     // GET - /image/{image_id}
     //GETS - status code 500 INTERNAL SERVER ERROR 
    test.skip('Gets image metadata by object id that does not exists', async ({request, baseURL}) => {
        const endpoind = '/image/';
        const image_id = 0;
        const expected_body = '"Image not found!"';
        const response = await request.get(baseURL+endpoind+image_id);
        expect.soft(response.status()).toBe(404);
        expect.soft(await response.text()).toMatch(expected_body);
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    // GET - /image
    test('Gets all images metadata after uploading a file', async ({request, baseURL}) => {
        const endpoind = '/image';
        const response = await request.get(baseURL+endpoind);
        const json = await response.json();
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
        expect.soft(Array.isArray(json)).toBe(true);
        expect.soft(json.length).toBe(1);
    });

     // DELETE - /image/{image_id}
     test('Delete image by key', async ({request, baseURL}) => {
        const endpoind = '/image/';
        const response = await request.delete(baseURL+endpoind+image_id);
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    // DELETE - /image/{image_id}
    test('Delete image that does not exists', async ({request, baseURL}) => {
        const endpoind = '/image/';
        const image_id = 99;
        const response = await request.delete(baseURL+endpoind+image_id);
        expect.soft(response.status()).toBe(404);
        expect.soft(response.headers()["content-type"]).toBe('application/json');
    });

    // GET - /image
    test('Gets all images metadata after deletting a file', async ({request, baseURL}) => {
        const endpoind = '/image';
        const response = await request.get(baseURL+endpoind);
        const json = await response.json();
        expect.soft(response).toBeOK();
        expect.soft(response.headers()["content-type"]).toBe('application/json');
        expect.soft(Array.isArray(json)).toBe(true);
        expect.soft(json.length).toBe(0);
    });

});