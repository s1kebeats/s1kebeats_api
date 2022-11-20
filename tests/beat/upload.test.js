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
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
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
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
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
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
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
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav');
    assert.equal(res.statusCode, 400);
  });
  it('stemsPrice without stems archive', async () => {
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
      .field('stemsPrice', 9999)
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('stems archive without stemsPrice', async () => {
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
      .attach('stems', 'tests/files/test.rar')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('wrong stems archive extension', async () => {
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
      .field('stemsPrice', 9999)
      .attach('stems', 'tests/files/outtahere_122BPM_Gunna.mp3')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('wrong wave extension', async () => {
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
      .attach('wave', 'tests/files/test.rar')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('wrong mp3 extension', async () => {
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
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/test.rar');
    assert.equal(res.statusCode, 400);
  });
  it('wrong image extension', async () => {
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
      .attach('image', 'tests/files/test.rar')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('wrong tags', async () => {
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
      .field('tags', '{}')
      .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
      .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
    assert.equal(res.statusCode, 400);
  });
  it('not authorized', async () => {
    const res = await request(app)
      .post('/api/beat/upload')
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
    assert.equal(res.statusCode, 401);
  });
  // it('success', async () => {
  //   const login = await request(app).post('/api/login').send({
  //     login: 's1kebeats',
  //     password: 'sbeats2005',
  //   });
  //   const accessToken = login.body.accessToken;
  //   const res = await request(app)
  //     .post('/api/beat/upload')
  //     .set('Authorization', 'Bearer ' + accessToken)
  //     .field('wavePrice', 2099)
  //     .field('name', 'outtahere')
  //     .field(
  //       'tags',
  //       `[
  //       {"name": "s1kebeats"},
  //       {"name": "gunna"},
  //       {"name": "wheezy"}
  //     ]`
  //     )
  //     .attach('image', 'tests/files/test.jpg')
  //     .attach('wave', 'tests/files/outtahere_122BPM_Gunna.wav')
  //     .attach('mp3', 'tests/files/outtahere_122BPM_Gunna.mp3');
  //   assert.equal(res.statusCode, 200);
  //   assert.equal(res.body.name, 'outtahere');
  //   assert.equal(Array.isArray(res.body.tags), true);
  //   assert.equal(res.body.tags[0].name, 's1kebeats');
  //   assert.equal(res.body.tags[1].name, 'gunna');
  //   assert.equal(res.body.tags[2].name, 'wheezy');
  //   const image = await request(app).get('/api/file/' + res.body.image);
  //   assert.equal(image.statusCode, 200);
  //   const wave = await request(app).get('/api/file/' + res.body.wave);
  //   assert.equal(wave.statusCode, 200);
  //   const mp3 = await request(app).get('/api/file/' + res.body.mp3);
  //   assert.equal(mp3.statusCode, 200);
  // }).timeout(120000);
});
