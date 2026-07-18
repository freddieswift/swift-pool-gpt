import {
  calculateHandicapSchema,
  createPlayerHandicapSchema
} from "../src/validators/handicap.validator.js";

describe("handicap validation", () => {
  test("accepts a manual player handicap", () => {
    const result = createPlayerHandicapSchema.validate({
      value: 2.5,
      effectiveFrom: "2026-09-01",
      source: "MANUAL"
    });

    expect(result.error).toBeUndefined();
  });

  test("rejects an invalid effective range", () => {
    const result = createPlayerHandicapSchema.validate({
      value: 1,
      effectiveFrom: "2026-10-01",
      effectiveUntil: "2026-09-01"
    });

    expect(result.error).toBeDefined();
  });

  test("applies calculation defaults", () => {
    const result = calculateHandicapSchema.validate({
      effectiveFrom: "2026-09-01"
    });

    expect(result.error).toBeUndefined();
    expect(result.value.minimumFrames).toBe(5);
    expect(result.value.apply).toBe(false);
  });
});
