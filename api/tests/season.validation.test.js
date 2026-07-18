import {
  createSeasonSchema,
  updateSeasonStatusSchema
} from "../src/validators/season.validator.js";

describe("season validation", () => {
  const matchFormatId = "3f49a5cb-3855-4b83-86c7-44c578705817";

  test("accepts a valid season", () => {
    const result = createSeasonSchema.validate({
      name: "2026/27 Season",
      startDate: "2026-09-01",
      endDate: "2027-05-31",
      registrationOpensAt: "2026-07-01T09:00:00.000Z",
      registrationClosesAt: "2026-08-20T23:59:59.000Z",
      matchFormatId,
      teamsPlayEachOther: 2,
      useHomeAndAway: true
    });

    expect(result.error).toBeUndefined();
    expect(result.value.teamsPlayEachOther).toBe(2);
  });

  test("rejects an end date before the start date", () => {
    const result = createSeasonSchema.validate({
      name: "Invalid",
      startDate: "2026-09-01",
      endDate: "2026-08-31",
      matchFormatId
    });

    expect(result.error).toBeDefined();
  });

  test("accepts a valid lifecycle status", () => {
    const result = updateSeasonStatusSchema.validate({
      status: "REGISTRATION"
    });

    expect(result.error).toBeUndefined();
  });
});
