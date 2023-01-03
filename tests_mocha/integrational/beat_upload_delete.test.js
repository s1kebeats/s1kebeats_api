import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

it("Upload beat + delete uploaded beat", async function () {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;
  const image = await request(app)
    .post("/api/media/upload")
    .set("Authorization", "Bearer " + accessToken)
    .field("path", "image")
    .attach("file", "tests/files/test.jpg");
  const key = image.body;
  const upload = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", "Bearer " + accessToken)
    .send({
      name: "outtahere",
      bpm: 140,
      description: "inspired by wheezy",
      tags: "gunna,wheezy,s1kebeats",

      wavePrice: 499,

      wave: "wave/",
      mp3: "mp3/",
      image: key,
    });
  const id = upload.body.id;
  const deletion = await request(app)
    .post(`/api/beat/${id}/delete`)
    .set("Authorization", "Bearer " + accessToken);
  assert.equal(deletion.statusCode, 200);
  const getBeat = await request(app).get(`/api/beat/${id}`);
  assert.equal(getBeat.statusCode, 404);
  const getImage = await request(app).get("/api/media/" + key);
  assert.equal(getImage.statusCode, 404);
}).timeout(10000);
