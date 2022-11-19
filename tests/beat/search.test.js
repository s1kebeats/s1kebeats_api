import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('beats search', () => {
  it('get only', async () => {
    const res = await request(app).post('/api/beat/');
    assert.equal(res.statusCode, 404);
  });
  it('no filters', async () => {
    const res = await request(app).get('/api/beat/');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 2);
  });
  it('tags', async () => {
    const res = await request(app).get('/api/beat/?tags=7');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(
      res.body[0].tags.map((item) => item.name).includes('gunna'),
      true
    );
  });
  it('query author name', async () => {
    const res = await request(app).get('/api/beat/?q=s1kebeats');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 2);
    assert.equal(
      res.body.map((item) => item.user.username).includes('s1kebeats'),
      true
    );
  });
  it('query beat name', async () => {
    const res = await request(app).get('/api/beat/?q=outta');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].name, 'outtahere');
  });
  it('bpm', async () => {
    const res = await request(app).get('/api/beat/?bpm=140');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].name, 'Chaze');
  });
  it('sort', async () => {
    const res = await request(app).get('/api/beat/?sort=id');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].name, 'Chaze');
  });
});
