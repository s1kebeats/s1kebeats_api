import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeAll, afterEach, afterAll, expect, test } from "vitest";
import { activatedUsers, beatCreateInputs } from "./utils/mocks";

describe("beat like", () => {
  let id: number | null = null;
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        ...activatedUsers[0],
        password: await (async () => await bcrypt.hash(activatedUsers[0].password, 3))(),
      },
    });
    const beat = await prisma.beat.create({
      data: beatCreateInputs[0],
    });
    id = beat.id;
  });

  afterEach(async () => {
    await prisma.like.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
  });

  test("GET request should return 404", async () => {
    const res = await request(app).get(`/api/beat/${id}/like`);
    expect(res.statusCode).toBe(404);
  });
  test("unauthorized request should return 401", async () => {
    const res = await request(app).put(`/api/beat/${id}/like`);
    expect(res.statusCode).toBe(401);
  });
  test("request to not existing beat should return 404", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app).put("/api/-1/like").set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });
  test("valid request, should return 200 and add the like", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app).put(`/api/beat/${id}/like`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);

    const beat = await request(app).get(`/api/beat/${id}`);
    expect(beat.body._count.likes).toBe(1);
  });
  test("valid request, should return 200 and remove the like", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    await request(app).put(`/api/beat/${id}/like`).set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app).put(`/api/beat/${id}/like`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);

    const beat = await request(app).get(`/api/beat/${id}`);
    expect(beat.body._count.likes).toBe(0);
  });
});
