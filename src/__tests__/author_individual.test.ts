import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

async function checkIndividualAuthorResponse(body: any) {
  await expect(body.email).toBe(undefined);
  await expect(body.password).toBe(undefined);
  await expect(body.activationLink).toBe(undefined);
  await expect(body.isActivated).toBe(undefined);
  await expect(body.username).toBe("s1kebeats");
  await expect(body.displayedName).toBe("Arthur Datsenko-Boos");
  await expect(body.image).toBe("path/to/image");
}

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "s1kebeats",
      displayedName: "Arthur Datsenko-Boos",
      image: "path/to/image",
      password: await (() => bcrypt.hash("Password1234", 3))(),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
      isActivated: true,
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("POST request should return 404", async () => {
  const res = await request(app).post("/api/author/s1kebeats");
  await expect(res.statusCode).toBe(404);
});
it("providing wrong username, should return 404", async () => {
  const res = await request(app).get("/api/author/NotExistingAuthor");
  await expect(res.statusCode).toBe(404);
});
it("providing right username, should return 200 and send user data", async () => {
  const res = await request(app).get("/api/author/s1kebeats");
  await expect(res.statusCode).toBe(200);

  // check response body
  await checkIndividualAuthorResponse(res.body);
});
