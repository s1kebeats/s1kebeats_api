import request from 'supertest';
import prisma from '../client';
import bcrypt from 'bcrypt';
import app from './app.js';
import { describe, beforeAll, afterAll, expect, test } from 'vitest';
import { activatedUsers } from './utils/mocks';

describe('author individual', () => {
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

  test('providing username that does not exist, should return 404', async () => {
    const res = await request(app).get('/api/author/NotExistingAuthor');
    expect(res.statusCode).toBe(404);
  });
  test('providing existing username, should return 200 and send user data', async () => {
    const res = await request(app).get(
      `/api/author/${activatedUsers[0].username}`
    );
    expect(res.statusCode).toBe(200);

    // check response body
    expect(res.body.email).toBe(undefined);
    expect(res.body.password).toBe(undefined);
    expect(res.body.activationLink).toBe(undefined);
    expect(res.body.isActivated).toBe(undefined);
    expect(res.body.username).toBe(activatedUsers[0].username);
    expect(res.body.displayedName).toBe(activatedUsers[0].displayedName);
  });
});
