import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

const beats = [
  {
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
  },
  {
    name: "23",
    bpm: 170,
    description: "NBA",
    tags: "yb,emotional,s1kebeats",

    stemsPrice: 2999,
    wavePrice: 799,

    wave: "wave/",
    mp3: "mp3/",
    stems: "stems/",
    image: "image/",
  },
  {
    name: "Chaze",
    bpm: 140,
    description: "Inspired by ChazeBeatz",

    stemsPrice: 1699,
    wavePrice: 999,

    wave: "wave/",
    mp3: "mp3/",
    stems: "stems/",
    image: "image/",
  },
];
const accounts = [
  {
    username: "s1kebeats",
    password: "Sbeats2005",
  },
  {
    username: "datsenkoboos",
    password: "Sbeats2005",
  },
];

it("Upload 3 beats from 3 accounts + search", async () => {
  // 1st account upload
  const s1kebeatsLogin = await request(app).post("/api/login").send(accounts[0]);
  const s1kebeatsAccessToken = s1kebeatsLogin.body.accessToken;
  // 1st beat
  const s1kebeatsFirstBeat = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", "Bearer " + s1kebeatsAccessToken)
    .send(beats[0]);
  // 2nd beat
  const s1kebeatsSecondtBeat = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", "Bearer " + s1kebeatsAccessToken)
    .send(beats[1]);
  // 2nd account upload
  const datsenkoboosLogin = await request(app).post("/api/login").send(accounts[1]);
  const datsenkoboosAccessToken = datsenkoboosLogin.body.accessToken;
  const datsenkoboosFirstBeat = await request(app)
    .post("/api/beat/upload")
    .set("Authorization", "Bearer " + datsenkoboosAccessToken)
    .send(beats[2]);

  // search + sorting
  const noFilters = await request(app).get("/api/beat/");
  assert.equal(noFilters.body.beats.length, 3, "No filters");
  // viewed = 10
  const skip10 = await request(app).get("/api/beat/?viewed=10");
  assert.equal(skip10.body.beats.length, 0, "Viewed 10");

  const outtahereQ = await request(app).get("/api/beat/?q=outtahere");
  assert.equal(outtahereQ.body.beats[0].name, "outtahere");
  assert.equal(outtahereQ.body.beats.length, 1, "Outtahere");
  // q = a (beat name / authors name contains "a")
  const nameWith3 = await request(app).get("/api/beat/?q=3");
  assert.equal(nameWith3.body.beats.length, 1, "q=3");

  const s1kebeatsTag = await request(app).get("/api/beat/?tags=s1kebeats");
  assert.equal(s1kebeatsTag.body.beats.length, 2, "tags=s1kebeats");

  const ybTag = await request(app).get("/api/beat/?tags=yb");
  assert.equal(ybTag.body.beats.length, 1, "tags=yb");
  assert.equal(ybTag.body.beats[0].name, "23", "tags=yb");

  const bpm170 = await request(app).get("/api/beat/?bpm=170");
  assert.equal(bpm170.body.beats.length, 1, "bpm=170");
  assert.equal(bpm170.body.beats[0].name, "23", "bpm=170");
  // s1kebeats beats
  const s1kebeatsQ = await request(app).get("/api/beat/?q=s1ke");
  assert.equal(s1kebeatsQ.body.beats.length, 2, "q=s1ke");

  const orderByStemsPrice = await request(app).get("/api/beat/?orderBy=stemsPriceLower");
  assert.equal(orderByStemsPrice.body.beats.length, 3, "orderByStemsPrice");
  assert.equal(orderByStemsPrice.body.beats[0].name, "Chaze", "orderByStemsPrice");

  const orderByWavePrice = await request(app).get("/api/beat/?orderBy=wavePriceHigher");
  assert.equal(orderByWavePrice.body.beats.length, 3, "orderByWavePrice");
  assert.equal(orderByWavePrice.body.beats[1].name, "23", "orderByWavePrice");
}).timeout(5000);
