import {
  addRosterPlayerSchema,
  createPlayerSchema,
  transferPlayerSchema
} from "../src/validators/player.validator.js";

describe("player validation", () => {
  const playerId = "3f49a5cb-3855-4b83-86c7-44c578705817";
  const seasonTeamId = "c86a4628-b07d-4702-a978-f5648cc14f4a";

  test("accepts a player without a user account", () => {
    const result = createPlayerSchema.validate({
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@example.com"
    });

    expect(result.error).toBeUndefined();
    expect(result.value.isActive).toBe(true);
  });

  test("accepts an eligible roster assignment", () => {
    const result = addRosterPlayerSchema.validate({
      playerId,
      eligibleFrom: "2026-09-01",
      eligibleUntil: "2027-05-31",
      isCaptain: true
    });

    expect(result.error).toBeUndefined();
  });

  test("rejects an eligibility end before the start", () => {
    const result = addRosterPlayerSchema.validate({
      playerId,
      eligibleFrom: "2026-10-01",
      eligibleUntil: "2026-09-01"
    });

    expect(result.error).toBeDefined();
  });

  test("accepts a player transfer", () => {
    const result = transferPlayerSchema.validate({
      toSeasonTeamId: seasonTeamId,
      effectiveDate: "2026-11-01",
      reason: "Approved transfer"
    });

    expect(result.error).toBeUndefined();
  });
});
