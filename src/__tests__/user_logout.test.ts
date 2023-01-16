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
  const res = await request(app).get("/api/logout");
  await expect(res.statusCode).toEqual(404);
});
it("request without refresh token http-only cookie provided, should return 401", async () => {
  const res = await request(app).post("/api/logout");
  await expect(res.statusCode).toEqual(401);
});
it("request without refresh token http-only cookie provided, should return 401", async () => {
  const res = await request(app).post("/api/logout").set("Cookie", ["refreshToken=randomToken"]);
  await expect(res.statusCode).toEqual(401);
});
it("providing valid refresh token, should return 200 and invalidate refreshToken", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
    refresh: true,
  });
  const refreshToken = login.headers["set-cookie"][0].split(" ")[0];

  const res = await request(app).post("/api/logout").set("Cookie", refreshToken);
  await expect(res.statusCode).toEqual(200);

  // check that refreshToken is not valid anymore
  const refreshWithDeletedToken = await request(app).post("/api/refresh").set("Cookie", refreshToken);
  await expect(refreshWithDeletedToken.statusCode).toEqual(401);
});
