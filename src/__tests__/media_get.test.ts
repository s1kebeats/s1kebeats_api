import mediaLocations from './media/mediaLocations';
import request from 'supertest';
import prisma from '../client';
import bcrypt from 'bcrypt';
import app from './app.js';
import { describe, beforeAll, afterAll, expect, test } from 'vitest';
import { activatedUsers } from './utils/mocks';

describe('get media', () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        ...activatedUsers[0],
        password: await (async () =>
          await bcrypt.hash(activatedUsers[0].password, 3))(),
      },
    });
  });
  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  test('request to non-existent file should return 404', async () => {
    const res = await request(app).get('/api/media/random/file');
    expect(res.statusCode).toBe(404);
  });
  test('request to existing media should return 200', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const upload = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', mediaLocations.wave)
      .field('path', 'wave');
    const filePath = upload.body;

    const res = await request(app).get(`/api/media/${filePath}`);
    expect(res.statusCode).toBe(200);
  });
});
