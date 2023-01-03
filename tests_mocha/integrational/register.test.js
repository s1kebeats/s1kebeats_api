import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

it("Register + login", async function () {
  const register = await request(app)
    .post("/api/register")
    .send({
      email: "adacenkoboos@gmail.com",
      username: "s1kebeats",
      password: "Password1234",
    })
    .set("Content-Type", "application/json");
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  // email not confirmed
  assert.equal(login.statusCode, 403);
}).timeout(5000);
