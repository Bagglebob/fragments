const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');
// const logger = require('../../src/logger');

describe('POST /v1/fragments', () => {
  // If the request is missing the Auth header, it should be forbidden
  test('POST: unauthenticated requests are denied', () =>
    request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('Hello World')
      .expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('POST: incorrect credentials are denied', async () =>
    await request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .set('Content-Type', 'text/plain')
      .send('Hello World')
      .expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('POST: authenticated users can post a fragments array (includes hashed email test)', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('This is a plain text fragment'); // data
    const resBody = JSON.parse(res.text);

    expect(res.status).toBe(201);
    expect(resBody.status).toBe('ok');
    expect(resBody.fragment).toHaveProperty('id');
    expect(resBody.fragment).toHaveProperty('created');
    expect(resBody.fragment).toHaveProperty('updated');
    expect(resBody.fragment).toHaveProperty('type', 'text/plain');
    expect(resBody.fragment).toHaveProperty('ownerId', hash('user1@email.com'));
    expect(resBody.fragment).toHaveProperty('size');
    expect(res.header).toHaveProperty('location');
  });
});
