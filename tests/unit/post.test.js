const request = require('supertest');

const app = require('../../src/app');
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
  test('POST: authenticated users can post a fragments array', async () => {
    const expectedData = Buffer.from('This is a plain text fragment').toJSON();
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('This is a plain text fragment'); // data
    // logger.debug(res);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('created');
    expect(res.body).toHaveProperty('updated');
    expect(res.body).toHaveProperty('type', 'text/plain');
    expect(res.body).toHaveProperty('ownerId', 'user1@email.com');
    expect(res.body).toHaveProperty('size');
    expect(res.body).toHaveProperty('data', expectedData);
    expect(res.header).toHaveProperty('location');
  });
});
