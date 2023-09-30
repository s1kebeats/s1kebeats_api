import isLocalOrigin from "./isLocalOrigin";
import { describe, it, expect } from "vitest";

describe("isLocalOrigin", () => {
  it("should return false when called with falsy origin", () => {
    expect(isLocalOrigin("")).toBe(false);
  });
  it("should return false when called with remote origin", () => {
    expect(isLocalOrigin("https://www.example.com/")).toBe(false);
  });
  it("should return true when called with local origins", () => {
    expect(isLocalOrigin("http://localhost:3000/")).toBe(true);
    expect(isLocalOrigin("http://localhost:3050/")).toBe(true);
    expect(isLocalOrigin("http://192.168.1.135:3000/")).toBe(true);
    expect(isLocalOrigin("http://192.168.1.131:3005/")).toBe(true);
  });
});
