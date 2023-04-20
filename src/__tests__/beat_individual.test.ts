import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeAll, afterAll, expect, test } from "vitest";
import { activatedUser, firstBeat } from "./utils/mocks";

describe("individual beat", () => {
  let beatId: number | null = null;
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        ...activatedUser,
        password: await (async () => await bcrypt.hash(activatedUser.password, 3))(),
      },
    });
    const beat = await prisma.beat.create({
      data: firstBeat,
    });
    beatId = beat.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
  });

  test("request to non-existing beat, should return 404", async () => {
    const res = await request(app).get("/api/beat/-1");
    expect(res.statusCode).toBe(404);
  });
  test("valid unauthorized request, should return 200 and send individual beat data without comments", async () => {
    const res = await request(app).get(`/api/beat/${beatId}`);
    expect(res.statusCode).toBe(200);

    expect(res.body.comments).toBe(undefined);
    // check response body
    expect(res.body.wave).toBe(undefined);
    expect(res.body.wavePrice).toBe(firstBeat.wavePrice);
    expect(res.body.name).toBe(firstBeat.name);
    expect(res.body.user.username).toBe(firstBeat.user.connect.username);
    expect(res.body.tags.length).toBe(firstBeat.tags.connectOrCreate.length);
    expect(res.body.image).toBe(firstBeat.image);
    expect(res.body.related.length).toBe(0);
  });
  test("valid authorized request, should return 200 and send individual beat data with comments", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app).get(`/api/beat/${beatId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBe(0);
    // check response body
    expect(res.body.wave).toBe(undefined);
    expect(res.body.wavePrice).toBe(firstBeat.wavePrice);
    expect(res.body.name).toBe(firstBeat.name);
    expect(res.body.user.username).toBe(firstBeat.user.connect.username);
    expect(res.body.tags.length).toBe(firstBeat.tags.connectOrCreate.length);
    expect(res.body.image).toBe(firstBeat.image);
    expect(res.body.related.length).toBe(0);
  });
});
