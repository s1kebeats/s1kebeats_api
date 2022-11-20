import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('individual beat', () => {
  it('get only', async () => {
    const res = await request(app).post('/api/beat/14');
    assert.equal(res.statusCode, 404);
  });
  it('not existing beat', async () => {
    const res = await request(app).get('/api/beat/-2');
    assert.equal(res.statusCode, 404);
  });
  it('existing beat', async () => {
    const res = await request(app).get('/api/beat/21');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.name, 'Chaze');
    assert.equal(res.body.user.username, 's1kebeats');
    // related beats should not contain the main beat
    assert.equal(
      res.body.related.map((item) => item.id).includes(res.body.id),
      false
    );
  });
});
