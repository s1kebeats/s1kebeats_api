import request from "supertest";
import assert from "assert";
import app from "../../../build/app.js";

describe("User data editing", () => {
  it("Only POST", async () => {
    const res = await request(app).get("/api/edit");
    assert.equal(res.statusCode, 404);
  });
  it("Not authorized", async () => {
    const res = await request(app).post("/api/edit");
    assert.equal(res.statusCode, 401);
  });
  it("Taken username", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/edit")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        username: "s1kebeats",
      });
    assert.equal(res.statusCode, 400);
  });
  it("Success", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Sbeats2005",
    });
    const accessToken = login.body.accessToken;
    const res = await request(app)
      .post("/api/edit")
      .set("Authorization", "Bearer " + accessToken)
      .send({
        about: "2023 LETS GO!",
      });
    assert.equal(res.statusCode, 200);
  });
});
