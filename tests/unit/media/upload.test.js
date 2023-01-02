import request from "supertest";
import assert from "assert";
import app from "../../../build/app.js";

describe("Uploading media files", function () {
  it("Only POST", async () => {
    const res = await request(app).get("/api/media/upload");
    assert.equal(res.statusCode, 404);
  });
  it("Not authorized", async () => {
    const res = await request(app)
      .post("/api/media/upload")
      .attach("image", "tests/files/outtahere_122BPM_Gunna.wav")
      .field("path", "image");
    assert.equal(res.statusCode, 401);
  });
  it("No file", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", "Bearer " + accessToken)
      .attach("image", "tests/files/outtahere_122BPM_Gunna.wav")
      .field("path", "image");
    assert.equal(res.statusCode, 400);
  });
  it("No path", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", "Bearer " + accessToken)
      .attach("file", "tests/files/outtahere_122BPM_Gunna.wav");
    assert.equal(res.statusCode, 400);
  });
  it("Wrong image", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", "Bearer " + accessToken)
      .attach("file", "tests/files/outtahere_122BPM_Gunna.wav")
      .field("path", "image");
    assert.equal(res.statusCode, 400);
  });
  it("Wrong stems", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", "Bearer " + accessToken)
      .attach("file", "tests/files/outtahere_122BPM_Gunna.wav")
      .field("path", "stems");
    assert.equal(res.statusCode, 400);
  });
  it("Wrong mp3", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", "Bearer " + accessToken)
      .attach("file", "tests/files/outtahere_122BPM_Gunna.wav")
      .field("path", "mp3");
    assert.equal(res.statusCode, 400);
  });
  it("Wrong wav", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", "Bearer " + accessToken)
      .attach("file", "tests/files/outtahere_122BPM_Gunna.mp3")
      .field("path", "wav");
    assert.equal(res.statusCode, 400);
  });
  it("Success", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/media/upload")
      .set("Authorization", "Bearer " + accessToken)
      .attach("file", "tests/files/test.jpg")
      .field("path", "image");
    assert.equal(res.statusCode, 200);
  });
});
