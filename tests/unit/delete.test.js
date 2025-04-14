const request = require('supertest');

const app = require('../../src/app');
// const logger = require('../../src/logger');

describe('DELETE /v1/fragments/:id', () => {

  test('POST a fragment, then DELETE it, and then try to GET it', async () => {
    // POST fragment
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain') // send plain text
      .send('This is a plain text fragment')

    expect(res.header).toHaveProperty('location');
    const postResponseBody = JSON.parse(res.text);


    const res2 = await request(app)
      .delete(`/v1/fragments/${postResponseBody.fragment.id}`)
      .auth('user1@email.com', 'password1')

    expect(res2.status).toBe(200);
  })


  test('Non-existed fragment DELETE request', async () => {
    const res2 = await request(app)
      .delete(`/v1/fragments/39515f16-10a6-4b24-9fa3-d7daff78233d`)
      .auth('user1@email.com', 'password1')

    expect(res2.status).toBe(404);

  })

});
