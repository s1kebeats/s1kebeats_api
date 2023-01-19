import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import mediaLocations from "./media/mediaLocations";
import PrismaClient from "@prisma/client";

let id: null | number = null;
beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      {
        username: "s1kebeats",
        password: await bcrypt.hash("Password1234", 3),
        email: "s1kebeats@gmail.com",
        activationLink: "s1kebeats-activation-link",
        isActivated: true,
      },
      {
        username: "datsenkoboos",
        password: await bcrypt.hash("Password1234", 3),
        email: "datsenkoboos@gmail.com",
        activationLink: "datsenkoboos-activation-link",
        isActivated: true,
      },
    ],
  });
  const beat = await prisma.beat.create({
    data: {
      name: "outtahere",
      user: {
        connect: {
          username: "s1kebeats",
        },
      },
      wavePrice: 499,
      wave: "wave/",
      mp3: "mp3/",
      image: "image/",
    },
  });
  id = beat.id;
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get(`/api/beat/${id}/delete`);
  await expect(res.statusCode).toBe(404);
});
it("unauthorized request should return 401", async () => {
  const res = await request(app).delete(`/api/beat/${id}/delete`);
  await expect(res.statusCode).toBe(401);
});
it("request to delete a beat that doesn't exist, should return 404", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).delete("/api/beat/-1/delete").set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(404);
});
it("request to delete beat that belongs to other user, should return 401", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).delete(`/api/beat/${id}/delete`).set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(401);
});
it("valid request, should return 200, delete the beat and it's media", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const imageUpload = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.image)
    .field("path", "image");
  const image = imageUpload.body;
  await expect(imageUpload.statusCode).toBe(200);

  const mp3Upload = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.mp3)
    .field("path", "mp3");
  const mp3 = mp3Upload.body;
  await expect(mp3Upload.statusCode).toBe(200);

  const stemsUpload = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.stems)
    .field("path", "stems");
  const stems = stemsUpload.body;
  await expect(stemsUpload.statusCode).toBe(200);

  const waveUpload = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.wave)
    .field("path", "wave");
  const wave = waveUpload.body;
  await expect(waveUpload.statusCode).toBe(200);

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
  await expect(res.statusCode).toBe(200);

  // check that beat was deleted
  const deleted = await request(app).post(`/api/beat/${id}`);
  await expect(deleted.statusCode).toBe(404);

  // check that all beat media was deleted
  const beatImage = await request(app).get(`/api/media/${image}`);
  await expect(beatImage.statusCode).toBe(404);

  const beatWave = await request(app).get(`/api/media/${wave}`);
  await expect(beatWave.statusCode).toBe(404);

  const beatMp3 = await request(app).get(`/api/media/${mp3}`);
  await expect(beatMp3.statusCode).toBe(404);

  const beatStems = await request(app).get(`/api/media/${stems}`);
  await expect(beatStems.statusCode).toBe(404);
}, 25000);
