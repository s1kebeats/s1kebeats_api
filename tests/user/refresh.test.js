import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

describe("Refresh user tokens", () => {
  it("Only GET", async () => {
    const res = await request(app).post("/api/refresh");
    assert.equal(res.statusCode, 404);
  });
  it("No refhreshToken cookie", async () => {
    const res = await request(app).get("/api/refresh").set("Content-Type", "application/json");
    assert.equal(res.statusCode, 401);
  });
  it("Wrong refhreshToken cookie", async () => {
    const res = await request(app)
      .get("/api/refresh")
      .set("Cookie", ["refreshToken=randomToken"])
      .set("Content-Type", "application/json");
    assert.equal(res.statusCode, 401);
  });
  it("Different IP's", async () => {
    const login = await request(app)
      .post("/api/login")
      .send({
        username: "s1kebeats",
        password: "Sbeats2005",
      })
      .set('X-Forwarded-For', 'ip1')
      .set("Content-Type", "application/json");
    const refresh = await request(app)
      .get("/api/refresh")
      .set("Cookie", ["refreshToken=" + login.body.refreshToken])
      .set('X-Forwarded-For', 'ip2')
      .set("Content-Type", "application/json");
    assert.equal(refresh.statusCode, 401);
  });
  it("Success", async () => {
    const login = await request(app)
      .post("/api/login")
      .send({
        username: "s1kebeats",
        password: "Sbeats2005",
      })
      .set("Content-Type", "application/json");
    const refresh = await request(app)
      .get("/api/refresh")
      .set("Cookie", ["refreshToken=" + login.body.refreshToken])
      .set("Content-Type", "application/json");
    assert.equal(refresh.statusCode, 200);
    assert.equal(refresh.headers["set-cookie"][0].includes("refreshToken=" + refresh.body.refreshToken), true);
    assert.equal(refresh.headers["set-cookie"][0].includes("HttpOnly"), true);
  });
});
