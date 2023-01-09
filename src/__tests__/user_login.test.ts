import request from "supertest";
import assert from "assert";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

function checkMockedUserLoginResponse(body: any): void {
  assert.equal(body.user.email, mock.email);
  assert.equal(body.user.username, mock.username);
  assert.equal(body.user.displayedName, mock.displayedName);
  assert.equal(body.user.image, mock.image);
  assert.equal(typeof body.accessToken, "string");
}

const mock = {
  username: "s1kebeats",
  displayedName: "Arthur Datsenko-Boos",
  image: "path/to/image",
  password: await (() => bcrypt.hash("Password1234", 3))(),
  email: "s1kebeats@gmail.com",
  activationLink: "s1kebeats-activation-link",
  isActivated: true,
};
beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      {
        username: "datsenkoboos",
        password: await bcrypt.hash("Password1234", 3),
        email: "datsenkoboos@gmail.com",
        activationLink: "datsenkoboos-activation-link",
      },
      mock,
    ],
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get("/api/login");
  assert.equal(res.statusCode, 404);
});
it("should return 400 without username provided", async () => {
  const res = await request(app).post("/api/login").send({
    password: "randompassword",
  });
  assert.equal(res.statusCode, 400);
});
it("should return 400 without password provided", async () => {
  const res = await request(app).post("/api/login").send({
    username: "randomusername",
  });
  assert.equal(res.statusCode, 400);
});
it("logging with wrong password should return 401", async () => {
  const res = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "randompassword",
  });
  assert.equal(res.statusCode, 401);
});
it("logging with not registered username should return 401", async () => {
  const res = await request(app).post("/api/login").send({
    username: "randonusername",
    password: "Password1234",
  });
  assert.equal(res.statusCode, 401);
});
it("logging into account without activated email should return 403", async () => {
  const res = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  assert.equal(res.statusCode, 403);
});
it("providing right data, refresh=true, should return 200 and set http-only refresh token cookie, should send right userDto", async () => {
  const res = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
    refresh: true,
  });
  assert.equal(res.statusCode, 200);
  checkMockedUserLoginResponse(res.body);

  // refresh token cookie check
  assert.equal(res.headers["set-cookie"][0].includes("refreshToken="), true);
  assert.equal(res.headers["set-cookie"][0].includes("HttpOnly"), true);
});
it("providing right data, refresh=false, should return 200 and should not set http-only refresh token cookie, should send right userDto", async () => {
  const res = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  assert.equal(res.statusCode, 200);
  checkMockedUserLoginResponse(res.body);

  // refresh token cookie check
  assert.equal(res.headers["set-cookie"], undefined);
});
