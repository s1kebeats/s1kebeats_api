import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('Tags retrieval', () => {
  it('Only GET', async () => {
    const res = await request(app).post('/api/tag');
    assert.equal(res.statusCode, 404);
  });
  it('No name filter', async () => {
    const res = await request(app).get('/api/tag');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.tags.length, 9);
  });
  it('Viewed: 10', async () => {
    const res = await request(app).get('/api/tag/?viewed=10');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.tags.length, 0);
  });
  it('With name filter', async () => {
    const res = await request(app).get('/api/tag/?name=s1kebeats');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.tags.length, 1);
  });
});
