import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import PrismaClient from "@prisma/client";

const MOCKED_USERS = 4;
const usersList = [
  {
    username: "alice56",
    password: await (() => bcrypt.hash("Password1234", 3))(),
    email: "alice56@gmail.com",
    activationLink: "alice56-activation-link",
  },
  {
    username: "john34",
    password: await (() => bcrypt.hash("Password1234", 3))(),
    email: "john34@gmail.com",
    activationLink: "john34-activation-link",
  },
  {
    username: "jane12",
    password: await (() => bcrypt.hash("Password1234", 3))(),
    email: "jane12@gmail.com",
    activationLink: "jane12-activation-link",
  },
  {
    username: "bob78",
    displayedName: "Bob Jonathan",
    password: await (() => bcrypt.hash("Password1234", 3))(),
    email: "bob78@gmail.com",
    activationLink: "bob78-activation-link",
  },
];
beforeAll(async () => {
  await prisma.user.createMany({
    data: usersList,
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("POST request should return 404", async () => {
  const res = await request(app).post("/api/author/");
  await expect(res.statusCode).toBe(404);
});
it("valid request without query and viewed provided", async () => {
  const res = await request(app).get("/api/author/");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.authors.length).toBe(MOCKED_USERS);
  await expect(res.body.viewed).toBe(4);
});
it("valid request with query provided", async () => {
  const res = await request(app).get("/api/author/?q=j");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.authors.length).toBe(3);
});
it("valid request with viewed=10", async () => {
  const res = await request(app).get("/api/author/?viewed=10");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.authors.length).toBe(0);
  await expect(res.body.viewed).toBe(10);
});
