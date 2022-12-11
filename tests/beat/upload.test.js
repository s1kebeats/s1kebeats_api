import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('Beat upload', () => {
  it('Only POST', async () => {
    const res = await request(app).get('/api/beat/upload');
    // 400 because of Id param validator on the individual beat path
    assert.equal(res.statusCode, 400);
  });
  it('No beat name', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('No beat wavePrice', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('name', 'randomname')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('No beat wave', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('No beat mp3', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav');
    assert.equal(res.statusCode, 400);
  });
  it('stemsPrice without stems archive', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .field('stemsPrice', 9999)
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('stems archive without stemsPrice', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('stems', 'tests/files/test.rar')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('Wrong stems archive extension', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .field('stemsPrice', 9999)
      .attach('stems', 'tests/files/outtahere_122BPM_Gunna.mp3')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('Wrong wave extension', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('wave', 'tests/files/test.rar')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('Wrong mp3 extension', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/test.rar');
    assert.equal(res.statusCode, 400);
  });
  it('Wrong image extension', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .attach('image', 'tests/files/test.rar')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('Wrong tags', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 1000)
      .field('name', 'randomname')
      .field('tags', '{}')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('Not authorized', async () => {
    const res = await request(app)
      .post('/api/beat/upload')
      .field('wavePrice', 2099)
      .field('name', 'outtahere')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 401);
  });
  it('Success', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('wavePrice', 2099)
      .field('name', 'outtahere')
      .field(
        'tags',
        `[
        {"name": "s1kebeats"},
        {"name": "gunna"},
        {"name": "wheezy"}
      ]`
      )
      .attach('image', 'tests/files/test.jpg')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.name, 'outtahere');
    assert.equal(Array.isArray(res.body.tags), true);
    assert.equal(res.body.tags[0].name, 's1kebeats');
    assert.equal(res.body.tags[1].name, 'gunna');
    assert.equal(res.body.tags[2].name, 'wheezy');
    const image = await request(app).get('/api/file/' + res.body.image);
    assert.equal(image.statusCode, 200);
    const wave = await request(app).get('/api/file/' + res.body.wave);
    assert.equal(wave.statusCode, 200);
    const mp3 = await request(app).get('/api/file/' + res.body.mp3);
    assert.equal(mp3.statusCode, 200);
  }).timeout(120000);
});
