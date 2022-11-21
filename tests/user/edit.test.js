import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('User data editing', () => {
  it('Only POST', async () => {
    const res = await request(app).get('/api/edit');
    assert.equal(res.statusCode, 404);
  });
  it('Not authorized', async () => {
    const res = await request(app).post('/api/edit');
    assert.equal(res.statusCode, 401);
  });
  it('Authorized, but not activated', async () => {
    const login = await request(app).post('/api/login').send({
      login: 'notActivated',
      password: 'notActivated',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/edit')
      .set('Authorization', 'Bearer ' + accessToken);
    assert.equal(res.statusCode, 401);
  });
  it('Wrong image', async () => {
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
  it('Success', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/edit')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('about', 'User about')
      .attach('image', 'tests/files/test.jpg');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.about, 'User about');
    const image = await request(app).get('/api/file/' + res.body.image);
    assert.equal(image.statusCode, 200);
  });
});
