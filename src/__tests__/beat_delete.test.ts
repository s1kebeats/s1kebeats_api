import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import mediaLocations from "./media/mediaLocations";
import { describe, beforeAll, afterAll, expect, test } from "vitest";
import { activatedUser, secondUser, firstBeat } from "./utils/mocks";

describe("beat deletion", () => {
  let id: null | number = null;
  beforeAll(async () => {
    await prisma.user.createMany({
      data: [
        {
          ...activatedUser,
          password: await (async () => await bcrypt.hash(activatedUser.password, 3))(),
        },
        {
          ...secondUser,
          password: await (async () => await bcrypt.hash(secondUser.password, 3))(),
        },
      ],
    });
    const beat = await prisma.beat.create({
      data: firstBeat,
    });
    id = beat.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.beat.deleteMany();
  });

  test("GET request should return 404", async () => {
    const res = await request(app).get(`/api/beat/${id}/delete`);
    expect(res.statusCode).toBe(404);
  });
  test("unauthorized request should return 401", async () => {
    const res = await request(app).delete(`/api/beat/${id}/delete`);
    expect(res.statusCode).toBe(401);
  });
  test("request to delete a beat that doesn't exist, should return 404", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const res = await request(app).delete("/api/beat/-1/delete").set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });
  test("request to delete beat that belongs to other user, should return 401", async () => {
    const login = await request(app).post("/api/login").send(secondUser);
    const accessToken = login.body.accessToken;

    const res = await request(app).delete(`/api/beat/${id}/delete`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(401);
  });
  test("valid request, should return 200, delete the beat and it's media", async () => {
    const login = await request(app).post("/api/login").send(activatedUser);
    const accessToken = login.body.accessToken;

    const imageUpload = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.image)
      .field("path", "image");

    const image = imageUpload.body;

    const mp3Upload = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.mp3)
      .field("path", "mp3");

    const mp3 = mp3Upload.body;

    const stemsUpload = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.stems)
      .field("path", "stems");

    const stems = stemsUpload.body;

    const waveUpload = await request(app)
      .post("/api/media/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", mediaLocations.wave)
      .field("path", "wave");

    const wave = waveUpload.body;

    const beatUpload = await request(app).post("/api/beat/upload").set("Authorization", `Bearer ${accessToken}`).send({
      name: "outtahere",
      bpm: 140,
      description: "inspired by wheezy",
      tags: "gunna,wheezy,s1kebeats",

      stemsPrice: 1999,
      wavePrice: 499,

      wave,
      mp3,
      stems,
      image,
    });

    const id = beatUpload.body.id;

    const res = await request(app).delete(`/api/beat/${id}/delete`).set("Authorization", `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);

    // check that beat was deleted
    const deleted = await request(app).post(`/api/beat/${id}`);
    expect(deleted.statusCode).toBe(404);

    // check that all beat media was deleted
    const beatImage = await request(app).get(`/api/media/${image}`);
    expect(beatImage.statusCode).toBe(404);

    const beatWave = await request(app).get(`/api/media/${wave}`);
    expect(beatWave.statusCode).toBe(404);

    const beatMp3 = await request(app).get(`/api/media/${mp3}`);
    expect(beatMp3.statusCode).toBe(404);

    const beatStems = await request(app).get(`/api/media/${stems}`);
    expect(beatStems.statusCode).toBe(404);
  }, 25000);
});
