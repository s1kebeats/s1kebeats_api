import request from "supertest";
import prisma from "../client";
import app from "./app.js";
import { describe, beforeAll, afterAll, expect, test } from "vitest";

describe("tag search", () => {
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
    await prisma.tag.deleteMany();
  });

  test("valid request, should return 200 and tag list", async () => {
    const res = await request(app).get("/api/tag");
    expect(res.statusCode).toBe(200);
    expect(res.body.tags.length).toBe(5);
    expect(res.body.viewed).toBe(5);
  });
  test("valid request with viewed 10 should return 200 and skip all tags", async () => {
    const res = await request(app).get("/api/tag?viewed=10");
    expect(res.body.tags.length).toBe(0);
    expect(res.body.viewed).toBe(10);
  });
});
