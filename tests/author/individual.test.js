import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('author individual enpoint', () => {
  it('get only', async () => {
    const res = await request(app).post('/api/author/s1kebeats');
    assert.equal(res.statusCode, 404);
  });
  it('not existing author', async () => {
    const res = await request(app).get('/api/author/randomauthor');
    assert.equal(res.statusCode, 404);
  });
  it('existing author', async () => {
    const res = await request(app).get('/api/author/s1kebeats');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.username, 's1kebeats');
    assert.equal(res.body.beats.length, 4);
  });
});
