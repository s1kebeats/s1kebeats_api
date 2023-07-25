import request from 'supertest';
import prisma from '../client';
import bcrypt from 'bcrypt';
import app from './app.js';
import { describe, beforeAll, afterAll, expect, test } from 'vitest';
import { activatedUsers, beatCreateInputs } from './utils/mocks';

describe('comment deletion', () => {
  let commentId: number | null = null;
  let beatId: number | null = null;
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
    beatId = beat.id;
    const comment = await prisma.comment.create({
      data: {
        content: 'Sum comment',
        user: {
          connect: {
            username: activatedUsers[0].username,
          },
        },
        beat: {
          connect: {
            id: beatId,
          },
        },
      },
    });
    commentId = comment.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
    await prisma.comment.deleteMany();
  });

  test('GET request should return 404', async () => {
    const res = await request(app).get(`/api/comment/delete/${commentId}`);
    expect(res.statusCode).toBe(404);
  });
  test('unauthorized request should return 401', async () => {
    const res = await request(app).delete(`/api/comment/delete/${commentId}`);
    expect(res.statusCode).toBe(401);
  });
  test('request to delete a comment that belongs to other user should return 401', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[1]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .delete(`/api/comment/delete/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(401);
  });
  test('valid request, should return 200 and delete the comment', async () => {
    const login = await request(app).post('/api/login').send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .delete(`/api/comment/delete/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);

    // check that the comment was deleted
    const comment = await request(app)
      .get(`/api/comment/${beatId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(comment.body.comments.length).toBe(0);
  }, 25000);
});
