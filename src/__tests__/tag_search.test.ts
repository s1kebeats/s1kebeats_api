import request from "supertest";
import prisma from "../client";
import app from "./app.js";

beforeEach(async () => {
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

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.$disconnect();
});

it("valid request without filters, should return 200 and tag list", async () => {
  const res = await request(app).get("/api/tag");
  expect(res.statusCode).toBe(200);
  expect(res.body.tags.length).toBe(5);
  expect(res.body.viewed).toBe(5);
});
it("valid request with viewed = 10", async () => {
  const res = await request(app).get("/api/tag/?viewed=10");
  expect(res.body.tags.length).toBe(0);
  expect(res.body.viewed).toBe(10);
});
it("valid request with name filter", async () => {
  const res = await request(app).get("/api/tag/?name=Beat");
  expect(res.body.tags.length).toBe(4);
});
