import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

// [
//   {
//       "username": "buddahbless",
//   },
//   {
//       "username": "jpbeatz",
//   },
//   {
//       "username": "s1kebeats",
//   },
//   {
//       "username": "notActivated",
//   }
// ]
describe("Authors filtering", () => {
  it("Only GET", async () => {
    const res = await request(app).post("/api/author");
    assert.equal(res.statusCode, 404);
  });
  it("No query", async () => {
    const res = await request(app).get("/api/author");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 4);
  });
  it("Text query", async () => {
    const res = await request(app).get("/api/author/?q=jp");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].username, "jpbeatz");
  });
  it("Viewed: 10", async () => {
    const res = await request(app).get("/api/author/?viewed=10");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.length, 0);
  });
});
