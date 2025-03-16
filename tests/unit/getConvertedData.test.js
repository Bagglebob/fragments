const request = require('supertest');
// const { Fragment } = require('../../src/model/fragment');
const app = require('../../src/app');
const contentType = require('content-type');

describe('GET converted Fragment Data @ /v1/fragments/:id.ext', () => {
  const user = 'user1@email.com'; // username for testing
  const pass = 'password1';

  // Test for successful conversion of Markdown to HTML
  test('GET: Converts Markdown to HTML and returns the converted data', async () => {
    const fileExt = 'html'; // Target extension
    const markdownData = '# Hello World'; // Sample Markdown data
    const expectedHtml = '<h1>Hello World</h1>\n'; // Expected converted HTML

    // First, POST a fragment to create it in the DB
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/markdown')
      .send(markdownData);
    const resBody = JSON.parse(postRes.text);

    // Assert that POST was successful
    expect(postRes.status).toBe(201);
    expect(resBody.status).toBe('ok');
    // console.log(resBody);
    // Now, get the converted data by calling the /convertedData route with 'html' extension
    const res = await request(app)
      .get(`/v1/fragments/${resBody.fragment.id}.${fileExt}`)
      .auth(user, pass);
    // console.log(res.text);
    let ty = contentType.parse(res.headers['content-type']);
    // Assertions for successful response
    expect(res.status).toBe(200);
    expect(res.text).toBe(expectedHtml); // Check if the conversion happened correctly
    expect(ty.type).toBe('text/html'); // Ensure the content type is HTML
  });
});
