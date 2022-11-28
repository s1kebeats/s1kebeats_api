import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('Liking beats', () => {
  it('Only POST', async () => {
    const res = await request(app).get('/api/21/like');
    assert.equal(res.statusCode, 404);
  });
  it('Not existing beat', async () => {
    const res = await request(app).post('/api/0/like');
    assert.equal(res.statusCode, 404);
  });
  it('Not authorized', async () => {
    const res = await request(app).post('/api/beat/21/like');
    assert.equal(res.statusCode, 401);
  });
  it('Authorized, but not activated', async () => {
    const login = await request(app).post('/api/login').send({
      login: 'notActivated',
      password: 'notActivated',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/21/like')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 401);
  });
  it('Adding like', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/21/like')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 200);
    const beat = await request(app).get('/api/beat/21/');
    assert.equal(beat.body._count.likes, 1);
  });
  it('Removing like', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/21/like')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 200);
    const beat = await request(app).get('/api/beat/21/');
    assert.equal(beat.body._count.likes, 0);
  });
});
