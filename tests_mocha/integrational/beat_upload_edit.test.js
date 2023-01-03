import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

describe("Beat upload + beat edit", function () {
  it("Upload beat without stems and stemsPrice + send payload with stemsPrice only", async function () {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
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
        image: "image/",
      });
    const id = upload.body.id;
    const edit = await request(app)
      .post(`/api/beat/${id}/edit`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        stemsPrice: 1999,
      });
    assert.equal(edit.statusCode, 400);
  });
  it("Upload beat without stems and stemsPrice + send payload with stems only", async function () {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
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
        image: "image/",
      });
    const id = upload.body.id;
    const edit = await request(app)
      .post(`/api/beat/${id}/edit`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        stems: "stems/3",
      });
    assert.equal(edit.statusCode, 400);
  });
  it("Success", async function () {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const accessToken = login.body.accessToken;
    const upload = await request(app)
      .post("/api/beat/upload")
      .set("Authorization", "Bearer " + accessToken)
      .send({
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
      });
    const id = upload.body.id;
    const edit = await request(app)
      .post(`/api/beat/${id}/edit`)
      .set("Authorization", "Bearer " + accessToken)
      .send({
        name: "newName",
        bpm: 99,
        description: "inspired by newName",
        tags: "tag,s1kebeats",

        stemsPrice: 2999,
        wavePrice: 199,

        wave: "wave/1",
        mp3: "mp3/2",
        stems: "stems/3",
        image: "image/4",
      });
    assert.equal(edit.statusCode, 200);
    const edited = await request(app).get("/api/beat/" + id);
    assert.equal(edited.body.name, "newName");
    assert.equal(edited.body.bpm, 99);
    assert.equal(edited.body.description, "inspired by newName");
    assert.equal(edited.body.tags.length, 2);
    assert.equal(edited.body.stemsPrice, 2999);
    assert.equal(edited.body.wavePrice, 199);
    assert.equal(edited.body.mp3, "mp3/2");
    assert.equal(edited.body.image, "image/4");
  });
});
