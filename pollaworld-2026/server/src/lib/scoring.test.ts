import { describe, it, expect } from "vitest";
import { calculatePoints } from "./scoring";

describe("calculatePoints", () => {
  it("5 pts for exact score", () => {
    expect(calculatePoints(2, 1, 2, 1)).toBe(5);
    expect(calculatePoints(0, 0, 0, 0)).toBe(5);
    expect(calculatePoints(3, 0, 3, 0)).toBe(5);
  });

  it("3 pts for correct winner, wrong score", () => {
    expect(calculatePoints(2, 0, 1, 0)).toBe(3); // home wins, pred higher
    expect(calculatePoints(1, 3, 0, 2)).toBe(3); // away wins
    expect(calculatePoints(1, 0, 3, 0)).toBe(3); // home wins both
  });

  it("2 pts for correct draw prediction (any score)", () => {
    expect(calculatePoints(1, 1, 0, 0)).toBe(2);
    expect(calculatePoints(2, 2, 1, 1)).toBe(2);
    expect(calculatePoints(0, 0, 1, 1)).toBe(2);
  });

  it("0 pts for completely wrong prediction", () => {
    expect(calculatePoints(0, 2, 2, 0)).toBe(0);
    expect(calculatePoints(0, 1, 2, 2)).toBe(0);
    expect(calculatePoints(3, 0, 0, 1)).toBe(0);
  });
});
