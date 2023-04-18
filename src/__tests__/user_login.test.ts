import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";
import { activatedUser, secondUser } from "./utils/mocks";

describe("login", () => {
  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test("GET request should return 404", async () => {
    const res = await request(app).get("/api/login");
    expect(res.statusCode).toBe(404);
  });
  test("should return 400 without username provided", async () => {
    const res = await request(app)
      .post("/api/login")
      .send((({ username, ...rest }) => rest)(activatedUser));
    expect(res.statusCode).toBe(400);
  });
  test("should return 400 without password provided", async () => {
    const res = await request(app)
      .post("/api/login")
      .send((({ password, ...rest }) => rest)(activatedUser));
    expect(res.statusCode).toBe(400);
  });
  test("logging with wrong password should return 401", async () => {
    const res = await request(app)
      .post("/api/login")
      .send((({ password, ...rest }) => ({ password: "wrongpassword", ...rest }))(activatedUser));
    expect(res.statusCode).toBe(401);
  });
  test("logging with unregistered username should return 401", async () => {
    const res = await request(app)
      .post("/api/login")
      .send((({ username, ...rest }) => ({ username: "wrongusername", ...rest }))(activatedUser));
    expect(res.statusCode).toBe(401);
  });
  test("logging into account without activated email should return 403", async () => {
    const res = await request(app).post("/api/login").send(secondUser);
    expect(res.statusCode).toBe(403);
  });
  test("providing right data, refresh=true, should return 200 and set http-only refresh token cookie", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ ...activatedUser, refresh: true });
    expect(res.statusCode).toBe(200);
    // refresh token cookie check
    expect(res.headers["set-cookie"][0].includes("refreshToken=")).toBeTruthy();
    expect(res.headers["set-cookie"][0].includes("HttpOnly")).toBeTruthy();
  });
  test("providing right data, refresh=false, should return 200 and should not set http-only refresh token cookie", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ ...activatedUser, refresh: false });
    expect(res.statusCode).toBe(200);
    // refresh token cookie check
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});
