import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

describe("Get comments", () => {
  it("Only GET", async () => {
    const login = await request(app).post("/api/login").send({
      login: "notActivated",
      password: "notActivated",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/comment/0")
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 404);
  });
  it("Not authorized", async () => {
    const res = await request(app).get("/api/comment/21");
    assert.equal(res.statusCode, 401);
  });
  it("Not existing beat", async () => {
    const login = await request(app).post("/api/login").send({
      login: "notActivated",
      password: "notActivated",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .get("/api/comment/0")
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 404);
  });
  it("Non-numeric id", async () => {
    const login = await request(app).post("/api/login").send({
      login: "notActivated",
      password: "notActivated",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .get("/api/comment/randomText")
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 400);
  });
  it("Success", async () => {
    const login = await request(app).post("/api/login").send({
      login: "notActivated",
      password: "notActivated",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .get("/api/comment/21")
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.comments[0].content, "Comment content");
  });
  it("Non-numeric viewed count", async () => {
    const login = await request(app).post("/api/login").send({
      login: "notActivated",
      password: "notActivated",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .get("/api/comment/21/?viewed=text")
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 400);
  });
  it("Success: viewed = 10", async () => {
    const login = await request(app).post("/api/login").send({
      login: "notActivated",
      password: "notActivated",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .get("/api/comment/21/?viewed=10")
      .set("Authorization", "Bearer " + accessToken);
    assert.equal(res.statusCode, 200);
    // Less than 10 comments in database, viewed=10 skips all fo them
    assert.equal(res.body.comments.length, 0);
  });
});
