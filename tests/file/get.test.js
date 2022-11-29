import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('Getting media from S3', () => {
  it('Only GET', async () => {
    const res = await request(app).post('/api/file');
    assert.equal(res.statusCode, 404);
  });
  it('Not existing media', async () => {
    const res = await request(app).get('/api/file/random/file');
    assert.equal(res.statusCode, 404);
  });
  it('Success', async () => {
    const res = await request(app).get(
      '/api/file/image/F4naIXHO6RcWDhbsEf1mVpmYd2Ls5uMgNUYd'
    );
    assert.equal(res.statusCode, 200);
  });
});
