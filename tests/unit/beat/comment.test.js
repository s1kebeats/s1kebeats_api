import request from "supertest";
import assert from "assert";
import app from "../../../build/app.js";

// Beat for tests: { id: 21 }
describe("Beat commenting", () => {
  it("Only POST", async () => {
    const res = await request(app).get("/api/beat/1/comment");
    assert.equal(res.statusCode, 404);
  });
  it("Not authorized", async () => {
    const res = await request(app).post("/api/beat/1/comment");
    assert.equal(res.statusCode, 401);
  });
  it("No comment content", async () => {
    const login = await request(app).post("/api/login").send({
      // Activated user, created for tests
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/1/comment")
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 400);
  });
  it("Not existing beat", async () => {
    const login = await request(app).post("/api/login").send({
      // Activated user, created for tests
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      // Beat: { id: 0 } doesn't exist
      .post("/api/beat/0/comment")
      .send({
        content: "Comment content",
      })
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 404);
  });
  it("Non-numberic beat id", async () => {
    const login = await request(app).post("/api/login").send({
      // Activated user, created for tests
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/randomText/comment")
      .send({
        content: "Comment content",
      })
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 400);
  });
  it("Success", async () => {
    const login = await request(app).post("/api/login").send({
      // Activated user, created for tests
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/beat/1/comment")
      .send({
        content: "First comment",
      })
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.content, "First comment");
  });
});
