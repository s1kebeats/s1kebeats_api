import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";
import { activatedUser } from "./utils/mocks";

describe("checkUsername", () => {
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

  test("request with username containing banned chars should return 400", async () => {
    const res = await request(app).get("/api/checkusername/_F");
    expect(res.statusCode).toBe(400);
  });
  test("request to unavailable username should return 200 and available = false", async () => {
    const res = await request(app).get(`/api/checkusername/${activatedUser.username}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.available).toBe(false);
  });
  test("request to available username should return 200 and available = true", async () => {
    const res = await request(app).get("/api/checkusername/notUsed");
    expect(res.statusCode).toBe(200);
    expect(res.body.available).toBeTruthy();
  });
});
