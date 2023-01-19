import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import PrismaClient from "@prisma/client";

const editPayload: PrismaClient.Prisma.UserUpdateInput = {
  username: "newUsername",
  displayedName: "newDisplayedName",
  about: "newAbout",
  youtube: "newYouTube",
  instagram: "newInstagram",
  vk: "newVk",
  image: "image/newImage",
};
async function checkEditedUser(body: any) {
  for (const key of Object.keys(editPayload)) {
    await expect(body[key]).toEqual(editPayload[key as keyof typeof editPayload]);
  }
}

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
      {
        username: "s1kebeats",
        password: await bcrypt.hash("Password1234", 3),
        email: "s1kebeats@gmail.com",
        activationLink: "s1kebeats-activation-link",
      },
    ],
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 404", async () => {
  const res = await request(app).get("/api/edit");
  await expect(res.statusCode).toEqual(404);
});
it("unauthorized request should return 401", async () => {
  const res = await request(app).patch("/api/edit");
  await expect(res.statusCode).toEqual(401);
});
it("providing used username, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch("/api/edit").set("Authorization", `Bearer ${accessToken}`).send({
    username: "s1kebeats",
  });
  await expect(res.statusCode).toEqual(400);
});
it("providing username with banned characters, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch("/api/edit").set("Authorization", `Bearer ${accessToken}`).send({
    username: "__newusername",
  });
  await expect(res.statusCode).toEqual(400);
});
it("providing wrong image key, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch("/api/edit").set("Authorization", `Bearer ${accessToken}`).send({
    image: "notInsideImageFolder",
  });
  await expect(res.statusCode).toEqual(400);
});
it("providing valid data, should return 200 and edit the user", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).patch("/api/edit").set("Authorization", `Bearer ${accessToken}`).send(editPayload);
  await expect(res.statusCode).toEqual(200);

  // check that the user was edited
  const user = await request(app).get(`/api/author/${editPayload.username}`);
  await checkEditedUser(user.body);
});
