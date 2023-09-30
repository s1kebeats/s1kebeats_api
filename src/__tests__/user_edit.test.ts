import request from 'supertest';
import prisma from '../client';
import bcrypt from 'bcrypt';
import app from './app.js';
import { describe, beforeEach, afterEach, expect, test } from 'vitest';
import { activatedUsers } from './utils/mocks';

const editPayload = {
  username: 'newUsername',
  displayedName: 'newDisplayedName',
  about: 'newAbout',
  youtube: 'newYouTube',
  instagram: 'newInstagram',
  vk: 'newVk',
  image: 'image/newImage',
};

describe('user edit', () => {
  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test('GET request should return 404', async () => {
    const res = await request(app).get('/api/edit');
    expect(res.statusCode).toBe(404);
  });
  test('unauthorized request should return 401', async () => {
    const res = await request(app).patch('/api/edit');
    expect(res.statusCode).toBe(401);
  });
  test('providing used username, should return 400', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch('/api/edit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        username: activatedUsers[1].username,
      });
    expect(res.statusCode).toEqual(400);
  });
  test('providing username with banned characters, should return 400', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch('/api/edit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        username: '__newusername',
      });
    expect(res.statusCode).toEqual(400);
  });
  test('providing wrong image key, should return 400', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch('/api/edit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        image: 'notInsideImageFolder',
      });
    expect(res.statusCode).toEqual(400);
  });
  test('providing valid data, should return 200 and edit the user', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .patch('/api/edit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(editPayload);
    expect(res.statusCode).toEqual(200);

    // check that the user was edited
    const user = await request(app).get(`/api/author/${editPayload.username}`);
    for (const key of Object.keys(editPayload)) {
      expect(user.body[key]).toEqual(
        editPayload[key as keyof typeof editPayload]
      );
    }
  });
});
