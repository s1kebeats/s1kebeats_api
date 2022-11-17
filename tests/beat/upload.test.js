import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('beat upload', () => {
  it('post only', async () => {
    const res = await request(app).get('/beat/upload');
    assert.equal(res.statusCode, 404);
  });
  it('no name', async () => {
    const login = await request(app).get('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005'
    })
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/beat/upload')
      .set('Authorization', accessToken)
      .field('wavePrice', 1000)
      .attach('wave', 'tests/files/test.wav')
      .attach('mp3', 'tests/files/test.mp3');
    console.log(res.body)
    assert.equal(res.statusCode, 400);
  });
});
