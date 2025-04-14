// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments/:id get fragments by ID', () => {
  const user = 'user1@email.com'; // username for testing
  const pass = 'password1';

  test('Get Fragment DATA by ID | /:id route', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('This is a plain text fragment'); // data
    // Parse response body from postRes.text, because postRes.text contains the response as a string
    const postResponseBody = JSON.parse(postRes.text);

    const res = await request(app)
      .get(`/v1/fragments/${postResponseBody.fragment.id}`)
      .auth('user1@email.com', 'password1');
    // console.log('GET RESULT:: /:id', res.text);

    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('This is a plain text fragment');
    // Verify Content-Type header
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
  });


  test('GET /v1/fragments/:id returns JSON for application/json type', async () => {
    const jsonData = JSON.stringify({ name: 'Alice', active: true });

    // Post the fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send(jsonData);

    const id = JSON.parse(postRes.text).fragment.id;

    // Fetch the fragment by ID
    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(user, pass);

    expect(getRes.status).toBe(200);
    expect(getRes.headers['content-type']).toContain('application/json');
    expect(getRes.body).toEqual({ name: 'Alice', active: true });
  });

});
