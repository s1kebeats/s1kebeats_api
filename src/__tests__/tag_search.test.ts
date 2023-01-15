import request from "supertest";
import prisma from "../client";
import app from "./app.js";

beforeAll(async () => {
  await prisma.tag.createMany({
    data: [
      {
        name: "TrapBeat",
      },
      {
        name: "HipHopInstrumental",
      },
      {
        name: "RapBeat",
      },
      {
        name: "RnBBeat",
      },
      {
        name: "TrapSoulbeat",
      },
    ],
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("POST request should return 404", async () => {
  const res = await request(app).post("/api/tag");
  await expect(res.statusCode).toBe(404);
});
it("valid request without filters, should return 200 and tag list", async () => {
  const res = await request(app).get("/api/tag");
  await expect(res.statusCode).toBe(200);
  await expect(res.body.tags.length).toBe(5);
  await expect(res.body.viewed).toBe(5);
});
it("valid request with viewed = 10", async () => {
  const res = await request(app).get("/api/tag/?viewed=10");
  await expect(res.body.tags.length).toBe(0);
  await expect(res.body.viewed).toBe(10);
});
it("valid request with name filter", async () => {
  const res = await request(app).get("/api/tag/?name=Beat");
  await expect(res.body.tags.length).toBe(4);
});
