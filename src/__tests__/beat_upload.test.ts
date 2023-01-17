import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";

const data = {
  name: "outtahere",
  bpm: 140,
  description: "inspired by wheezy",
  tags: "gunna,wheezy,s1kebeats",

  stemsPrice: 1999,
  wavePrice: 499,

  wave: "wave/",
  mp3: "mp3/",
  stems: "stems/",
  image: "image/",
};

beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      {
        username: "s1kebeats",
        password: await bcrypt.hash("Password1234", 3),
        email: "s1kebeats@gmail.com",
        activationLink: "s1kebeats-activation-link",
        isActivated: true,
      },
    ],
  });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.$disconnect();
});

it("GET request should return 400", async () => {
  const res = await request(app).get("/api/beat/upload");
  // 400 because of Id param validator on the individual beat path
  await expect(res.statusCode).toBe(400);
});
it("not authorized request, should return 401", async () => {
  const res = await request(app).post("/api/beat/upload").send(data);
  await expect(res.statusCode).toBe(401);
});
it("request without name provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ name, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request without wavePrice provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ wavePrice, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request without wave provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ wave, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request without mp3 provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ mp3, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request without stems, but with stemsPrice provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ stems, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request without stemsPrice, but with stems provided should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ stemsPrice, ...rest }) => ({ ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request with wrong stems path, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ stems, ...rest }) => ({ stems: "image/key", ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request with wrong wave path, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ wave, ...rest }) => ({ wave: "image/key", ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request with wrong mp3 path, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ mp3, ...rest }) => ({ mp3: "image/key", ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request with wrong image path, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ image, ...rest }) => ({ image: "wave/key", ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request with wrong tags, should return 400", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", `Bearer ${accessToken}`)
    .send((({ tags, ...rest }) => ({ tags: ",./[", ...rest }))(data));
  await expect(res.statusCode).toBe(400);
});
it("request with valid data provided, should return 200 and upload the beat", async () => {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;

  const res = await request(app).post("/api/beat/upload").set("Authorization", `Bearer ${accessToken}`).send(data);
  await expect(res.statusCode).toBe(200);

  const id = res.body.id;

  const beat = await request(app).get(`/api/beat/${id}`);
  await expect(beat.statusCode).toBe(200);
  await expect(beat.body.name).toBe(data.name);
}, 25000);
