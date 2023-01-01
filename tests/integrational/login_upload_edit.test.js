import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

describe("Login, upload image, update user information, get user data, user image", async function () {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Sbeats2005",
  });
  const accessToken = login.body.accessToken;
  const image = await request(app).post("/api/media/upload").attach("file", "./files/test.jpg").field("path", "image");
  const edit = await request(app).post("/api/edit").send({
    username: "datsenkoboos",
  });
});
