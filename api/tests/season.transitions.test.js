import { SEASON_STATUSES } from "../src/models/Season.js";

describe("season status constants", () => {
  test("contains the expected lifecycle states", () => {
    expect(Object.values(SEASON_STATUSES)).toEqual([
      "DRAFT",
      "REGISTRATION",
      "ACTIVE",
      "COMPLETED",
      "CANCELLED"
    ]);
  });
});
