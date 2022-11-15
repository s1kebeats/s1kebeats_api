import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('register endpoint', () => {
  it('post only', async () => {
    const res = await request(app).get('/api/register');
    assert.equal(res.statusCode, 404);
  });
  it('no email', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        username: 'randomusername',
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('no username', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        email: 'random@email.com',
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('no password', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        email: 'random@email.com',
        username: 'randomusername',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('wrong email', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        email: 'random.com',
        username: 'randomusername',
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('short password', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        email: 'random@email.com',
        username: 'randomusername',
        password: 'ra',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('long password', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        email: 'random@email.com',
        username: 'randomusername',
        password: 'g' * 33,
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
  it('wrong username', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        email: 'random@email.com',
        username: '__randomusername',
        password: 'randompassword',
      })
      .set('Content-Type', 'application/json');
    assert.equal(res.statusCode, 400);
  });
});
