import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('edit endpoint', () => {
  it('post only', async () => {
    const res = await request(app).get('/api/edit');
    assert.equal(res.statusCode, 404);
  });
  it('not authorized', async () => {
    const res = await request(app).post('/api/edit');
    assert.equal(res.statusCode, 401);
  });
  // it('not activated', async () => {
  //   const login = await request(app).post('/api/login').send({
  //     login: 's1kebeats',
  //     password: 'sbeats2005',
  //   });
  //   const accessToken = login.body.accessToken;
  //   const res = await request(app)
  //     .post('/api/edit')
  //     .set('Authorization', 'Bearer ' + accessToken);
  //   assert.equal(res.statusCode, 401);
  // });
  it('wrong urls', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/edit')
      .set('Authorization', 'Bearer ' + accessToken)
      .attach('image', 'tests/files/outtahere_122BPM_Gunna.wav');
    assert.equal(res.statusCode, 400);
  });
  it('success', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/edit')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('about', 'big biy youngin from krasnoyarsk');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.about, 'big biy youngin from krasnoyarsk');
  });
});
