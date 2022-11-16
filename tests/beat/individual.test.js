import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('individual beat', () => {
  it('get only', async () => {
    const res = await request(app).post('/beat/');
    assert.equal(res.statusCode, 400);
  });
});
