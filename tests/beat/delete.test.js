import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('Beat deletion', () => {
  it('Only POST', async () => {
    const res = await request(app).get('/api/beat/21/delete');
    assert.equal(res.statusCode, 404);
  });
  it('Not authorized', async () => {
    const res = await request(app).post('/api/beat/21/delete');
    assert.equal(res.statusCode, 401);
  });
  it('Authorized, but not activated', async () => {
    const login = await request(app).post('/api/login').send({
      login: 'notActivated',
      password: 'notActivated',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/21/delete')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 401);
  });
  it('Not a beat author', async () => {
    const login = await request(app).post('/api/login').send({
      login: 'hasNoBeats',
      password: 'hasNoBeats',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/21/delete')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 401);
  });
  it('Not existing beat', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/0/delete')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 404);
  });
  it('Success', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/25/delete')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 200);
    const wave = await request(app).get(`/api/file/${res.body.wave}`);
    assert.equal(wave.statusCode, 404);
  });
});
