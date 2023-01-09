import request from "supertest";
import assert from "assert";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "s1kebeats",
      password: await bcrypt.hash("Password1234", 3),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get("/api/register");
  await expect(res.statusCode).toEqual(404);
});
it("should return 400 without email provided", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      username: "randomusername",
      password: "randompassword",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("should return 400 without username provided", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      password: "randompassword",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("should return 400 without password provided", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("providing wrong email, should return 400", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random.com",
      username: "randomusername",
      password: "randompassword",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("providing password shorter than 8 chars, should return 400", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
      password: "1234567",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("providing password without digit, should return 400", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
      password: "abcdefgHI",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("providing password without at least one capital letter, should return 400", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
      password: "abcdefg1234",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("providing username with banned characters, should return 400", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "__randomusername",
      password: "randompassword",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("providing already used username, should return 400", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "s1kebeats",
      password: "Password1234",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 400);
});
it("providing right data, should return 200", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
      password: "Password1234",
    })
    .set("Content-Type", "application/json");
  assert.equal(res.statusCode, 200);
});
