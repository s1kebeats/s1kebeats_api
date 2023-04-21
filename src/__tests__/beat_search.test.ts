import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeAll, afterAll, expect, test } from "vitest";
import { activatedUsers, beatCreateInputs } from "./utils/mocks";

describe("beat search", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        ...activatedUsers[0],
        password: await (async () => await bcrypt.hash(activatedUsers[0].password, 3))(),
      },
    });
    await prisma.beat.createMany({
      data: [...beatCreateInputs],
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
    await prisma.$disconnect();
  });

  test("valid request without query, should return 200 and all beats (4)", async () => {
    const res = await request(app).get("/api/beat/");
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(4);
  });
  test("valid request with filter by tags: gunna,emotional, should return 200 and beats with the tags ", async () => {
    const res = await request(app).get("/api/beat/?tags=gunna,emotional");
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(3);
  });
  test("valid request with filter by tags: wheezy, should return 200 and beat with 'wheezy' tag (1)", async () => {
    const res = await request(app).get("/api/beat/?tags=wheezy");
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(1);
    expect(res.body.beats[0].name).toBe("outtahere");
  });
  test("valid request with filter by text, should return 200 and beat with name or author username containing text query (4)", async () => {
    const res = await request(app).get(`/api/beat/?q=${activatedUsers[0].username}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(4);
  });
  test("valid request with filter by text: outta, should return 200 and beat with name or author username containing text query (1)", async () => {
    const res = await request(app).get("/api/beat/?q=outta");
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(1);
  });
  test("valid request with filter by bpm: 140, should return 200 and beat with bpm = 140 (2)", async () => {
    const res = await request(app).get("/api/beat/?bpm=140");
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(2);
    expect(res.body.beats[0].name).toBe("Turnt");
    expect(res.body.beats[1].name).toBe("Chaze");
  });
  test("valid request with ordering by wavePriceHigher, should return 200, all beats (4) and sort them by wavePrice higher first", async () => {
    const res = await request(app).get("/api/beat/?sort=wavePriceHigher");
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(4);
    expect(res.body.beats[0].name).toBe("outtahere");
  });
  test("valid request with ordering by wavePriceLower, should return 200, all beats (4) and sort them by wavePrice lower first", async () => {
    const res = await request(app).get("/api/beat/?sort=wavePriceLower");
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(4);
    expect(res.body.beats[0].name).toBe("Chaze");
  });
  test("valid request with filter by both bpm and text, should return 200 filter beats", async () => {
    const res = await request(app).get(`/api/beat/?q=${activatedUsers[0].username}&bpm=122`);
    expect(res.statusCode).toBe(200);
    expect(res.body.beats.length).toBe(1);
    expect(res.body.beats[0].name).toBe("outtahere");
  });
});
