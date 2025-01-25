const request = require('supertest');

const app = require('../../src/app');

describe('404 Response Test for src/app.js', () => {
  test('should return a 404 error for unknown routes', () =>
    request(app).get('/noroute').expect(404));
});
