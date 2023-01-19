import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import mediaLocations from "./media/mediaLocations";
import PrismaClient from "@prisma/client";

const firstBeatMock: PrismaClient.Prisma.BeatCreateInput = {
  name: "outtahere",
  tags: {
    connectOrCreate: [
      {
        where: { name: "s1kebeats" },
        create: { name: "s1kebeats" },
      },
      {
        where: { name: "wheezy" },
        create: { name: "wheezy" },
      },
    ],
  },
  user: {
    connect: {
      username: "s1kebeats",
    },
  },
  wavePrice: 499,
  wave: "wave/",
  mp3: "mp3/",
  image: "image/",
};

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
    data: firstBeatMock,
  });
  id = beat.id;
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get(`/api/beat/${id}/edit`);
  // 400 because of Id param validator on the individual beat path
  await expect(res.statusCode).toBe(404);
});
it("not authorized request should return 401", async () => {
  const res = await request(app).patch(`/api/beat/${id}/edit`);
  await expect(res.statusCode).toBe(401);
});
it("request to edit a beat that doesn't exist, should return 404", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch("/api/beat/-1/edit").set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(404);
});
it("request to edit beat that belongs to other user, should return 401", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch(`/api/beat/${id}/edit`).set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(401);
});
it("providing stemsPrice without stems media file, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch(`/api/beat/${id}/edit`).set("Authorization", `Bearer ${accessToken}`).send({
    stemsPrice: 1000,
  });
  await expect(res.statusCode).toBe(400);
});
it("providing stems without stemsPrice, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch(`/api/beat/${id}/edit`).set("Authorization", `Bearer ${accessToken}`).send({
    stems: "stems/randomFile",
  });
  await expect(res.statusCode).toBe(400);
});
it("request with wrong tags, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch(`/api/beat/${id}/edit`).set("Authorization", `Bearer ${accessToken}`).send({
    tags: "_/f",
  });
  await expect(res.statusCode).toBe(400);
});
it("providing valid data, should return 200, edit the beat and delete old media", async () => {
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

  const editPayload = {
    wave: "/wave/new",
    mp3: "/mp3/new",
    image: "/image/newImage",
    stems: "/stems/new",
    name: "different name",
    description: "different description",
    bpm: 150,
    stemsPrice: 5000,
    wavePrice: 1000,
    tags: "newTag,s1kebeats",
  };

  const res = await request(app)
    .patch(`/api/beat/${id}/edit`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send(editPayload);
  await expect(res.statusCode).toBe(200);

  // check that beat was edited
  const beat = await request(app).get(`/api/beat/${id}`);
  beat.body.tags = beat.body.tags.map((tag: { name: string }) => tag.name);
  for (const key of Object.keys(editPayload)) {
    if (key === "tags") {
      await expect(beat.body.tags.length).toBe(2);
      await expect(beat.body.tags.includes("newTag")).toBe(true);
      await expect(beat.body.tags.includes("s1kebeats")).toBe(true);
      continue;
    }
    // wave and stems should not be accessible without payment
    if (key === "wave" || key === "stems") {
      await expect(beat.body[key]).toBe(undefined);
      continue;
    }
    await expect(beat.body[key]).toBe(editPayload[key as keyof typeof editPayload]);
  }
  // check that old beat media was deleted
  const oldImage = await request(app).get(`/api/media/${image}`);
  await expect(oldImage.statusCode).toBe(404);

  const oldWave = await request(app).get(`/api/media/${wave}`);
  await expect(oldWave.statusCode).toBe(404);

  const oldMp3 = await request(app).get(`/api/media/${mp3}`);
  await expect(oldMp3.statusCode).toBe(404);

  const oldStems = await request(app).get(`/api/media/${stems}`);
  await expect(oldStems.statusCode).toBe(404);
}, 25000);
