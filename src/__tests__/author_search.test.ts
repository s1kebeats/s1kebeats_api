import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import PrismaClient from "@prisma/client";

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

beforeEach(async () => {
  await prisma.user.createMany({
    data: usersList,
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("valid request without query and viewed provided", async () => {
  const res = await request(app).get("/api/author/");
  expect(res.statusCode).toBe(200);
  expect(res.body.authors.length).toBe(MOCKED_USERS);
  expect(res.body.viewed).toBe(4);
});
it("valid request with query provided", async () => {
  const res = await request(app).get("/api/author/?q=j");
  expect(res.statusCode).toBe(200);
  expect(res.body.authors.length).toBe(3);
});
it("valid request with viewed=10", async () => {
  const res = await request(app).get("/api/author/?viewed=10");
  expect(res.statusCode).toBe(200);
  expect(res.body.authors.length).toBe(0);
  expect(res.body.viewed).toBe(10);
});
