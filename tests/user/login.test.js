import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('User login', () => {
  it('Only POST', async () => {
    const res = await request(app).get('/api/login');
    assert.equal(res.statusCode, 404);
  });
  it('No username', async () => {
    const res = await request(app).post('/api/login').send({
      password: 'randompassword',
    });
    assert.equal(res.statusCode, 400);
  });
  it('No password', async () => {
    const res = await request(app).post('/api/login').send({
      username: 'random@email.com',
    });
    assert.equal(res.statusCode, 400);
  });
  it('Not activated user', async () => {
    const res = await request(app).post('/api/login').send({
      username: 'notActivated',
      password: 'notActivated1',
    });
    assert.equal(res.statusCode, 400);
  });
  it('Success', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        username: 's1kebeats',
        password: 'Sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.body.accessToken, 'string');
    assert.equal(typeof res.body.refreshToken, 'string');
    assert.equal(res.body.user.username, 's1kebeats');
    assert.equal(res.body.user.email, 'adacenkoboos@gmail.com');
    // refresh token cookie check
    assert.equal(
      res.headers['set-cookie'][0].includes(
        'refreshToken=' + res.body.refreshToken
      ),
      true
    );
    assert.equal(res.headers['set-cookie'][0].includes('HttpOnly'), true);
  });
  it('Wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        login: 's1kebeats',
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('Wrong username', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        username: 'randonusername',
        password: 'Sbeats2005',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
});
