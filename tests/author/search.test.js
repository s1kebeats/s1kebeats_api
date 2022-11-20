import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('authors endpoint', () => {
  it('get only', async () => {
    const res = await request(app).post('/api/author');
    assert.equal(res.statusCode, 404);
  });
  it('no query', async () => {
    const res = await request(app).get('/api/author');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 3);
  });
  it('with query', async () => {
    const res = await request(app).get('/api/author/?q=jp');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].username, 'jpbeatz');
  });
});
