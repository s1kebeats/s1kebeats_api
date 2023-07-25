import request from 'supertest';
import prisma from '../client';
import bcrypt from 'bcrypt';
import app from './app.js';
import mediaLocations from './media/mediaLocations';
import { describe, beforeAll, afterAll, expect, test } from 'vitest';
import { activatedUsers, beatCreateInputs, beatUpload } from './utils/mocks';

describe('beat edit', () => {
  let id: null | number = null;
  beforeAll(async () => {
    await prisma.user.createMany({
      data: [
        {
          ...activatedUsers[0],
          password: await (async () =>
            await bcrypt.hash(activatedUsers[0].password, 3))(),
        },
        {
          ...activatedUsers[1],
          password: await (async () =>
            await bcrypt.hash(activatedUsers[1].password, 3))(),
        },
      ],
    });
    const beat = await prisma.beat.create({
      data: beatCreateInputs[0],
    });
    id = beat.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
  });

  test('GET request should return 404', async () => {
    const res = await request(app).get(`/api/beat/${id}/edit`);
    expect(res.statusCode).toBe(404);
  });
  test('not authorized request should return 401', async () => {
    const res = await request(app).patch(`/api/beat/${id}/edit`);
    expect(res.statusCode).toBe(401);
  });
  test("request to edit a beat that doesn't exist, should return 404", async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[1]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch('/api/beat/-1/edit')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });
  test('request to edit beat that belongs to other user, should return 401', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[1]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch(`/api/beat/${id}/edit`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(401);
  });
  test('providing stemsPrice without stems media file, should return 400', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch(`/api/beat/${id}/edit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        stemsPrice: 1000,
      });
    expect(res.statusCode).toBe(400);
  });
  test('providing stems without stemsPrice, should return 400', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch(`/api/beat/${id}/edit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        stems: 'stems/randomFile',
      });
    expect(res.statusCode).toBe(400);
  });
  test('request with wrong tags, should return 400', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch(`/api/beat/${id}/edit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tags: '_/f',
      });
    expect(res.statusCode).toBe(400);
  });
  test('providing valid data, should return 200, edit the beat and delete old media', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const imageUpload = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', mediaLocations.image)
      .field('path', 'image');
    const image = imageUpload.body;

    const mp3Upload = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', mediaLocations.mp3)
      .field('path', 'mp3');
    const mp3 = mp3Upload.body;

    const waveUpload = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', mediaLocations.wave)
      .field('path', 'wave');
    const wave = waveUpload.body;

    const upload = await request(app)
      .post('/api/beat/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...beatUpload,
        wave,
        mp3,
        image,
      });
    expect(upload.statusCode).toBe(200);
    const id = upload.body.id;

    const editPayload = {
      wave: '/wave/new',
      mp3: '/mp3/new',
      image: '/image/newImage',
      stems: '/stems/new',
      name: 'different name',
      description: 'different description',
      bpm: 150,
      stemsPrice: 5000,
      wavePrice: 1000,
      tags: 'newTag,s1kebeats',
    };
    const res = await request(app)
      .patch(`/api/beat/${id}/edit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(editPayload);
    expect(res.statusCode).toBe(200);

    // check that beat was edited
    const beat = await request(app).get(`/api/beat/${id}`);
    beat.body.tags = beat.body.tags.map((tag: { name: string }) => tag.name);
    for (const key of Object.keys(editPayload)) {
      if (key === 'tags') {
        expect(beat.body.tags.length).toBe(2);
        expect(beat.body.tags.includes('newTag')).toBeTruthy();
        expect(beat.body.tags.includes('s1kebeats')).toBeTruthy();
        continue;
      }
      // wave and stems should not be accessible by default
      if (key === 'wave' || key === 'stems') {
        expect(beat.body[key]).toBe(undefined);
        continue;
      }
      expect(beat.body[key]).toBe(editPayload[key as keyof typeof editPayload]);
    }
    // check that old beat media was deleted
    const oldImage = await request(app).get(`/api/media/${image}`);
    expect(oldImage.statusCode).toBe(404);

    const oldWave = await request(app).get(`/api/media/${wave}`);
    expect(oldWave.statusCode).toBe(404);

    const oldMp3 = await request(app).get(`/api/media/${mp3}`);
    expect(oldMp3.statusCode).toBe(404);
  }, 25000);
});
