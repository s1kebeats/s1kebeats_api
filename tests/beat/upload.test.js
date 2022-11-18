import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('beat upload', () => {
  it('post only', async () => {
    const res = await request(app).get('/api/beat/upload');
    assert.equal(res.statusCode, 404);
  });
  it('no name', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .attach('wave', 'tests/files/test.wav')
      .attach('mp3', 'tests/files/test.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('no wave', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('mp3', 'tests/files/test.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('no mp3', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('wave', 'tests/files/test.wav');
    assert.equal(res.statusCode, 400);
  });
  it('no wavePrice', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('name', 'randomname')
      .attach('wave', 'tests/files/test.wav')
      .attach('mp3', 'tests/files/test.mp3');
    assert.equal(res.statusCode, 400);
  });
});
