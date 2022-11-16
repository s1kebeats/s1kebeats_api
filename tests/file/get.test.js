import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('get media', () => {
  it('get only', async () => {
    const res = await request(app).post('/api/file');
    assert.equal(res.statusCode, 404);
  });
  it('not existing media', async () => {
    const res = await request(app).get('/api/file/random/file');
    assert.equal(res.statusCode, 404);
  });
  it('success', async () => {
    const res = await request(app).get(
      '/api/file/image/cNuUc7iZy6SGxd8JaheO9tRQDKLLRIdDuUCJ'
    );
    assert.equal(res.statusCode, 200);
  });
});
