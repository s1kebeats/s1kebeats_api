import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";
import { secondUser } from "./utils/mocks";

describe("activate", () => {
  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
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

  test("providing wrong activation link should return 404", async () => {
    const res = await request(app).post("/api/activate/wrong-activation-link");
    expect(res.statusCode).toBe(404);
  });
  test("providing valid activation link should return 200 and update user's isActivated field to true", async () => {
    const res = await request(app).post(`/api/activate/${secondUser.activationLink}`);
    expect(res.statusCode).toBe(200);

    const newlyActivatedUser = await prisma.user.findUnique({ where: { username: secondUser.username } });

    // check that user isActivated field is true
    expect(newlyActivatedUser!.isActivated).toBeTruthy();
  });
});
