import request from "supertest";
import app from "./app.js";

it("GET request should return 404", async () => {
  const res = await request(app).get("/api/media/");
  await expect(res.statusCode).toBe(404);
});
it("providing not existing path, should return 404", async () => {
  const res = await request(app).get("/api/media/random/media");
  await expect(res.statusCode).toBe(404);
});
it("providing valid path, should return 200", async () => {
  const res = await request(app).get("/api/media/image/logo_main.svg");
  await expect(res.statusCode).toBe(200);
});
