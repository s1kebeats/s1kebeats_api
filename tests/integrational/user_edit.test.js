import request from "supertest";
import assert from "assert";
import app from "../../build/app.js";

const data = {
  username: "datsenkoboos",
  displayedName: "Arthur Datsenko-Boos",
  about: "Krasnoyarsk, Russia",
  vk: "datsenkoboos",
  youtube: "s1kebeats",
  instagram: "datsenkoboos",
};

it("Upload image + edit user data + get the user", async function () {
  const login = await request(app).post("/api/login").send({
    username: "s1kebeats",
    password: "Password1234",
  });
  const accessToken = login.body.accessToken;
  const image = await request(app)
    .post("/api/media/upload")
    .set("Authorization", "Bearer " + accessToken)
    .attach("file", "tests/files/test.jpg")
    .field("path", "image");
  const key = image.body;
  const edit = await request(app)
    .post("/api/edit")
    .set("Authorization", "Bearer " + accessToken)
    .send({ ...data, image: key });
  assert.equal(edit.statusCode, 200);
  const old = await request(app).get("/api/s1kebeats");
  assert.equal(old.statusCode, 404);
  const updated = await request(app).get("/api/author/datsenkoboos");
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.body.username, data.username);
  assert.equal(updated.body.displayedName, data.displayedName);
  assert.equal(updated.body.about, data.about);
  assert.equal(updated.body.vk, data.vk);
  assert.equal(updated.body.youtube, data.youtube);
  assert.equal(updated.body.instagram, data.instagram);
  assert.equal(updated.body.image, key);
});
