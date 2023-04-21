import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";

const USERS_BEFORE_TESTS = 1;

const existingUser = {
  username: "test",
  password: await (async () => await bcrypt.hash("Password1234", 3))(),
  email: "test@gmail.com",
  activationLink: "test-activation-link",
};

const newUser = {
  username: "new",
  password: "Password1234",
  email: "new@gmail.com",
  activationLink: "new-activation-link",
};

describe("register", () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: existingUser,
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test("GET request should return 404", async () => {
    const res = await request(app).get("/api/register");
    expect(res.statusCode).toBe(404);
  });
  test("should return 400 without email provided", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ email, ...rest }) => rest)(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("should return 400 without username provided", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ username, ...rest }) => rest)(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("should return 400 without password provided", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ password, ...rest }) => rest)(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("providing wrong email, should return 400", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ email, ...rest }) => ({ email: "notAnEmail.com", ...rest }))(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("providing password shorter than 8 chars, should return 400", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ password, ...rest }) => ({ password: "1234567", ...rest }))(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("providing password without digit, should return 400", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ password, ...rest }) => ({ password: "veryLongPassword", ...rest }))(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("providing password without any capital letters, should return 400", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ password, ...rest }) => ({ password: "nocap1talletters", ...rest }))(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("providing username with banned characters, should return 400", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ password, ...rest }) => ({ password: "wrong_chars", ...rest }))(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("providing already used username, should return 400", async () => {
    const res = await request(app)
      .post("/api/register")
      .send((({ username, ...rest }) => ({ username: existingUser.username, ...rest }))(newUser))
      .set("Content-Type", "application/json");
    expect(res.statusCode).toBe(400);
  });
  test("providing valid data, should return 200 and register new user with isActivated field = false", async () => {
    const res = await request(app).post("/api/register").send(newUser).set("Content-Type", "application/json");
    expect(res.statusCode).toBe(200);

    // number of users should increase by the one that the test registered
    expect((await prisma.user.findMany()).length).toBe(USERS_BEFORE_TESTS + 1);

    const newUserFromDb = await prisma.user.findUnique({ where: { username: newUser.username } });

    expect(newUserFromDb).toBeTruthy();
    expect(newUserFromDb!.isActivated).toBe(false);
  }, 25000);
});
