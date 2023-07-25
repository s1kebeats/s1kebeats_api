import request from 'supertest';
import prisma from '../client';
import bcrypt from 'bcrypt';
import app from './app.js';
import { describe, beforeEach, afterEach, expect, test } from 'vitest';
import { activatedUsers } from './utils/mocks';

describe('logout', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        ...activatedUsers[0],
        password: await (async () =>
          await bcrypt.hash(activatedUsers[0].password, 3))(),
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test('GET request should return 404', async () => {
    const res = await request(app).get('/api/logout');
    expect(res.statusCode).toBe(404);
  });
  test('request without refresh token http-only cookie provided, should return 401', async () => {
    const res = await request(app).post('/api/logout');
    expect(res.statusCode).toBe(401);
  });
  test('request without refresh token http-only cookie provided, should return 401', async () => {
    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', ['refreshToken=randomToken']);
    expect(res.statusCode).toBe(401);
  });
  test('providing valid refresh token, should return 200 and invalidate refreshToken', async () => {
    const login = await request(app)
      .post('/api/login')
      .send({ ...activatedUsers[0], refresh: true });
    const refreshToken = login.headers['set-cookie'][0].split(' ')[0];

    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', refreshToken);
    expect(res.statusCode).toBe(200);

    // check that refreshToken is not valid anymore
    const refreshWithDeletedToken = await request(app)
      .post('/api/refresh')
      .set('Cookie', refreshToken);
    expect(refreshWithDeletedToken.statusCode).toBe(401);
  });
});
