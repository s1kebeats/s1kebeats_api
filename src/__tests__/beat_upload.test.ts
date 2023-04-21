import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";
import { activatedUsers, beatUpload } from "./utils/mocks";

describe("upload", () => {
  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
        {
          ...activatedUsers[0],
          password: await (async () => await bcrypt.hash(activatedUsers[0].password, 3))(),
        },
      ],
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
  });

  test("GET request should return 400", async () => {
    const res = await request(app).get("/api/beat/upload");
    // 400 because of Id param validator on the individual beat path
    expect(res.statusCode).toBe(400);
  });
  test("not authorized request, should return 401", async () => {
    const res = await request(app).post("/api/beat/upload").send(beatUpload);
    expect(res.statusCode).toBe(401);
  });
  test("request without name provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ name, ...rest }) => ({ ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request without wavePrice provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ wavePrice, ...rest }) => ({ ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request without wave provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ wave, ...rest }) => ({ ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request without mp3 provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ mp3, ...rest }) => ({ ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with stemsPrice but without stems provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ stems, ...rest }) => ({ ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with stems but without stemsPrice provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ stemsPrice, ...rest }) => ({ ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with wrong stems path, should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ stems, ...rest }) => ({ stems: "image/key", ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with wrong wave path, should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ wave, ...rest }) => ({ wave: "image/key", ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with wrong mp3 path, should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ mp3, ...rest }) => ({ mp3: "image/key", ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with wrong image path, should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ image, ...rest }) => ({ image: "wave/key", ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with wrong tags, should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send((({ tags, ...rest }) => ({ tags: ",./[", ...rest }))(beatUpload));
    expect(res.statusCode).toBe(400);
  });
  test("request with valid data provided, should return 200 and upload the beat", async () => {
    const login = await request(app).post("/api/login").send(activatedUsers[0]);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(beatUpload);
    expect(res.statusCode).toBe(200);

    const id = res.body.id;

    const beat = await request(app).get(`/api/beat/${id}`);
    expect(beat.statusCode).toBe(200);
  }, 25000);
});
