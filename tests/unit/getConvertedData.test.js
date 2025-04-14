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


  test('Markdown to .txt conversion', async () => {
    const markdown = '# Hello';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/markdown')
      .send(markdown);
    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello'); // Not raw markdown
    expect(contentType.parse(res.headers['content-type']).type).toBe('text/plain');
  });

  test('Markdown to .md conversion', async () => {
    const markdown = '# Heading';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/markdown')
      .send(markdown);
    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.md`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.text).toBe('# Heading');
  });


  test('HTML to .txt conversion', async () => {
    const html = '<p>Sample HTML</p>';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/html')
      .send(html);
    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.text).toBe('Sample HTML');
  });



  test('CSV to JSON conversion', async () => {
    const csv = 'name,age\nJohn,30\nJane,25';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/csv')
      .send(csv);
    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({ name: 'John', age: '30' });
    expect(res.body[1]).toEqual({ name: 'Jane', age: '25' });
  });


  test('JSON to YAML conversion', async () => {
    const json = { fruit: 'banana', count: 3 };
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(json));
    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.yaml`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.text).toContain('fruit: banana');
    expect(res.text).toContain('count: 3');
  });


  test('Invalid conversion returns 415', async () => {
    const html = '<p>Test</p>';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/html')
      .send(html);
    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.yaml`)
      .auth(user, pass);

    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });


  test('Unsupported extension returns 415', async () => {
    const text = 'simple text';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send(text);
    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.docx`)
      .auth(user, pass);

    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });


  test('HTML conversion returns .html', async () => {
    const htmlData = '<p>Test HTML</p>';  // Example HTML content
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/html')
      .send(htmlData);

    const id = JSON.parse(postRes.text).fragment.id;

    // Now, request the conversion to .html
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth(user, pass);

    // Ensure status is 200 and data is correctly converted to HTML
    expect(res.status).toBe(200);
    expect(res.text).toBe(htmlData);  // Since no actual conversion was needed, the original HTML is returned
  });


  test('Non-existent fragment returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistentid.txt')
      .auth(user, pass);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });



  test('YAML conversion returns .yaml', async () => {
    const yamlData = `
    name: Fawad
    type: Developer
    `;

    // Post the YAML fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/yaml')
      .send(yamlData);

    const id = JSON.parse(postRes.text).fragment.id;

    // Get it back as `.yaml`
    const res = await request(app)
      .get(`/v1/fragments/${id}.yaml`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/yaml');
    expect(res.text.trim()).toBe(yamlData.trim()); // Trim to avoid whitespace mismatch
  });

  test('YAML conversion returns .txt', async () => {
    const yamlData = `
    framework: Express
    usage: backend
    `;

    // Post the YAML fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/yaml')
      .send(yamlData);

    const id = JSON.parse(postRes.text).fragment.id;

    // Get it back as `.txt`
    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text.trim()).toBe(yamlData.trim());
  });

  test('YAML conversion to invalid type', async () => {
    const yamlData = `
    framework: Express
    usage: backend
    `;

    // Post the YAML fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/yaml')
      .send(yamlData);

    const id = JSON.parse(postRes.text).fragment.id;

    // Get it back as `.txt`
    const res = await request(app)
      .get(`/v1/fragments/${id}.docx`)
      .auth(user, pass);

    expect(res.status).toBe(415);
  });


  test('Convert JSON to .json', async () => {
    const jsonData = JSON.stringify({ name: 'Alice', age: 25 });

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send(jsonData);

    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/json');
    expect(JSON.parse(res.text)).toEqual({ name: 'Alice', age: 25 });
  });


  test('Convert JSON to .txt', async () => {
    const jsonData = JSON.stringify({ city: 'Toronto', population: 3000000 });

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send(jsonData);

    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');

    // Should be stringified JSON string
    expect(res.text).toBe(JSON.stringify(jsonData));
  });


  test('Fail to convert JSON to unsupported format (.csv)', async () => {
    const jsonData = JSON.stringify({ test: true });

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'application/json')
      .send(jsonData);

    const id = JSON.parse(postRes.text).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.csv`)
      .auth(user, pass);

    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toMatch(/Unsupported conversion/);
  });

});
