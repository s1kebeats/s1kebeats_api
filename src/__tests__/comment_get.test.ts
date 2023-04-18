import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

let beatId: number | null = null;
let userId: number | null = null;
beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      username: "s1kebeats",
      password: await (async () => await bcrypt.hash("Password1234", 3))(),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
      isActivated: true,
    },
  });
  userId = user.id;
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

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.$disconnect();
});

it("unauthorized request should return 401", async () => {
  const res = await request(app).get(`/api/comment/${beatId}`);
  expect(res.statusCode).toBe(401);
});
it("request to comments for not existing beat should return 404", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).get("/api/comment/-1").set("Authorization", `Bearer ${accessToken}`);
  expect(res.statusCode).toBe(404);
});
it("valid request, should return 200 and beat comments", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).get(`/api/comment/${beatId}`).set("Authorization", `Bearer ${accessToken}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.comments.length).toBe(5);
  expect(res.body.viewed).toBe(5);
});
it("valid request with viewed = 10, should return 200 and skip comments", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).get(`/api/comment/${beatId}/?viewed=10`).set("Authorization", `Bearer ${accessToken}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.comments.length).toBe(0);
  expect(res.body.viewed).toBe(10);
});
