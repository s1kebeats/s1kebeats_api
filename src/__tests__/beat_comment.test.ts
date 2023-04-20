import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeAll, afterAll, expect, test } from "vitest";
import { activatedUser, firstBeat } from "./utils/mocks";

describe("beat comment", () => {
  let id: number | null = null;
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
    id = beat.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
    await prisma.comment.deleteMany();
  });

  test("GET request should return 404", async () => {
    const res = await request(app).get(`/api/beat/${id}/comment`);
    expect(res.statusCode).toBe(404);
  });
  test("unauthorized request should return 401", async () => {
    const res = await request(app).post(`/api/beat/${id}/comment`);
    expect(res.statusCode).toBe(401);
  });
  test("request without comment content provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app).post(`/api/beat/${id}/comment`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(400);
  });
  test("valid request to not existing beat should return 404", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/-1/comment")
      .send({
        content: "Comment content",
      })
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });
  test("valid request, should return 200 and add a new comment to the beat", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post(`/api/beat/${id}/comment`)
      .send({
        content: "First comment",
      })
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);

    const beat = await request(app).get(`/api/beat/${id}`).set("Authorization", `Bearer ${accessToken}`);
    expect(beat.body.comments.length).toBe(1);
    expect(beat.body.comments[0].content).toBe("First comment");
  });
});
