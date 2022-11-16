import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('logout endpoint', () => {
  it('post only', async () => {
    const res = await request(app).get('/api/logout');
    assert.equal(res.statusCode, 404);
  });
  it('no cookie', async () => {
    const res = await request(app)
      .post('/api/logout')
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 401);
  });
  it('wrong cookie', async () => {
    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', ['refreshToken=randomToken'])
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 401);
  });
  it('success', async () => {
    const login = await request(app)
      .post('/api/login')
      .send({
        login: 's1kebeats',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');
    const refreshToken = login.body.refreshToken;

    const logout = await request(app)
      .post('/api/logout')
      .set('Cookie', ['refreshToken=' + refreshToken])
      .set('Content-Type', 'application/json');
    assert.equal(logout.statusCode, 200);
    assert.equal(logout.body.refreshToken, refreshToken);
  });
});
