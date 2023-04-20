import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeAll, afterAll, expect, test } from "vitest";

let commentId: number | null = null;
let beatId: number | null = null;
beforeEach(async () => {
  const s1kebeats = await prisma.user.create({
    data: {
      username: "s1kebeats",
      password: await (async () => await bcrypt.hash("Password1234", 3))(),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
      isActivated: true,
    },
  });
  const datsenkoboos = await prisma.user.create({
    data: {
      username: "datsenkoboos",
      password: await (async () => await bcrypt.hash("Password1234", 3))(),
      email: "datsenkoboos@gmail.com",
      activationLink: "datsenkoboos-activation-link",
      isActivated: true,
    },
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
  beatId = beat.id;
  const comment = await prisma.comment.create({
    data: {
      content: "Sum comment",
      user: {
        connect: {
          username: "s1kebeats",
        },
      },
      beat: {
        connect: {
          id: beatId,
        },
      },
    },
  });
  commentId = comment.id;
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get(`/api/comment/delete/${commentId}`);
  expect(res.statusCode).toBe(404);
});
it("unauthorized request should return 401", async () => {
  const res = await request(app).delete(`/api/comment/delete/${commentId}`);
  expect(res.statusCode).toBe(401);
});
it("request to delete a comment that belongs to other user should return 401", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .delete(`/api/comment/delete/${commentId}`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(res.statusCode).toBe(401);
});
it("valid request, should return 200 and delete the comment", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .delete(`/api/comment/delete/${commentId}`)
    .set("Authorization", `Bearer ${accessToken}`);
  expect(res.statusCode).toBe(200);

  // check that the comment was deleted
  const comment = await request(app).get(`/api/comment/${beatId}`).set("Authorization", `Bearer ${accessToken}`);
  expect(comment.body.comments.length).toBe(0);
}, 25000);
