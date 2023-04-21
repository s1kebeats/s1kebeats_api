import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeAll, afterAll, expect, test } from "vitest";
import { activatedUsers } from "./utils/mocks";

let beatId: number | null = null;

describe("get comments", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        ...activatedUsers[0],
        password: await (async () => await bcrypt.hash(activatedUsers[0].password, 3))(),
      },
    });
    const userId = user.id;
    const beat = await prisma.beat.create({
      data: {
        name: "outtahere",
        user: {
          connect: {
            username: "first",
          },
        },
        wavePrice: 499,
        wave: "wave/",
        mp3: "mp3/",
        image: "image/",
        comments: {
          createMany: {
            data: [
              {
                content: "First Comment",
                userId,
              },
              {
                content: "Second Comment",
                userId,
              },
              {
                content: "Third Comment",
                userId,
              },
              {
                content: "Fourth Comment",
                userId,
              },
              {
                content: "Fifth Comment",
                userId,
              },
            ],
          },
        },
      },
    });
    beatId = beat.id;
  });
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
    await prisma.comment.deleteMany();
  });

  test("unauthorized request should return 401", async () => {
    const res = await request(app).get(`/api/comment/${beatId}`);
    expect(res.statusCode).toBe(401);
  });
  test("request to comments for not existing beat should return 404", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app).get("/api/comment/-1").set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });
  test("valid request, should return 200 and comments", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app).get(`/api/comment/${beatId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBe(5);
    expect(res.body.viewed).toBe(5);
  });
  test("valid request with viewed = 10, should return 200 and skip comments", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .get(`/api/comment/${beatId}/?viewed=10`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBe(0);
    expect(res.body.viewed).toBe(10);
  });
});
