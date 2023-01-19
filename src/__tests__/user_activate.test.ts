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
      },
    ],
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("providing wrong activation link should return 404", async () => {
  const res = await request(app).get("/api/activate/wrong-activation-link");
  await expect(res.statusCode).toEqual(404);
});
it("providing valid activation link should return 200 and update users isActivated field to true", async () => {
  const res = await request(app).get("/api/activate/datsenkoboos-activation-link");
  await expect(res.statusCode).toEqual(200);

  // check that user isActivated field is true
  await expect(!((await prisma.user.findUnique({ where: { username: "datsenkoboos" } })) == null)).toEqual(true);
});
