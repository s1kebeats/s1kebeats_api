import request from "supertest";
import assert from "assert";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

const USERS_BEFORE_TESTS = 1;
const mock = {
  username: "s1kebeats",
  password: await (async () => await bcrypt.hash("Password1234", 3))(),
  email: "s1kebeats@gmail.com",
  activationLink: "s1kebeats-activation-link",
};
beforeEach(async () => {
  await prisma.user.create({
    data: {
      ...mock,
    },
  });
});

afterEach(async () => {
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
  await expect(res.statusCode).toBe(400);
});
it("should return 400 without username provided", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      password: "randompassword",
    })
    .set("Content-Type", "application/json");
  await expect(res.statusCode).toBe(400);
});
it("should return 400 without password provided", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
    })
    .set("Content-Type", "application/json");
  await expect(res.statusCode).toBe(400);
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
  await expect(res.statusCode).toBe(400);
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
  await expect(res.statusCode).toBe(400);
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
  await expect(res.statusCode).toBe(400);
});
it("providing password without any capital letters, should return 400", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
      password: "abcdefg1234",
    })
    .set("Content-Type", "application/json");
  await expect(res.statusCode).toBe(400);
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
  await expect(res.statusCode).toBe(400);
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
  await expect(res.statusCode).toBe(400);
});
it("providing valid data, should return 200 and register new user with isActivated field = false", async () => {
  const res = await request(app)
    .post("/api/register")
    .send({
      email: "random@email.com",
      username: "randomusername",
      password: "Password1234",
    })
    .set("Content-Type", "application/json");
  await expect(res.statusCode).toBe(200);

  // number of users should increase by the one that test registered
  assert.equal((await prisma.user.findMany()).length, USERS_BEFORE_TESTS + 1);

  // registered user should be in the database
  assert.equal(!((await prisma.user.findUnique({ where: { username: mock.username } })) == null), true);

  // registered user isActivated field should be false
  assert.equal((await prisma.user.findUnique({ where: { username: mock.username } }))!.isActivated, false);
}, 25000);
