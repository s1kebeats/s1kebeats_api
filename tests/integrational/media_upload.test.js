import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

it("Upload a media + get an uploaded media", async function () {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Sbeats2005",
  });
  const accessToken = login.body.accessToken;
  const upload = await request(app)
    .post("/api/media/upload")
    .set("Authorization", "Bearer " + accessToken)
    .attach("file", "tests/files/test.jpg")
    .field("path", "image");
  const key = upload.body;
  const image = await request(app).get(`/api/media/${key}`);
  assert.equal(image.statusCode, 200);
});
