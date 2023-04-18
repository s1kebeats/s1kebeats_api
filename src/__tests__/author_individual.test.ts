import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

async function checkIndividualAuthorResponse(body: any) {
  expect(body.email).toBe(undefined);
  expect(body.password).toBe(undefined);
  expect(body.activationLink).toBe(undefined);
  expect(body.isActivated).toBe(undefined);
  expect(body.username).toBe("s1kebeats");
  expect(body.displayedName).toBe("Arthur Datsenko-Boos");
  expect(body.image).toBe("path/to/image");
}

beforeEach(async () => {
  await prisma.user.create({
    data: {
      username: "s1kebeats",
      displayedName: "Arthur Datsenko-Boos",
      image: "path/to/image",
      password: await (async () => await bcrypt.hash("Password1234", 3))(),
      email: "s1kebeats@gmail.com",
      activationLink: "s1kebeats-activation-link",
      isActivated: true,
    },
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("providing wrong username, should return 404", async () => {
  const res = await request(app).get("/api/author/NotExistingAuthor");
  expect(res.statusCode).toBe(404);
});
it("providing right username, should return 200 and send user data", async () => {
  const res = await request(app).get("/api/author/s1kebeats");
  expect(res.statusCode).toBe(200);

  // check response body
  await checkIndividualAuthorResponse(res.body);
});
