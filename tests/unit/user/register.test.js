import request from "supertest";
import assert from "assert";
import app from "../../../build/app.js";

describe("User registration", () => {
  it("Only POST", async () => {
    const res = await request(app).get("/api/register");
    assert.equal(res.statusCode, 404);
  });
  it("No email", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        username: "randomusername",
        password: "randompassword",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("No username", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "random@email.com",
        password: "randompassword",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("No password", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "random@email.com",
        username: "randomusername",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("Wrong email", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "random.com",
        username: "randomusername",
        password: "randompassword",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("Too short password", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "random@email.com",
        username: "randomusername",
        password: "1",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("Password without digit", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "random@email.com",
        username: "randomusername",
        password: "abcdefgHI",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("Password without capital letter", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "random@email.com",
        username: "randomusername",
        password: "abcdefg1111",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("Username with banned characters", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "random@email.com",
        username: "__randomusername",
        password: "randompassword",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("Already used username", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "adacenkoboos@gmail.com",
        username: "s1kebeats",
        password: "Sbeats2005",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 400);
  });
  it("Success", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        email: "adacenkoboos@gmail.com",
        username: "s1kebeats",
        password: "Sbeats2005",
      })
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 200);
  });
});
