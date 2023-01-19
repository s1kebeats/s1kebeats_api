import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

async function checkIndividualAuthorResponse(body: any) {
  await expect(body.wave).toBe(undefined);
  await expect(body.wavePrice).toBe(499);
  await expect(body.name).toBe("outtahere");
  await expect(body.user.username).toBe("s1kebeats");
  await expect(body.tags.length).toBe(2);
  await expect(body.image).toBe("image/");
  await expect(body.related.length).toBe(0);
}

let beatId: number | null = null;
beforeEach(async () => {
  await prisma.user.create({
    data: {
      username: "s1kebeats",
      displayedName: "Arthur Datsenko-Boos",
      image: "path/to/image",
      password: await (async () => await bcrypt.hash("Password1234", 3))(),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
      isActivated: true,
    },
  });
  const beat = await prisma.beat.create({
    data: {
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
    },
  });
  beatId = beat.id;
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.$disconnect();
});

it("request to not existing beat, should return 404", async () => {
  const res = await request(app).get("/api/beat/-1");
  await expect(res.statusCode).toBe(404);
});
it("valid unauthorized request, should return 200 and send individual beat data", async () => {
  const res = await request(app).get(`/api/beat/${beatId}`);
  await expect(res.statusCode).toBe(200);

  await expect(res.body.comments).toBe(undefined);
  // check response body
  await checkIndividualAuthorResponse(res.body);
});
it("valid authorized request, should return 200 and send individual beat data", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).get(`/api/beat/${beatId}`).set("Authorization", `Bearer ${accessToken}`);
  await expect(res.statusCode).toBe(200);
  console.log(res.body);
  await expect(res.body.comments.length).toBe(0);
  // check response body
  await checkIndividualAuthorResponse(res.body);
});
