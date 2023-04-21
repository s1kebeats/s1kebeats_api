import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import { describe, beforeEach, afterEach, expect, test } from "vitest";
import { nonActivatedUser } from "./utils/mocks";

describe("activate", () => {
  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
        {
          ...nonActivatedUser,
          password: await (async () => await bcrypt.hash(nonActivatedUser.password, 3))(),
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
    const res = await request(app).post(`/api/activate/${nonActivatedUser.activationLink}`);
    expect(res.statusCode).toBe(200);

    const newlyActivatedUser = await prisma.user.findUnique({ where: { username: nonActivatedUser.username } });

    // check that user isActivated field is true
    expect(newlyActivatedUser!.isActivated).toBeTruthy();
  });
});
