import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import mediaLocations from "./media/mediaLocations";

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
  const res = await request(app).get("/api/media/upload");
  await expect(res.statusCode).toBe(404);
});
it("not authorized request should return 401", async () => {
  const res = await request(app).post("/api/media/upload").attach("image", mediaLocations.image).field("path", "image");
  await expect(res.statusCode).toBe(401);
});
it('no "file" field attached should return 400', async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .field("path", "image");
  await expect(res.statusCode).toBe(400);
});
it("no path provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.image);
  await expect(res.statusCode).toBe(400);
});
it("invalid path provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.image)
    .field("path", "randomPath");
  await expect(res.statusCode).toBe(400);
});
it("providing media file with wrong extension to image path should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.wave)
    .field("path", "image");
  await expect(res.statusCode).toBe(400);
});
it("providing media file with wrong extension to stems path should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.image)
    .field("path", "stems");
  await expect(res.statusCode).toBe(400);
});
it("providing media file with wrong extension to mp3 path should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.image)
    .field("path", "mp3");
  await expect(res.statusCode).toBe(400);
});
it("providing media file with wrong extension to wav path should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.image)
    .field("path", "wav");
  await expect(res.statusCode).toBe(400);
});
it("valid data provided, should return 200 and upload the file", async () => {
  const login = await request(app).post("/api/login").send({
    username: "datsenkoboos",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/media/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .attach("file", mediaLocations.image)
    .field("path", "image");
  await expect(res.statusCode).toBe(200);

  const key = res.body;

  // check if the file was uploaded
  const media = await request(app).get(`/api/media/${key}`);
  await expect(media.statusCode).toBe(200);
});