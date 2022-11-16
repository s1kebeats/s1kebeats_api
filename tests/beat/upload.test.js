import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('beat upload', () => {
  it('post only', async () => {
    const res = await request(app).get('/beat/upload');
    assert.equal(res.statusCode, 400);
  });
  it('post only', async () => {
    const res = await request(app).get('/beat/upload');
    assert.equal(res.statusCode, 400);
  });
});
