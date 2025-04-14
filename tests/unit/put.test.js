const request = require('supertest');

const app = require('../../src/app');
// const logger = require('../../src/logger');

describe('PUT /v1/fragments/:id', () => {

  test('POSTing a fragment and then updating it with PUT', async () => {
    // POST fragment
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('This is a plain text fragment')

    expect(res.header).toHaveProperty('location');
    const postResponseBody = JSON.parse(res.text);

    // Update fragment
    const res2 = await request(app)
      .put(`/v1/fragments/${postResponseBody.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('Updated Fragment')

    expect(res2.status).toBe(200);

    // Get fragment Data

    const res3 = await request(app)
      .get(`/v1/fragments/${postResponseBody.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(res3.text).toEqual('Updated Fragment');
    expect(res3.headers['content-type']).toBe('text/plain; charset=utf-8');
  })

  // Lines 24-25
  test('Non-existed fragment PUT request', async () => {

    // Update fragment
    const res2 = await request(app)
      .put(`/v1/fragments/39515f16-10a6-4b24-9fa3-d7daff78233d`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('Updated Fragment')

    expect(res2.status).toBe(404);

  })

});
