import mediaLocations from "./media/mediaLocations";
import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";
import { activatedUser } from "./utils/mocks";

describe("upload", () => {
  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
        {
          ...activatedUser,
          password: await (async () => await bcrypt.hash(activatedUser.password, 3))(),
        },
      ],
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test("GET request should return 404", async () => {
    const res = await request(app).get("/api/media/upload");
    expect(res.statusCode).toBe(404);
  });
  test("not authorized request should return 401", async () => {
    const res = await request(app)
      .post("/api/media/upload")
      .attach("image", mediaLocations.image)
      .field("path", "image");
    expect(res.statusCode).toBe(401);
  });
  test("no file attached should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("path", "image");
    expect(res.statusCode).toBe(400);
  });
  test("no path provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.image);
    expect(res.statusCode).toBe(400);
  });
  test("invalid path provided should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.image)
      .field("path", "randomPath");
    expect(res.statusCode).toBe(400);
  });
  test("providing media file with wrong extension to image path should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.wave)
      .field("path", "image");
    expect(res.statusCode).toBe(400);
  });
  test("providing media file with wrong extension to stems path should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.image)
      .field("path", "stems");
    expect(res.statusCode).toBe(400);
  });
  test("providing media file with wrong extension to mp3 path should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.image)
      .field("path", "mp3");
    expect(res.statusCode).toBe(400);
  });
  test("providing media file with wrong extension to wav path should return 400", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.image)
      .field("path", "wav");
    expect(res.statusCode).toBe(400);
  });
  test("valid data provided, should return 200 and upload the file", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.wave)
      .field("path", "wave");
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe("wave/test.wav");
  });
});
