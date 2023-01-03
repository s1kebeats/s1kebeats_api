import request from "supertest";
import app from "../app";

describe("Registration", () => {
  test("Only POST", async () => {
    const res = await request(app).get("/api/register");
    expect(res.statusCode).toBe(404);
  });
});
