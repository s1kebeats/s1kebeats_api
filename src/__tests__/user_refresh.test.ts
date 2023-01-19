import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      {
        username: "datsenkoboos",
        password: await bcrypt.hash("Password1234", 3),
        email: "datsenkoboos@gmail.com",
        activationLink: "datsenkoboos-activation-link",
        isActivated: true,
      },
    ],
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get("/api/refresh");
  await expect(res.statusCode).toEqual(404);
});
it("request without refreshToken http-only cookie provided should return 401", async () => {
  const res = await request(app).post("/api/refresh");
  await expect(res.statusCode).toEqual(401);
});
it("request with wrong refreshToken http-only cookie provided should return 401", async () => {
  const res = await request(app).post("/api/refresh").set("Cookie", ["refreshToken=randomToken"]);
  await expect(res.statusCode).toEqual(401);
});
it("refresh with right refreshToken http-only cookie should return 200 and new valid tokens", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
    refresh: true,
  });
  let refreshTokenCookie = login.headers["set-cookie"][0].split(" ")[0];

  const res = await request(app).post("/api/refresh").set("Cookie", refreshTokenCookie);
  await expect(res.statusCode).toEqual(200);
  await expect(res.headers["set-cookie"][0].includes("refreshToken=")).toBe(true);
  await expect(res.headers["set-cookie"][0].includes("HttpOnly")).toBe(true);

  refreshTokenCookie = res.headers["set-cookie"][0].split(" ")[0];

  // request to a random endpoint with required authorization to check that new accessToken is valid
  const edit = await request(app).patch("/api/edit").set("Authorization", `Bearer ${res.body.accessToken}`);
  await expect(edit.statusCode).toEqual(200);

  // checking that new refreshToken is valid
  const refreshWithNewRefreshToken = await request(app).post("/api/refresh").set("Cookie", refreshTokenCookie);
  await expect(refreshWithNewRefreshToken.statusCode).toEqual(200);
});
