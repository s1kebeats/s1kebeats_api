import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeAll, afterAll, expect, test } from "vitest";
import { activatedUser } from "./utils/mocks";

describe("author individual", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        ...activatedUser,
        password: await (async () => await bcrypt.hash(activatedUser.password, 3))(),
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  test("providing username that does not exist, should return 404", async () => {
    const res = await request(app).get("/api/author/NotExistingAuthor");
    expect(res.statusCode).toBe(404);
  });
  test("providing existing username, should return 200 and send user data", async () => {
    const res = await request(app).get(`/api/author/${activatedUser.username}`);
    expect(res.statusCode).toBe(200);

    // check response body
    expect(res.body.email).toBe(undefined);
    expect(res.body.password).toBe(undefined);
    expect(res.body.activationLink).toBe(undefined);
    expect(res.body.isActivated).toBe(undefined);
    expect(res.body.username).toBe(activatedUser.username);
    expect(res.body.displayedName).toBe(activatedUser.displayedName);
    expect(res.body.image).toBe(activatedUser.image);
  });
});
