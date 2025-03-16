const request = require('supertest');
const app = require('../../src/app');
// const { Fragment } = require('../../src/model/fragment');
const contentType = require('content-type');

describe('GET /v1/fragments/:id/info', () => {
  const user = 'user1@email.com'; // username for testing
  const pass = 'password1';

  test('GET: unauthenticated requests are denied', () =>
    request(app)
      .get('/v1/fragments/123/info') // Assuming 123 is a valid fragment ID
      .expect(401));

  // Test case for successful metadata retrieval
  test('GET: should return metadata for a valid fragment', async () => {
    // First, create a fragment (post request)
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('This is a plain text fragment');
    const postResBody = JSON.parse(postRes.text);

    const fragmentId = postResBody.fragment.id;

    // Now, get the metadata for that fragment
    const res = await request(app).get(`/v1/fragments/${fragmentId}/info`).auth(user, pass);
    let ty = contentType.parse(res.headers['content-type']);
    const resBody = JSON.parse(res.text);

    expect(res.status).toBe(200); // Expecting successful response
    expect(resBody).toHaveProperty('id', fragmentId); // Check that the returned fragment has the same ID
    expect(resBody).toHaveProperty('type'); // Check that the fragment has a type
    expect(resBody).toHaveProperty('size'); // Check that the fragment has a size
    expect(ty.type).toBe(resBody.type); // Content-Type header should match fragment type
  });
});
