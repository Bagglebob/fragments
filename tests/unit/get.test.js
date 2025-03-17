// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    // console.log(res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test("POST fragment, and GET it by calling get route. Returns a list of the authenticated user's existing fragment IDs", async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('This is a plain text fragment'); // data
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    const postResponseBody = JSON.parse(postRes.text);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toContainEqual(postResponseBody.fragment.id);
  });

  test("POST fragment, and GET it by calling get /?expand=1 route. Returns a list of the user's full fragments", async () => {
    const postRes = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('This is a plain text fragment2'); // data
    // If the response is a string, parse it
    const postResponseBody = JSON.parse(postRes.text); // Use postRes.body if it's already parsed

    // console.log('POST RESULT expand = true::', postResponseBody);

    const res = await request(app)
      .get(`/v1/fragments/?expand=1`)
      .auth('user1@email.com', 'password1');

    // console.log('GET RESULT:: expand = true', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments[1].id).toEqual(postResponseBody.fragment.id);
    expect(res.body.fragments[1].type).toEqual(postResponseBody.fragment.type);
    expect(res.body.fragments[1].ownerId).toEqual(postResponseBody.fragment.ownerId);
    expect(res.body.fragments[1].size).toEqual(postResponseBody.fragment.size);
  });

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
});
