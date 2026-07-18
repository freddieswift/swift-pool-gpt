import {
  createTeamSchema,
  registerSeasonTeamSchema,
  updateSeasonTeamSchema
} from "../src/validators/team.validator.js";

describe("team validation", () => {
  const teamId = "3f49a5cb-3855-4b83-86c7-44c578705817";
  const divisionId = "c86a4628-b07d-4702-a978-f5648cc14f4a";

  test("accepts a valid permanent team", () => {
    const result = createTeamSchema.validate({
      name: "The Railway Arms",
      shortName: "Railway",
      venueName: "Railway Arms",
      contactEmail: "captain@example.com"
    });

    expect(result.error).toBeUndefined();
    expect(result.value.isActive).toBe(true);
  });

  test("accepts a season registration", () => {
    const result = registerSeasonTeamSchema.validate({
      teamId,
      divisionId,
      status: "APPROVED",
      seed: 1
    });

    expect(result.error).toBeUndefined();
  });

  test("requires a reason for a non-zero points adjustment", () => {
    const result = updateSeasonTeamSchema.validate({
      pointsAdjustment: -2
    });

    expect(result.error).toBeDefined();
  });
});
