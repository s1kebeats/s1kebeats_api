import request from 'supertest';
import assert from 'assert';
import app from '../../build/app.js';

describe('Beat editing', () => {
  it('POST only', async () => {
    const res = await request(app).get('/api/beat/1/edit');
    assert.equal(res.statusCode, 404);
  });
  it('Not authorized', async () => {
    const res = await request(app).post('/api/beat/1/edit');
    assert.equal(res.statusCode, 401);
  });
  it('Not a beat author', async () => {
    const login = await request(app).get('/api/login').send({
      login: 'hasNoBeats',
      password: 'hasNoBeats1',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/1/edit')
      .set('Authorization', `Bearer ${accessToken}`);
    assert.equal(res.statusCode, 401);
  });
  it('Success: name, description', async () => {
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/1/edit')
      .set('Authorization', 'Bearer ' + accessToken)
      .field('name', 'different name')
      .field('description', 'different description');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.name, 'different name');
    const beat = await request(app).get('/api/beat/1');
    assert.equal(beat.body.name, 'different name');
    assert.equal(beat.body.description, 'different description');
  });
  it('Success: image', async () => {
    const notEditedBeat = await request(app).get('/api/beat/1');
    const login = await request(app).post('/api/login').send({
      login: 's1kebeats',
      password: 'Sbeats2005',
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post('/api/beat/1/edit')
      .set('Authorization', 'Bearer ' + accessToken)
      .attach('image', 'tests/files/test.jpg');
    assert.equal(res.statusCode, 200);
    const beat = await request(app).get('/api/beat/1');
    assert.equal(beat.body.image, res.body.image);
    const oldImage = await request(app).get(`/api/file/${notEditedBeat.body.image}`)
    assert.equal(oldImage.statusCode, 404)
    const newImage = await request(app).get(`/api/file/${res.body.image}`)
    assert.equal(newImage.statusCode, 200)
  }).timeout(120000);
});
