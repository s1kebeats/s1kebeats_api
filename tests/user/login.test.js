import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('login endpoint', () => {
  it('post only', async () => {
    const res = await request(app).get('/api/login');
    assert.equal(res.statusCode, 404);
  });
  it('no login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('no password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'random@email.com',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('login with username', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 's1kebeats',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.body.accessToken, 'string');
    assert.equal(typeof res.body.refreshToken, 'string');
    assert.equal(res.body.user.username, 's1kebeats');
    assert.equal(res.body.user.email, 'adacenkoboos@gmail.com');
    assert.equal(
      res.headers['set-cookie'][0].includes(
        'refreshToken=' + res.body.refreshToken
      ),
      true
    );
    assert.equal(res.headers['set-cookie'][0].includes('HttpOnly'), true);
  });
  it('login with email', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'adacenkoboos@gmail.com',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.body.accessToken, 'string');
    assert.equal(typeof res.body.refreshToken, 'string');
    assert.equal(res.body.user.username, 's1kebeats');
    assert.equal(res.body.user.email, 'adacenkoboos@gmail.com');
    // assert.equal(res.headers['set-cookie'][0].split(';')[0].split('=')[1], res.body.refreshToken)
    assert.equal(
      res.headers['set-cookie'][0].includes(res.body.refreshToken),
      true
    );
    assert.equal(res.headers['set-cookie'][0].includes('HttpOnly'), true);
  });
  it('wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 's1kebeats',
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('wrong login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 'randonusername',
        password: 'sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
});
