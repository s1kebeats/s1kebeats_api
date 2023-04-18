import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";
import { activatedUser } from "./utils/mocks";

describe("refresh", () => {
  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
        {
          ...activatedUser,
          password: await (async () => await bcrypt.hash(activatedUser.password, 3))(),
        },
      ],
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test("GET request should return 404", async () => {
    const res = await request(app).get("/api/refresh");
    expect(res.statusCode).toBe(404);
  });
  test("request without refreshToken http-only cookie provided should return 401", async () => {
    const res = await request(app).post("/api/refresh");
    expect(res.statusCode).toBe(401);
  });
  test("request with wrong refreshToken http-only cookie provided should return 401", async () => {
    const res = await request(app).post("/api/refresh").set("Cookie", ["refreshToken=randomToken"]);
    expect(res.statusCode).toBe(401);
  });
  test("refresh with valid refreshToken http-only cookie should return 200 and generate valid tokens", async () => {
    const login = await request(app)
      .post("/api/login")
      .send({
        ...activatedUser,
        refresh: true,
      });
    let refreshTokenCookie = login.headers["set-cookie"][0].split(" ")[0];

    const res = await request(app).post("/api/refresh").set("Cookie", refreshTokenCookie);
    expect(res.statusCode).toBe(200);

    expect(res.headers["set-cookie"][0].includes("refreshToken=")).toBeTruthy();
    expect(res.headers["set-cookie"][0].includes("HttpOnly")).toBeTruthy();

    refreshTokenCookie = res.headers["set-cookie"][0].split(" ")[0];

    // request to a random endpoint with required authorization to check that new accessToken is valid
    const edit = await request(app).patch("/api/edit").set("Authorization", `Bearer ${res.body.accessToken}`);
    expect(edit.statusCode).toEqual(200);

    // checking that new refreshToken is valid
    const refreshWithNewRefreshToken = await request(app).post("/api/refresh").set("Cookie", refreshTokenCookie);
    expect(refreshWithNewRefreshToken.statusCode).toEqual(200);
  });
});
