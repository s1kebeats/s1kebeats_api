import request from "supertest";
import assert from "assert";
import app from "../../../build/app.js";

// Beats for test: [
//   {
//     id: 21,
//     name: 'Chaze',
//     bpm: 140,
//     user: {
//       username: 's1kebeats',
//     },
//     wavePrice: 899,
//     tags: [
//       {
//         id: 3,
//         name: 's1kebeats',
//       },
//       {
//         id: 6,
//         name: 'keyglock',
//       },
//     ],
//   },
//   {
//     id: 22,
//     name: 'outtahere',
//     bpm: 122,
//     user: {
//       username: 's1kebeats',
//     },
//     wavePrice: 1499,
//     tags: [
//       {
//         id: 3,
//         name: 's1kebeats',
//       },
//       {
//         id: 7,
//         name: 'gunna',
//       },
//       {
//         id: 8,
//         name: 'wheezy',
//       },
//     ],
//   },
//   {
//     id: 23,
//     name: 'Turnt',
//     bpm: 140,
//     user: {
//       username: 's1kebeats',
//     },
//     wavePrice: 1299,
//     tags: [
//       {
//         id: 3,
//         name: 's1kebeats',
//       },
//       {
//         id: 9,
//         name: 'LilTjay',
//       },
//       {
//         id: 10,
//         name: 'Emotional',
//       },
//     ],
//   },
//   {
//     id: 24,
//     name: 'PSD',
//     bpm: 160,
//     user: {
//       username: 's1kebeats',
//     },
//     wavePrice: 1099,
//     tags: [
//       {
//         id: 3,
//         name: 's1kebeats',
//       },
//       {
//         id: 11,
//         name: 'agressive',
//       },
//     ],
//   },
// ];
describe("Beats filtering and ordering", () => {
  it("Only GET", async () => {
    const res = await request(app).post("/api/beat/");
    assert.equal(res.statusCode, 404);
  });
  it("No query", async () => {
    const res = await request(app).get("/api/beat/");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats.length, 4);
  });
  it("Filter with tags: 7,3", async () => {
    const res = await request(app).get("/api/beat/?tags=7,3");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats.length, 4);
  });
  it("Filter with tags: 7", async () => {
    const res = await request(app).get("/api/beat/?tags=7");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats.length, 1);
    assert.equal(res.body.beats[0].name, "outtahere");
  });
  it("Filter with text: s1kebeats", async () => {
    const res = await request(app).get("/api/beat/?q=s1kebeats");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats.length, 4);
    // Beats with name or author username, containing text query
    assert.equal(res.body.beats.map((item) => item.user.username).includes("s1kebeats"), true);
  });
  it("Filter with text: outta", async () => {
    const res = await request(app).get("/api/beat/?q=outta");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats.length, 1);
    // Beats with name or author username, containing text query
    assert.equal(res.body.beats[0].name, "outtahere");
  });
  it("Filter with bpm", async () => {
    const res = await request(app).get("/api/beat/?bpm=140");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats.length, 2);
    assert.equal(res.body.beats[0].name, "Chaze");
    assert.equal(res.body.beats[1].name, "Turnt");
  });
  it("Order by wavePrice H(higher)", async () => {
    const res = await request(app).get("/api/beat/?sort=HwavePrice");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats[0].name, "outtahere");
  });
  it("Order by wavePrice L(lower)", async () => {
    const res = await request(app).get("/api/beat/?sort=LwavePrice");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats[0].name, "Chaze");
  });
  it("Filter with both bpm and text", async () => {
    const res = await request(app).get("/api/beat/?q=s1kebeats&bpm=122");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.beats.length, 1);
    assert.equal(res.body.beats[0].name, "outtahere");
  });
});
