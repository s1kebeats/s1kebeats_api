import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import PrismaClient from "@prisma/client";
import { describe, beforeAll, afterAll, expect, test } from "vitest";

const MOCKED_USERS = 4;
const usersList: PrismaClient.Prisma.UserCreateInput[] = [
  {
    username: "alice56",
    password: await (async () => await bcrypt.hash("Password1234", 3))(),
    email: "alice56@gmail.com",
    activationLink: "alice56-activation-link",
  },
  {
    username: "john34",
    password: await (async () => await bcrypt.hash("Password1234", 3))(),
    email: "john34@gmail.com",
    activationLink: "john34-activation-link",
  },
  {
    username: "jane12",
    password: await (async () => await bcrypt.hash("Password1234", 3))(),
    email: "jane12@gmail.com",
    activationLink: "jane12-activation-link",
  },
  {
    username: "bob78",
    displayedName: "Bob Jonathan",
    password: await (async () => await bcrypt.hash("Password1234", 3))(),
    email: "bob78@gmail.com",
    activationLink: "bob78-activation-link",
  },
];

describe("authors search", () => {
  beforeAll(async () => {
    await prisma.user.createMany({
      data: usersList,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  test("valid request without query and viewed provided should return 200 and authors list", async () => {
    const res = await request(app).get("/api/author/");
    expect(res.statusCode).toBe(200);
    expect(res.body.authors.length).toBe(MOCKED_USERS);
    expect(res.body.viewed).toBe(MOCKED_USERS);
  });
  test("valid request with query provided should return 200 and filter authors", async () => {
    const res = await request(app).get("/api/author/?q=j");
    expect(res.statusCode).toBe(200);
    expect(res.body.authors.length).toBe(
      usersList.filter(
        (user) => user.username.toLowerCase().includes("j") || user.displayedName?.toLowerCase().includes("j")
      ).length
    );
  });
  test("valid request with viewed=10 should return 200 and skip all authors", async () => {
    const res = await request(app).get("/api/author/?viewed=10");
    expect(res.statusCode).toBe(200);
    expect(res.body.authors.length).toBe(0);
    expect(res.body.viewed).toBe(10);
  });
});
