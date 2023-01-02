import request from "supertest";
import assert from "assert";
import app from "../../../build/app.js";

describe("User logout", () => {
  it("Only POST", async () => {
    const res = await request(app).get("/api/logout");
    assert.equal(res.statusCode, 404);
  });
  it("No refresh token cookie", async () => {
    const res = await request(app).post("/api/logout");
    assert.equal(res.statusCode, 401);
  });
  it("Wrong refresh token cookie", async () => {
    const res = await request(app).post("/api/logout").set("Cookie", ["refreshToken=randomToken"]);
    assert.equal(res.statusCode, 401);
  });
  it("Success", async () => {
    const login = await request(app).post("/api/login").send({
      username: "s1kebeats",
      password: "Password1234",
    });
    const refreshToken = login.body.refreshToken;
    const logout = await request(app)
      .post("/api/logout")
      .set("Cookie", ["refreshToken=" + refreshToken]);
    assert.equal(logout.statusCode, 200);
    // token should be deleted from database
    const refreshWithDeletedToken = await request(app)
      .get("/api/refresh")
      .set("Cookie", ["refreshToken=" + refreshToken]);
    assert.equal(refreshWithDeletedToken.statusCode, 401);
  });
});
