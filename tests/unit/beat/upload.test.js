import request from "supertest";
import assert from "assert";
import app from "../../../build/app.js";

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

describe("Beat upload", () => {
  it("Only POST", async () => {
    const res = await request(app).get("/api/beat/upload");
    // 400 because of Id param validator on the individual beat path
    assert.equal(res.statusCode, 400);
  });
  it("No beat name", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ name, ...rest }) => ({ ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("No beat wavePrice", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ wavePrice, ...rest }) => ({ ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("No beat wave", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ wave, ...rest }) => ({ ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("No beat mp3", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ mp3, ...rest }) => ({ ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("stemsPrice without stems archive", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ stems, ...rest }) => ({ ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("stems archive without stemsPrice", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ stemsPrice, ...rest }) => ({ ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("Wrong stems archive", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ stems, ...rest }) => ({ stems: "image/key", ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("Wrong wave", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ wave, ...rest }) => ({ wave: "image/key", ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("Wrong mp3", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ mp3, ...rest }) => ({ mp3: "image/key", ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("Wrong image extension", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ image, ...rest }) => ({ image: "wave/key", ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("Wrong tags", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send((({ tags, ...rest }) => ({ tags: ",./[", ...rest }))(data));
    assert.equal(res.statusCode, 400);
  });
  it("Not authorized", async () => {
    const res = await request(app)
      .post("/api/beat/upload")
      .send(data);
    assert.equal(res.statusCode, 401);
  });
  it("Success", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send(data);
    assert.equal(res.statusCode, 200);
  }).timeout(5000);
});
