import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

// Beat for tests: { id: 21, name: 'Chaze', user: { username: 's1kebeats' }, comments[0]: { content: 'Comment content' } }
describe('Get individual beat data', () => {
  it('Only GET', async () => {
    const res = await request(app).post('/api/beat/21');
    assert.equal(res.statusCode, 404);
  });
  it('Not existing beat', async () => {
    // Beat: { id: 0 } doesn't exist
    const res = await request(app).get('/api/beat/0');
    assert.equal(res.statusCode, 404);
  });
  it('Success', async () => {
    const res = await request(app).get('/api/beat/1');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.name, 'outtahere');
    assert.equal(res.body.user.username, 's1kebeats');
    // Related beats shouldn't contain beat that user is getting
    assert.equal(
      res.body.related.map((item) => item.id).includes(res.body.id),
      false
    );
  });
});
