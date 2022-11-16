import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('resfresh endpoint', () => {
  it('get only', async () => {
    const res = await request(app).post('/api/refresh');
    assert.equal(res.statusCode, 404);
  });
  it('no cookie', async () => {
    const res = await request(app)
      .get('/api/refresh')
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 401);
  });
  it('wrong cookie', async () => {
    const res = await request(app)
      .get('/api/refresh')
      .set('Cookie', ['refreshToken=randomToken'])
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 401);
  });
  it('refresh', async () => {
    const login = await request(app)
      .post('/api/login')
      .send({
        login: 's1kebeats',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');

    const refresh = await request(app)
      .get('/api/refresh')
      .set('Cookie', ['refreshToken=' + login.body.refreshToken])
      .set('Content-Type', 'application/json');
    assert.equal(refresh.statusCode, 200);
    assert.equal(
      refresh.headers['set-cookie'][0].includes(
        'refreshToken=' + refresh.body.refreshToken
      ),
      true
    );
    assert.equal(refresh.headers['set-cookie'][0].includes('HttpOnly'), true);
  });
});
