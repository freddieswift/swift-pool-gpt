import {
  generateFixturesSchema,
  updateMatchSchema
} from "../src/validators/match.validator.js";

describe("match validation", () => {
  test("accepts fixture generation settings", () => {
    const result = generateFixturesSchema.validate({
      startDate: "2026-09-03",
      kickoffTime: "19:30",
      intervalDays: 7
    });

    expect(result.error).toBeUndefined();
    expect(result.value.replaceExisting).toBe(false);
  });

  test("rejects an invalid kickoff time", () => {
    const result = generateFixturesSchema.validate({
      startDate: "2026-09-03",
      kickoffTime: "25:00"
    });

    expect(result.error).toBeDefined();
  });

  test("requires a reason when postponing", () => {
    const result = updateMatchSchema.validate({
      status: "POSTPONED"
    });

    expect(result.error).toBeDefined();
  });
});
