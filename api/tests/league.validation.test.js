import {
  createMatchFormatSchema,
  updateLeagueSettingsSchema
} from "../src/validators/league.validator.js";

describe("league validation", () => {
  test("accepts frame-points format", () => {
    const result = createMatchFormatSchema.validate({
      name: "11 Frame League",
      framesPerMatch: 11,
      scoringMethod: "FRAME_POINTS",
      pointsPerFrame: 1
    });

    expect(result.error).toBeUndefined();
    expect(result.value.winPoints).toBeNull();
  });

  test("rejects result scoring without all point values", () => {
    const result = createMatchFormatSchema.validate({
      name: "Ten Frame Match",
      framesPerMatch: 10,
      scoringMethod: "MATCH_RESULT",
      winPoints: 3
    });

    expect(result.error).toBeDefined();
  });

  test("disables handicap only with NONE method", () => {
    const result = updateLeagueSettingsSchema.validate({
      handicapEnabled: false,
      handicapMethod: "PLAYER"
    });

    expect(result.error).toBeDefined();
  });
});
